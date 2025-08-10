
import { Header } from '@/components/app/header';
import { CommunityGallery } from '@/components/app/community-gallery';
import { getGalleryItems } from '@/app/actions';
import { Sidebar } from '@/components/app/sidebar';

export default async function CommunityPage() {
  const galleryItems = await getGalleryItems();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col md:pl-[220px] lg:pl-[280px]">
        <Header />
        <main className="flex-1 overflow-y-auto">
            <CommunityGallery galleryItems={galleryItems} />
        </main>
      </div>
    </div>
  );
}
