import Link from "next/link";
import { getTrips } from "@/lib/actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ShoppingBag, ChevronRight, Store, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const trips = await getTrips();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold page-title">Trip History</h1>
        <p className="page-subtitle text-sm mt-1">
          {trips.length === 0 ? "No trips yet" : `${trips.length} total trip${trips.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <ShoppingBag className="h-14 w-14 text-white/35" />
            </div>
            <div className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Clock className="h-5 w-5 text-white/60" />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-white">No trips yet</p>
            <p className="text-sm text-white/55 mt-1">Complete a shopping trip to see your history here</p>
          </div>
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
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Store className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <p className="font-semibold truncate text-sm text-primary">{trip.store_name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(trip.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="font-bold text-foreground text-base">
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
