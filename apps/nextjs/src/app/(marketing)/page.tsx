import React from "react";
import { HeroSection } from "./hero";
import { TrustBar } from "./trust-bar";
import { FeaturesSection } from "./features";
import { ScreenshotsSection } from "./screenshots";
import { HouseholdSection } from "./household";
import { HowItWorksSection } from "./how-it-works";
import { FaqSection } from "./faq";
import { PricingSection } from "./pricing";
import { CallToAction } from "./call-to-action";

export default async function Home() {
  return (
    <div>
      <HeroSection />
      <TrustBar />
      <FeaturesSection />
      <ScreenshotsSection />
      <HouseholdSection />
      <HowItWorksSection />
      <FaqSection />
      <PricingSection />
      <CallToAction />
    </div>
  );
}
