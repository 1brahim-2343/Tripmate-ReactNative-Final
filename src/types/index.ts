export type CategoryFilter = "All" | "Beach" | "Cities" | "Nature";

export interface Highlight {
  id: string;
  title: string;
  imageUrl: string;
}

export interface DestinationWeather {
  temperature: number;
  windspeed: number;
  weathercode: number;
  isDay: boolean;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  countryCode: string; // e.g. "PT", "JP", "CH"
  flagUrl: string; // e.g. "https://flagcdn.com/w80/jp.png"
  category: Exclude<CategoryFilter, "All">;
  rating?: number;
  reviewsCount?: string;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  highlights: Highlight[];
  weather?: DestinationWeather;
}
export interface Trip {
  id: string;
  title: string;
  destinationId?: string;
  city: string;
  country: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  status: "upcoming" | "past";
  createdAt: string;
}

export type ActivityCategory =
  | "flight"
  | "landmark"
  | "food"
  | "hotel"
  | "other";

export interface Activity {
  id: string;
  tripId: string;
  dayNumber: number;
  time: string; // "09:00"
  title: string;
  location?: string;
  notes?: string;
  category: ActivityCategory;
}

export type ExpenseCategory =
  | "Flights"
  | "Accommodation"
  | "Food & Drinks"
  | "Activities";

export interface Expense {
  id: string;
  tripId: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  date: string;
}

export interface JournalEntry {
  id: string;
  tripId?: string;
  title: string;
  content: string;
  imageUri?: string;
  locationName?: string;
  createdAt: string;
}
