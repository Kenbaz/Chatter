'use client';

import { Provider } from "react-redux";
import { store } from '../_store/store';
import { AuthProvider } from "./AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <AuthProvider>{children}</AuthProvider>
      </Provider>
    );
}