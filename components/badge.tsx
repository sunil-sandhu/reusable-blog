import { slugify } from "@/lib/utils";
import Link from "next/link";

export function Badge({
  label,
  directory,
}: {
  label: string;
  directory?: string;
}) {
  const slug = label ? slugify(label) : undefined;

  return (
    <div className="pt-2">
      <p className="inline-flex px-3.5 py-1.5 text-sm font-medium text-brand hover:text-brand/80 bg-brand/5 rounded-full transition-colors">
        <Link href={`${directory ? `/${directory}` : ""}/${slug}`}>
          {label}
        </Link>
      </p>
    </div>
  );
}
