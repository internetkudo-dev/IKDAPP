
import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './profileApi.slice';
import { ordersApiSlice } from './odersApi.slice';

export const store = configureStore({
    reducer: {
        profile: profileReducer,
        [ordersApiSlice.reducerPath]: ordersApiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(ordersApiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
