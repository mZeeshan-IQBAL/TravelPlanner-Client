import React, { useMemo, useState, useEffect } from 'react';
import Layout from '../components/Layout';
import GuideCard from '../components/GuideCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { guidesAPI } from '../services/api';

const SAMPLE_GUIDES = [
  {
    id: 'jp-1',
    title: 'Japan: Video Game Guide',
    excerpt: 'Visited Tokyo/Kyoto/Osaka twice, and loved it each time! My recommendations for arcades, game shops, and themed cafes.',
    cover: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1600&auto=format&fit=crop',
    location: 'Japan',
    tags: ['Japan', 'Tokyo', 'Kyoto', 'Osaka'],
    author: { name: 'Natalie Jiang', avatarUrl: 'https://i.pravatar.cc/100?img=5' },
    stats: { likes: 135, comments: 6, views: 201 }
  },
  {
    id: 'jp-2',
    title: 'Pokémon Japan Guide',
    excerpt: 'If you’re a mild Pokémon fan like me, this guide will get you to all the best shops and events across Japan.',
    cover: 'https://images.unsplash.com/photo-1607968565040-b8be0aab160b?q=80&w=1600&auto=format&fit=crop',
    location: 'Tokyo, Japan',
    tags: ['Japan', 'Tokyo', 'Shopping'],
    author: { name: 'Anna', avatarUrl: 'https://i.pravatar.cc/100?img=12' },
    stats: { likes: 0, comments: 0, views: 19 }
  },
  {
    id: 'ie-1',
    title: 'Ireland and Scotland Guide',
    excerpt: 'Spent 2 magical weeks, tasting my way through distilleries and hiking the highlands.',
    cover: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1600&auto=format&fit=crop',
    location: 'Ireland & Scotland',
    tags: ['Ireland', 'Scotland', 'Road trip'],
    author: { name: 'Savannah', avatarUrl: 'https://i.pravatar.cc/100?img=14' },
    stats: { likes: 0, comments: 0, views: 10 }
  },
  {
    id: 'us-bos',
    title: 'Boston Walking Tour',
    excerpt: 'Lived in the area for 2 years during college — this is my favorite half-day tour on foot.',
    cover: 'https://images.unsplash.com/photo-1505762801498-611b67fb21d8?q=80&w=1600&auto=format&fit=crop',
    location: 'Boston, USA',
    tags: ['USA', 'Boston', 'City Walk'],
    author: { name: 'Lucas', avatarUrl: 'https://i.pravatar.cc/100?img=7' },
    stats: { likes: 24, comments: 3, views: 180 }
  },
  {
    id: 'pr-1',
    title: 'Puerto Rico Guide',
    excerpt: 'A collection of the best-of since I grew up here. Beaches, food, and day trips.',
    cover: 'https://images.unsplash.com/photo-1526404079164-030a37b1b497?q=80&w=1600&auto=format&fit=crop',
    location: 'Puerto Rico',
    tags: ['Caribbean', 'Beaches'],
    author: { name: 'Mariana', avatarUrl: 'https://i.pravatar.cc/100?img=49' },
    stats: { likes: 61, comments: 4, views: 266 }
  },
  {
    id: 'hi-1',
    title: 'Maui Guide - 4 days in Hawaii',
    excerpt: 'Our favorite place — here’s a short itinerary to maximize sunshine and beaches.',
    cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',
    location: 'Maui, Hawaii',
    tags: ['Hawaii', 'Beaches'],
    author: { name: 'Ben', avatarUrl: 'https://i.pravatar.cc/100?img=37' },
    stats: { likes: 87, comments: 2, views: 345 }
  },
];

const popular = ['Japan', 'New York City', 'Hawaii', 'Ireland', 'Scotland', 'Puerto Rico'];

const Guides = () => {
  const [q, setQ] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch guides from API
  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setLoading(true);
        const response = await guidesAPI.getAll();
        
        // Normalize the data structure - convert _id to id for consistency
        const normalizedGuides = (response.data.guides || []).map(guide => ({
          ...guide,
          id: guide._id || guide.id // Use _id from MongoDB, fallback to id if it exists
        }));
        
        setGuides(normalizedGuides);
        setError(null);
        
        // Check if data is from database or sample data
        if (response.data.source === 'sample_data') {
          setError('Using sample data - API connected but no database data found');
        }
      } catch (err) {
        console.error('Failed to fetch guides:', err);
        // Fallback to sample data if API fails
        setGuides(SAMPLE_GUIDES);
        setError('Using sample data - API unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return guides.filter(g => {
      const inText = !term || g.title.toLowerCase().includes(term) || g.location.toLowerCase().includes(term);
      const inTag = !activeTag || g.tags?.some(t => t.toLowerCase() === activeTag.toLowerCase());
      return inText && inTag;
    });
  }, [guides, q, activeTag]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" message="Loading travel guides..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                ⚠️ {error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero */}
      <div className="bg-white dark:bg-secondary-900 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-secondary-900 dark:text-secondary-100">
            Explore travel guides and itineraries
          </h1>

          {/* search */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search for a destination"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-secondary-200 bg-secondary-50 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-300 text-secondary-900 dark:bg-secondary-800 dark:border-secondary-700 dark:text-secondary-100"
              />
            </div>

            {/* Popular chips */}
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {popular.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTag(activeTag === t ? '' : t)}
                  className={`px-4 py-2 rounded-full text-sm border transition-all ${
                    activeTag === t
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700'
                  }`}
                >
                  {t}
                </button>
              ))}
              <button className="px-4 py-2 rounded-full text-sm bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 border border-secondary-200 dark:border-secondary-700">
                See more…
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Guides */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">Recent guides</h2>
        {filtered.length === 0 ? (
          <div className="text-center text-secondary-600 dark:text-secondary-300 py-16">No guides match your search.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((g) => (
              <GuideCard key={g.id} guide={g} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Guides;
