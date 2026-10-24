
"use client";

import { useEffect, useState } from "react";

type Toast = {
  id: number;
  message: string;
  type: "success" | "error";
};

export default function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let nextId = 0;

    function showToast(event: Event) {
      const detail = (
        event as CustomEvent<{
          message?: string;
          type?: "success" | "error";
        }>
      ).detail;

      if (!detail?.message) return;

      const id = ++nextId;

      setToasts((current) => [
        ...current,
        {
          id,
          message: detail.message!,
          type: detail.type === "error" ? "error" : "success",
        },
      ]);

      window.setTimeout(() => {
        setToasts((current) =>
          current.filter((toast) => toast.id !== id)
        );
      }, 3500);
    }

    window.addEventListener("vg-toast", showToast);

    return () => {
      window.removeEventListener("vg-toast", showToast);
    };
  }, []);

  return (
    <div
      className="vg-toast-container"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.type === "error" ? "alert" : "status"}
          className={`vg-toast ${
            toast.type === "success"
              ? "vg-toast-success"
              : "vg-toast-error"
          }`}
        >
          <span aria-hidden="true">
            {toast.type === "success" ? "✓" : "!"}
          </span>

          <p>{toast.message}</p>

          <button
            type="button"
            className="vg-toast-close"
            aria-label="Dismiss notification"
            onClick={() =>
              setToasts((current) =>
                current.filter((item) => item.id !== toast.id)
              )
            }
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
