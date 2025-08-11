
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
}

export const galleryItems: GalleryItem[] = [];
