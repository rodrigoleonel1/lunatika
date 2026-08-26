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

  return (
    <section className="flex flex-col lg:flex-row-reverse gap-4">
      <main className="relative aspect-square w-full overflow-hidden rounded-lg max-h-[460px]">
        {selectedImage.endsWith(".mp4") ? (
          <video
            className="h-full w-full object-cover object-center"
            controls
            playsInline
            preload="metadata"
          >
            <source src={selectedImage} type="video/mp4" />
            Tu navegador no soporta el elemento de video.
          </video>
        ) : (
          <img
            src={selectedImage}
            alt={productName}
            loading="eager"
            decoding="async"
            fetchPriority="high"
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
              className={`relative aspect-square w-full overflow-hidden rounded-lg cursor-pointer ${
                selectedImage === image ? "ring-2 ring-black" : ""
              }`}
            >
              <video
                className="h-full w-full object-cover object-center"
                muted
                loop
                playsInline
                autoPlay
                preload="none"
              >
                <source src={image} type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>
            </button>
          ) : (
            <button
              key={index}
              onClick={() => setSelectedImage(image)}
              className={`relative aspect-square w-full overflow-hidden rounded-lg cursor-pointer ${
                selectedImage === image ? "ring-2 ring-black" : ""
              }`}
            >
              <img
                src={image}
                alt={`${productName} - vista ${index + 1}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-center"
              />
            </button>
          )
        )}
      </footer>
    </section>
  );
}
