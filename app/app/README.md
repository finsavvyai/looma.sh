# Looma.sh Frontend - Extensible Marketing Website

This is a modern, marketing-focused frontend for the Looma.sh V2V communication platform. The code is organized to be easily extensible with new marketing sections and content.

## 📁 Project Structure

```
app/
├── app/
│   ├── components/
│   │   ├── sections/          # Marketing sections
│   │   │   ├── Hero.tsx       # Main hero section
│   │   │   ├── SocialProof.tsx # Stats and trust indicators
│   │   │   ├── HowItWorks.tsx # Process explanation
│   │   │   └── Demo.tsx       # Live demo with V2V console
│   │   ├── layout/
│   │   │   └── Layout.tsx     # Main layout with navigation
│   │   ├── V2VConsole.tsx     # Core V2V functionality
│   │   └── IdentityCard.tsx   # User identity display
│   ├── config/
│   │   └── marketing.ts       # Centralized marketing content
│   ├── lib/
│   │   └── identity.ts       # Authentication & crypto
│   ├── styles/
│   │   └── animations.css    # Custom animations
│   └── page.tsx               # Main page composition
```

## 🎨 Design System

The website uses a modern dark theme with:
- **Colors**: Blue/Purple gradients for CTAs, slate for backgrounds
- **Typography**: Clean hierarchy with bold headers
- **Animations**: Smooth transitions, hover effects, loading states
- **Components**: Glass morphism effects, backdrop blur, shadows

## 📝 Adding Marketing Content

### 1. Update Marketing Configuration

All marketing content is centralized in `config/marketing.ts`:

```typescript
export const marketingConfig: MarketingContent = {
  hero: {
    title: "Looma.sh",
    subtitle: "Your new subtitle",
    description: "Your description",
    features: [
      { icon: "🔗", text: "New Feature" },
      // Add more features
    ]
  },
  // Update other sections...
};
```

### 2. Create New Sections

To add a new marketing section:

1. Create a new component in `app/components/sections/`:
```typescript
// app/components/sections/NewSection.tsx
"use client";

import { marketingConfig } from "../../config/marketing";

export default function NewSection() {
  return (
    <section className="max-w-6xl mx-auto py-16">
      {/* Your section content */}
    </section>
  );
}
```

2. Add it to the main page:
```typescript
// app/page.tsx
import NewSection from "./components/sections/NewSection";

export default function Home() {
  return (
    <Layout>
      <Hero />
      <NewSection /> {/* Add here */}
      {/* Other sections */}
    </Layout>
  );
}
```

### 3. Extending Navigation

Update `Layout.tsx` to add new navigation items:

```typescript
<div className="hidden md:flex items-center space-x-8">
  <a href="#new-section" className="text-gray-300 hover:text-white transition-colors">
    New Section
  </a>
  {/* Other nav items */}
</div>
```

## 🎯 Customization Options

### Hero Section
- Title and subtitle gradients
- Call-to-action buttons
- Feature icons and text
- Background animations

### Social Proof
- Statistics and metrics
- Trust indicators
- Customer logos (easy to add)

### How It Works
- Step-by-step process
- Color-coded sections
- Architecture diagrams

### Demo Section
- Live V2V console integration
- Instructions and privacy notice
- Interactive elements

## 🚀 Deployment

The frontend is built for static export and deployment to Cloudflare Pages:

```bash
npm run build    # Build the static site
npm run deploy   # Deploy to Cloudflare Pages
```

## 📱 Mobile Responsiveness

- Mobile-first design approach
- Responsive navigation with hamburger menu
- Touch-friendly interactions
- Optimized typography for all screen sizes

## 🔧 Technical Features

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom animations
- **TypeScript**: Full type safety
- **WebSocket**: Real-time V2V communication with HTTP fallback
- **Crypto**: Ed25519 for secure identity generation

## 🛠 Extending with Bolt.new

The modular structure makes it easy to import into Bolt.new and extend:

1. **Add New Marketing Pages**: Create new route files in `app/`
2. **Add Components**: Build reusable components in `app/components/`
3. **Update Content**: Modify `config/marketing.ts` for text changes
4. **Add Sections**: Create new section components and import them
5. **Customize Design**: Update Tailwind classes and animations

## 📊 Analytics Integration

Easily add analytics by updating `Layout.tsx`:

```typescript
// Add your analytics tracking code here
useEffect(() => {
  // Google Analytics, Mixpanel, etc.
}, []);
```

## 🎨 Brand Customization

Update the color scheme by modifying Tailwind classes in components:

- **Primary**: `from-blue-600 to-purple-600`
- **Secondary**: `from-slate-700 to-slate-800`
- **Accent**: Modify gradient classes as needed

This structure provides a solid foundation for marketing while maintaining the core V2V functionality. Perfect for rapid iteration and A/B testing of marketing content!