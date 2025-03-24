// backend/src/types/index.ts

import { RowDataPacket } from "mysql2/promise";

/**
 * Interface representing a basic User.
 */
export interface User {
  id: number;
  username: string;
  phone: string;
  password: string;
}

/**
 * UserRow extends User and RowDataPacket so that the type is compatible
 * with the data returned from mysql2's promise query.
 */
export interface UserRow extends User, RowDataPacket {}

/**
 * Interface representing a Food Item record in the database.
 */
export interface FoodItem {
  id: number;
  user_id: number;
  item_description: string;
  pickup_address: string;
  box_option: "need" | "noNeed";
  food_types: string;       // Comma-separated string (or JSON) of food types.
  ingredients: string;      // Comma-separated string (or JSON) of ingredients.
  special_notes: string;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Interface for Preferences, if needed.
 */
export interface UserPreferences {
  id?: number;
  user_id: number;
  city: string;
  radius: number;
  food_preference: "Kosher vegetarian" | "Vegan" | "Vegetarian + fish" | "No preferences";
  allergies: string; // Comma-separated string of allergies
  created_at?: Date;
  updated_at?: Date;
}
