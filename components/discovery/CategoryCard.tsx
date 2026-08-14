import Link from "next/link";
import type { PlaceCategory } from "@/types/place";
import { formatCategoryLabel } from "@/lib/utils/format";

const descriptions: Record<PlaceCategory, string> = {
  heritage: "Imambaras, gateways and the stories carved into old Lucknow.",
  food: "Galouti kebabs, nihari, chaat and the tea stalls locals swear by.",
  shopping: "Chikankari markets and the bazaars of Chowk and Aminabad.",
  parks: "Green, walkable spaces for a slower afternoon or evening.",
  riverfront_evening: "Gomti riverfront and the city as the light changes.",
  modern: "Malls, Ekana Stadium and Gomti Nagar's contemporary side.",
  transport: "Getting in, out, and around the city without the guesswork.",
};

export function CategoryCard({ category }: { category: PlaceCategory }) {
  return (
    <Link
      href={`/explore/${category}`}
      className="group flex flex-col justify-between gap-6 rounded-2xl border border-sandstone-200/70 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-navy-900/5"
    >
      <div>
        <h3 className="font-display text-xl text-navy-900">{formatCategoryLabel(category)}</h3>
        <p className="mt-2 text-sm text-ink-soft">{descriptions[category]}</p>
      </div>
      <span className="text-sm font-medium text-saffron-600 transition-transform group-hover:translate-x-1">
        Explore →
      </span>
    </Link>
  );
}
