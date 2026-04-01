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

        // IMPORTANT: Use the production domain for redirects in native mode.
        // WebViews often lose session context during redirects, so we use a public domain.
        const production_origin = 'https://vicalfarmart.com';
        const redirect_path = '/payment-callback';
        const redirect_url = `${production_origin}${redirect_path}`;
        
        let paymentLink = '';
        let isResolved = false;

        try {
            // 1. Obtain secure payment link from our backend initiate route
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

        // This triggers when the user manually closes the browser window.
        browserFinishedListener = await Browser.addListener('browserFinished', () => {
            if (!isResolved) {
                isResolved = true;
                cleanup();
                resolve({ status: 'cancelled' });
            }
        });

        // Intercept redirects back to our site.
        pageLoadedListener = await Browser.addListener('browserPageLoaded', async (info) => {
            if (isResolved) return;

            const url = info.url || '';
            const lowerUrl = url.toLowerCase();
            
            console.log("[PaymentService] URL Intercepted:", url);

            // Robust success detection:
            // 1. Hits the specific callback path
            // 2. Or hits our main site (vicalfarmart.com) after being at the gateway
            // 3. Or contains success-related query parameters
            const isReturningToSite = lowerUrl.includes('vicalfarmart.com');
            const hasSuccessParams = lowerUrl.includes('status=successful') || 
                                   lowerUrl.includes('status=completed') || 
                                   lowerUrl.includes('status=success');

            if (isReturningToSite || hasSuccessParams) {
                isResolved = true;
                
                try {
                    const urlObj = new URL(url);
                    const status = urlObj.searchParams.get('status');
                    const transaction_id = urlObj.searchParams.get('transaction_id') || urlObj.searchParams.get('transactionId');
                    const tx_ref = urlObj.searchParams.get('tx_ref');

                    // FORCE CLOSE the browser immediately
                    await Browser.close();
                    await cleanup();

                    if (status === 'failed') {
                        resolve({ status: 'failed' });
                    } else {
                        resolve({ 
                            status: 'successful', 
                            transaction_id: transaction_id || 'N/A', 
                            tx_ref: tx_ref || undefined 
                        });
                    }
                } catch (e) {
                    // Fallback: If URL parsing fails but we hit our domain, treat as likely success
                    await Browser.close();
                    await cleanup();
                    resolve({ status: 'successful' });
                }
            }
        });

        try {
            // 2. Open the payment gateway in the system browser plugin
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
