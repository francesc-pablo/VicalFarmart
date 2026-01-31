'use client';

import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

interface FlutterwaveConfig {
    public_key: string;
    tx_ref: string;
    amount: number;
    currency: string;
    payment_options: string;
    redirect_url: string; // Important for native flow
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

// Define the shape of the successful response
interface PaymentResponse {
    status: 'successful' | 'cancelled' | 'failed';
    transaction_id?: string;
    tx_ref?: string;
}

export const handleNativePayment = (config: FlutterwaveConfig): Promise<PaymentResponse> => {
    return new Promise(async (resolve) => {
        if (!Capacitor.isNativePlatform()) {
             resolve({ status: 'failed' }); // Should not be called on web
             return;
        }

        const baseUrl = "https://checkout.flutterwave.com/v3/hosted/pay";
        // Create URLSearchParams from the config object
        const params = new URLSearchParams({
            public_key: config.public_key,
            tx_ref: config.tx_ref,
            amount: String(config.amount),
            currency: config.currency,
            payment_options: config.payment_options,
            redirect_url: config.redirect_url, // This is key
            'customer[email]': config.customer.email,
            'customer[name]': config.customer.name,
            'customer[phone_number]': config.customer.phone_number,
            'customizations[title]': config.customizations.title,
            'customizations[description]': config.customizations.description,
            'customizations[logo]': config.customizations.logo,
        });

        const paymentUrl = `${baseUrl}?${params.toString()}`;

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
            if (info.url.startsWith(config.redirect_url)) {
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
            await Browser.open({ url: paymentUrl, presentationStyle: 'popover' });
        } catch (error) {
            console.error("Error opening In-App Browser:", error);
            cleanupListeners();
            resolve({ status: 'failed' });
        }
    });
};
