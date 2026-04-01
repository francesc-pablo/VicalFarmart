'use client';

import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

export interface PaymentInitiationDetails {
    tx_ref: string;
    amount: number;
    currency: string;
    customer: {
        email: string;
        phone_number: string;
        name: string;
    };
    customizations: {
        title: string;
        description: string;
        logo: string;
    };
}

interface PaymentResponse {
    status: 'successful' | 'cancelled' | 'failed';
    transaction_id?: string;
    tx_ref?: string;
}

/**
 * Handles the native payment flow using Capacitor Browser.
 * Intercepts redirects to confirm payment success and automatically closes the browser.
 */
export const handleNativePayment = (details: PaymentInitiationDetails): Promise<PaymentResponse> => {
    return new Promise(async (resolve) => {
        if (!Capacitor.isNativePlatform()) {
             resolve({ status: 'failed' });
             return;
        }

        // We use a dedicated callback path that our listener can easily identify
        const redirect_path = '/payment-callback';
        const redirect_url = `${window.location.origin}${redirect_path}`;
        
        let paymentLink = '';
        let isResolved = false;

        try {
            // 1. Obtain secure payment link from your backend
            const response = await fetch('/api/payments/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...details, redirect_url }),
            });

            const data = await response.json();
            if (!response.ok || !data.success || !data.paymentLink) {
                throw new Error(data.message || 'Failed to initiate payment.');
            }
            paymentLink = data.paymentLink;

        } catch (error) {
            console.error("Payment Initiation Error:", error);
            resolve({ status: 'failed' });
            return;
        }

        let pageLoadedListener: PluginListenerHandle | null = null;
        let browserFinishedListener: PluginListenerHandle | null = null;

        const cleanup = async () => {
            if (pageLoadedListener) await pageLoadedListener.remove();
            if (browserFinishedListener) await browserFinishedListener.remove();
        };

        // Triggers when the user manually swipes away or closes the browser window
        browserFinishedListener = await Browser.addListener('browserFinished', () => {
            if (!isResolved) {
                isResolved = true;
                cleanup();
                resolve({ status: 'cancelled' });
            }
        });

        // Triggers every time a page finish loading in the in-app browser overlay
        pageLoadedListener = await Browser.addListener('browserPageLoaded', async (info) => {
            if (isResolved) return;

            const url = info.url || '';
            const lowerUrl = url.toLowerCase();
            
            // Be extremely broad in detection to catch redirects on all Android browser implementations
            const hasSuccessParams = lowerUrl.includes('status=successful') || 
                                   lowerUrl.includes('status=completed') || 
                                   lowerUrl.includes('status=success');
            
            const isAtCallbackPath = lowerUrl.includes('payment-callback');

            if (hasSuccessParams || isAtCallbackPath) {
                // Lock resolution immediately to prevent browserFinished from firing a cancellation
                isResolved = true;
                
                try {
                    const urlObj = new URL(url);
                    const status = urlObj.searchParams.get('status');
                    const tx_ref = urlObj.searchParams.get('tx_ref');
                    const transaction_id = urlObj.searchParams.get('transaction_id');

                    // Close browser first, then resolve
                    await Browser.close();
                    await cleanup();

                    if (status === 'failed') {
                        resolve({ status: 'failed' });
                    } else {
                        resolve({ 
                            status: 'successful', 
                            transaction_id: transaction_id || undefined, 
                            tx_ref: tx_ref || undefined 
                        });
                    }
                } catch (e) {
                    // Fallback for valid redirects with complex or missing query strings
                    await Browser.close();
                    await cleanup();
                    resolve({ status: 'successful' });
                }
            }
        });

        try {
            // 2. Open the gateway in the secure Capacitor browser
            await Browser.open({ url: paymentLink });
        } catch (error) {
            console.error("Browser Open Error:", error);
            if (!isResolved) {
                isResolved = true;
                await cleanup();
                resolve({ status: 'failed' });
            }
        }
    });
};
