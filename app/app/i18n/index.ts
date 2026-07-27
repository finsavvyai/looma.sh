import { he } from './he';
import { ar } from './ar';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';
import { en } from './en';

export type Language = 'he' | 'ar' | 'es' | 'fr' | 'de' | 'en';

export interface Translations {
  // Navigation
  features: string;
  howItWorks: string;
  docs: string;
  getStarted: string;
  documentation: string;
  api: string;
  blog: string;
  about: string;
  careers: string;
  contact: string;
  privacy: string;
  terms: string;

  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  network: string;
  encrypted: string;
  security: string;
  investorHighlights: string;
  viewInvestorDeck: string;
  scheduleDemo: string;

  // Features
  realTimeCommunication: string;
  realTimeCommunicationDesc: string;
  militaryGradeEncryption: string;
  militaryGradeEncryptionDesc: string;
  locationFiltering: string;
  locationFilteringDesc: string;
  globalEdgeNetwork: string;
  globalEdgeNetworkDesc: string;
  developerFriendly: string;
  developerFriendlyDesc: string;
  scalableInfrastructure: string;
  scalableInfrastructureDesc: string;

  // Social Proof
  trustedByDevelopers: string;
  buildingFuture: string;
  messagesProcessed: string;
  activeConnections: string;
  responseTime: string;
  uptime: string;
  citiesDeployed: string;
  fleetsManaged: string;
  insurancePartners: string;

  // Investor Demo
  investorDashboard: string;
  investorSubtitle: string;
  targetMarkets: string;
  smartCityIntegration: string;
  fleetManagement: string;
  insuranceIntegration: string;
  liveDemo: string;
  emergencyServices: string;
  accidentPrevention: string;
  fuelEfficiency: string;
  responseTimeReduction: string;
  fraudDetectionRate: string;
  totalAddressableMarket: string;
  smartCityMarket: string;
  fleetMarket: string;
  insuranceMarket: string;
  totalMarketOpportunity: string;
  fiveYearTarget: string;
  requestPrivateDemo: string;
  tryLiveDemo: string;
  experienceRealTimeV2V: string;

  // V2V Console
  v2vNetwork: string;
  realTimeVehicleCommunication: string;
  activeMessages: string;
  searchRadius: string;
  broadcastMessage: string;
  liveFeed: string;
  realTime: string;
  noMessagesInRange: string;
  messagesWillAppearHere: string;
  connectedRealtime: string;
  reconnecting: string;

  // Identity
  vehicleIdentity: string;
  cryptographicallySecure: string;
  nickname: string;
  deviceId: string;
  publicKey: string;
  verified: string;

  // Social Proof Section
  trustedByDevelopersWorldwide: string;
  buildingFutureOfVehicleCommunication: string;
  realTimeProcessing: string;
  enterpriseSecurity: string;
  developerFirst: string;

  // Footer
  poweredBy: string;
  technologies: string[];
}

export const translations: Record<Language, Translations> = {
  en,
  he,
  ar,
  es,
  fr,
  de,
};

export function getTranslation(language: Language): Translations {
  return translations[language] || translations.en;
}

// Language list with display names
export const languages: Array<{ code: Language, name: string, direction: 'ltr' | 'rtl' }> = [
  { code: 'en', name: 'English', direction: 'ltr' },
  { code: 'he', name: 'עברית', direction: 'rtl' },
  { code: 'ar', name: 'العربية', direction: 'rtl' },
  { code: 'es', name: 'Español', direction: 'ltr' },
  { code: 'fr', name: 'Français', direction: 'ltr' },
  { code: 'de', name: 'Deutsch', direction: 'ltr' },
];