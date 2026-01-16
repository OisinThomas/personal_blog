export default function DividerBlock() {
  return (
    <div className="my-12 flex items-center justify-center gap-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-card-border" />
      <div className="flex gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-card-border" />
    </div>
  );
}
