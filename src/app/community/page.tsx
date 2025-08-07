
import { Header } from '@/components/app/header';
import { CommunityGallery } from '@/components/app/community-gallery';
import { getGalleryItems } from '@/app/actions';

export default async function CommunityPage() {
  const galleryItems = await getGalleryItems();

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <CommunityGallery galleryItems={galleryItems} />
      </main>
    </div>
  );
}
