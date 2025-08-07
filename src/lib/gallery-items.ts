export interface GalleryItem {
  name: string;
  description: string;
  prompt: string;
  image: string;
  'data-ai-hint'?: string;
  code: string;
}

export const galleryItems: GalleryItem[] = [];
