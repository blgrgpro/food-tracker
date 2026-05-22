"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, ShoppingCart, CheckCircle2, Circle, Euro } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { addItem, toggleItem, deleteItem, clearBoughtItems } from "@/lib/actions";
import type { Item } from "@/lib/db";
import { CreateTripDialog } from "./create-trip-dialog";
import { cn, formatDate } from "@/lib/utils";

interface ShoppingListProps {
  initialItems: Item[];
}

export function ShoppingList({ initialItems }: ShoppingListProps) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  const pendingItems = items.filter((i) => i.status === "pending");
  const boughtItems = items.filter((i) => i.status === "bought");

  const boughtSubtotal = boughtItems.reduce((sum, i) => {
    return i.price != null ? sum + i.price : sum;
  }, 0);
  const hasBoughtPrices = boughtItems.some((i) => i.price != null);

  function handleAdd(formData: FormData) {
    const name = formData.get("name") as string;
    const quantity = formData.get("quantity") as string;
    const priceRaw = formData.get("price") as string;
    const price = priceRaw ? parseFloat(priceRaw) : null;
    if (!name?.trim()) return;

    const optimistic: Item = {
      id: Date.now(),
      name: name.trim(),
      quantity: quantity?.trim() || null,
      price: price ?? null,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    setItems((prev) => [optimistic, ...prev]);

    startTransition(async () => {
      await addItem(formData);
    });
  }

  function handleToggle(item: Item) {
    const newStatus = item.status === "pending" ? "bought" : "pending";
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
    );
    startTransition(async () => {
      await toggleItem(item.id, item.status);
    });
  }

  function handleDelete(id: number) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    startTransition(async () => {
      await deleteItem(id);
    });
  }

  function handleClearBought() {
    setItems((prev) => prev.filter((i) => i.status !== "bought"));
    startTransition(async () => {
      await clearBoughtItems();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Add item form */}
      <form
        action={handleAdd}
        className="flex gap-2 p-3 rounded-2xl bg-muted/40 border border-border"
      >
        <Input
          name="name"
          placeholder="Add item..."
          className="flex-1 h-11 text-base bg-background"
          autoComplete="off"
        />
        <Input
          name="quantity"
          placeholder="Qty"
          className="w-18 h-11 text-base bg-background"
          autoComplete="off"
        />
        <div className="relative">
          <Euro className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            name="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="Price"
            className="w-24 h-11 text-base pl-7 bg-background"
            autoComplete="off"
          />
        </div>
        <Button type="submit" size="lg" className="h-11 px-4 rounded-xl">
          <Plus className="h-5 w-5" />
        </Button>
      </form>

      {/* Stats row */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap items-center">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {pendingItems.length} pending
          </Badge>
          {boughtItems.length > 0 && (
            <Badge variant="success" className="rounded-full px-3 py-1">
              {boughtItems.length} in cart
            </Badge>
          )}
          {hasBoughtPrices && (
            <span className="text-sm font-semibold text-primary">
              Subtotal: €{boughtSubtotal.toFixed(2)}
            </span>
          )}
        </div>
        {boughtItems.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearBought}
              disabled={isPending}
              className="text-muted-foreground text-xs"
            >
              Clear bought
            </Button>
            <CreateTripDialog
              boughtCount={boughtItems.length}
              boughtItems={boughtItems}
              onTripCreated={() =>
                setItems((prev) => prev.filter((i) => i.status !== "bought"))
              }
            />
          </div>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <ShoppingCart className="h-12 w-12 opacity-30" />
          <p className="text-lg">Your list is empty</p>
          <p className="text-sm">Add items above to get started</p>
        </div>
      )}

      {/* Pending items */}
      {pendingItems.length > 0 && (
        <div className="flex flex-col gap-2">
          {pendingItems.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Bought items */}
      {boughtItems.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            In cart
          </p>
          {boughtItems.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ItemRow({
  item,
  onToggle,
  onDelete,
}: {
  item: Item;
  onToggle: (item: Item) => void;
  onDelete: (id: number) => void;
}) {
  const isBought = item.status === "bought";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl px-4 py-3 border transition-all shadow-sm",
        isBought
          ? "bg-muted/30 border-transparent opacity-60"
          : "bg-card border-border hover:border-primary/40 hover:shadow-md"
      )}
    >
      <button
        onClick={() => onToggle(item)}
        className="flex-shrink-0 text-primary"
        aria-label={isBought ? "Mark as pending" : "Mark as bought"}
      >
        {isBought ? (
          <CheckCircle2 className="h-6 w-6 text-primary" />
        ) : (
          <Circle className="h-6 w-6 text-muted-foreground/60" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className={cn("text-base font-medium", isBought && "line-through text-muted-foreground")}>
            {item.name}
          </span>
          {item.quantity && (
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {item.quantity}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          Added {formatDate(item.created_at)}
        </p>
      </div>

      {item.price != null && (
        <span
          className={cn(
            "text-sm font-semibold px-2 py-0.5 rounded-lg",
            isBought
              ? "text-muted-foreground bg-muted/50"
              : "text-primary bg-primary/10"
          )}
        >
          €{item.price.toFixed(2)}
        </span>
      )}

      <button
        onClick={() => onDelete(item.id)}
        className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1 rounded-lg hover:bg-destructive/10"
        aria-label="Delete item"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
