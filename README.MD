# ✈️ TripMate — Explore. Plan. Remember.

**TripMate** is an offline-first mobile travel companion app built with **React Native**, **Expo**, **TypeScript**, and **Expo Router**. It lets travelers discover worldwide destinations with live weather and landmark highlights, plan day-by-day trip itineraries, explore interactive maps, and record travel memories in an offline SQLite journal.

---

## ✨ Key Features

- **🌍 Worldwide Destination Discovery**
  - Curated featured destinations across categories (`All`, `Beach`, `Cities`, `Nature`).
  - Live worldwide city search powered by **Open-Meteo Geocoding API**, **Wikipedia REST & GeoSearch APIs**, and **FlagCDN**.
  - Real-time temperature & day/night weather conditions at every destination.
  - Nearby landmark **Highlights** fetched dynamically by coordinates.
- **🗺️ Interactive Map (`react-native-maps` & `expo-location`)**
  - Browse destination pins on a full-screen dark/light adaptive map.
  - Search any city directly on the map and jump to your live GPS coordinates.
- **🧳 Offline-First Trip & Itinerary Planner (`expo-sqlite`)**
  - Create, edit, and manage **Upcoming** and **Past** trips with custom budgets, dates, and traveler counts.
  - Dynamic multi-day **Trip Itinerary** timeline calculated automatically from trip start and end dates.
  - Add categorized daily activities (`Sightseeing`, `Food`, `Flights`, `Hotel`, `Other`).
- **📸 Trip Photos & Travel Journal (`expo-image-picker`)**
  - Upload custom trip photos from the device media library.
  - Write and save personal travel diary stories with dates and photos in the **Travel Journal** drawer screen.
- **❤️ Saved Favorites**
  - Bookmark favorite destinations to SQLite and filter them in a 2-column grid.
- **🔐 Secure Authentication & Custom Theming**
  - Encrypted JWT token persistence via **`expo-secure-store`** (plus instant 1-tap Demo mode).
  - First-launch swipeable **Onboarding** flow and persistent **Light / Dark Mode** via **`AsyncStorage`**.
  - Native iOS 26 Liquid Glass tab bar (`NativeTabs`) + frosted **`expo-blur`** TripMate AI Assistant preview.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
| :--- | :--- |
| **Framework** | React Native (`0.88`) + Expo SDK (`58`) + TypeScript |
| **Navigation** | Expo Router (Root Stack + Auth Stack + Drawer + Native Tabs + Dynamic `[id]` Routes & Modals) |
| **Offline Database** | `expo-sqlite` (`trips`, `activities`, `favorites`, `journal` tables with foreign-key cascades) |
| **Secure Storage** | `expo-secure-store` (Auth tokens) |
| **Key-Value Storage** | `@react-native-async-storage/async-storage` (Theme & Onboarding state) |
| **Device APIs** | `expo-location`, `expo-image-picker`, `react-native-maps` |
| **UI & Animations** | `react-native-reanimated`, `react-native-gesture-handler`, `expo-linear-gradient`, `expo-blur`, `react-native-svg` |

---

## 🌐 External APIs Used (Zero API Keys Required)

1. **Wikipedia REST & GeoSearch API** (`https://en.wikipedia.org/api/rest_v1/page/summary/{slug}` & `/w/api.php`) — High-resolution destination cover photos, travel descriptions, and nearby landmark highlights within a 10km radius.
2. **Open-Meteo Geocoding & Weather Forecast API** (`https://geocoding-api.open-meteo.com` & `https://api.open-meteo.com`) — Live worldwide city search, coordinates, country codes, and real-time weather conditions.
3. **FlagCDN** (`https://flagcdn.com/w80/{code}.png`) — Country flag badges.

---

## 📂 Project Structure

```text
Tripmate-ReactNative-Final/
├── app/
│   ├── _layout.tsx                 # Root Stack, Providers & SQLite initialization
│   ├── index.tsx                   # Auth & Onboarding redirect guard
│   ├── +not-found.tsx              # 404 fallback screen
│   ├── (auth)/
│   │   ├── _layout.tsx             # Auth Stack layout
│   │   ├── onboarding.tsx          # First-time swipeable onboarding slides
│   │   └── login.tsx               # Sign In + 1-tap Demo Mode
│   ├── (drawer)/
│   │   ├── _layout.tsx             # Drawer navigator wrapping Tabs & Journal
│   │   ├── journal.tsx             # Travel Journal with photo picker
│   │   └── (tabs)/
│   │       ├── _layout.tsx         # NativeTabs + Floating TripMate AI modal
│   │       ├── index.tsx           # Home / Explore destinations
│   │       ├── map.tsx             # Interactive destination map
│   │       ├── trips.tsx           # My Trips (Upcoming & Past)
│   │       ├── favorites.tsx       # Saved Favorites 2-column grid
│   │       └── profile.tsx         # Profile & Settings (Dark Mode, Sign Out)
│   ├── destination/
│   │   └── [id].tsx                # Dynamic Destination Details & Highlights
│   └── trip/
│       ├── create.tsx              # Create Trip modal with city autocomplete
│       └── [id]/
│           ├── index.tsx           # Trip Overview dashboard
│           ├── edit.tsx            # Edit Trip screen
│           ├── itinerary.tsx       # Dynamic Day-by-Day timeline
│           ├── activity.tsx        # Add Activity modal
│           └── photos.tsx          # Trip Photos gallery with ImagePicker
└── src/
    ├── constants/
    │   └── storageKeys.ts          # AsyncStorage & SecureStore key constants
    ├── contexts/
    │   ├── AuthContext.tsx         # Auth session provider
    │   └── ThemeContext.tsx        # Dynamic Light & Dark theme provider
    ├── database/
    │   ├── db.ts                   # Singleton SQLite initialization & schema
    │   ├── trips.repo.ts           # CRUD for trips, activities & favorites
    │   └── journal.repo.ts         # CRUD for journal entries & trip photos
    ├── services/
    │   ├── api.ts                  # Wikipedia, Open-Meteo & FlagCDN client
    │   └── storage.ts              # SecureStore & AsyncStorage service
    ├── theme/
    │   └── theme.ts                # LightTheme & DarkTheme design tokens
    └── types/
        └── index.ts                # TypeScript domain interfaces
```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/1brahim-2343/Tripmate-ReactNative-Final.git
cd Tripmate-ReactNative-Final
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the Expo development server
```bash
npx expo start -c
```
Scan the QR code with **Expo Go** on iOS or Android (or press `i` for iOS Simulator / `a` for Android Emulator).

---

## 🔑 Demo Credentials

You can tap **"Try the demo"** on the Login screen for instant access, or sign in manually with:

- **Email:** `johnddoe@tripmate.app`
- **Password:** `Password123!`

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).