import Link from "next/link";
import { getTrips } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ShoppingBag, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const trips = await getTrips();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Trip History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {trips.length === 0 ? "No trips yet" : `${trips.length} total trips`}
        </p>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <ShoppingBag className="h-12 w-12 opacity-30" />
          <p className="text-lg">No trips recorded yet</p>
          <p className="text-sm">Complete your first shopping trip to see history</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{trip.store_name}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(trip.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="secondary" className="font-semibold text-base px-3 py-1">
                        {formatCurrency(trip.total_cost)}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
