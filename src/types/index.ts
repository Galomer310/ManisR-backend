import { RowDataPacket } from "mysql2/promise";

/**
 * User interface now uses email instead of phone.
 */
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
}

/**
 * UserRow extends User and RowDataPacket.
 */
export interface UserRow extends User, RowDataPacket {}

/**
 * Interface representing a Food Item record.
 */
export interface FoodItem {
  id: number;
  user_id: number;
  item_description: string;
  pickup_address: string;
  box_option: "need" | "noNeed";
  food_types: string;
  ingredients: string;
  special_notes: string;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Interface for User Preferences.
 */
export interface UserPreferences {
  id?: number;
  user_id: number;
  city: string;
  radius: number;
  food_preference: "Kosher vegetarian" | "Vegan" | "Vegetarian + fish" | "No preferences";
  allergies: string;
  created_at?: Date;
  updated_at?: Date;
}
