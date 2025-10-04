import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";
import NotificationDropdown from "./NotificationDropdown";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const canSearch = searchQuery.trim().length >= 1;

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 dark:text-secondary-100">
      {/* Navbar */}
      <nav className="w-full bg-white dark:bg-secondary-900 border-b border-gray-200 dark:border-secondary-800 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-md"></div>
              </div>
              <span className="text-orange-500 text-xl font-bold tracking-tight">
                wanderlog
              </span>
            </Link>

            {/* Middle: Nav links + Search */}
            <div className="flex items-center space-x-6 flex-1 justify-center">
              {/* Main Nav */}
              <div className="hidden lg:flex items-center space-x-6">
                <Link
                  to="/"
                  className={`text-sm font-medium ${
                    isActive("/") ? "text-orange-500 font-semibold" : "text-gray-900 dark:text-gray-200 hover:text-orange-500"
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/guides"
                  className={`text-sm font-medium ${
                    isActive("/guides") ? "text-orange-500 font-semibold" : "text-gray-900 dark:text-gray-200 hover:text-orange-500"
                  }`}
                >
                  Travel guides
                </Link>
                <Link
                  to="/hotels"
                  className={`text-sm font-medium ${
                    isActive("/hotels") ? "text-orange-500 font-semibold" : "text-gray-900 dark:text-gray-200 hover:text-orange-500"
                  }`}
                >
                  Hotels
                </Link>
              </div>

              {/* Search Input */}
              <div className="hidden md:block w-full max-w-md">
                <form onSubmit={handleSearch} className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    placeholder="Explore by destination (e.g. France, Japan)"
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-secondary-700 dark:bg-secondary-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  />
                  <button
                    type="submit"
                    onClick={handleSearch}
                    disabled={!canSearch}
                    aria-label="Search"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg text-white transition-colors ${
                      canSearch
                        ? 'bg-gradient-to-r from-primary-500 to-wanderlog-orange hover:from-primary-600 hover:to-wanderlog-orange shadow'
                        : 'bg-secondary-300 dark:bg-secondary-700 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>

            {/* Right side: Auth/User */}
            <div className="flex items-center space-x-4">
              {/* Notifications - only show when authenticated */}
              {user && <NotificationDropdown />}

              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="text-gray-900 dark:text-gray-200 hover:text-orange-500 text-sm font-medium"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-secondary-800 transition-all duration-200"
                  >
                    <Avatar
                      src={user?.avatar?.publicId || user?.avatar?.url}
                      alt={user?.username || user?.name}
                      size="medium"
                      showOnlineStatus={true}
                    />
                    <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user?.username}
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-500 dark:text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-secondary-900 rounded-2xl shadow-lg border border-gray-200 dark:border-secondary-800 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-secondary-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user?.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-secondary-800 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        👤 Profile Settings
                      </Link>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-secondary-800 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        📊 Dashboard
                      </Link>
                      <hr className="my-2 border-gray-200 dark:border-secondary-700" />
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 dark:text-red-400"
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-secondary-800 transition-all duration-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      mobileMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 dark:border-secondary-800 py-4 bg-white dark:bg-secondary-900">
              <div className="flex flex-col space-y-2">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    isActive("/")
                      ? "text-orange-500 font-semibold"
                      : "text-gray-700 dark:text-gray-200 hover:text-orange-500"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/guides"
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    isActive("/guides")
                      ? "text-orange-500 font-semibold"
                      : "text-gray-700 dark:text-gray-200 hover:text-orange-500"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Travel guides
                </Link>
                <Link
                  to="/hotels"
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    isActive("/hotels")
                      ? "text-orange-500 font-semibold"
                      : "text-gray-700 dark:text-gray-200 hover:text-orange-500"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Hotels
                </Link>

                {!user && (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-2 rounded text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-orange-500"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
                {user && (
                  <>
                    <Link
                      to="/dashboard"
                      className={`px-4 py-2 rounded text-sm font-medium ${
                        isActive("/dashboard")
                          ? "text-orange-500 font-semibold"
                          : "text-gray-700 dark:text-gray-200 hover:text-orange-500"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      📊 Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50"
                    >
                      🚪 Sign Out
                    </button>
                  </>
                )}

              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 dark:bg-secondary-900 dark:border-secondary-800 mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1 - Wanderlog Links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Wanderlog</h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li><Link to="/hotels" className="hover:underline">Hotels</Link></li>
                <li><Link to="/blog" className="hover:underline">Blog</Link></li>
                <li><a href="/security" className="hover:underline">Report security issue</a></li>
                <li><a href="/terms" className="hover:underline">Terms & Privacy</a></li>
                <li><a href="/app" className="hover:underline">Mobile app</a></li>
                <li><a href="/browser" className="hover:underline">Browser extension</a></li>
                <li><a href="/budgeting" className="hover:underline">Travel budgeting</a></li>
                <li><a href="/jobs" className="hover:underline">Jobs</a></li>
                <li><a href="/contact" className="hover:underline">Contact us</a></li>
                <li><a href="/disclosure" className="hover:underline">Google data disclosure</a></li>
                <li><a href="/embed" className="hover:underline">How to embed a map</a></li>
              </ul>
            </div>

            {/* Column 2 - Guides */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Guides & Resources</h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li><a href="/trip-planners" className="hover:underline">Trip planners</a></li>
                <li><a href="/explore" className="hover:underline">Explore destinations</a></li>
                <li><a href="/road-trips" className="hover:underline">Road trips</a></li>
                <li><a href="/places" className="hover:underline">Best places by category</a></li>
                <li><a href="/popular-search" className="hover:underline">Popular searches</a></li>
                <li><a href="/weather" className="hover:underline">Weather</a></li>
                <li><a href="/qna" className="hover:underline">Q&A</a></li>
                <li><a href="/itinerary" className="hover:underline">Itinerary guides</a></li>
                <li><a href="/maps" className="hover:underline">Maps</a></li>
                <li><a href="/seasons" className="hover:underline">By season</a></li>
                <li><a href="/destinations" className="hover:underline">By destination</a></li>
              </ul>
            </div>

            {/* Column 3 - Get the App */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Get the app</h4>
              <div className="flex flex-col space-y-3">
                <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer">
                  <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" className="w-36" />
                </a>
                <a href="https://play.google.com" target="_blank" rel="noopener noreferrer">
                  <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" className="w-36" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-10 border-t border-gray-200 dark:border-secondary-800 pt-6 flex justify-center text-sm text-gray-600 dark:text-gray-400">
            <p>Built with <span className="text-red-500">❤️</span> using the MERN stack from Zeeshan</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;