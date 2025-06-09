// /components/ui/sonner.tsx
"use client";

import { Toaster } from "sonner";

export function SonnerToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      theme="light"
      toastOptions={{
        className: "border border-gray-200 shadow-md",
      }}
    />
  );
}
