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
 * Follows the reliable "Detect Success -> Close Browser" flow.
 */
export const handleNativePayment = (details: PaymentInitiationDetails): Promise<PaymentResponse> => {
    return new Promise(async (resolve) => {
        if (!Capacitor.isNativePlatform()) {
             resolve({ status: 'failed' });
             return;
        }

        // Production Origin for reliable callback detection
        const production_origin = 'https://vicalfarmart.com';
        const redirect_url = `${production_origin}/payment-callback`;
        
        let isResolved = false;

        try {
            // 1. Obtain secure payment link from our backend initiation route
            const response = await fetch('/api/payments/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...details, redirect_url }),
            });

            const data = await response.json();
            if (!response.ok || !data.success || !data.paymentLink) {
                throw new Error(data.message || 'Failed to initiate payment.');
            }
            
            const paymentLink = data.paymentLink;

            let pageLoadedListener: PluginListenerHandle | null = null;
            let browserFinishedListener: PluginListenerHandle | null = null;

            const cleanup = async () => {
                if (pageLoadedListener) await pageLoadedListener.remove();
                if (browserFinishedListener) await browserFinishedListener.remove();
            };

            // Triggers when user manually closes the window
            browserFinishedListener = await Browser.addListener('browserFinished', () => {
                // Ignore if we already detected success/redirect
                if (!isResolved) {
                    isResolved = true;
                    cleanup();
                    resolve({ status: 'cancelled' });
                }
            });

            // RELIABLE DETECTION: Monitor URL changes
            pageLoadedListener = await Browser.addListener('browserPageLoaded', async (info) => {
                if (isResolved) return;

                const url = info.url || '';
                const lowerUrl = url.toLowerCase();
                
                console.log("[PaymentService] Native Intercept:", url);

                // Success markers in the redirect URL
                const isCallbackPage = lowerUrl.includes('/payment-callback');
                const hasSuccessParams = lowerUrl.includes('status=successful') || 
                                       lowerUrl.includes('status=completed') || 
                                       lowerUrl.includes('status=success');

                if (isCallbackPage || hasSuccessParams) {
                    isResolved = true;
                    
                    try {
                        const urlObj = new URL(url);
                        const status = urlObj.searchParams.get('status');
                        const transaction_id = urlObj.searchParams.get('transaction_id') || urlObj.searchParams.get('transactionId');
                        const tx_ref = urlObj.searchParams.get('tx_ref');

                        // 🔥 CLOSE browser immediately to return to native app
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
                        // Fallback: If URL parsing fails but we hit the domain, treat as success signal
                        await Browser.close();
                        await cleanup();
                        resolve({ status: 'successful' });
                    }
                }
            });

            // 2. Open the Flutterwave checkout in the system-standard browser view
            await Browser.open({ url: paymentLink });

        } catch (error) {
            console.error("Payment Initiation Error:", error);
            resolve({ status: 'failed' });
        }
    });
};
