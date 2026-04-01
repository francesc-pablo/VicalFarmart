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
 * Detects redirects to confirm payment success.
 */
export const handleNativePayment = (details: PaymentInitiationDetails): Promise<PaymentResponse> => {
    return new Promise(async (resolve) => {
        if (!Capacitor.isNativePlatform()) {
             resolve({ status: 'failed' });
             return;
        }

        // We use a specific path to look for in the redirect URL
        const redirect_path = '/payment-callback';
        const redirect_url = `${window.location.origin}${redirect_path}`;
        
        let paymentLink = '';
        let isResolved = false;

        try {
            // 1. Get the payment link from the backend
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
            console.error("Error initiating payment:", error);
            resolve({ status: 'failed' });
            return;
        }

        let pageLoadedListener: PluginListenerHandle | null = null;
        let browserFinishedListener: PluginListenerHandle | null = null;

        const cleanupListeners = () => {
            pageLoadedListener?.remove();
            browserFinishedListener?.remove();
        };

        // This triggers when the user manually closes the browser
        browserFinishedListener = await Browser.addListener('browserFinished', () => {
            if (!isResolved) {
                isResolved = true;
                cleanupListeners();
                resolve({ status: 'cancelled' });
            }
        });

        // This triggers when a page finishes loading in the browser
        pageLoadedListener = await Browser.addListener('browserPageLoaded', (info) => {
            console.log("Native Browser URL Changed:", info.url);
            
            // Check if the URL contains the success status or our redirect path
            // We use .includes for robustness against www/non-www or trailing slashes
            const isSuccess = info.url.includes('status=successful') || info.url.includes('status=completed');
            const isRedirect = info.url.includes(redirect_path);

            if (!isResolved && (isSuccess || isRedirect)) {
                const url = new URL(info.url);
                const status = url.searchParams.get('status');
                
                // If it explicitly says failed, we handle that, otherwise treat redirect as success
                if (status === 'failed') {
                    isResolved = true;
                    cleanupListeners();
                    Browser.close();
                    resolve({ status: 'failed' });
                } else if (isSuccess || status === 'successful') {
                    isResolved = true;
                    cleanupListeners();
                    
                    const tx_ref = url.searchParams.get('tx_ref');
                    const transaction_id = url.searchParams.get('transaction_id');

                    // Small delay to ensure Browser.close doesn't interrupt the transition
                    setTimeout(() => {
                        Browser.close();
                        resolve({ 
                            status: 'successful', 
                            transaction_id: transaction_id || undefined, 
                            tx_ref: tx_ref || undefined 
                        });
                    }, 500);
                }
            }
        });

        try {
            // 2. Open the payment link in the secure browser
            await Browser.open({ url: paymentLink });
        } catch (error) {
            console.error("Error opening In-App Browser:", error);
            if (!isResolved) {
                isResolved = true;
                cleanupListeners();
                resolve({ status: 'failed' });
            }
        }
    });
};