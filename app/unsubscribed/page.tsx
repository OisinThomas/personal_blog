import Link from 'next/link';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Unsubscribed',
  robots: { index: false, follow: false },
};

export default function UnsubscribedPage() {
  return (
    <>
      <main className="container mx-auto px-4 mb-16 max-w-xl">
        <div className="py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">You&apos;ve been unsubscribed</h1>
          <p className="text-secondary-500 mb-8">
            You will no longer receive email notifications. If this was a mistake, you can always subscribe again from the homepage.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:opacity-90 transition-opacity"
          >
            Back to homepage
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
