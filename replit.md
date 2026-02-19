# Healthy - Wellness Marketplace App

## Overview
A wellness marketplace app built with React Native Expo (SDK 54) and Supabase backend. Users can discover wellness establishments, browse classes, book sessions, and manage their wellness journey. Features a polished green-themed UI with map exploration, booking flow with date/time selection, and booking confirmation with QR codes.

## Tech Stack
- **Framework**: React Native with Expo SDK 54
- **Routing**: expo-router (file-based)
- **Backend**: Supabase (hosted at eoyqjiehqjullmuopcbc.supabase.co)
- **Auth**: Supabase Auth with expo-secure-store for session persistence
- **Styling**: React Native StyleSheet with custom design tokens
- **Date Handling**: date-fns
- **Maps**: Leaflet + OpenStreetMap (web), react-native-maps (mobile, bundled in Expo Go)

## Project Structure
```
app/                    # File-based routing screens
  _layout.tsx          # Root layout with AuthProvider
  index.tsx            # Entry redirect (auth check)
  auth.tsx             # Login/Register screen (tab toggle, social auth)
  +not-found.tsx       # 404 screen
  (tabs)/              # Tab navigator
    _layout.tsx        # Tab bar config (4 tabs with labels)
    home.tsx           # Discovery: greeting, search, categories, nearby, today's classes
    explore.tsx        # Map-style explore with pins, filters, detail popup
    bookings.tsx       # User bookings (upcoming/past tabs, status badges)
    profile.tsx        # Profile card, stats, menu, sign out
  establishment/[id].tsx  # Detail: hero image, tabs (classes/info/reviews), bottom CTA
  booking/[classId].tsx   # Booking: date picker, time slots, payment, confirmation + QR

lib/                    # Core utilities
  supabase.ts          # Supabase client config
  auth.tsx             # AuthProvider context
  types.ts             # TypeScript interfaces
  theme.ts             # Design tokens (colors, spacing, typography, shadows)

hooks/                  # Data hooks
  useEstablishments.ts  # Fetch establishments (list, single, featured)
  useClasses.ts         # Fetch classes by establishment, single class
  useAllClasses.ts      # Fetch upcoming classes for home screen
  useBookings.ts        # Manage bookings (create, cancel)
  useFavorites.ts       # Manage favorites (toggle, check)
```

## Design System
- Primary: #22C55E (vibrant green)
- Background: #FFFFFF
- Text: #1a1a2e (dark navy)
- Secondary text: #64748B, #94A3B8
- Cards: rounded 16px corners, light borders (#F1F5F9)
- Tab bar: icons + labels, 85px height
- Consistent shadows (sm/md/lg)

## Database Tables (Supabase)
- profiles, establishments, classes, bookings, favorites
- All with RLS enabled
- 8 establishments (SF area with lat/lng) and 26 classes seeded
- Prices stored in cents (e.g., 2500 = $25.00)

## Navigation Flow
1. Auth screen (sign in/sign up with tab toggle)
2. Home tab: greeting, search bar -> explore, category filter, nearby cards, today's classes
3. Explore tab: map-style pins with price bubbles, search + category filters, detail popup
4. Establishment detail: hero image, classes/info/reviews tabs, "Book a Class" CTA
5. Booking flow: date picker (7 days), time slots, payment summary, confirmation + QR code
6. Bookings tab: upcoming/past toggle, status badges, cancel/reschedule actions
7. Profile tab: avatar, stats row, settings menu, sign out

## Running
Dev server: `npx expo start --web --clear` on port 5000
