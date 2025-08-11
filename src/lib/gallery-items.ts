
export interface GalleryItem {
  id: string;
  name: string;
  description: string;
  prompt: string;
  code: string;
  previewHtml?: string;
  category?: string;
  authorId?: string;
  authorName?: string;
  authorImage?: string;
  likes?: number;
  copies?: number;
  createdAt?: Date;
  framework: 'html' | 'tailwindcss';
}

// Data needed to create a new gallery item, some fields are generated on server/DB
export type GalleryItemCreate = Omit<GalleryItem, 'id' | 'previewHtml' | 'createdAt'>;


export const galleryItems: GalleryItem[] = [];
