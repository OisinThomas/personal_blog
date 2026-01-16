import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

// Standalone layout for embeddable assets - no header/footer
export default function AssetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={inter.className}>
      {children}
    </div>
  );
}
