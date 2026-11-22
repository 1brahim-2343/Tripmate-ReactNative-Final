import {
  CategoryFilter,
  Destination,
  DestinationWeather,
  Highlight,
} from "../types";

const WIKIPEDIA_BASE_URL = "https://en.wikipedia.org/api/rest_v1/page/summary";
const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_BASE_URL = "https://api.open-meteo.com/v1/forecast";
const FLAG_BASE_URL = "https://flagcdn.com/w80";

const WIKI_HEADERS = {
  Accept: "application/json",
  "User-Agent": "TripMateApp",
};

interface BaseDestination {
  id: string;
  name: string;
  wikiSlug: string;
  country: string;
  countryCode: string;
  category: Exclude<CategoryFilter, "All">;
  rating: number;
  reviewsCount: string;
  fallbackDescription: string;
  fallbackImage: string;
  latitude: number;
  longitude: number;
  highlights: Highlight[];
}

const FEATURED_DEFAULT_DESTINATIONS: BaseDestination[] = [
  {
    id: "lisbon",
    name: "Lisbon",
    wikiSlug: "Lisbon",
    country: "Portugal",
    countryCode: "PT",
    category: "Cities",
    rating: 4.7,
    reviewsCount: "98k reviews",
    fallbackDescription:
      "Explore historic yellow trams, pastel-colored neighborhoods, hilltop castles, and coastal viewpoints in Portugal's vibrant capital.",
    fallbackImage:
      "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=80",
    latitude: 38.7223,
    longitude: -9.1393,
    highlights: [
      {
        id: "lisbon-1",
        title: "Belém Tower",
        imageUrl:
          "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&q=80",
      },
      {
        id: "lisbon-2",
        title: "Alfama District",
        imageUrl:
          "https://images.unsplash.com/photo-1513735492246-483525079686?w=400&q=80",
      },
      {
        id: "lisbon-3",
        title: "Jerónimos Monastery",
        imageUrl:
          "https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?w=400&q=80",
      },
    ],
  },
  {
    id: "kyoto",
    name: "Kyoto",
    wikiSlug: "Kyoto",
    country: "Japan",
    countryCode: "JP",
    category: "Cities",
    rating: 4.8,
    reviewsCount: "125k reviews",
    fallbackDescription:
      "Experience the perfect blend of tradition and modernity in Kyoto. Ancient temples, beautiful gardens and cherry blossoms await you.",
    fallbackImage:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    latitude: 35.0116,
    longitude: 135.7681,
    highlights: [
      {
        id: "kyoto-1",
        title: "Fushimi Inari Shrine",
        imageUrl:
          "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&q=80",
      },
      {
        id: "kyoto-2",
        title: "Kinkaku-ji Temple",
        imageUrl:
          "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&q=80",
      },
      {
        id: "kyoto-3",
        title: "Arashiyama Bamboo Grove",
        imageUrl:
          "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&q=80",
      },
    ],
  },
  {
    id: "swiss-alps",
    name: "Swiss Alps",
    wikiSlug: "Swiss_Alps",
    country: "Switzerland",
    countryCode: "CH",
    category: "Nature",
    rating: 4.9,
    reviewsCount: "110k reviews",
    fallbackDescription:
      "Breathtaking snow-capped peaks, crystal-clear alpine lakes, and scenic mountain railways across the heart of Switzerland.",
    fallbackImage:
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80",
    latitude: 46.5594,
    longitude: 7.961,
    highlights: [
      {
        id: "swiss-1",
        title: "Matterhorn",
        imageUrl:
          "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400&q=80",
      },
      {
        id: "swiss-2",
        title: "Lauterbrunnen Valley",
        imageUrl:
          "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=400&q=80",
      },
      {
        id: "swiss-3",
        title: "Jungfraujoch",
        imageUrl:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
      },
    ],
  },
  {
    id: "bali",
    name: "Bali",
    wikiSlug: "Bali",
    country: "Indonesia",
    countryCode: "ID",
    category: "Beach",
    rating: 4.8,
    reviewsCount: "142k reviews",
    fallbackDescription:
      "Tropical beaches, lush emerald rice terraces, clifftop ocean temples, and world-class surf spots in Indonesia's island paradise.",
    fallbackImage:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    latitude: -8.4095,
    longitude: 115.1889,
    highlights: [
      {
        id: "bali-1",
        title: "Uluwatu Temple",
        imageUrl:
          "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&q=80",
      },
      {
        id: "bali-2",
        title: "Tegallalang Rice Terraces",
        imageUrl:
          "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&q=80",
      },
      {
        id: "bali-3",
        title: "Nusa Penida",
        imageUrl:
          "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=400&q=80",
      },
    ],
  },
  {
    id: "santorini",
    name: "Santorini",
    wikiSlug: "Santorini",
    country: "Greece",
    countryCode: "GR",
    category: "Beach",
    rating: 4.7,
    reviewsCount: "89k reviews",
    fallbackDescription:
      "Iconic whitewashed cliffside villages, blue-domed churches, and dramatic Aegean Sea sunsets across a volcanic caldera.",
    fallbackImage:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80",
    latitude: 36.3932,
    longitude: 25.4615,
    highlights: [
      {
        id: "santorini-1",
        title: "Oia Village",
        imageUrl:
          "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&q=80",
      },
      {
        id: "santorini-2",
        title: "Fira Caldera",
        imageUrl:
          "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&q=80",
      },
      {
        id: "santorini-3",
        title: "Red Beach",
        imageUrl:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80",
      },
    ],
  },
  {
    id: "banff",
    name: "Banff",
    wikiSlug: "Banff_National_Park",
    country: "Canada",
    countryCode: "CA",
    category: "Nature",
    rating: 4.9,
    reviewsCount: "76k reviews",
    fallbackDescription:
      "Turquoise glacial lakes, towering Canadian Rockies peaks, and abundant wildlife in Canada's oldest national park.",
    fallbackImage:
      "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800&q=80",
    latitude: 51.4968,
    longitude: -115.9281,
    highlights: [
      {
        id: "banff-1",
        title: "Lake Louise",
        imageUrl:
          "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=400&q=80",
      },
      {
        id: "banff-2",
        title: "Moraine Lake",
        imageUrl:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80",
      },
      {
        id: "banff-3",
        title: "Icefields Parkway",
        imageUrl:
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80",
      },
    ],
  },
];

