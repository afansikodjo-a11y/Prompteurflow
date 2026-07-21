import type { Metadata } from "next";

import { FEATURE_FLAGS } from "@/config/flags";
import { getAllPlansServer } from "@/features/subscription/lib/plans-server";
import { AudienceSection } from "@/components/marketing/audience-section";
import { DeviceShowcase } from "@/components/marketing/device-showcase";
import { EmotionalSection } from "@/components/marketing/emotional-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { FeatureShowcase } from "@/components/marketing/feature-showcase";
import { FinalCtaSection } from "@/components/marketing/final-cta-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { NarrativeSection } from "@/components/marketing/narrative-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { ProductDemoSection } from "@/components/marketing/product-demo-section";
import { SolutionSection } from "@/components/marketing/solution-section";
import { TrustSection } from "@/components/marketing/trust-section";

export const metadata: Metadata = {
  title: "Prompteur vidéo en ligne — filmez avec votre script sous les yeux",
  description:
    "Prompteur Flow est un prompteur vidéo qui fait défiler votre script pendant que vous filmez, depuis ton téléphone, ta tablette ou ton ordinateur. Écris ton script, importe-le, ou laisse l'IA le rédiger pour toi. Ton script. Ta caméra. Un seul appareil.",
};

export default async function HomePage() {
  const plans = FEATURE_FLAGS.pricingVisible ? await getAllPlansServer() : [];

  return (
    <div className="bg-neutral-950">
      <MarketingHeader />
      <HeroSection />
      <NarrativeSection />
      <ProductDemoSection />
      <SolutionSection />
      <AudienceSection />
      <DeviceShowcase />
      <FeatureShowcase />
      <EmotionalSection />
      {FEATURE_FLAGS.pricingVisible && <PricingSection plans={plans} />}
      <TrustSection />
      <FaqSection />
      <FinalCtaSection />
    </div>
  );
}
