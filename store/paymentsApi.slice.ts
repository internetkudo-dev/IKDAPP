
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const paymentsApiSlice = createApi({
    reducerPath: 'paymentsApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        createPaymentIntent: builder.mutation({
            query: (body) => ({
                url: 'payments/create-intent',
                method: 'POST',
                body,
            }),
        }),
        confirmPayment: builder.mutation({
            query: (body) => ({
                url: 'payments/confirm',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const {
    useCreatePaymentIntentMutation,
    useConfirmPaymentMutation,
} = paymentsApiSlice;
