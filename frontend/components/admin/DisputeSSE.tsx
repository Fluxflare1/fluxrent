// frontend/components/admin/DisputeSSE.tsx
"use client";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/api";

export default function DisputeSSE() {
  const { toast } = useToast();
  const evtRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.warn("No token for SSE; admin must be logged in");
      return;
    }

    const url = `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}/api/disputes/sse/?token=${encodeURIComponent(token)}`;

    const es = new EventSource(url);
    evtRef.current = es;

    es.addEventListener("new_dispute", (ev: MessageEvent) => {
      try {
        const payload = JSON.parse(ev.data);
        toast({
          title: "New dispute",
          description: `${payload.user_email} • ${payload.transaction_reference || "no-ref"} • ${payload.amount || ""}`,
        });
        // Optionally, dispatch a Redux/Context action to refresh list
        const event = new CustomEvent("dispute:new", { detail: payload });
        window.dispatchEvent(event);
      } catch (err) {
        console.error("Invalid SSE payload", err);
      }
    });

    es.onerror = (err) => {
      console.error("SSE error", err);
      // reconnect handled by browser EventSource automatically; you may implement backoff
    };

    return () => {
      es.close();
      evtRef.current = null;
    };
  }, [toast]);

  return null;
}
