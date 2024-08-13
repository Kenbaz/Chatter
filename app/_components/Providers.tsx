'use client';

import { Provider } from "react-redux";
import { store } from '../_store/store';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        {children}
      </Provider>
    );
}