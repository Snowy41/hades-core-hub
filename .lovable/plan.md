

# Hades Client — Website Plan

## Design Direction
- **Dark theme** with orange/yellow accent colors — fitting the mythological "Hades" brand
- Modern, clean UI with glassmorphism effects, subtle gradients, and smooth animations
- Ghost/stealth aesthetic with sleek typography and premium feel

---

## Pages & Features

### 1. Homepage
- Hero section with animated background, client name "HADES", tagline, and CTA buttons (Download / Learn More)
- Feature showcase widgets — highlighting ghost injection, bypass capabilities, and key modules
- Embedded video/media section showing the client in-game
- Stats counter (e.g., users, configs, uptime)
- Testimonials or community highlights
- Footer with links, socials, and branding

### 2. Download Page
- **Pricing tiers** (e.g., Free / Premium / Lifetime) with feature comparison
- Prominent download buttons per tier
- Version changelog section showing recent updates
- Embedded gameplay videos or screenshots showcasing the client
- FAQ section about installation and compatibility

### 3. Account System (Supabase Backend)
- **Login & Register** pages with email/password authentication
- **User Profile** page showing:
  - Username, avatar, account tier
  - Hades Coin balance (custom currency)
  - Uploaded configs list
  - Purchase history
- User profiles table linked to Supabase auth

### 4. Currency System ("Hades Coins")
- In-app currency used to buy configs on the marketplace
- **Buy coins** flow — integrated with Stripe for real-money purchases
- **Withdraw coins** flow — users can request to cash out earned coins
- Transaction history visible on the profile page
- Balance displayed in the navigation bar when logged in

### 5. Config Marketplace
- Browse all configs with search, filters (by category, price, rating, popularity)
- Config detail page with description, screenshots, ratings, and download/buy button
- **Upload config** form for logged-in users — set title, description, category, and price (free or Hades Coins)
- **Rating system** — users can rate configs after downloading
- Team-provided "Official" configs highlighted with a badge, available for free
- File storage via Supabase Storage for config files

---

## Navigation & Layout
- Sticky top navbar with logo, page links, currency balance, and login/profile button
- Mobile-responsive hamburger menu
- Consistent dark theme across all pages

---

## Backend (Supabase)
- **Auth**: Email/password login and registration
- **Database tables**: Profiles, configs, ratings, transactions, currency balances, user roles
- **Storage**: Config file uploads
- **RLS policies**: Users manage their own data; admins manage official configs
- **Stripe integration**: For purchasing Hades Coins with real money

