"use client";

import { useState } from "react";
import Image from "next/image";

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
          <Image
            src={selectedImage}
            alt={productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />
        )}
      </main>
      <footer className="grid grid-cols-4 lg:flex lg:flex-col gap-4 lg:w-20 lg:h-[240px]">
        {productImages.map((image, index) =>
          image.endsWith(".mp4") ? (
            <button
              key={index}
              onClick={() => setSelectedImage(image)}
              className={`relative aspect-square w-full overflow-hidden rounded-lg ${
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
              className={`relative aspect-square w-full overflow-hidden rounded-lg ${
                selectedImage === image ? "ring-2 ring-black" : ""
              }`}
            >
              <Image
                src={image}
                alt={`${productName} - vista ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover object-center"
              />
            </button>
          )
        )}
      </footer>
    </section>
  );
}
