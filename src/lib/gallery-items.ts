export interface GalleryItem {
  id: string;
  name: string;
  description: string;
  prompt: string;
  image?: string; // Kept optional for now
  'data-ai-hint'?: string;
  code: string;
  category?: string;
  authorId?: string;
  likes?: number;
  copies?: number;
}

export const galleryItems: GalleryItem[] = [];
