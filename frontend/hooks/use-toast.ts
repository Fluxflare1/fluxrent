import { useCallback } from "react";

export function useToast() {
  const toast = useCallback(
    (msg: string, type: "success" | "error" | "info" = "info") => {
      if (typeof window !== "undefined") {
        alert(`${type.toUpperCase()}: ${msg}`); // simple fallback
      }
    },
    []
  );

  return { toast };
}
