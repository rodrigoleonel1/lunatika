import { Container } from "@/components/admin/container";
import { Heading } from "@/components/admin/heading";
import { getImagesWithUsage } from "@/actions/getImagesWithUsage";
import { ImagesGallery } from "@/components/admin/images-gallery";

export const dynamic = "force-dynamic";

export default async function ImagesAdminPage() {
  const images = await getImagesWithUsage();
  const unusedCount = images.filter(
    (img) => img.products.length === 0 && img.categories.length === 0
  ).length;

  return (
    <Container>
      <Heading
        title={`Imágenes (${images.length})`}
        description={`Todas las imágenes subidas a Supabase Storage, y en qué productos o categorías se están usando.${
          unusedCount > 0 ? ` ${unusedCount} sin usar.` : ""
        }`}
      />
      <ImagesGallery images={images} />
    </Container>
  );
}
