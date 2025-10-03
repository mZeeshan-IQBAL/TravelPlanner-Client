import React from 'react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Nadia",
      role: "Travel Blogger @Couple Travels",
      avatar: "N",
      rating: 5,
      quote: "Planning your trip by having all the attractions already plugged into a map makes trip planning so much easier.",
      avatarColor: "bg-purple-500"
    },
    {
      id: 2,
      name: "Sharon Brewster",
      role: "S",
      avatar: "S",
      rating: 5,
      quote: "amazing app! easy to use, love the AI functionality.",
      avatarColor: "bg-green-500"
    },
    {
      id: 3,
      name: "Jayson Oite",
      role: "",
      avatar: "J",
      rating: 5,
      quote: "It seems to be this is my new travel app buddy. Very handy, convenient and very easy to use. It also recommends tourist destinations and nearby places. Kudos to the programmer. 👏👏👏👏",
      avatarColor: "bg-blue-500"
    },
    {
      id: 4,
      name: "Erica Franco",
      role: "",
      avatar: "E",
      rating: 5,
      quote: "Absolutely love this app! It is so helpful when planning my trips. I especially love The optimize route option. When I have all my information in place like my starting point and my ending point it is fabulous! I found it was worth it for me to buy the subscription to the app to use this",
      avatarColor: "bg-indigo-500"
    },
    {
      id: 5,
      name: "Lydia Yang",
      role: "Founder @LydiaScapes A...",
      avatar: "L",
      rating: 5,
      quote: "So much easier to visualize and plan a road trip to my favourite",
      avatarColor: "bg-pink-500"
    },
    {
      id: 6,
      name: "Belinda and Kathy Kohles",
      role: "",
      avatar: "B",
      rating: 5,
      quote: "Love this app for planning trips",
      avatarColor: "bg-orange-500"
    }
  ];

  const stats = [
    { number: "8M+", label: "Trips planned", description: "See why millions of trips have been planned with Wanderlog." },
    { number: "33K+", label: "Reviews", description: "Trusted by thousands—see why travelers rave about their experience." },
    { number: "4.9⭐", label: "Rating on App Store", description: "Top-rated on the App Store for exceptional travel planning." },
    { number: "4.7⭐", label: "Rating on Google Play", description: "Highly rated and selected as Editor's Choice on Google Play." }
  ];

  return (
    <div className="bg-white dark:bg-secondary-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            What travelers are raving about
          </h2>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
            Over 1 million people have already tried Wanderlog and loved its easy trip planning features.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id}
              className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-soft hover:shadow-large transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 ${testimonial.avatarColor} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                  {testimonial.avatar}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 text-sm">
                    {testimonial.name}
                  </h4>
                  {testimonial.role && (
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">
                      {testimonial.role}
                    </p>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-secondary-600 dark:text-secondary-300 text-sm leading-relaxed">
                {testimonial.quote}
              </blockquote>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="text-center group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4">
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-wanderlog-orange group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <h4 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mt-2">
                  {stat.label}
                </h4>
              </div>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-white dark:bg-secondary-800 rounded-3xl p-8 shadow-large max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
              Join millions of happy travelers
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">
              Start planning your next adventure with the world's best travel planning platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-gradient-to-r from-primary-500 to-wanderlog-orange text-white px-8 py-4 rounded-2xl font-bold hover:from-primary-600 hover:to-wanderlog-orange transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                🚀 Start Planning Free
              </button>
              <button className="bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 px-8 py-4 rounded-2xl font-bold hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-all duration-200 border border-secondary-200 dark:border-secondary-600">
                📱 Get the App
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;