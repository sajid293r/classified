import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  serverConnected: false,
  socketConnected: false,
  voiceChatService: null, // Will hold the VoiceChatService instance
};

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    setServerConnected(state, action) {
      state.serverConnected = action.payload;
    },
    setSocketConnected(state, action) {
      state.socketConnected = action.payload;
    },
    setVoiceChatService(state, action) {
      state.voiceChatService = action.payload;
    },
  },
});

export const { setServerConnected, setSocketConnected, setVoiceChatService } = connectionSlice.actions;
export default connectionSlice.reducer; 