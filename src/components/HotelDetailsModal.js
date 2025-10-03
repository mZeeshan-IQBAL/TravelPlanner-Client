import React, { useState, useEffect, useCallback } from 'react';
import BookingModal from './BookingModal';

const HotelDetailsModal = ({ hotel, offers = [], isOpen, onClose, onGetOffers, searchParams }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const handleGetOffers = useCallback(async () => {
    if (!onGetOffers || !hotel) return;
    setLoading(true);
    try {
      await onGetOffers(hotel.id);
    } finally {
      setLoading(false);
    }
  }, [onGetOffers, hotel]);

  useEffect(() => {
    if (isOpen && hotel && offers.length === 0) {
      handleGetOffers();
    }
  }, [isOpen, hotel, offers.length, handleGetOffers]);

  const handleBookNow = (offer) => {
    setSelectedOffer(offer);
    setShowBookingModal(true);
  };

  if (!isOpen || !hotel) return null;

  // Sample amenities - in a real app, this would come from the hotel data
  const amenities = [
    { icon: '🏊‍♂️', name: 'Swimming Pool', available: true },
    { icon: '🏋️‍♂️', name: 'Fitness Center', available: true },
    { icon: '📶', name: 'Free WiFi', available: true },
    { icon: '🚗', name: 'Parking', available: true },
    { icon: '🐕', name: 'Pet Friendly', available: false },
    { icon: '🏖️', name: 'Beach Access', available: false },
    { icon: '🍳', name: 'Breakfast', available: true },
    { icon: '🧺', name: 'Laundry Service', available: true },
    { icon: '🚖', name: 'Airport Shuttle', available: true },
    { icon: '💼', name: 'Business Center', available: true },
    { icon: '🍸', name: 'Bar/Lounge', available: true },
    { icon: '🍽️', name: 'Restaurant', available: true }
  ];

  const sampleReviews = [
    {
      id: 1,
      author: 'John D.',
      rating: 5,
      date: '2024-01-15',
      title: 'Excellent stay!',
      content: 'Amazing hotel with great service. The room was clean and comfortable. Staff was very helpful and friendly.',
      helpful: 12
    },
    {
      id: 2,
      author: 'Sarah M.',
      rating: 4,
      date: '2024-01-10',
      title: 'Good value for money',
      content: 'Nice hotel in a good location. The breakfast was excellent and the pool area was well maintained.',
      helpful: 8
    },
    {
      id: 3,
      author: 'Mike R.',
      rating: 4,
      date: '2024-01-05',
      title: 'Great location',
      content: 'Perfect location for exploring the city. Walking distance to major attractions. Room was a bit small but comfortable.',
      helpful: 5
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📋' },
    { id: 'rooms', name: 'Rooms & Rates', icon: '🛏️' },
    { id: 'amenities', name: 'Amenities', icon: '✨' },
    { id: 'reviews', name: 'Reviews', icon: '⭐' },
    { id: 'location', name: 'Location', icon: '📍' }
  ];

  const getBestPrice = () => {
    if (!offers || offers.length === 0) return null;
    const allPrices = offers.flatMap(offer => offer.offers || []).map(o => parseFloat(o.price?.total || 0));
    return allPrices.length > 0 ? Math.min(...allPrices) : null;
  };

  const bestPrice = getBestPrice();
  const currency = offers?.[0]?.offers?.[0]?.price?.currency || 'EUR';
  const avgRating = 4.2; // Sample rating

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
              {hotel.name}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-secondary-600 dark:text-secondary-300">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {hotel.address?.cityName || hotel.iataCode}
                {hotel.address?.countryCode && `, ${hotel.address.countryCode}`}
              </div>
              {hotel.distance && (
                <div className="flex items-center">
                  <span>📍 {hotel.distance.value} {hotel.distance.unit} from center</span>
                </div>
              )}
              <div className="flex items-center">
                <div className="flex text-yellow-400 mr-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < Math.floor(avgRating) ? 'fill-current' : 'stroke-current fill-none'}`} viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span>{avgRating} ({sampleReviews.length} reviews)</span>
              </div>
            </div>
          </div>
          {bestPrice && (
            <div className="text-right ml-6">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {currency} {bestPrice.toFixed(2)}
              </div>
              <div className="text-sm text-secondary-500 dark:text-secondary-400">per night</div>
            </div>
          )}
          <button
            onClick={onClose}
            className="ml-4 text-secondary-400 hover:text-secondary-600 dark:text-secondary-500 dark:hover:text-secondary-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-secondary-200 dark:border-secondary-700 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Hotel Images Placeholder */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 h-64 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-lg font-semibold">Main Hotel View</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                  <div className="h-30 md:h-30 bg-gradient-to-br from-primary-300 to-primary-500 rounded-xl"></div>
                  <div className="h-30 md:h-30 bg-gradient-to-br from-primary-300 to-primary-500 rounded-xl"></div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-3">About This Hotel</h3>
                <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed">
                  Experience luxury and comfort at {hotel.name}, perfectly located in the heart of {hotel.address?.cityName}. 
                  Our hotel offers modern amenities, exceptional service, and easy access to the city's top attractions. 
                  Whether you're traveling for business or leisure, our dedicated staff ensures a memorable stay.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-secondary-50 dark:bg-secondary-700/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">4.2</div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-300">Guest Rating</div>
                </div>
                <div className="bg-secondary-50 dark:bg-secondary-700/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">150+</div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-300">Rooms</div>
                </div>
                <div className="bg-secondary-50 dark:bg-secondary-700/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">24/7</div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-300">Front Desk</div>
                </div>
                <div className="bg-secondary-50 dark:bg-secondary-700/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">Free</div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-300">WiFi</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Available Rooms</h3>
                <button
                  onClick={handleGetOffers}
                  disabled={loading}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Refresh Prices'}
                </button>
              </div>

              {offers.length > 0 ? (
                offers.map((hotelOffer, idx) => 
                  hotelOffer.offers?.map((offer, offerIdx) => (
                    <div key={`${idx}-${offerIdx}`} className="border border-secondary-200 dark:border-secondary-700 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                            {offer.room?.description?.text || offer.room?.typeEstimated?.category || 'Standard Room'}
                          </h4>
                          <div className="text-sm text-secondary-600 dark:text-secondary-300 mb-2">
                            {offer.room?.typeEstimated?.beds && 
                              `${offer.room.typeEstimated.beds} ${offer.room.typeEstimated.bedType || 'bed'}${offer.room.typeEstimated.beds > 1 ? 's' : ''}`
                            }
                          </div>
                          <div className="text-sm text-secondary-500 dark:text-secondary-400">
                            Check-in: {offer.checkInDate} • Check-out: {offer.checkOutDate}
                          </div>
                        </div>
                        <div className="text-right ml-6">
                          <div className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                            {offer.price.currency} {offer.price.total}
                          </div>
                          {offer.price.base !== offer.price.total && (
                            <div className="text-sm text-secondary-500 dark:text-secondary-400">
                              Base: {offer.price.currency} {offer.price.base}
                            </div>
                          )}
                          <div className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                            for {offer.guests?.adults} guest{offer.guests?.adults !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {offer.policies?.cancellation && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Free Cancellation
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {offer.policies?.paymentType || 'Pay at Hotel'}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleBookNow(offer)}
                          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                          Select Room
                        </button>
                      </div>
                    </div>
                  ))
                )
              ) : (
                <div className="text-center py-8">
                  <div className="text-secondary-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">No rooms available</h4>
                  <p className="text-secondary-600 dark:text-secondary-300 mb-4">Click "Refresh Prices" to check room availability and rates.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'amenities' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Hotel Amenities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-3">Available</h4>
                  <div className="space-y-3">
                    {amenities.filter(a => a.available).map((amenity, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <span className="text-xl">{amenity.icon}</span>
                        <span className="text-secondary-700 dark:text-secondary-300">{amenity.name}</span>
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-3">Not Available</h4>
                  <div className="space-y-3">
                    {amenities.filter(a => !a.available).map((amenity, idx) => (
                      <div key={idx} className="flex items-center space-x-3 opacity-60">
                        <span className="text-xl">{amenity.icon}</span>
                        <span className="text-secondary-500 dark:text-secondary-400">{amenity.name}</span>
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Guest Reviews</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{avgRating}</div>
                    <div className="text-sm text-secondary-500 dark:text-secondary-400">out of 5</div>
                  </div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < Math.floor(avgRating) ? 'fill-current' : 'stroke-current fill-none'}`} viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {sampleReviews.map(review => (
                  <div key={review.id} className="border border-secondary-200 dark:border-secondary-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                          {review.author.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-secondary-900 dark:text-secondary-100">{review.author}</div>
                          <div className="text-sm text-secondary-500 dark:text-secondary-400">{review.date}</div>
                        </div>
                      </div>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'stroke-current fill-none'}`} viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-2">{review.title}</h4>
                    <p className="text-secondary-600 dark:text-secondary-300 mb-3">{review.content}</p>
                    <div className="flex items-center text-sm text-secondary-500 dark:text-secondary-400">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      {review.helpful} people found this helpful
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Hotel Location</h3>
              
              {/* Map Placeholder */}
              <div className="h-64 bg-secondary-100 dark:bg-secondary-700 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="text-secondary-600 dark:text-secondary-300">Interactive map would be displayed here</div>
                </div>
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-3">Address</h4>
                  <p className="text-secondary-600 dark:text-secondary-300">
                    {hotel.name}<br/>
                    {hotel.address?.cityName}{hotel.address?.countryCode && `, ${hotel.address.countryCode}`}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-3">Nearby Attractions</h4>
                  <ul className="space-y-2 text-secondary-600 dark:text-secondary-300">
                    <li>• City Center - {hotel.distance?.value || '1.5'} {hotel.distance?.unit || 'KM'}</li>
                    <li>• Main Shopping District - 0.8 KM</li>
                    <li>• Museum Quarter - 1.2 KM</li>
                    <li>• Public Transport - 0.3 KM</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-700/50">
          <div className="flex items-center space-x-4 text-sm text-secondary-600 dark:text-secondary-300">
            <span>📅 {searchParams?.checkInDate} - {searchParams?.checkOutDate}</span>
            <span>👥 {searchParams?.adults} guest{searchParams?.adults !== 1 ? 's' : ''}</span>
            <span>🏠 {searchParams?.rooms} room{searchParams?.rooms !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg font-medium text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
            >
              Close
            </button>
            <button 
              onClick={() => {
                // Use the first available offer for quick booking
                const firstOffer = offers?.[0]?.offers?.[0];
                if (firstOffer) handleBookNow(firstOffer);
              }}
              disabled={!offers || offers.length === 0}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        hotel={hotel}
        offer={selectedOffer}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        searchParams={searchParams}
      />
    </div>
  );
};

export default HotelDetailsModal;
