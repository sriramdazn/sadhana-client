import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Alert } from "antd";
import { theme } from "@/constants/theme";
import { createPortal } from "react-dom";

type ToastType = "success" | "info" | "warning" | "error";

type Toast = {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
};

type ToastContextType = {
  show: (type: ToastType, message: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
};

const getToastStyle = (type: ToastType): React.CSSProperties => {
  const base = { ...styles.toast };
  const colors = {
    success: "#9ED8A0",
    error: theme.colors.coral,
    warning: theme.colors.peach,
    info: theme.colors.sand,
  };

  const typeStyles: Record<ToastType, React.CSSProperties> = {
    success: { borderLeft: `4px solid #9ED8A0`, color: colors[type] },
    error: { borderLeft: `4px solid ${theme.colors.coral}`, color: colors[type] },
    warning: { borderLeft: `4px solid ${theme.colors.peach}` },
    info: { borderLeft: `4px solid ${theme.colors.sand}` },
  };

  return { ...base, ...typeStyles[type] };
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback((type: ToastType, message: string, description?: string) => {
    // crypto.randomUUID can also be missing in some environments; fallback is safer
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

    setToasts((t) => [...t, { id, type, message, description }]);
    window.setTimeout(() => remove(id), 3000);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      {mounted && typeof document !== "undefined"
        ? createPortal(
            <div style={styles.container}>
              {toasts.map((t) => (
                <Alert
                  key={t.id}
                  type={t.type}
                  message={t.message}
                  description={t.description}
                  closable
                  style={getToastStyle(t.type)}
                />
              ))}
            </div>,
            document.body
          )
        : null}
    </ToastContext.Provider>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed",
    top: 40,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    zIndex: 9999,
    pointerEvents: "none",
  },
  toast: {
    pointerEvents: "auto",
    width: "100%",
    maxWidth: 420,
    padding: "6px 10px",
    borderRadius: theme.radius.md,
    backdropFilter: "blur(40px)",
    background: theme.colors.card1,
    border: `1px solid ${theme.colors.border}`,
    color: "#F4F2FF",
    boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
    fontSize: 13,
    fontWeight: 500,
  },
};
