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
        // Flutterwave's servers need a public URL to redirect the user back to.
        const production_origin = 'https://vicalfarmart.com';
        const redirect_path = '/payment-callback';
        const redirect_url = `${production_origin}${redirect_path}`;
        
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

        // Triggers when the user manually closes the browser
        browserFinishedListener = await Browser.addListener('browserFinished', () => {
            if (!isResolved) {
                isResolved = true;
                cleanup();
                resolve({ status: 'cancelled' });
            }
        });

        // Intercept redirects to your site
        pageLoadedListener = await Browser.addListener('browserPageLoaded', async (info) => {
            if (isResolved) return;

            const url = info.url || '';
            const lowerUrl = url.toLowerCase();
            
            // Log for debugging in Android Studio
            console.log("[PaymentListener] URL Loaded:", url);

            // We look for ANY sign that the gateway is returning to our site.
            // Even if the browser session bounces to /login (due to missing cookies), 
            // the presence of our domain confirms the payment process is done.
            const isOurSite = lowerUrl.includes('vicalfarmart.com');
            const isAtCallbackPath = lowerUrl.includes('payment-callback');
            const hasSuccessParams = lowerUrl.includes('status=successful') || 
                                   lowerUrl.includes('status=completed') || 
                                   lowerUrl.includes('status=success');

            if (isAtCallbackPath || hasSuccessParams || (isOurSite && lowerUrl.includes('/login'))) {
                isResolved = true;
                
                try {
                    const urlObj = new URL(url);
                    const status = urlObj.searchParams.get('status');
                    const transaction_id = urlObj.searchParams.get('transaction_id');
                    const tx_ref = urlObj.searchParams.get('tx_ref');

                    // Close browser immediately
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
                    // Fallback for malformed URLs that still hit our domain
                    await Browser.close();
                    await cleanup();
                    resolve({ status: 'successful' });
                }
            }
        });

        try {
            // 2. Open the gateway
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
