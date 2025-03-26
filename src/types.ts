export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  password: string;
  verified: boolean;
  avatar_url: string;
}

export interface FoodItem {
  id: number;
  user_id: number; // Giver's user ID
  item_description: string;
  pickup_address: string;
  box_option: "need" | "noNeed";
  food_types: string;
  ingredients: string;
  special_notes: string;
  lat: number | null;
  lng: number | null;
  approved: boolean;
}

export interface Preferences {
  id?: number;
  user_id: number;
  city: string;
  radius: number;
  food_preference: string;
  allergies: string;
}

export interface Message {
  senderId: number;
  message: string;
  created_at: string;
}
