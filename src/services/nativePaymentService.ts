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
 * Detects redirects to confirm payment success and automatically closes the browser.
 */
export const handleNativePayment = (details: PaymentInitiationDetails): Promise<PaymentResponse> => {
    return new Promise(async (resolve) => {
        if (!Capacitor.isNativePlatform()) {
             resolve({ status: 'failed' });
             return;
        }

        // The specific path the payment gateway will redirect to upon success/callback
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

        // This triggers when the user manually closes the browser window
        browserFinishedListener = await Browser.addListener('browserFinished', () => {
            if (!isResolved) {
                isResolved = true;
                cleanupListeners();
                // If it wasn't resolved by a redirect detection, it was a manual user cancellation
                resolve({ status: 'cancelled' });
            }
        });

        // This triggers whenever a page finishes loading in the in-app browser
        pageLoadedListener = await Browser.addListener('browserPageLoaded', async (info) => {
            console.log("Native Browser navigated to:", info.url);
            
            const lowerUrl = info.url.toLowerCase();
            const lowerRedirectPath = redirect_path.toLowerCase();

            // Detect success indicators in the URL params or the presence of our internal callback path
            const isSuccess = lowerUrl.includes('status=successful') || lowerUrl.includes('status=completed');
            const isRedirectPath = lowerUrl.includes(lowerRedirectPath);

            if (!isResolved && (isSuccess || isRedirectPath)) {
                // Lock the resolution to prevent the 'browserFinished' event from triggering a cancellation
                isResolved = true;
                
                try {
                    const url = new URL(info.url);
                    const status = url.searchParams.get('status');
                    
                    if (status === 'failed') {
                        cleanupListeners();
                        await Browser.close();
                        resolve({ status: 'failed' });
                    } else {
                        const tx_ref = url.searchParams.get('tx_ref');
                        const transaction_id = url.searchParams.get('transaction_id');

                        // Clean up and close the browser IMMEDIATELY to return control to the app UI
                        cleanupListeners();
                        await Browser.close();
                        
                        resolve({ 
                            status: 'successful', 
                            transaction_id: transaction_id || undefined, 
                            tx_ref: tx_ref || undefined 
                        });
                    }
                } catch (e) {
                    // Fallback resolution for valid redirects that might have malformed query strings
                    cleanupListeners();
                    await Browser.close();
                    resolve({ status: 'successful' });
                }
            }
        });

        try {
            // 2. Open the payment gateway in the secure in-app browser
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
