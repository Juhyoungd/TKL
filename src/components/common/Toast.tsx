"use client";

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="app-toast"><span>✓</span>{message}</div>
  );
}
