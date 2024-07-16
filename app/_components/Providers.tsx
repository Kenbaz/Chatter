'use client';

import { Provider } from "react-redux";
import { store } from '../_store/store';
import { ThemeProvider } from "@/src/Theme/ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <ThemeProvider>{children}</ThemeProvider>
      </Provider>
    );
}