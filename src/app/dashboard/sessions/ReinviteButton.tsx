"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReinviteButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReinvite() {
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/reinvite`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to re-invite");
      }
    } catch {
      alert("Failed to re-invite");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleReinvite}
      disabled={loading}
      className="text-xs font-medium text-india-green hover:text-india-green/80 transition-colors disabled:opacity-50"
    >
      {loading ? "Inviting..." : "Re-invite"}
    </button>
  );
}
