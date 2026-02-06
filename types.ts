
export type PropertyType = 'Apartment' | 'Villa' | 'Penthouse' | 'Townhouse';
export type PropertyStatus = 'Available' | 'Sold' | 'Reserved' | 'Off-Market';
export type Visibility = 'Public' | 'Private Vault';

export interface Property {
  id: string | number;
  title: string;
  name?: string; // alias for compatibility
  slug?: string;
  type: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  area?: number; // alias for compatibility
  status: string;
  featured: boolean | number;
  isFeatured?: boolean; // alias for compatibility
  visibility?: string;
  created_at?: string;
  dateAdded?: string; // alias for compatibility
  image?: string;
  imageUrl?: string; // alias for compatibility
  views?: number;
  enquiries?: number;
}

export interface StatItem {
  label: string;
  value: string;
  growth: number;
  trend: 'up' | 'down';
}

// Database Schema Representation (Reference for Backend)
/*
  Table: properties
  - id: UUID PRIMARY KEY
  - name: VARCHAR(255)
  - type: ENUM('Apartment', 'Villa', 'Penthouse', 'Townhouse')
  - location: VARCHAR(255)
  - price: BIGINT (AED)
  - currency: VARCHAR(3) DEFAULT 'AED'
  - bedrooms: INT
  - bathrooms: INT
  - area_sqft: FLOAT
  - parking_slots: INT
  - furnishing: ENUM('Furnished', 'Semi', 'Unfurnished')
  - view_type: VARCHAR(100)
  - status: ENUM('Available', 'Sold', 'Reserved', 'Off-Market')
  - is_featured: BOOLEAN DEFAULT false
  - visibility: ENUM('Public', 'Private Vault')
  - description_short: TEXT
  - description_full: TEXT
  - amenities: JSONB (Array of strings)
  - tags: JSONB (Array of strings)
  - cover_image: TEXT (URL)
  - gallery_images: JSONB (Array of URLs)
  - confidential_notes: TEXT
  - created_at: TIMESTAMP
  - views_count: INT DEFAULT 0
*/
