'use client';
import Image from 'next/image';

export default function SupportSection() {
  return (
    <section className="relative bg-sky-100 py-16 -mx-6 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-square rounded-2xl overflow-hidden shadow">
          <Image
            src="/img/support-tablet.jpg"
            alt="Support on the field"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold">
            Using xFarm is easy, find out how we can help you
          </h2>
          <a
            href="/support"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700"
          >
            Go to Support Center
          </a>
        </div>
      </div>
    </section>
  );
}
