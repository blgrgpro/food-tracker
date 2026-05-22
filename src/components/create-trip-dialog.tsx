"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTrip } from "@/lib/actions";
import type { Item } from "@/lib/db";

interface CreateTripDialogProps {
  boughtCount: number;
  boughtItems: Item[];
  onTripCreated: () => void;
}

export function CreateTripDialog({ boughtCount, boughtItems, onTripCreated }: CreateTripDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const autoSubtotal = boughtItems.reduce((sum, i) => {
    return i.price != null ? sum + i.price : sum;
  }, 0);
  const hasAutoSubtotal = boughtItems.some((i) => i.price != null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const { id } = await createTrip(formData);
        onTripCreated();
        setOpen(false);
        router.push(`/trips/${id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save trip");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 rounded-xl">
          <ShoppingBag className="h-4 w-4" />
          End trip
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Shopping Trip</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Items preview */}
          <div className="rounded-xl bg-muted/50 border border-border p-3 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">{boughtCount} items in cart</p>
            <p className="text-xs line-clamp-2">
              {boughtItems.map((i) => i.name).join(", ")}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="store_name">Store name *</Label>
            <Input
              id="store_name"
              name="store_name"
              placeholder="e.g. Rewe, Aldi, Lidl"
              required
              className="h-12 text-base"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="total_cost">Total cost (€) *</Label>
            <Input
              id="total_cost"
              name="total_cost"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              required
              defaultValue={hasAutoSubtotal ? autoSubtotal.toFixed(2) : undefined}
              className="h-12 text-base"
            />
            {hasAutoSubtotal && (
              <p className="text-xs text-muted-foreground">
                Auto-calculated from item prices: €{autoSubtotal.toFixed(2)}. You can edit this.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any notes about this trip..."
              rows={2}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" size="lg" disabled={isPending} className="mt-1 rounded-xl">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Trip"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
