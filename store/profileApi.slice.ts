
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: {
        id: 'guest',
        name: 'Guest User',
        email: 'guest@example.com',
    },
    purchases: [],
};

const profileApiSlice = createSlice({
    name: 'profileApi',
    initialState,
    reducers: {
        setUser(state, action) {
            state.user = action.payload;
        },
        setPurchases(state, action) {
            state.purchases = action.payload;
        },
    },
});

export const { setUser, setPurchases } = profileApiSlice.actions;
export const useGetPurchasesQuery = (userId) => {
    // Mock implementation returning dummy data or empty array
    return {
        data: { purchases: [], total: 0 },
        isLoading: false,
        isError: false,
        refetch: () => { },
    };
};

export default profileApiSlice.reducer;
