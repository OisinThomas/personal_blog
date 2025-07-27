import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Oisín Thomas's blog",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p>
            This website respects your privacy. We use minimal analytics to understand 
            how visitors interact with our content, helping us improve the reading experience.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">What We Collect</h2>
          <p>When you accept cookies, we collect:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Page views and navigation paths</li>
            <li>General location (country/city level)</li>
            <li>Device type and browser information</li>
            <li>Referral sources</li>
          </ul>
          <p>
            We do <strong>not</strong> collect any personal information such as names, 
            email addresses, or IP addresses.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use This Data</h2>
          <p>The anonymous analytics data helps us:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Understand which articles are most popular</li>
            <li>Improve website performance</li>
            <li>Make content decisions based on reader interests</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Analytics Provider</h2>
          <p>
            We use PostHog for analytics, which is configured to respect your privacy. 
            PostHog is GDPR-compliant and processes data within the EU.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Choices</h2>
          <p>
            You can change your cookie preferences at any time using the cookie icon 
            in the bottom left corner of any page. If you reject cookies, we won't 
            track any analytics data for your visit.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p>
            If you have any questions about this privacy policy, please feel free to 
            reach out through any of the social links in the website header.
          </p>
        </section>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Link 
            href="/" 
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
