'use client';
import Image from 'next/image';

export default function SustainabilitySection() {
  return (
    <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
      {/* text */}
      <div className="space-y-6 order-2 md:order-1">
        <h2 className="text-3xl font-bold">
          Technology for sustainable agriculture
        </h2>
        <p className="text-gray-700">
          Use data to monitor your activities, improve practices and capture
          soil carbon through <strong>Regenerative&nbsp;Agriculture</strong>.
        </p>

        <ul className="space-y-3">
          {[
            ['Carbon dioxide', 'CO₂eq', '🌿'],
            ['Water', 'm³', '💧'],
            ['Acidification', 'SO₂eq', '🧪'],
            ['Eutrophication', 'PO₄eq', '🦠'],
          ].map(([label, unit, icon]) => (
            <li key={label} className="flex items-center space-x-3">
              <span className="text-2xl">{icon}</span>
              <span className="font-medium">
                {label} <span className="text-gray-500">-{unit}</span>
              </span>
            </li>
          ))}
        </ul>

        <a
          href="/pricing"
          className="inline-block border-2 border-green-700 text-green-700 px-8 py-3 rounded-md hover:bg-green-50 transition"
        >
          Increase your sustainability
        </a>
      </div>

      {/* image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden shadow order-1 md:order-2">
        <Image
          src="/img/sustainability-hands.jpg"
          alt="Seedling in hands"
          fill
          className="object-cover"
          priority
        />
      </div>
    </section>
  );
}
