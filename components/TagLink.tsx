import Link from "next/link";

interface TagLinkProps {
  tag: string;
  className?: string;
}

export default function TagLink({ tag, className }: TagLinkProps) {
  return (
    <Link
      href={`/all?tag=${encodeURIComponent(tag)}`}
      className={
        className ||
        "text-xs px-2 py-1 rounded-full bg-surface-1 text-secondary-500 hover:text-primary hover:bg-surface-2 transition-colors"
      }
    >
      {tag}
    </Link>
  );
}
