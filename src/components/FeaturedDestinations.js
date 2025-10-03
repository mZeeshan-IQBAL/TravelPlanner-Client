import React from 'react';
import { Link } from 'react-router-dom';

// A simple featured destinations grid that links directly to search results
// Clicking a card navigates to /search?q=<destination>
const destinations = [
  {
    name: 'Paris',
    subtitle: 'Eiffel Tower • Louvre • Seine',
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1600&auto=format&fit=crop',
  },
  {
    name: 'Tokyo',
    subtitle: 'Shibuya • Senso-ji • Akihabara',
    image:
      'https://images.unsplash.com/photo-1505060890687-7b0de6b2d2d2?q=80&w=1600&auto=format&fit=crop',
  },
  {
    name: 'Rome',
    subtitle: 'Colosseum • Vatican City • Pantheon',
    image:
      'https://images.unsplash.com/photo-1549887534-1541e9323bcb?q=80&w=1600&auto=format&fit=crop',
  },
  {
    name: 'Bangkok',
    subtitle: 'Wat Arun • Grand Palace • Markets',
    image:
      'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1600&auto=format&fit=crop',
  },
  {
    name: 'New York',
    subtitle: 'Statue of Liberty • Times Square',
    image:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop',
  },
  {
    name: 'London',
    subtitle: 'Tower Bridge • British Museum',
    image:
      'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1600&auto=format&fit=crop',
  },
  {
    name: 'Dubai',
    subtitle: 'Burj Khalifa • Palm Jumeirah',
    image:
      'https://images.unsplash.com/photo-1504274066651-8d31a536b11a?q=80&w=1600&auto=format&fit=crop',
  },
];

const FeaturedDestinations = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
          Explore popular places
        </h2>
        <p className="text-secondary-600 dark:text-secondary-400 mt-2">
          Quick links to start planning instantly
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map((d) => (
          <Link
            key={d.name}
            to={`/search?q=${encodeURIComponent(d.name)}`}
            className="group relative rounded-3xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-300 hover:-translate-y-1 border border-secondary-100 dark:border-secondary-800"
          >
            {/* Image */}
            <div className="aspect-[4/3] w-full overflow-hidden bg-secondary-200 dark:bg-secondary-800">
              <img
                src={d.image}
                alt={d.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Text */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <h3 className="text-xl font-bold drop-shadow-sm">{d.name}</h3>
              <p className="text-sm opacity-90">{d.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FeaturedDestinations;
