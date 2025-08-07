export interface GalleryItem {
  name: string;
  description: string;
  prompt: string;
  image: string;
  'data-ai-hint'?: string;
}

export const galleryItems: GalleryItem[] = [];
