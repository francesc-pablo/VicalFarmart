
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

        // Use a specific path that we have now created a route for
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
                // If it wasn't resolved by a redirect detection, it was a user cancellation
                resolve({ status: 'cancelled' });
            }
        });

        // This triggers when a page finishes loading in the browser
        pageLoadedListener = await Browser.addListener('browserPageLoaded', (info) => {
            console.log("Native Browser URL Changed:", info.url);
            
            const lowerUrl = info.url.toLowerCase();
            const lowerRedirectPath = redirect_path.toLowerCase();

            // Detect success indicators or the presence of our callback path
            const isSuccess = lowerUrl.includes('status=successful') || lowerUrl.includes('status=completed');
            const isRedirectPath = lowerUrl.includes(lowerRedirectPath);

            if (!isResolved && (isSuccess || isRedirectPath)) {
                // IMPORTANT: Mark as resolved IMMEDIATELY to prevent 'browserFinished' from triggering 'cancelled'
                isResolved = true;
                
                try {
                    const url = new URL(info.url);
                    const status = url.searchParams.get('status');
                    
                    if (status === 'failed') {
                        cleanupListeners();
                        Browser.close();
                        resolve({ status: 'failed' });
                    } else {
                        const tx_ref = url.searchParams.get('tx_ref');
                        const transaction_id = url.searchParams.get('transaction_id');

                        // Provide a slight delay before closing to ensure state is clean
                        setTimeout(() => {
                            cleanupListeners();
                            Browser.close();
                            resolve({ 
                                status: 'successful', 
                                transaction_id: transaction_id || undefined, 
                                tx_ref: tx_ref || undefined 
                            });
                        }, 800);
                    }
                } catch (e) {
                    // Fallback for malformed URLs that still match our success criteria
                    cleanupListeners();
                    Browser.close();
                    resolve({ status: 'successful' });
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
