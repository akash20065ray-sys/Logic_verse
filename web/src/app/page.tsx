import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/landing/hero-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { ModulesSection } from "@/components/landing/modules-section";
import { LogicAiSection } from "@/components/landing/logicai-section";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <WorkflowSection />
        <ModulesSection />
        <LogicAiSection />
      </main>
      <SiteFooter />
    </>
  );
}
