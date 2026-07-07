"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import DiscountBadge from "@/components/common/DiscountBadge";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  discountPercentage?: number;
  stock?: number;
}

export default function ProductImageGallery({
  images,
  productName,
  discountPercentage,
  stock,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const handleThumbnailClick = (index: number) => {
    setSelectedImage(index);
  };

  const handleMainImageClick = () => {
    setModalImageIndex(selectedImage);
    setIsModalOpen(true);
  };

  const handlePrevImage = () => {
    setModalImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setModalImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevImage();
    if (e.key === "ArrowRight") handleNextImage();
    if (e.key === "Escape") setIsModalOpen(false);
  };

  return (
    <>
      <div className="relative">
        <div className="sticky top-5">
          {/* Main Image */}
          <div className="relative bg-background rounded-2xl overflow-hidden border border-border shadow-sm cursor-pointer group h-[400px] sm:h-[500px] flex items-center justify-center transition-all duration-300 hover:shadow-md hover:border-primary/30">
            <div
              onClick={handleMainImageClick}
              className="relative w-full h-full p-4"
            >
              <Image
                src={images[selectedImage]}
                alt={`${productName} - Image ${selectedImage + 1}`}
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-105"
                priority={selectedImage === 0}
              />
              {/* Overlay hint on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0">
                  <span className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                      <path d="M8 11h6" />
                      <path d="M11 8v6" />
                    </svg>
                    Click to Enlarge
                  </span>
                </span>
              </div>
            </div>

            {/* Discount Badge */}
            {(discountPercentage ?? 0) > 0 && (
              <div className="absolute top-4 left-4">
                <DiscountBadge
                  discountPercentage={discountPercentage!}
                  className="w-16 h-16 text-lg"
                />
              </div>
            )}

            {/* Stock Badge */}
            {stock !== undefined && stock <= 5 && stock > 0 && (
              <div className="absolute top-4 right-4 bg-accent text-background px-3 py-1 rounded-full text-sm font-medium">
                Only {stock} left!
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  onMouseEnter={() => handleThumbnailClick(index)}
                  className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 bg-background ${
                    selectedImage === index
                      ? "border-primary ring-2 ring-primary/20 shadow-sm"
                      : "border-border hover:border-primary/50 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${productName} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setIsModalOpen(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2.5 backdrop-blur-md"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 text-white/90 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium tracking-wide">
            {modalImageIndex + 1} / {images.length}
          </div>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-all bg-white/10 hover:bg-white/20 hover:scale-110 rounded-full p-3 backdrop-blur-md disabled:opacity-50"
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-all bg-white/10 hover:bg-white/20 hover:scale-110 rounded-full p-3 backdrop-blur-md disabled:opacity-50"
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          {/* Main Modal Image */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[modalImageIndex]}
              alt={`${productName} - Image ${modalImageIndex + 1}`}
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>

          {/* Thumbnail Navigation */}
          {images.length > 1 && (
            <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-black/50 backdrop-blur-md rounded-2xl max-w-[90vw] overflow-x-auto border border-white/10">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalImageIndex(index);
                  }}
                  className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all duration-300 ${
                    modalImageIndex === index
                      ? "border-2 border-white scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                      : "border border-white/20 hover:border-white/50 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${productName} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
