"use client";

import { useState } from "react";

interface ProductGalleryProps {
  mainImage: string;
  productName: string;
  productImages: string[];
}

export default function ProductGallery({
  mainImage,
  productName,
  productImages,
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(mainImage);

  const images = productImages.filter(
    (link) => link.endsWith(".jpg") || link.endsWith(".png")
  );

  const videos = productImages.filter((link) => link.endsWith(".mp4"));
  console.log("Imágenes:", images);
  console.log("Videos:", videos);

  return (
    <section className="flex flex-col lg:flex-row-reverse gap-4">
      <main className="aspect-square w-full overflow-hidden rounded-lg max-h-[460px]">
        {selectedImage.endsWith(".mp4") ? (
          <video className="h-full w-full object-cover object-center" controls>
            <source src={selectedImage} type="video/mp4" />
            Tu navegador no soporta el elemento de video.
          </video>
        ) : (
          <img
            src={selectedImage}
            alt={productName}
            className="h-full w-full object-cover object-center"
          />
        )}
      </main>
      <footer className="grid grid-cols-4 lg:flex lg:flex-col gap-4 lg:w-20 lg:h-[240px]">
        {productImages.map((image, index) =>
          image.endsWith(".mp4") ? (
            <button
              key={index}
              onClick={() => setSelectedImage(image)}
              className={`aspect-square w-full overflow-hidden rounded-lg ${
                selectedImage === image ? "ring-2 ring-black" : ""
              }`}
            >
              <video
                key={index}
                className="h-full w-full object-cover object-center"
              >
                <source src={image} type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>
            </button>
          ) : (
            <button
              key={index}
              onClick={() => setSelectedImage(image)}
              className={`aspect-square w-full overflow-hidden rounded-lg ${
                selectedImage === image ? "ring-2 ring-black" : ""
              }`}
            >
              <img
                src={image}
                alt={`${productName} view ${index + 1}`}
                className="h-full w-full object-cover object-center"
              />
            </button>
          )
        )}
      </footer>
    </section>
  );
}
