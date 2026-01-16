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
        "text-xs px-2 py-1 rounded-full bg-surface-1 text-secondary-500 hover:bg-blue-500 hover:!text-white focus:bg-blue-500 focus:!text-white transition-colors"
      }
    >
      {tag}
    </Link>
  );
}
