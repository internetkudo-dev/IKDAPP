
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApiSlice = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api/auth' }),
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: 'login',
                method: 'POST',
                body: credentials,
            }),
        }),
        sendVerificationCode: builder.mutation({
            query: (email) => ({
                url: 'send-code',
                method: 'POST',
                body: { email }
            })
        }),
        verifyCode: builder.mutation({
            query: ({ email, code }) => ({
                url: 'verify-code',
                method: 'POST',
                body: { email, code }
            })
        }),
        resetPassword: builder.mutation({
            query: ({ email, code, newPassword }) => ({
                url: 'reset-password',
                method: 'POST',
                body: { email, code, newPassword }
            })
        }),
        signUp: builder.mutation({
            query: (userData) => ({
                url: 'register',
                method: 'POST',
                body: userData
            })
        })
    }),
});

export const {
    useLoginMutation,
    useSendVerificationCodeMutation,
    useVerifyCodeMutation,
    useResetPasswordMutation,
    useSendVerificationCodeMutation: useSendResetCodeMutation,
    useSignUpMutation
} = authApiSlice;
