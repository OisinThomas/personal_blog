import Link from "next/link";

interface TagFilterProps {
  tags: string[];
  selectedTag?: string;
}

export default function TagFilter({ tags, selectedTag }: TagFilterProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <p className="text-sm text-secondary-500 mb-3">Filter by tag:</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isActive = selectedTag === tag;
          return (
            <Link
              key={tag}
              href={`/all?tag=${encodeURIComponent(tag)}`}
              className={
                isActive
                  ? "text-xs px-2 py-1 rounded-full bg-primary text-white transition-colors"
                  : "text-xs px-2 py-1 rounded-full bg-surface-1 text-secondary-500 hover:bg-blue-500 hover:!text-white transition-colors"
              }
            >
              {tag}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
