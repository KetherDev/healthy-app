# Healthy - Wellness Marketplace App

## Overview
A wellness marketplace app built with React Native Expo (SDK 54) and Supabase backend. Users can discover wellness establishments, browse classes, book sessions, and manage their wellness journey.

## Tech Stack
- **Framework**: React Native with Expo SDK 54
- **Routing**: expo-router (file-based)
- **Backend**: Supabase (hosted at eoyqjiehqjullmuopcbc.supabase.co)
- **Auth**: Supabase Auth with expo-secure-store for session persistence
- **Styling**: React Native StyleSheet with custom design tokens

## Project Structure
```
app/                    # File-based routing screens
  _layout.tsx          # Root layout with AuthProvider
  index.tsx            # Entry redirect (auth check)
  auth.tsx             # Login/Register screen
  +not-found.tsx       # 404 screen
  (tabs)/              # Tab navigator
    _layout.tsx        # Tab bar config (icon-only, no labels)
    home.tsx           # Discovery screen with categories, featured, nearby
    search.tsx         # Search with filters
    bookings.tsx       # User bookings (upcoming/past)
    profile.tsx        # Profile, stats, settings
  establishment/[id].tsx  # Establishment detail with classes
  booking/[classId].tsx   # Booking confirmation flow

lib/                    # Core utilities
  supabase.ts          # Supabase client config
  auth.tsx             # AuthProvider context
  types.ts             # TypeScript interfaces
  theme.ts             # Design tokens (colors, spacing, typography)

hooks/                  # Data hooks
  useEstablishments.ts  # Fetch establishments
  useClasses.ts         # Fetch classes
  useBookings.ts        # Manage bookings
  useFavorites.ts       # Manage favorites
```

## Design System
- Primary: #4CAF7D (soft green)
- Background: #FAFBFC
- iOS-style rounded aesthetics
- Tab bar: icons only, no labels

## Database Tables (Supabase)
- profiles, establishments, classes, bookings, favorites
- All with RLS enabled
- 8 establishments and 25+ classes seeded

## Running
Dev server: `npx expo start --web --clear` on port 5000
