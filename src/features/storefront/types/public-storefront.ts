// Shared types for storefront API responses

export interface StorefrontModule {
  id: string;
  type: string;
  title: string;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicStorefront {
  storeId: number;
  storeName: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  customization: {
    storeId: number;
    themeId?: string;
    themeName?: string;
    modules: StorefrontModule[];
    globalSettings: Record<string, unknown>;
    customCss?: string;
    isPublished: boolean;
    publishedAt?: string;
    publishVersion: number;
    viewCount?: number;
    createdAt?: string;
    updatedAt?: string;
  };
  store: {
    storeId: number;
    storeName: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    addresses?: Array<{
      type: string;
      name: string;
      phone: string;
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
      instructions: string;
    }>;
    openHours?: Array<{
      dayOfWeek: number;
      openTime: string;
      closeTime: string;
      isClosed: boolean;
    }>;
    categories?: Array<{
      name: string;
      description: string;
      icon: string;
    }>;
    galleryImages?: Array<{
      imageId: number;
      filePath: string;
      imageType: string;
      caption?: string;
      displayOrder: number;
      uploadedAt: string;
    }>;
    video?: {
      imageId: number;
      filePath: string;
      mimeType: string;
      uploadedAt: string;
      isExternalVideo?: boolean;
    };
  };
  products: Array<Record<string, unknown>>;
  isActive: boolean;
  lastUpdated: string;
}
