import type { Metadata } from "next";

import { getAllPlansServer } from "@/features/subscription/lib/plans-server";
import { AudienceSection } from "@/components/marketing/audience-section";
import { DeviceShowcase } from "@/components/marketing/device-showcase";
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
    "PrompteurFlow est un prompteur vidéo qui fait défiler votre script pendant que vous filmez, depuis votre téléphone, votre tablette ou votre ordinateur. Créez vos vidéos sans mémoriser vos textes.",
};

export default async function HomePage() {
  const plans = await getAllPlansServer();

  return (
    <div className="bg-neutral-950">
      <MarketingHeader />
      <HeroSection />
      <NarrativeSection />
      <SolutionSection />
      <DeviceShowcase />
      <ProductDemoSection />
      <AudienceSection />
      <FeatureShowcase />
      <PricingSection plans={plans} />
      <TrustSection />
      <FaqSection />
      <FinalCtaSection />
    </div>
  );
}
