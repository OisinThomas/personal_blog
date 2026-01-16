'use client';

import { useRouter } from 'next/navigation';

interface ClickableCardProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function ClickableCard({ href, children, className }: ClickableCardProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on a link or button
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button')) {
      return;
    }
    router.push(href);
  };

  return (
    <article
      onClick={handleClick}
      className={`${className} cursor-pointer`}
    >
      {children}
    </article>
  );
}
