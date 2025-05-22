import { configureStore } from '@reduxjs/toolkit';
import connectionReducer from './connectionSlice';
import chatReducer from './chatSlice';

const store = configureStore({
  reducer: {
    connection: connectionReducer,
    chat: chatReducer,
  },
});

export default store; 