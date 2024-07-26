'use client';

import { useLayoutEffect, ReactNode } from "react";
import { initializeApp } from "@/src/libs/appInitialization";

export default function ClientInitWrapper({ children }: { children: ReactNode }) {
    useLayoutEffect(() => {
        initializeApp();
    }, []);

    return <>{children}</>;
};