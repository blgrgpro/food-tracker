"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteTrip } from "@/lib/actions";

export function DeleteTripButton({ tripId }: { tripId: number }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Delete this trip? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteTrip(tripId);
      router.push("/trips");
    });
  }

  return (
    <Button
      variant="outline"
      className="text-destructive border-destructive/30 hover:bg-destructive/10 w-full mt-2"
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      Delete trip
    </Button>
  );
}
