"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, ShoppingCart, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { addItem, toggleItem, deleteItem, clearBoughtItems } from "@/lib/actions";
import type { Item } from "@/lib/db";
import { CreateTripDialog } from "./create-trip-dialog";
import { cn } from "@/lib/utils";

interface ShoppingListProps {
  initialItems: Item[];
}

export function ShoppingList({ initialItems }: ShoppingListProps) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  const pendingItems = items.filter((i) => i.status === "pending");
  const boughtItems = items.filter((i) => i.status === "bought");

  function handleAdd(formData: FormData) {
    const name = formData.get("name") as string;
    const quantity = formData.get("quantity") as string;
    if (!name?.trim()) return;

    const optimistic: Item = {
      id: Date.now(),
      name: name.trim(),
      quantity: quantity?.trim() || null,
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
    <div className="flex flex-col gap-4">
      {/* Add item form */}
      <form
        action={handleAdd}
        className="flex gap-2"
      >
        <Input
          name="name"
          placeholder="Add item..."
          className="flex-1 h-12 text-base"
          autoComplete="off"
        />
        <Input
          name="quantity"
          placeholder="Qty"
          className="w-20 h-12 text-base"
          autoComplete="off"
        />
        <Button type="submit" size="lg" className="h-12 px-4">
          <Plus className="h-5 w-5" />
        </Button>
      </form>

      {/* Stats row */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Badge variant="secondary">{pendingItems.length} pending</Badge>
          {boughtItems.length > 0 && (
            <Badge variant="success">{boughtItems.length} bought</Badge>
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
        <div className="flex flex-col gap-1">
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
        <div className="flex flex-col gap-1 mt-2">
          <p className="text-xs font-medium text-muted-foreground px-1 mb-1">In cart</p>
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
        "flex items-center gap-3 rounded-xl px-4 py-3 border transition-all",
        isBought
          ? "bg-muted/50 border-transparent opacity-70"
          : "bg-card border-border hover:border-primary/30"
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
          <Circle className="h-6 w-6 text-muted-foreground" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <span className={cn("text-base", isBought && "line-through text-muted-foreground")}>
          {item.name}
        </span>
        {item.quantity && (
          <span className="ml-2 text-sm text-muted-foreground">({item.quantity})</span>
        )}
      </div>

      <button
        onClick={() => onDelete(item.id)}
        className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1"
        aria-label="Delete item"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
