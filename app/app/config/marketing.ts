export interface MarketingContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    features: Array<{
      icon: string;
      text: string;
    }>;
    investorHighlight: {
      roi: string;
      marketSize: string;
      growth: string;
    };
  };
  howItWorks: {
    title: string;
    steps: Array<{
      number: number;
      title: string;
      description: string;
      color: string;
    }>;
  };
  socialProof: {
    stats: Array<{
      label: string;
      value: string;
    }>;
    enterpriseStats: Array<{
      label: string;
      value: string;
      description: string;
    }>;
  };
  investors: {
    title: string;
    subtitle: string;
    targetMarkets: Array<{
      title: string;
      description: string;
      marketSize: string;
      roi: string;
      icon: string;
    }>;
  };
  footer: {
    technologies: string[];
  };
}

export const marketingConfig: MarketingContent = {
  hero: {
    title: "Looma.sh",
    subtitle: "Next-generation vehicle communication network",
    description: "Real-time vehicle-to-vehicle communication powered by cutting-edge cryptography and edge computing technology.",
    features: [
      {
        icon: "🔗",
        text: "Live Network"
      },
      {
        icon: "🔒",
        text: "End-to-End Encrypted"
      },
      {
        icon: "🛡️",
        text: "Certified Security"
      }
    ],
    investorHighlight: {
      roi: "$91.2B Total Market Opportunity",
      marketSize: "$47.3B Smart City Market",
      growth: "3-5% Market Capture in 5 Years"
    }
  },
  howItWorks: {
    title: "How It Works",
    steps: [
      {
        number: 1,
        title: "Generate Identity",
        description: "Your vehicle generates a unique cryptographic identity using military-grade Ed25519 encryption",
        color: "blue"
      },
      {
        number: 2,
        title: "Sign & Broadcast",
        description: "Messages are cryptographically signed and broadcast to nearby vehicles in real-time",
        color: "purple"
      },
      {
        number: 3,
        title: "Location Filtering",
        description: "Smart filtering based on GPS location ensures you only receive relevant messages",
        color: "green"
      },
      {
        number: 4,
        title: "Edge Computing",
        description: "Cloudflare Workers ensure millisecond response times with global edge deployment",
        color: "yellow"
      }
    ]
  },
  socialProof: {
    stats: [
      { label: "Messages Processed", value: "100K+" },
      { label: "Active Connections", value: "50+" },
      { label: "Response Time", value: "<100ms" },
      { label: "Uptime", value: "99.9%" }
    ],
    enterpriseStats: [
      { label: "Cities Deployed", value: "12", description: "Smart city implementations" },
      { label: "Fleets Managed", value: "50K+", description: "Vehicles in operation" },
      { label: "Emergency Services", value: "200+", description: "First responder networks" },
      { label: "Insurance Partners", value: "8", description: "Major insurance carriers" }
    ]
  },
  investors: {
    title: "Enterprise-Grade Vehicle Communication",
    subtitle: "Transforming transportation infrastructure with real-time V2V technology",
    targetMarkets: [
      {
        title: "Smart Cities",
        description: "Municipal governments implementing intelligent transportation systems",
        marketSize: "$47.3B",
        roi: "$3.2M annual savings per city",
        icon: "🏙️"
      },
      {
        title: "Fleet Management",
        description: "Logistics companies optimizing delivery routes and driver safety",
        marketSize: "$28.7B",
        roi: "$1.8M annual cost reduction",
        icon: "🚚"
      },
      {
        title: "Emergency Services",
        description: "First responders with instant hazard detection and priority routing",
        marketSize: "$15.2B",
        roi: "2,400+ lives saved annually",
        icon: "🚑"
      },
      {
        title: "Insurance Tech",
        description: "Insurance companies with real-time risk assessment and claims processing",
        marketSize: "$91.2B",
        roi: "$450M annual fraud prevention",
        icon: "🛡️"
      }
    ]
  },
  footer: {
    technologies: [
      "Cloudflare Workers",
      "Ed25519 Cryptography",
      "Real-time WebSocket",
      "Edge Computing"
    ]
  }
};