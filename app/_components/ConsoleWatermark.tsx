"use client";

import { useEffect } from "react";

const ConsoleWatermark: React.FC = () => {
  useEffect(() => {
    console.log(
      "%c Built by Ken ",
      "background: #222; color: #bada55; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 0 rgba(0,0,0,0.3);"
    );
  }, []);

  return null;
};

export default ConsoleWatermark;