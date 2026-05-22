"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, ShoppingCart, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { addItem, toggleItem, deleteItem, clearBoughtItems } from "@/lib/actions";
import type { Item } from "@/lib/db";
import { CreateTripDialog } from "./create-trip-dialog";
import { EditItemDialog } from "./edit-item-dialog";
import { cn, formatDate } from "@/lib/utils";

interface ShoppingListProps {
  initialItems: Item[];
}

export function ShoppingList({ initialItems }: ShoppingListProps) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  const pendingItems = items.filter((i) => i.status === "pending");
  const boughtItems = items.filter((i) => i.status === "bought");
  const boughtSubtotal = boughtItems.reduce((sum, i) => (i.price != null ? sum + Number(i.price) : sum), 0);
  const hasBoughtPrices = boughtItems.some((i) => i.price != null);

  function handleAdd(formData: FormData) {
    const name = formData.get("name") as string;
    const quantity = formData.get("quantity") as string;
    if (!name?.trim()) return;

    const optimistic: Item = {
      id: Date.now(),
      name: name.trim(),
      quantity: quantity?.trim() || null,
      price: null,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    setItems((prev) => [optimistic, ...prev]);
    (formData as unknown as { target?: HTMLFormElement }).target?.reset?.();

    startTransition(async () => {
      await addItem(formData);
    });
  }

  function handleToggle(item: Item) {
    const newStatus = item.status === "pending" ? "bought" : "pending";
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)));
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

  function handleUpdated(updated: Item) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Add item form */}
      <form
        action={handleAdd}
        className="flex gap-2 p-3 rounded-2xl glass-card shadow-lg"
      >
        <Input
          name="name"
          placeholder="Add item..."
          className="flex-1 h-12 text-base bg-white/70"
          autoComplete="off"
        />
        <Input
          name="quantity"
          placeholder="Qty"
          className="w-20 h-12 text-base bg-white/70"
          autoComplete="off"
        />
        <Button type="submit" size="lg" className="h-12 px-4 rounded-xl shadow-md">
          <Plus className="h-5 w-5" />
        </Button>
      </form>

      {/* Stats row */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap items-center">
          <Badge variant="secondary" className="rounded-full px-3 py-1 bg-white/80 text-foreground shadow-sm">
            {pendingItems.length} pending
          </Badge>
          {boughtItems.length > 0 && (
            <Badge variant="success" className="rounded-full px-3 py-1 shadow-sm">
              {boughtItems.length} in cart
            </Badge>
          )}
          {hasBoughtPrices && (
            <span className="text-sm font-semibold text-white bg-primary/80 rounded-full px-3 py-1 shadow-sm">
              €{boughtSubtotal.toFixed(2)}
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
              className="text-white/80 hover:text-white hover:bg-white/20 text-xs"
            >
              Clear
            </Button>
            <CreateTripDialog
              boughtCount={boughtItems.length}
              boughtItems={boughtItems}
              onTripCreated={() => setItems((prev) => prev.filter((i) => i.status !== "bought"))}
            />
          </div>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <ShoppingCart className="h-10 w-10 text-white/70" />
          </div>
          <p className="text-xl font-semibold text-white">List is empty</p>
          <p className="text-sm text-white/70">Add items above to get started</p>
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
              onUpdated={handleUpdated}
            />
          ))}
        </div>
      )}

      {/* Bought items */}
      {boughtItems.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60 px-1">
            In cart
          </p>
          {boughtItems.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onUpdated={handleUpdated}
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
  onUpdated,
}: {
  item: Item;
  onToggle: (item: Item) => void;
  onDelete: (id: number) => void;
  onUpdated: (updated: Item) => void;
}) {
  const isBought = item.status === "bought";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl px-4 py-3 transition-all shadow-md",
        isBought ? "bg-white/40 backdrop-blur-sm opacity-70" : "glass-card hover:shadow-lg"
      )}
    >
      <button
        onClick={() => onToggle(item)}
        className="flex-shrink-0"
        aria-label={isBought ? "Mark as pending" : "Mark as bought"}
      >
        {isBought ? (
          <CheckCircle2 className="h-6 w-6 text-primary" />
        ) : (
          <Circle className="h-6 w-6 text-muted-foreground/50" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("text-base font-medium", isBought && "line-through text-muted-foreground")}>
            {item.name}
          </span>
          {item.quantity && (
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {item.quantity}
            </span>
          )}
          {item.price != null && (
            <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5">
              €{Number(item.price).toFixed(2)}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          {formatDate(item.created_at)}
        </p>
      </div>

      <EditItemDialog item={item} onUpdated={onUpdated} />

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
