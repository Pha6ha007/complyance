# Required Assets for SEO and Branding

## Favicon Files

### favicon.ico
- **Size:** 32x32px (multi-resolution ICO recommended: 16x16, 32x32, 48x48)
- **Format:** ICO
- **Purpose:** Browser tab icon
- **Location:** `/public/favicon.ico`

### apple-touch-icon.png
- **Size:** 180x180px
- **Format:** PNG
- **Purpose:** iOS home screen icon when user saves website
- **Location:** `/public/apple-touch-icon.png`

## Open Graph Images (Social Media Previews)

### og-home.png
- **Size:** 1200x630px
- **Format:** PNG or JPG
- **Purpose:** Landing page social media preview
- **Content:** Complyance logo + tagline "AI Compliance Platform for SaaS Companies"
- **Background:** Gradient (blue tones matching brand)
- **Location:** `/public/og-home.png`

### og-pricing.png
- **Size:** 1200x630px
- **Format:** PNG or JPG
- **Purpose:** Pricing page social media preview
- **Content:** "Transparent AI Compliance Pricing" + "$99-$499/mo" + key features
- **Location:** `/public/og-pricing.png`

### og-free-classifier.png
- **Size:** 1200x630px
- **Format:** PNG or JPG
- **Purpose:** Free classifier tool social media preview
- **Content:** "Free EU AI Act Risk Classifier" + "Instant Results, No Registration"
- **Location:** `/public/og-free-classifier.png`

## Logo

### logo.png
- **Size:** 512x512px (vector preferred, but PNG acceptable)
- **Format:** PNG with transparency
- **Purpose:** Schema.org structured data, footer branding
- **Location:** `/public/logo.png`

## How to Generate These Assets

### Using Design Tools
1. **Figma/Canva:** Create designs matching brand colors
2. **Favicon Generator:** Use https://realfavicongenerator.net/ to generate multi-resolution favicons
3. **OG Image Generator:** Use https://www.opengraph.xyz/ or Figma templates

### Brand Colors (for consistency)
- **Primary Blue:** #2563eb (Tailwind blue-600)
- **Dark Blue:** #1e40af (Tailwind blue-800)
- **Slate:** #64748b (Tailwind slate-500)
- **White/Off-white:** #f8fafc (Tailwind slate-50)

### Quick Placeholders (temporary solution)
If you need placeholders immediately:
1. Use https://placehold.co/1200x630/2563eb/ffffff?text=Complyance for OG images
2. Use https://favicon.io/favicon-generator/ for quick favicon generation

## Next.js App Icon Convention (Alternative)

Instead of manually creating favicon.ico, you can also use Next.js app directory icon convention:
- `src/app/icon.png` or `src/app/icon.svg` - automatically converted to favicon
- `src/app/apple-icon.png` - automatically used as apple-touch-icon

This is the recommended approach for Next.js 14+.
