
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: { token: null, user: null } as { token: string | null, user: any | null },
    reducers: {
        setCredentials: (state, action) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
        },
        logOut: (state) => {
            state.token = null;
            state.user = null;
        },
        setUserId: (state, action) => {
            if (state.user) state.user.id = action.payload;
            // or if user is null, maybe partial user
        }
    },
});

export const { setCredentials, logOut, setUserId } = authSlice.actions;
export default authSlice.reducer;
export const selectCurrentUser = (state: any) => state.auth.user;
export const selectUserId = (state: any) => state.auth.user?.id;
export const selectToken = (state: any) => state.auth.token;
