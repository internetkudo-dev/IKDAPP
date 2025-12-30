
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const ordersApiSlice = createApi({
    reducerPath: 'ordersApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        createOrder: builder.mutation({
            query: (body) => ({
                url: 'orders',
                method: 'POST',
                body,
            }),
        }),
        validatePromoCode: builder.mutation({
            query: (body) => ({
                url: 'promo/validate',
                method: 'POST',
                body,
            }),
        }),
        pricePreview: builder.mutation({
            query: (body) => ({
                url: 'price/preview',
                method: 'POST',
                body,
            }),
        }),
        completeWithCredits: builder.mutation({
            query: (orderId) => ({
                url: `orders/${orderId}/complete-with-credits`,
                method: 'POST',
            }),
        }),
        cancelOrder: builder.mutation({
            query: (orderId) => ({
                url: `orders/${orderId}/cancel`,
                method: 'POST'
            })
        }),
        getCreditsBalance: builder.query({
            query: () => 'credits/balance',
        }),
    }),
});

export const {
    useCreateOrderMutation,
    useValidatePromoCodeMutation,
    usePricePreviewMutation,
    useCompleteWithCreditsMutation,
    useGetCreditsBalanceQuery,
    useCancelOrderMutation,
} = ordersApiSlice;

export type OrderResponse = {
    id: string;
    currency: string;
    packageTemplate: {
        packageTemplateName: string;
        periodDays: number;
    };
    usage?: {
        individualUsage: any[];
        totalDataUsed: number;
        totalDataAllowed: number;
        lastSyncedAt: string;
        isActive: boolean;
        status: string;
        totalDataRemaining: number;
    };
    iccid?: string;
    activationCode?: string;
    urlQrCode?: string;
    smdpServer?: string;
    subscriberId?: string;
    esimId?: string;
};
