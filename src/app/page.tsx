import { getItems } from "@/lib/actions";
import { ShoppingList } from "@/components/shopping-list";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const items = await getItems();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Shopping List</h1>
        <p className="text-muted-foreground text-sm mt-1">Tap to mark as bought</p>
      </div>
      <ShoppingList initialItems={items} />
    </div>
  );
}
