import {
  AboutCta,
  AboutHero,
  BrandValues,
  FounderPhilosophy,
  OurProcess,
  OurStory,
  Statistics,
} from "@/components/about/AboutSections";
import { getPageByUri, stripHtml } from "@/lib/graphql";

export async function generateMetadata() {
  const page = await getPageByUri("about");
  const description = page?.content
    ? stripHtml(page.content).slice(0, 155)
    : "Mantram is a modern destination for crystals, gemstone jewellery, healing objects and intentional living.";

  return {
    title: page?.title ?? "About",
    description,
  };
}

export default async function AboutPage() {
  const wpPage = await getPageByUri("about");

  return (
    <main className="bg-white">
      <AboutHero wpPage={wpPage} />
      <OurStory wpPage={wpPage} />
      <BrandValues />
      <OurProcess />
      <Statistics />
      <FounderPhilosophy />
      <AboutCta />
    </main>
  );
}
