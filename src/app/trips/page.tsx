import Link from "next/link";
import { getTrips } from "@/lib/actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ShoppingBag, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const trips = await getTrips();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold page-title">Trip History</h1>
        <p className="page-subtitle text-sm mt-1">
          {trips.length === 0 ? "No trips yet" : `${trips.length} total trips`}
        </p>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-white/70" />
          </div>
          <p className="text-xl font-semibold text-white">No trips yet</p>
          <p className="text-sm text-white/70">Complete a shopping trip to see history</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <div className="glass-card rounded-2xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{trip.store_name}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(trip.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="font-bold text-primary text-base">
                      {formatCurrency(trip.total_cost)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
