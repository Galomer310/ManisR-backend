// src/types.ts
export interface User {
  id: string;
  username: string;
  email: string;
}

export interface FoodItem {
  id: number;
  user_id: number; // Giver’s user id
  item_description: string;
  pickup_address: string;
  box_option: "need" | "noNeed";
  food_types: string;
  ingredients: string;
  special_notes: string;
  lat: number | null;
  lng: number | null;
  avatar_url: string;
}

export interface Preferences {
  city: string;
  radius: number;
  foodPreference: string;
  allergies: string[];
}

export interface Message {
  senderId: number;
  message: string;
  created_at: string;
}
