'use client';

import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
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
 * Handles the native payment flow using Capacitor Browser and Deep Linking.
 * Follows the "Deep Link Intercept" pattern for maximum reliability on Android.
 */
export const handleNativePayment = (details: PaymentInitiationDetails): Promise<PaymentResponse> => {
    return new Promise(async (resolve) => {
        if (!Capacitor.isNativePlatform()) {
             resolve({ status: 'failed' });
             return;
        }

        const production_origin = 'https://vicalfarmart.com';
        const redirect_url = `${production_origin}/payment-callback`;
        
        let isResolved = false;
        let appUrlListener: PluginListenerHandle | null = null;
        let browserFinishedListener: PluginListenerHandle | null = null;

        const cleanup = async () => {
            if (appUrlListener) await appUrlListener.remove();
            if (browserFinishedListener) await browserFinishedListener.remove();
        };

        try {
            // 1. Obtain secure payment link
            const response = await fetch('/api/payments/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...details, redirect_url }),
            });

            const data = await response.json();
            if (!response.ok || !data.success || !data.paymentLink) {
                throw new Error(data.message || 'Failed to initiate payment.');
            }
            
            // 2. Setup DEEP LINK listener (Reliable return path)
            appUrlListener = await App.addListener('appUrlOpen', async (info) => {
                if (isResolved) return;

                const url = info.url;
                if (url.includes('payment-result')) {
                    isResolved = true;
                    console.log("[PaymentService] Deep Link Caught:", url);
                    
                    try {
                        const urlObj = new URL(url.replace('vicalfarmart://', 'http://vical.temp/'));
                        const status = urlObj.searchParams.get('status');
                        const transaction_id = urlObj.searchParams.get('transaction_id');
                        const tx_ref = urlObj.searchParams.get('tx_ref');

                        await Browser.close();
                        await cleanup();

                        if (status === 'failed') {
                            resolve({ status: 'failed' });
                        } else {
                            resolve({ status: 'successful', transaction_id: transaction_id || undefined, tx_ref: tx_ref || undefined });
                        }
                    } catch (e) {
                        await Browser.close();
                        await cleanup();
                        resolve({ status: 'successful' });
                    }
                }
            });

            // 3. Setup Browser Close listener (Fallback for manual cancel)
            browserFinishedListener = await Browser.addListener('browserFinished', () => {
                if (!isResolved) {
                    isResolved = true;
                    cleanup();
                    // We treat a manual close as cancellation IF no deep link happened
                    resolve({ status: 'cancelled' });
                }
            });

            // 4. Open browser
            await Browser.open({ url: data.paymentLink });

        } catch (error) {
            console.error("Native Payment Error:", error);
            cleanup();
            resolve({ status: 'failed' });
        }
    });
};