// FlagCDN func
export function getFlagUrl(countryCode: string): string {
  return `${FLAG_BASE_URL}/${countryCode.trim().toLowerCase()}.png`;
}

//Wikipedia REST API func
async function fetchWikipediaSummary(slug: string): Promise<{
  extract?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}> {
  try {
    const response = await fetch(
      `${WIKIPEDIA_BASE_URL}/${encodeURIComponent(slug)}`,
      { headers: WIKI_HEADERS },
    );
    if (!response.ok) return {};
    const data = await response.json();

    return {
      extract: data.extract,
      imageUrl: data.originalimage?.source ?? data.thumbnail?.source,
      latitude: data.coordinates?.lat,
      longitude: data.coordinates?.lon,
    };
  } catch (error) {
    console.warn("Wiki fetch failed: ", slug, error);
    return {};
  }
}

// Open-Meteo Live Weather func
export async function fetchDestinationWeather(
  latitude: number,
  longitude: number,
): Promise<DestinationWeather | undefined> {
  try {
    const url = `${WEATHER_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const data = await response.json();

    if (!data.current_weather) return undefined;

    return {
      temperature: data.current_weather.temperature,
      windspeed: data.current_weather.windspeed,
      weathercode: data.current_weather.weathercode,
      isDay: data.current_weather.is_day === 1,
    };
  } catch {
    return undefined;
  }
}

// Combine all data(s) from APIs, return complete destination
// async function buildUserReadyDestination(
//   baseDestination: BaseDestination,
// ): Promise<Destination> {
//   const [wiki, weather, highlightSummaries] = await Promise.all([
//     fetchWikipediaSummary(baseDestination.wikiSlug),
//     fetchDestinationWeather(
//       baseDestination.latitude,
//       baseDestination.longitude,
//     ),
//     Promise.all(
//       baseDestination.highlights.map((h) => fetchWikipediaSummary(h.wikiSlug)),
//     ),
//   ]);

//   const highlights: Highlight[] = baseDestination.highlights.map(
//     (h, index) => ({
//       id: h.id,
//       title: h.title,
//       imageUrl: highlightSummaries[index]?.imageUrl ?? h.fallbackImage,
//     }),
//   );

//   return {
//     id: baseDestination.id,
//     name: baseDestination.name,
//     country: baseDestination.country,
//     countryCode: baseDestination.countryCode,
//     flagUrl: getFlagUrl(baseDestination.countryCode),
//     category: baseDestination.category,
//     rating: baseDestination.rating,
//     reviewsCount: baseDestination.reviewsCount,
//     description: wiki.extract ?? baseDestination.fallbackDescription,
//     imageUrl: wiki.imageUrl ?? baseDestination.fallbackImage,
//     latitude: wiki.latitude ?? baseDestination.latitude,
//     longitude: wiki.longitude ?? baseDestination.longitude,
//     highlights,
//     weather,
//   };
// }

// // 5. Fetch all Featured Destinations
// export async function fetchDestinations(): Promise<Destination[]> {
//   return Promise.all(
//     FEATURED_DEFAULT_DESTINATIONS.map(buildUserReadyDestination),
//   );
// }

// // 6. Fetch single Destination by ID (or dynamic city name from search)
// export async function fetchDestinationById(
//   id: string,
// ): Promise<Destination | null> {
//   const seed = FEATURED_DEFAULT_DESTINATIONS.find(
//     (item) => item.id.toLowerCase() === id.toLowerCase(),
//   );
//   if (seed) {
//     return buildUserReadyDestination(seed);
//   }

//   // If user searched a custom city not in SEED_DESTINATIONS, resolve via Open-Meteo + Wikipedia!
//   const searched = await searchCitiesRemote(id);
//   return searched[0] ?? null;
// }

// 7. Live Worldwide City Search using Open-Meteo Geocoding API + Wikipedia + FlagCDN

let alreadyFetchedDestinations: Destination[] | null = null;

async function buildUserReadyDestination(
  baseDestination: BaseDestination,
): Promise<Destination> {
  const [wiki, weather] = await Promise.all([
    fetchWikipediaSummary(baseDestination.wikiSlug),
    fetchDestinationWeather(
      baseDestination.latitude,
      baseDestination.longitude,
    ),
  ]);

  return {
    id: baseDestination.id,
    name: baseDestination.name,
    country: baseDestination.country,
    countryCode: baseDestination.countryCode,
    flagUrl: getFlagUrl(baseDestination.countryCode),
    category: baseDestination.category,
    rating: baseDestination.rating,
    reviewsCount: baseDestination.reviewsCount,
    description: wiki.extract ?? baseDestination.fallbackDescription,
    imageUrl: wiki.imageUrl ?? baseDestination.fallbackImage,
    latitude: wiki.latitude ?? baseDestination.latitude,
    longitude: wiki.longitude ?? baseDestination.longitude,
    highlights: baseDestination.highlights,
    weather,
  };
}

export async function fetchDestinations(): Promise<Destination[]> {
  if (alreadyFetchedDestinations) {
    return alreadyFetchedDestinations;
  }
  const destinations = await Promise.all(
    FEATURED_DEFAULT_DESTINATIONS.map(buildUserReadyDestination),
  );
  alreadyFetchedDestinations = destinations;
  return destinations;
}

export async function fetchDestinationById(
  id: string,
): Promise<Destination | null> {
  // 1. Reuse already-loaded destination from memory if available (0 new requests!)
  if (alreadyFetchedDestinations) {
    const existing = alreadyFetchedDestinations.find(
      (item) => item.id.toLowerCase() === id.toLowerCase(),
    );
    if (existing) return existing;
  }

  // 2. Otherwise build from DEFAULT_DESTINATIONS if it wasn't loaded yet
  const baseDestination = FEATURED_DEFAULT_DESTINATIONS.find(
    (item) => item.id.toLowerCase() === id.toLowerCase(),
  );
  if (baseDestination) {
    return buildUserReadyDestination(baseDestination);
  }

  // 3. Fallback for custom searched cities
  const searched = await searchCitiesRemote(id);
  return searched[0] ?? null;
}

export async function searchCitiesRemote(
  query: string,
): Promise<Destination[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(
    trimmed,
  )}&count=5&language=en&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to search cities");
  }

  const data = await response.json();
  const results: any[] = data.results ?? [];

  return Promise.all(
    results.map(async (item): Promise<Destination> => {
      const countryCode: string = item.country_code ?? "UN";
      const [wiki, weather] = await Promise.all([
        fetchWikipediaSummary(item.name),
        fetchDestinationWeather(item.latitude, item.longitude),
      ]);

      return {
        id: String(item.name).toLowerCase().replace(/\s+/g, "-"),
        name: item.name,
        country: item.country ?? countryCode,
        countryCode,
        flagUrl: getFlagUrl(countryCode),
        category: "Cities",
        rating: undefined,
        reviewsCount: undefined,
        description:
          wiki.extract ??
          `Explore ${item.name}, a popular destination in ${
            item.country ?? ""
          }.`,
        imageUrl:
          wiki.imageUrl ??
          "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
        latitude: item.latitude,
        longitude: item.longitude,
        highlights: [],
        weather,
      };
    }),
  );
}
