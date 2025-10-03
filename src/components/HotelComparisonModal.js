import React from 'react';

const HotelComparisonModal = ({ hotels, offers, isOpen, onClose, searchParams }) => {
  if (!isOpen || !hotels || hotels.length === 0) return null;

  const getBestPrice = (hotelId) => {
    const hotelOffers = offers[hotelId] || [];
    if (hotelOffers.length === 0) return null;
    const allPrices = hotelOffers.flatMap(offer => offer.offers || []).map(o => parseFloat(o.price?.total || 0));
    return allPrices.length > 0 ? Math.min(...allPrices) : null;
  };

  const getOfferCount = (hotelId) => {
    const hotelOffers = offers[hotelId] || [];
    return hotelOffers.reduce((total, offer) => total + (offer.offers?.length || 0), 0);
  };

  // Sample amenities for comparison
  const amenityCategories = [
    {
      name: 'Connectivity',
      items: ['Free WiFi', 'Business Center']
    },
    {
      name: 'Recreation',
      items: ['Swimming Pool', 'Fitness Center', 'Spa']
    },
    {
      name: 'Services',
      items: ['Room Service', 'Laundry', 'Concierge']
    },
    {
      name: 'Dining',
      items: ['Restaurant', 'Bar/Lounge', 'Breakfast']
    }
  ];

  // Sample amenity data (in a real app, this would come from the API)
  const getHotelAmenities = (hotelId) => ({
    'Free WiFi': true,
    'Business Center': true,
    'Swimming Pool': Math.random() > 0.5,
    'Fitness Center': Math.random() > 0.3,
    'Spa': Math.random() > 0.7,
    'Room Service': Math.random() > 0.4,
    'Laundry': true,
    'Concierge': Math.random() > 0.5,
    'Restaurant': true,
    'Bar/Lounge': Math.random() > 0.6,
    'Breakfast': Math.random() > 0.3
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
              Hotel Comparison
            </h2>
            <p className="text-secondary-600 dark:text-secondary-300">
              Compare features and amenities side by side
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 dark:text-secondary-500 dark:hover:text-secondary-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map(hotel => {
              const bestPrice = getBestPrice(hotel.id);
              const currency = offers[hotel.id]?.[0]?.offers?.[0]?.price?.currency || 'EUR';
              const hotelAmenities = getHotelAmenities(hotel.id);
              const offerCount = getOfferCount(hotel.id);

              return (
                <div key={hotel.id} className="bg-secondary-50 dark:bg-secondary-700/50 rounded-xl p-6">
                  {/* Hotel Header */}
                  <div className="mb-6">
                    <div className="h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg mb-4 relative">
                      <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
                      <div className="absolute bottom-3 left-3 text-white">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < 4 ? 'fill-current' : 'stroke-current fill-none'}`} viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-2">
                      {hotel.name}
                    </h3>
                    <div className="text-sm text-secondary-600 dark:text-secondary-300 mb-2">
                      📍 {hotel.address?.cityName || hotel.iataCode}
                      {hotel.address?.countryCode && `, ${hotel.address.countryCode}`}
                    </div>
                    {hotel.distance && (
                      <div className="text-sm text-secondary-500 dark:text-secondary-400">
                        {hotel.distance.value} {hotel.distance.unit} from center
                      </div>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-3">Pricing</h4>
                    {bestPrice ? (
                      <div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                          {currency} {bestPrice.toFixed(2)}
                        </div>
                        <div className="text-sm text-secondary-500 dark:text-secondary-400 mb-2">
                          per night (best rate)
                        </div>
                        <div className="text-xs text-secondary-600 dark:text-secondary-300">
                          {offerCount} room option{offerCount !== 1 ? 's' : ''} available
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-secondary-500 dark:text-secondary-400">
                        No pricing available
                      </div>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-3">Quick Stats</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-white dark:bg-secondary-800 rounded">
                        <div className="font-bold text-primary-600 dark:text-primary-400">
                          {hotel.relevance ? hotel.relevance.toFixed(1) : '4.2'}
                        </div>
                        <div className="text-xs text-secondary-500 dark:text-secondary-400">Rating</div>
                      </div>
                      <div className="text-center p-2 bg-white dark:bg-secondary-800 rounded">
                        <div className="font-bold text-primary-600 dark:text-primary-400">
                          {hotel.distance ? hotel.distance.value : '1.5'}
                        </div>
                        <div className="text-xs text-secondary-500 dark:text-secondary-400">
                          {hotel.distance?.unit || 'KM'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-4">
                    {amenityCategories.map(category => (
                      <div key={category.name}>
                        <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-2 text-sm">
                          {category.name}
                        </h4>
                        <div className="space-y-1">
                          {category.items.map(amenity => (
                            <div key={amenity} className="flex items-center justify-between text-sm">
                              <span className="text-secondary-700 dark:text-secondary-300">{amenity}</span>
                              {hotelAmenities[amenity] ? (
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                    <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add more hotels message */}
          {hotels.length < 3 && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  You can compare up to 3 hotels. Select more hotels from the search results to add them to comparison.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-700/50">
          <div className="flex items-center space-x-4 text-sm text-secondary-600 dark:text-secondary-300">
            <span>📅 {searchParams?.checkInDate} - {searchParams?.checkOutDate}</span>
            <span>👥 {searchParams?.adults} guest{searchParams?.adults !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg font-medium text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelComparisonModal;