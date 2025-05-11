"use client";
import { Toaster } from "react-hot-toast";
import React from "react";

export default function ToasterProvider() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[999999]">
      <Toaster 
        position="top-center"
        toastOptions={{
          className: "pointer-events-auto",
        }}
      />
    </div>
  );
}