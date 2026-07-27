import Layout from "./components/layout/Layout";
import FuturisticHero from "./components/sections/FuturisticHero";
import Features from "./components/sections/Features";
import SocialProof from "./components/sections/SocialProof";
import HowItWorks from "./components/sections/HowItWorks";
import Demo from "./components/sections/Demo";
import InvestorDemo from "./components/sections/InvestorDemo";
import CustomerTestimonials from "./components/sections/CustomerTestimonials";

export default function Home() {
  return (
    <Layout>
      <FuturisticHero />
      <Features />
      <SocialProof />
      <InvestorDemo />
      <HowItWorks />
      <Demo />
      <CustomerTestimonials />
    </Layout>
  );
}