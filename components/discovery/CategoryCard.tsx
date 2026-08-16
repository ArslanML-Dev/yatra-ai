import Link from "next/link";
import type { Place, PlaceCategory } from "@/types/place";
import { formatCategoryLabel } from "@/lib/utils/format";
import { PlaceImage } from "@/components/place/PlaceImage";

const descriptions: Record<PlaceCategory, string> = {
  heritage: "Imambaras, gateways and the stories carved into old Lucknow.",
  food: "Galouti kebabs, nihari, chaat and the tea stalls locals swear by.",
  shopping: "Chikankari markets and the bazaars of Chowk and Aminabad.",
  parks: "Green, walkable spaces for a slower afternoon or evening.",
  riverfront_evening: "Gomti riverfront and the city as the light changes.",
  modern: "Malls, Ekana Stadium and Gomti Nagar's contemporary side.",
  transport: "Getting in, out, and around the city without the guesswork.",
};

export function CategoryCard({ category, place }: { category: PlaceCategory; place?: Place }) {
  return (
    <Link
      href={`/explore/${category}`}
      className="group relative flex h-72 flex-col justify-end overflow-hidden rounded-2xl p-6 shadow-soft transition-shadow hover:shadow-lift"
    >
      <div className="absolute inset-0">
        {place ? (
          <PlaceImage place={place} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" tone="dark" iconSize="lg" />
        ) : (
          <div className="h-full w-full bg-navy-900" />
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-transparent transition-opacity group-hover:from-navy-950" />

      <div className="relative z-10">
        <h3 className="font-display text-xl text-ivory [text-shadow:0_2px_16px_rgba(0,0,0,0.7)]">
          {formatCategoryLabel(category)}
        </h3>
        <p className="mt-2 text-sm text-ivory/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.7)]">{descriptions[category]}</p>
        <span className="mt-3 inline-flex items-center text-sm font-medium text-saffron-400 [text-shadow:0_1px_10px_rgba(0,0,0,0.7)] transition-transform group-hover:translate-x-1">
          Explore →
        </span>
      </div>
    </Link>
  );
}
