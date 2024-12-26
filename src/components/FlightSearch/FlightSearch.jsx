import React, { useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const FlightSearch = () => {
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    start: '',
    end: '',
    isRoundTrip: false
  });
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Format dates to YYYY-MM-DD
      const formattedParams = {
        ...searchParams,
        from: searchParams.from.toUpperCase(),
        to: searchParams.to.toUpperCase(),
        start: searchParams.start,
        end: searchParams.isRoundTrip ? searchParams.end : searchParams.start
      };

      const response = await axios.post('http://localhost:5000/api/flights/search', formattedParams);
      setFlights(response.data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 'Failed to search flights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatFlightDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (err) {
      return 'Invalid Date';
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Flight Search</h2>
        
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="from" className="block text-sm font-medium text-gray-700">From</label>
              <input
                id="from"
                type="text"
                name="from"
                placeholder="Airport code (e.g., DUB)"
                value={searchParams.from}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase"
                required
                maxLength="3"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="to" className="block text-sm font-medium text-gray-700">To</label>
              <input
                id="to"
                type="text"
                name="to"
                placeholder="Airport code (e.g., SYD)"
                value={searchParams.to}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase"
                required
                maxLength="3"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="start" className="block text-sm font-medium text-gray-700">Departure Date</label>
              <input
                id="start"
                type="date"
                name="start"
                value={searchParams.start}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isRoundTrip"
                  checked={searchParams.isRoundTrip}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Round Trip</span>
              </label>
            </div>
          </div>

          {searchParams.isRoundTrip && (
            <div className="space-y-2">
              <label htmlFor="end" className="block text-sm font-medium text-gray-700">Return Date</label>
              <input
                id="end"
                type="date"
                name="end"
                value={searchParams.end}
                onChange={handleInputChange}
                min={searchParams.start}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'}`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <span className="mr-2">Searching</span>
                <span className="animate-pulse">...</span>
              </div>
            ) : (
              'Search Flights'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {flights.length > 0 ? (
          <div className="mt-8 space-y-4">
            {flights.map((flight) => (
              <div 
                key={flight.id} 
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="font-bold text-lg">{flight.cityFrom}</p>
                        <p className="text-sm text-gray-600">{flight.flyFrom}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <span className="text-xs text-gray-500">
                          {formatDuration(flight.duration.departure)}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-lg">{flight.cityTo}</p>
                        <p className="text-sm text-gray-600">{flight.flyTo}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Departure: {formatFlightDate(flight.local_departure)}</p>
                      <p>Arrival: {formatFlightDate(flight.local_arrival)}</p>
                    </div>
                  </div>
                  <div className="md:text-right space-y-2">
                    <p className="text-3xl font-bold text-blue-600">
                      ${flight.price}
                    </p>
                    <p className="text-sm text-gray-600">
                      Operated by: {flight.airlines.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          <div className="mt-8 text-center text-gray-500">
            No flights found. Try different search criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearch;