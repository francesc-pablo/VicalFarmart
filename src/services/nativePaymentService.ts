
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

export const handleNativePayment = (details: PaymentInitiationDetails): Promise<PaymentResponse> => {
    return new Promise(async (resolve) => {
        if (!Capacitor.isNativePlatform()) {
             resolve({ status: 'failed' });
             return;
        }

        const redirect_url = `${window.location.origin}/payment-callback`;
        
        let paymentLink = '';

        try {
            // 1. Call your backend to get the payment link
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

        browserFinishedListener = await Browser.addListener('browserFinished', () => {
            cleanupListeners();
            resolve({ status: 'cancelled' });
        });

        pageLoadedListener = await Browser.addListener('browserPageLoaded', (info) => {
            if (info && info.url && info.url.startsWith(redirect_url)) {
                cleanupListeners();
                Browser.close();

                const url = new URL(info.url);
                const status = url.searchParams.get('status');
                const tx_ref = url.searchParams.get('tx_ref');
                const transaction_id = url.searchParams.get('transaction_id');

                if (status === 'successful') {
                    resolve({ status: 'successful', transaction_id: transaction_id || undefined, tx_ref: tx_ref || undefined });
                } else {
                    resolve({ status: 'failed' });
                }
            }
        });

        try {
            // 2. Open the official link from your backend
            await Browser.open({ url: paymentLink });
        } catch (error) {
            console.error("Error opening In-App Browser:", error);
            cleanupListeners();
            resolve({ status: 'failed' });
        }
    });
};
