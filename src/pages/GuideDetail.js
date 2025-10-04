import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';
import LoadingSpinner from '../components/LoadingSpinner';
import { guidesAPI } from '../services/api';

// Sample guides data - fallback if API fails
const SAMPLE_GUIDES = [
  {
    id: 'jp-1',
    title: 'Japan: Video Game Guide',
    excerpt: 'Visited Tokyo/Kyoto/Osaka twice, and loved it each time! My recommendations for arcades, game shops, and themed cafes.',
    content: `
# Japan: Video Game Guide

Having visited Tokyo, Kyoto, and Osaka twice, I've fallen in love with Japan's incredible gaming culture. This guide covers all the best spots for arcade enthusiasts, retro game hunters, and anyone interested in Japan's gaming scene.

## Tokyo Gaming Spots

### Akihabara Electric Town
The mecca of gaming and electronics in Tokyo. Must-visit spots:
- **Super Potato**: Multi-floor retro gaming paradise with rare finds
- **Mandarake**: Huge selection of vintage games and consoles
- **Traders**: Great for current generation games and accessories

### Shibuya
- **Shibuya Sky**: Not just for the view - they have a great arcade on the lower floors
- **Center Gai Arcades**: Multiple floors of rhythm games, claw machines, and more

## Kyoto Gaming Culture

While more traditional, Kyoto has hidden gaming gems:
- **Kyoto International Manga Museum**: Interactive gaming exhibits
- **Teramachi Shopping Street**: Several small game shops with local treasures

## Osaka Gaming Scene

Osaka's gaming culture is more casual but incredibly fun:
- **Den Den Town**: Osaka's answer to Akihabara
- **Dotonbori Arcades**: Perfect for evening gaming sessions

## Pro Tips

1. **Timing**: Visit arcades after 6 PM for the best atmosphere
2. **Language**: Download Google Translate camera feature for game menus
3. **Currency**: Bring lots of 100 yen coins for arcade games
4. **Etiquette**: Don't hog popular machines, be respectful of local players

## Budget

- Arcade games: ¥100-200 per play
- Retro games: ¥500-5000 depending on rarity
- Game cafes: ¥1000-2000 per hour

This guide represents countless hours of exploration and gaming. Each location has been personally visited and tested!
    `,
    cover: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1600&auto=format&fit=crop',
    location: 'Japan',
    tags: ['Japan', 'Tokyo', 'Kyoto', 'Osaka', 'Gaming', 'Arcades'],
    author: { name: 'Natalie Jiang', avatarUrl: 'https://i.pravatar.cc/100?img=5' },
    stats: { likes: 135, comments: 6, views: 201 },
    duration: '7-10 days',
    difficulty: 'Easy',
    bestTimeToVisit: 'March-May, September-November',
    created: '2023-10-15'
  },
  {
    id: 'jp-2',
    title: 'Pokémon Japan Guide',
    excerpt: 'If you\'re a mild Pokémon fan like me, this guide will get you to all the best shops and events across Japan.',
    content: `
# Pokémon Japan Guide

As a lifelong Pokémon fan, visiting Japan was like stepping into the Pokémon world itself. This guide covers all the essential Pokémon experiences across Japan.

## Tokyo Pokémon Spots

### Pokémon Center Mega Tokyo
The flagship store in Skytree Town is a must-visit:
- Exclusive merchandise not found elsewhere
- Interactive Pokémon experiences
- Photo opportunities with life-sized Pokémon

### Other Tokyo Centers
- **Shibuya**: Compact but well-stocked
- **Ikebukuro**: Great for Pokémon Sun & Moon items
- **Tokyo Station**: Perfect for last-minute souvenirs

## Osaka Pokémon Center

The Osaka location often has Kansai-exclusive items and is less crowded than Tokyo locations.

## Special Events and Experiences

### Pokémon Cafe
Located in Tokyo and Osaka:
- Reservation required (book weeks in advance)
- Themed food and drinks
- Exclusive cafe merchandise

### Detective Pikachu Experiences
Various locations offer Detective Pikachu themed activities and photo spots.

## Shopping Tips

1. **Exclusive Items**: Each center has location-specific merchandise
2. **Tax-Free Shopping**: Bring your passport for tax-free purchases over ¥5,000
3. **Limited Editions**: Check for seasonal and event-exclusive items
4. **Trading Cards**: Japan has exclusive TCG products and tournament promos

## Budget Estimate

- Pokémon Center merchandise: ¥500-8,000 per item
- Pokémon Cafe: ¥2,500-4,000 per person
- Transportation: ¥500-1,000 between locations
- Special events: ¥1,500-3,000

Perfect for Pokémon fans of all ages who want to experience the franchise in its home country!
    `,
    cover: 'https://images.unsplash.com/photo-1607968565040-b8be0aab160b?q=80&w=1600&auto=format&fit=crop',
    location: 'Tokyo, Japan',
    tags: ['Japan', 'Tokyo', 'Shopping', 'Pokemon', 'Anime'],
    author: { name: 'Anna', avatarUrl: 'https://i.pravatar.cc/100?img=12' },
    stats: { likes: 0, comments: 0, views: 19 },
    duration: '3-5 days',
    difficulty: 'Easy',
    bestTimeToVisit: 'Year-round',
    created: '2023-09-22'
  },
  // Add other guides...
  {
    id: 'ie-1',
    title: 'Ireland and Scotland Guide',
    excerpt: 'Spent 2 magical weeks, tasting my way through distilleries and hiking the highlands.',
    content: `
# Ireland and Scotland: A Celtic Adventure

Two weeks exploring the rugged beauty and rich culture of Ireland and Scotland. This guide covers the perfect route for whiskey lovers and hiking enthusiasts.

## Ireland Highlights

### Dublin
- **Guinness Storehouse**: Learn about Ireland's famous stout
- **Temple Bar**: Vibrant nightlife and traditional music
- **Trinity College**: See the Book of Kells

### Whiskey Trail
- **Jameson Distillery**: Classic Irish whiskey experience
- **Tullamore D.E.W.**: Smaller, more intimate tours
- **Bushmills**: Northern Ireland's oldest distillery

### Natural Wonders
- **Giant's Causeway**: UNESCO World Heritage hexagonal basalt columns
- **Cliffs of Moher**: Breathtaking Atlantic coast views
- **Ring of Kerry**: Scenic circular route through mountains and coast

## Scotland Adventures

### Edinburgh
- **Royal Mile**: Historic street from castle to palace
- **Arthur's Seat**: Hike for panoramic city views
- **Scotch Whisky Experience**: Perfect introduction to Scottish whisky

### Highlands
- **Isle of Skye**: Dramatic landscapes and hiking trails
- **Loch Ness**: Mysterious lake with castle ruins
- **Cairngorms National Park**: Wildlife and mountain scenery

### Whisky Regions
- **Speyside**: Elegant, complex whiskies
- **Islay**: Peaty, smoky single malts
- **Highland**: Diverse flavors from Scotland's largest region

## Planning Tips

1. **Transportation**: Rent a car for maximum flexibility
2. **Weather**: Pack layers and waterproof gear year-round
3. **Accommodation**: Book B&Bs and castles in advance
4. **Whisky Tours**: Many offer pickup/drop-off services

## Budget

- Car rental: £300-500 per week
- Accommodation: £60-150 per night
- Whisky tours: £20-80 per person
- Meals: £25-50 per person per day
- Activities: £10-30 per attraction

An unforgettable journey through landscapes that inspired countless legends and stories!
    `,
    cover: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1600&auto=format&fit=crop',
    location: 'Ireland & Scotland',
    tags: ['Ireland', 'Scotland', 'Road trip', 'Whiskey', 'Hiking'],
    author: { name: 'Savannah', avatarUrl: 'https://i.pravatar.cc/100?img=14' },
    stats: { likes: 0, comments: 0, views: 10 },
    duration: '14 days',
    difficulty: 'Moderate',
    bestTimeToVisit: 'May-September',
    created: '2023-08-10'
  }
];

const GuideDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        setLoading(true);
        const response = await guidesAPI.getById(id);
        
        // Normalize the database response format
        const normalizedGuide = {
          ...response.data,
          id: response.data._id || response.data.id, // Use _id from MongoDB
          created: response.data.createdAt || response.data.created // Use createdAt from MongoDB
        };
        
        setGuide(normalizedGuide);
      } catch (error) {
        console.error('Failed to fetch guide from API:', error);
        // Fallback to sample data
        const foundGuide = SAMPLE_GUIDES.find(g => g.id === id);
        setGuide(foundGuide);
      } finally {
        setLoading(false);
      }
    };

    fetchGuide();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" message="Loading guide..." />
        </div>
      </Layout>
    );
  }

  if (!guide) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            Guide Not Found
          </h1>
          <p className="text-secondary-600 dark:text-secondary-300 mb-8">
            The guide you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/guides')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            Back to Guides
          </button>
        </div>
      </Layout>
    );
  }

  const handleLike = async () => {
    try {
      const response = await guidesAPI.like(id);
      setGuide(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          likes: response.data.likes
        }
      }));
    } catch (error) {
      console.error('Failed to like guide:', error);
      // Fallback to local increment
      setGuide(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          likes: prev.stats.likes + 1
        }
      }));
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-900">
        <img
          src={guide.cover}
          alt={guide.title}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="absolute bottom-8 left-0 right-0">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center space-x-3 mb-4">
              <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-medium text-secondary-700">
                {guide.location}
              </span>
              <span className="bg-primary-600/90 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-medium">
                {guide.duration}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {guide.title}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl">
              {guide.excerpt}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Author and Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 p-6 bg-white dark:bg-secondary-800 rounded-2xl shadow-soft">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Avatar src={guide.author.avatarUrl} alt={guide.author.name} size="large" />
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                {guide.author.name}
              </h3>
              <p className="text-secondary-600 dark:text-secondary-300">Guide Author</p>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                Published on {new Date(guide.created).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className="flex items-center space-x-2 text-secondary-600 hover:text-red-500 transition-colors"
            >
              <span>❤️</span>
              <span>{guide.stats.likes}</span>
            </button>
            <div className="flex items-center space-x-2 text-secondary-600">
              <span>💬</span>
              <span>{guide.stats.comments}</span>
            </div>
            <div className="flex items-center space-x-2 text-secondary-600">
              <span>👁️</span>
              <span>{guide.stats.views}</span>
            </div>
          </div>
        </div>

        {/* Guide Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-secondary-800 p-6 rounded-2xl shadow-soft">
            <h4 className="text-sm font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wide mb-2">
              Duration
            </h4>
            <p className="text-lg font-medium text-secondary-900 dark:text-secondary-100">
              {guide.duration}
            </p>
          </div>
          <div className="bg-white dark:bg-secondary-800 p-6 rounded-2xl shadow-soft">
            <h4 className="text-sm font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wide mb-2">
              Difficulty
            </h4>
            <p className="text-lg font-medium text-secondary-900 dark:text-secondary-100">
              {guide.difficulty}
            </p>
          </div>
          <div className="bg-white dark:bg-secondary-800 p-6 rounded-2xl shadow-soft">
            <h4 className="text-sm font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wide mb-2">
              Best Time
            </h4>
            <p className="text-lg font-medium text-secondary-900 dark:text-secondary-100">
              {guide.bestTimeToVisit}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-2">
            {guide.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Guide Content */}
        <div className="max-w-none">
          <div className="bg-white dark:bg-secondary-800 p-8 rounded-2xl shadow-soft">
            {guide.content.split('\n').map((line, index) => {
              if (line.startsWith('# ')) {
                return (
                  <h1 key={index} className="text-2xl font-bold mb-4 text-secondary-900 dark:text-secondary-100">
                    {line.substring(2)}
                  </h1>
                );
              } else if (line.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-xl font-semibold mt-6 mb-3 text-secondary-800 dark:text-secondary-200">
                    {line.substring(3)}
                  </h2>
                );
              } else if (line.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-secondary-700 dark:text-secondary-300">
                    {line.substring(4)}
                  </h3>
                );
              } else if (line.startsWith('- **')) {
                const match = line.match(/- \*\*(.*?)\*\*: (.*)/);
                if (match) {
                  return (
                    <li key={index} className="mb-1 text-sm">
                      <strong className="text-secondary-900 dark:text-secondary-100">{match[1]}</strong>: <span className="text-secondary-700 dark:text-secondary-300">{match[2]}</span>
                    </li>
                  );
                }
                // If regex doesn't match, treat it as a regular list item
                return (
                  <li key={index} className="mb-1 text-sm text-secondary-700 dark:text-secondary-300">
                    {line.substring(2)}
                  </li>
                );
              } else if (line.startsWith('- ')) {
                return (
                  <li key={index} className="mb-1 text-sm text-secondary-700 dark:text-secondary-300">
                    {line.substring(2)}
                  </li>
                );
              } else if (line.match(/^\d+\./)) {
                return (
                  <li key={index} className="mb-1 text-sm text-secondary-700 dark:text-secondary-300">
                    {line}
                  </li>
                );
              } else if (line.trim()) {
                return (
                  <p key={index} className="mb-3 text-sm text-secondary-700 dark:text-secondary-300 leading-relaxed">
                    {line}
                  </p>
                );
              } else {
                return <br key={index} />;
              }
            })}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/guides')}
            className="bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-700 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-200 px-6 py-3 rounded-full font-medium transition-colors"
          >
            ← Back to All Guides
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default GuideDetail;