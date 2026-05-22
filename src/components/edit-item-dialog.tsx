"use client";

import { useState, useTransition } from "react";
import { Pencil, Loader2, Euro } from "lucide-react";
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
import { updateItem } from "@/lib/actions";
import type { Item } from "@/lib/db";

interface EditItemDialogProps {
  item: Item;
  onUpdated: (updated: Item) => void;
}

export function EditItemDialog({ item, onUpdated }: EditItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const name = formData.get("name") as string;
    const quantity = (formData.get("quantity") as string) || null;
    const priceRaw = formData.get("price") as string;
    const price = priceRaw ? parseFloat(priceRaw) : null;

    if (!name?.trim()) return;

    onUpdated({ ...item, name: name.trim(), quantity: quantity?.trim() || null, price });
    setOpen(false);

    startTransition(async () => {
      await updateItem(item.id, name, quantity, price);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors p-1 rounded-lg hover:bg-primary/10"
          aria-label="Edit item"
          onClick={(e) => e.stopPropagation()}
        >
          <Pencil className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Item name *</Label>
            <Input
              id="edit-name"
              name="name"
              defaultValue={item.name}
              required
              className="h-12 text-base"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-quantity">Quantity</Label>
            <Input
              id="edit-quantity"
              name="quantity"
              defaultValue={item.quantity ?? ""}
              placeholder="e.g. 2, 500g, 1L"
              className="h-12 text-base"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-price">Price (€)</Label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="edit-price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={item.price ?? ""}
                placeholder="0.00"
                className="h-12 text-base pl-9"
              />
            </div>
          </div>

          <Button type="submit" size="lg" disabled={isPending} className="rounded-xl">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
