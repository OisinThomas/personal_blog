import Socials from "./Socials";

export default function Footer() {
  return (
    <footer className="bg-surface-1 border-t border-card-border mt-16">
      <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-secondary">
          © Oisín Thomas {new Date().getFullYear()}
        </div>
        <Socials />
      </div>
    </footer>
  );
}
