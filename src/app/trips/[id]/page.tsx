import Link from "next/link";
import { notFound } from "next/navigation";
import { getTripWithItems } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Store, CalendarDays, FileText, Package } from "lucide-react";
import { DeleteTripButton } from "./delete-trip-button";

export const dynamic = "force-dynamic";

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await getTripWithItems(parseInt(id));

  if (!trip) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/trips">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{trip.store_name}</h1>
          <p className="text-muted-foreground text-sm">{formatDate(trip.created_at)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Cost highlight */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-5">
            <p className="text-sm opacity-80 mb-1">Total spent</p>
            <p className="text-4xl font-bold">{formatCurrency(trip.total_cost)}</p>
          </CardContent>
        </Card>

        {/* Trip details */}
        <Card>
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm">
              <Store className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{trip.store_name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{formatDate(trip.created_at)}</span>
            </div>
            {trip.notes && (
              <div className="flex items-start gap-3 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{trip.notes}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items list */}
        {trip.items.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Items ({trip.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col divide-y">
                {trip.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2.5 gap-3">
                    <span className="text-sm flex-1">{item.item_name}</span>
                    <div className="flex items-center gap-2">
                      {item.quantity && (
                        <Badge variant="secondary" className="text-xs">
                          {item.quantity}
                        </Badge>
                      )}
                      {item.price != null && (
                        <span className="text-sm font-semibold text-primary">
                          €{Number(item.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <DeleteTripButton tripId={trip.id} />
      </div>
    </div>
  );
}
