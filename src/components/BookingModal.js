import React, { useState } from 'react';

const BookingModal = ({ hotel, offer, isOpen, onClose, searchParams }) => {
  const [selectedBookingSite, setSelectedBookingSite] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (!isOpen || !hotel || !offer) return null;

  // Sample booking sites with their URLs
  const bookingSites = [
    {
      id: 'booking',
      name: 'Booking.com',
      logo: '🏨',
      description: 'World\'s largest hotel booking site',
      commission: 'Free cancellation on most rooms',
      color: 'bg-blue-600'
    },
    {
      id: 'expedia',
      name: 'Expedia',
      logo: '✈️',
      description: 'Book hotels, flights & cars together',
      commission: 'Earn rewards on every booking',
      color: 'bg-yellow-600'
    },
    {
      id: 'hotels',
      name: 'Hotels.com',
      logo: '🏩',
      description: 'Collect 10 nights, get 1 free',
      commission: 'Price match guarantee',
      color: 'bg-red-600'
    },
    {
      id: 'agoda',
      name: 'Agoda',
      logo: '🌏',
      description: 'Best prices for Asia hotels',
      commission: 'Member-only deals available',
      color: 'bg-purple-600'
    }
  ];

  const handleBookingRedirect = (siteId) => {
    setIsRedirecting(true);
    setSelectedBookingSite(siteId);
    
    // Simulate redirect delay
    setTimeout(() => {
      // In a real implementation, these would be actual partner URLs with affiliate IDs
      const bookingUrls = {
        booking: `https://booking.com/search?city=${hotel.address?.cityName}&checkin=${searchParams.checkInDate}&checkout=${searchParams.checkOutDate}&adults=${searchParams.adults}`,
        expedia: `https://expedia.com/hotels/search?destination=${hotel.address?.cityName}&checkIn=${searchParams.checkInDate}&checkOut=${searchParams.checkOutDate}&adults=${searchParams.adults}`,
        hotels: `https://hotels.com/search?q=${hotel.address?.cityName}&checkIn=${searchParams.checkInDate}&checkOut=${searchParams.checkOutDate}&adults=${searchParams.adults}`,
        agoda: `https://agoda.com/city/${hotel.address?.cityName}?checkIn=${searchParams.checkInDate}&checkOut=${searchParams.checkOutDate}&adults=${searchParams.adults}`
      };
      
      // Open in new tab/window
      window.open(bookingUrls[siteId], '_blank');
      
      setIsRedirecting(false);
      onClose();
    }, 1000);
  };

  const roomDescription = offer.room?.description?.text || offer.room?.typeEstimated?.category || 'Standard Room';
  const bedInfo = offer.room?.typeEstimated?.beds ? 
    `${offer.room.typeEstimated.beds} ${offer.room.typeEstimated.bedType || 'bed'}${offer.room.typeEstimated.beds > 1 ? 's' : ''}` : 
    'Standard bedding';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
              Book Your Stay
            </h2>
            <p className="text-secondary-600 dark:text-secondary-300">
              Choose your preferred booking platform
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
          {/* Booking Summary */}
          <div className="bg-secondary-50 dark:bg-secondary-700/50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-3">Booking Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-secondary-900 dark:text-secondary-100">{hotel.name}</div>
                <div className="text-secondary-600 dark:text-secondary-300">
                  {hotel.address?.cityName}{hotel.address?.countryCode && `, ${hotel.address.countryCode}`}
                </div>
              </div>
              <div>
                <div className="font-medium text-secondary-900 dark:text-secondary-100">{roomDescription}</div>
                <div className="text-secondary-600 dark:text-secondary-300">{bedInfo}</div>
              </div>
              <div>
                <div className="text-secondary-600 dark:text-secondary-300">Check-in</div>
                <div className="font-medium text-secondary-900 dark:text-secondary-100">{offer.checkInDate}</div>
              </div>
              <div>
                <div className="text-secondary-600 dark:text-secondary-300">Check-out</div>
                <div className="font-medium text-secondary-900 dark:text-secondary-100">{offer.checkOutDate}</div>
              </div>
              <div>
                <div className="text-secondary-600 dark:text-secondary-300">Guests</div>
                <div className="font-medium text-secondary-900 dark:text-secondary-100">
                  {offer.guests?.adults} adult{offer.guests?.adults !== 1 ? 's' : ''}
                </div>
              </div>
              <div>
                <div className="text-secondary-600 dark:text-secondary-300">Total Price</div>
                <div className="font-bold text-lg text-green-600 dark:text-green-400">
                  {offer.price.currency} {offer.price.total}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sites */}
          <div className="space-y-3">
            <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
              Select Booking Platform
            </h3>
            
            {bookingSites.map(site => (
              <button
                key={site.id}
                onClick={() => handleBookingRedirect(site.id)}
                disabled={isRedirecting}
                className="w-full p-4 border border-secondary-200 dark:border-secondary-700 rounded-xl hover:border-primary-300 dark:hover:border-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${site.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                      {site.logo}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-secondary-900 dark:text-secondary-100">
                        {site.name}
                      </div>
                      <div className="text-sm text-secondary-600 dark:text-secondary-300">
                        {site.description}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        {site.commission}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isRedirecting && selectedBookingSite === site.id ? (
                      <div className="flex items-center text-primary-600 dark:text-primary-400">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm">Redirecting...</span>
                      </div>
                    ) : (
                      <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                <div className="font-medium mb-1">Important Notice</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Prices may vary on booking sites due to availability and demand</li>
                  <li>Each platform has its own cancellation and payment policies</li>
                  <li>We recommend comparing final prices before booking</li>
                  <li>This service may earn a commission on completed bookings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-700/50">
          <div className="text-sm text-secondary-600 dark:text-secondary-300">
            Secure booking guaranteed by our trusted partners
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg font-medium text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;