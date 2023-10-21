import InsightRoll from "@/components/About/InsightRoll";
import AboutCoverSection from "@/components/About/AboutCoverSection";
import Skills from "@/components/About/Skills";

export const metadata = {
  title: "About Oisín Thomas",
  description: `A few words about Oisín Thomas, a Trinity College Dublin graduate and co-founder of Weeve.`,
};

const insights = [
  "Co-founder of Weeve",
  "All-Ireland Scholar Alumnmi",
  "Triple Major in Computer Science, Linguistics and Irish at Trinity College Dublin",
];

export default function AboutLayout() {
  return (
    <main className="w-full flex flex-col items-center justify-between pb-10">
      <InsightRoll insights={insights} />
      <AboutCoverSection />
      <Skills />
    </main>
  );
}
