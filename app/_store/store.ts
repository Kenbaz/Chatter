import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import errorReducer from "./errorSlice";
import modalReducer from './modalSlice';
import loadingReducer from './loadingSlice';

export const store = configureStore({
  reducer: {
    error: errorReducer,
    modal: modalReducer,
    loading: loadingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;