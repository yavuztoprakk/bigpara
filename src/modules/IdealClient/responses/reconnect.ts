import { createSlice } from '@reduxjs/toolkit';
import { login } from '../../../screens/Auth/modules/auth';
const reconnectSlice = createSlice({
    name: 'reconnect',
    initialState: false,
    reducers: {
        showReconnect: () => true,
        hideReconnect: () => false,  // Reconnect'i gizlemek için yeni bir eylem
    },
    extraReducers: (builder) => {
        builder.addCase(login, () => false);  // auth/login eylemini dinleyin ve state'i false yapın
    },
});

// Selector fonksiyonunu tanımla
export const selectReconnect = (state: { reconnect: any; }) => state.reconnect;

export const { showReconnect, hideReconnect } = reconnectSlice.actions;
export default reconnectSlice.reducer;
