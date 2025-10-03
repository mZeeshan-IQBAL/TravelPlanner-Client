import React, { useState } from 'react';
import BookingModal from './BookingModal';

const HotelCard = ({ 
  hotel, 
  offers = [], 
  onSelectHotel, 
  onGetOffers,
  onToggleComparison,
  isInComparison = false,
  canAddToComparison = true,
  searchParams 
}) => {
  const [loading, setLoading] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const handleGetOffers = async () => {
    setLoading(true);
    try {
      await onGetOffers(hotel.id);
      setShowOffers(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleOffers = () => {
    setShowOffers(!showOffers);
  };

  const handleSelectHotel = () => {
    onSelectHotel?.(hotel);
  };

  const handleToggleComparison = () => {
    onToggleComparison?.(hotel);
  };

  const handleBookNow = (offer) => {
    setSelectedOffer(offer);
    setShowBookingModal(true);
  };

  // Extract hotel information based on data structure
  const hotelName = hotel.name;
  const cityName = hotel.address?.cityName || hotel.iataCode;
  const countryCode = hotel.address?.countryCode;
  const distance = hotel.distance;

  // Get best offer price
  const getBestPrice = () => {
    if (!offers || offers.length === 0) return null;
    const allPrices = offers.flatMap(offer => offer.offers || []).map(o => parseFloat(o.price?.total || 0));
    return allPrices.length > 0 ? Math.min(...allPrices) : null;
  };

  const bestPrice = getBestPrice();
  const currency = offers?.[0]?.offers?.[0]?.price?.currency || 'EUR';

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-300 cursor-pointer group">
      {/* Hotel Image Placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-primary-400 to-primary-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          {onToggleComparison && (
            <label className="flex items-center bg-white/90 backdrop-blur px-2 py-1 rounded-full cursor-pointer">
              <input
                type="checkbox"
                checked={isInComparison}
                onChange={handleToggleComparison}
                disabled={!canAddToComparison && !isInComparison}
                className="w-4 h-4 text-primary-600 bg-transparent border-2 border-secondary-400 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-secondary-800 focus:ring-2 dark:bg-secondary-700 dark:border-secondary-600"
              />
              <span className="ml-1 text-xs font-medium text-secondary-700">Compare</span>
            </label>
          )}
          {distance && (
            <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-medium text-secondary-700">
              {distance.value} {distance.unit}
            </div>
          )}
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center space-x-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className="w-4 h-4 fill-current text-yellow-400"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
        </div>
      </div>

      {/* Hotel Information */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-2 group-hover:text-primary-600 transition-colors">
            {hotelName}
          </h3>
          <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-300 mb-2">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{cityName}{countryCode ? `, ${countryCode}` : ''}</span>
          </div>
          
          {hotel.relevance && (
            <div className="flex items-center text-sm text-secondary-500 dark:text-secondary-400">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Relevance: {hotel.relevance}/10</span>
            </div>
          )}
        </div>

        {/* Amenities */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              WiFi
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-200">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Business Center
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Pool
            </span>
          </div>
        </div>

        {/* Pricing Information */}
        {bestPrice && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700 dark:text-green-300">Best Price Found</span>
              <div className="text-right">
                <div className="text-lg font-bold text-green-800 dark:text-green-200">
                  {currency} {bestPrice.toFixed(2)}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">per night</div>
              </div>
            </div>
            {offers.length > 0 && (
              <button
                onClick={toggleOffers}
                className="mt-2 text-sm text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 flex items-center"
              >
                {showOffers ? 'Hide' : 'Show'} all offers ({offers.reduce((total, offer) => total + (offer.offers?.length || 0), 0)})
                <svg className={`w-4 h-4 ml-1 transform transition-transform ${showOffers ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Offers List */}
        {showOffers && offers.length > 0 && (
          <div className="mb-4 space-y-2">
            {offers.map((hotelOffer, idx) => 
              hotelOffer.offers?.map((offer, offerIdx) => (
                <div key={`${idx}-${offerIdx}`} className="p-3 border border-secondary-200 dark:border-secondary-700 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-secondary-900 dark:text-secondary-100">
                        {offer.room?.description?.text || offer.room?.typeEstimated?.category || 'Room'}
                      </div>
                      <div className="text-sm text-secondary-600 dark:text-secondary-400">
                        {offer.room?.typeEstimated?.beds && `${offer.room.typeEstimated.beds} ${offer.room.typeEstimated.bedType || 'bed'}${offer.room.typeEstimated.beds > 1 ? 's' : ''}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-secondary-900 dark:text-secondary-100">
                        {offer.price.currency} {offer.price.total}
                      </div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-400">
                        {offer.price.base !== offer.price.total && `Base: ${offer.price.currency} ${offer.price.base}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-secondary-600 dark:text-secondary-400">
                      {offer.guests?.adults} guest{offer.guests?.adults !== 1 ? 's' : ''}
                    </span>
                    <div className="flex space-x-2">
                      {offer.policies?.cancellation && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          Free Cancellation
                        </span>
                      )}
                      <button 
                        onClick={() => handleBookNow(offer)}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleSelectHotel}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            View Details
          </button>
          <button
            onClick={handleGetOffers}
            disabled={loading}
            className="flex-1 bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-700 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-200 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            ) : offers.length > 0 ? (
              'Refresh Prices'
            ) : (
              'Get Prices'
            )}
          </button>
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

export default HotelCard;
