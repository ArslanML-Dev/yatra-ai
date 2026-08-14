"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { CategoryFilter } from "@/types/map";
import type { Coordinates, Place } from "@/types/place";
import { CategoryToggle } from "./CategoryToggle";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const MapView = dynamic(() => import("./MapView").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

interface MapExplorerProps {
  places: Place[];
  center: Coordinates;
}

export function MapExplorer({ places, center }: MapExplorerProps) {
  const [active, setActive] = useState<CategoryFilter>("all");

  const filtered = useMemo(
    () => (active === "all" ? places : places.filter((p) => p.category === active)),
    [active, places],
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <CategoryToggle active={active} onChange={setActive} />
      <div className="relative h-[65vh] min-h-[420px] w-full overflow-hidden rounded-2xl border border-sandstone-200/70">
        {filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6">
            <EmptyState
              title="Nothing in this category yet"
              description="Try another category — we're still curating this one."
            />
          </div>
        ) : (
          <MapView places={filtered} center={center} />
        )}
      </div>
    </div>
  );
}
