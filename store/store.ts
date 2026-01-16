
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.slice';
import profileReducer from './profileApi.slice';

// Import API slices with defensive checks
let authApiSlice: any;
let esimApiSlice: any;
let ordersApiSlice: any;
let paymentsApiSlice: any;

try {
    authApiSlice = require('./authApi.slice').authApiSlice;
} catch (e) {
    console.warn('Failed to load authApiSlice:', e);
}

try {
    esimApiSlice = require('./esimApi.slice').esimApiSlice;
} catch (e) {
    console.warn('Failed to load esimApiSlice:', e);
}

try {
    ordersApiSlice = require('./odersApi.slice').ordersApiSlice;
} catch (e) {
    console.warn('Failed to load ordersApiSlice:', e);
}

try {
    paymentsApiSlice = require('./paymentsApi.slice').paymentsApiSlice;
} catch (e) {
    console.warn('Failed to load paymentsApiSlice:', e);
}

const reducers: any = {
    auth: authReducer,
    profile: profileReducer,
};

const middlewares: any[] = [];

if (authApiSlice?.reducerPath) {
    reducers[authApiSlice.reducerPath] = authApiSlice.reducer;
    middlewares.push(authApiSlice.middleware);
}

if (esimApiSlice?.reducerPath) {
    reducers[esimApiSlice.reducerPath] = esimApiSlice.reducer;
    middlewares.push(esimApiSlice.middleware);
}

if (ordersApiSlice?.reducerPath) {
    reducers[ordersApiSlice.reducerPath] = ordersApiSlice.reducer;
    middlewares.push(ordersApiSlice.middleware);
}

if (paymentsApiSlice?.reducerPath) {
    reducers[paymentsApiSlice.reducerPath] = paymentsApiSlice.reducer;
    middlewares.push(paymentsApiSlice.middleware);
}

export const store = configureStore({
    reducer: reducers,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(...middlewares),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
