// frontend/components/admin/DisputeDetailModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { apiFetch, ENDPOINTS } from "@/lib/api";        // ✅ fixed alias
import Button from "@/components/ui/button";            // ✅ fixed alias
import Textarea from "@/components/ui/textarea";        // ✅ fixed alias
import { useToast } from "@/hooks/use-toast";           // ✅ fixed alias

type Comment = {
  id: string;
  author: number;
  author_name?: string;
  comment: string;
  internal: boolean;
  created_at: string;
};

export default function DisputeDetailModal({
  disputeId,
  onClose,
  onResolve,
  onRefund,
  onAddComment,
}: {
  disputeId: number;
  onClose: () => void;
  onResolve: (refetch?: boolean, payload?: any) => void;
  onRefund: (payload?: any) => void;
  onAddComment: (text: string, internal?: boolean) => void;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dispute, setDispute] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [internalComment, setInternalComment] = useState(false);

  const base = ENDPOINTS?.wallet?.base ?? "/api/wallets/";
  const endpoint = `${base}disputes/`;

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch(`${endpoint}${disputeId}/`);
      setDispute(data);
      setComments(data.comments || []);
    } catch (err: any) {
      toast({
        title: "Failed to load dispute",
        description: err?.payload?.detail || err.message,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disputeId]);

  async function handleAddComment() {
    if (!commentText.trim()) {
      toast({ title: "Enter comment" });
      return;
    }
    try {
      await apiFetch(`${endpoint}${disputeId}/comment/`, {
        method: "POST",
        body: JSON.stringify({ comment: commentText, internal: internalComment }),
      });
      setCommentText("");
      setInternalComment(false);
      toast({ title: "Comment added" });
      load();
      if (onAddComment) onAddComment(commentText, internalComment);
    } catch (err: any) {
      toast({ title: "Add comment failed", description: err?.payload?.detail || err.message });
    }
  }

  async function handleResolve(action: "accept" | "reject") {
    try {
      await apiFetch(`${endpoint}${disputeId}/resolve/`, {
        method: "POST",
        body: JSON.stringify({ action, note: "" }),
      });
      toast({ title: "Dispute resolved" });
      onResolve(true);
      onClose();
    } catch (err: any) {
      toast({ title: "Resolve failed", description: err?.payload?.detail || err.message });
    }
  }

  async function handleRefund() {
    try {
      await apiFetch(`${endpoint}${disputeId}/refund/`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      toast({ title: "Refund issued" });
      onRefund({});
      onClose();
    } catch (err: any) {
      toast({ title: "Refund failed", description: err?.payload?.detail || err.message });
    }
  }

  if (!dispute) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded shadow">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-auto">
      <div className="min-h-screen flex items-start justify-center pt-20 px-4">
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Dispute {dispute.uid}</h3>
              <div className="text-sm text-slate-600">{dispute.reason}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => onClose()}>
                Close
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* dispute info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-500">User</div>
                <div className="font-medium">{dispute.raised_by_name}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Amount</div>
                <div className="font-medium">{dispute.amount || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Status</div>
                <div className="font-medium">{dispute.status}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Created</div>
                <div className="font-medium">{dispute.created_at}</div>
              </div>
            </div>

            {/* evidence */}
            <div>
              <div className="text-sm text-slate-500">Evidence</div>
              {dispute.evidence ? (
                <a href={dispute.evidence} target="_blank" rel="noreferrer" className="text-blue-600">
                  View
                </a>
              ) : (
                <div className="text-slate-500">No evidence</div>
              )}
            </div>

            {/* comments */}
            <div>
              <div className="text-sm text-slate-500">Comments</div>
              <div className="space-y-2 mt-2 max-h-48 overflow-auto">
                {comments.length === 0 && <div className="text-sm text-slate-500">No comments yet</div>}
                {comments.map((c) => (
                  <div key={c.id} className="p-2 border rounded">
                    <div className="text-xs text-slate-500">
                      {c.author_name} • {c.created_at} {c.internal && "(internal)"}
                    </div>
                    <div>{c.comment}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* add comment */}
            <div>
              <div className="text-sm text-slate-500">Add comment</div>
              <Textarea
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div className="flex items-center gap-2 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={internalComment}
                    onChange={(e) => setInternalComment(e.target.checked)}
                  />
                  <span className="text-sm">Internal</span>
                </label>
                <Button onClick={handleAddComment}>Add</Button>
              </div>
            </div>

            {/* actions */}
            <div className="flex gap-2 justify-end">
              <Button onClick={() => handleResolve("reject")} variant="ghost">
                Reject
              </Button>
              <Button onClick={() => handleResolve("accept")} className="bg-green-600 text-white">
                Accept
              </Button>
              <Button onClick={handleRefund} variant="destructive">
                Refund
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
