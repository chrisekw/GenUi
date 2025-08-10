export interface GalleryItem {
  id: string;
  name: string;
  description: string;
  prompt: string;
  code: string;
  category?: string;
  authorId?: string;
  likes?: number;
  copies?: number;
}

export const galleryItems: GalleryItem[] = [];
