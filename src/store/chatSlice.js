import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  history: [], // Array of { message, from }
  pendingBotMessage: "", // For streaming bot reply
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage(state, action) {
      state.history.push(action.payload);
    },
    clearHistory(state) {
      state.history = [];
      state.pendingBotMessage = "";
    },
    setPendingBotMessage(state, action) {
      state.pendingBotMessage = action.payload;
    },
    clearPendingBotMessage(state) {
      state.pendingBotMessage = "";
    },
  },
});

export const { addMessage, clearHistory, setPendingBotMessage, clearPendingBotMessage } = chatSlice.actions;
export default chatSlice.reducer; 