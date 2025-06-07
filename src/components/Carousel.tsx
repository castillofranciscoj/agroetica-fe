// src/components/Carousel.tsx
'use client';

import React, { useState, useEffect } from 'react';

export interface Slide {
  image: string;
  title?: string;
  desc?: string;
}

interface CarouselProps {
  items: Slide[];
  interval?: number; // ms between auto-slides
}

export default function Carousel({ items, interval = 5000 }: CarouselProps) {
  const [index, setIndex] = useState(0);

  // auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % items.length);
    }, interval);
    return () => clearInterval(timer);
  }, [items.length, interval]);

  const prev = () => setIndex(i => (i - 1 + items.length) % items.length);
  const next = () => setIndex(i => (i + 1) % items.length);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {items.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage:    `url(${slide.image})`,
            backgroundSize:     'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* bottom-left caption box */}
          {(slide.title || slide.desc) && (
            <div className="absolute bottom-8 left-8 bg-black bg-opacity-60 p-8 rounded-lg max-w-[60%] text-white">
              {slide.title && <h2 className="text-3xl font-bold">{slide.title}</h2>}
              {slide.desc  && <p className="mt-2">{slide.desc}</p>}
            </div>
          )}
        </div>
      ))}

      {/* nav arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 z-10"
      >
        ‹
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 z-10"
      >
        ›
      </button>

      {/* dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition ${
              i === index ? 'bg-white' : 'bg-gray-400'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
