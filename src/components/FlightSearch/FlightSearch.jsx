import React, { useState } from 'react';
import { format, parse } from 'date-fns';
import { Search, Plane } from 'lucide-react';

const FlightSearch = () => {
  const initialDate = format(new Date(), 'dd MMM, yyyy');
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    whenDate: initialDate,
    isRoundTrip: false,
    returnDepartureDateTimeRange: null
  });
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDateChange = (e) => {
    const inputDate = new Date(e.target.value);
    const formattedDate = format(inputDate, 'dd MMM, yyyy');
    setSearchParams({ ...searchParams, whenDate: formattedDate });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/flights/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch flights');
      }
      
      const data = await response.json();
      setFlights(data);
    } catch (error) {
      setError('Error searching flights. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), 'dd MMM, yyyy HH:mm');
  };

  // Convert date string to HTML date input format
  const getHtmlDateFormat = (dateString) => {
    const parsedDate = parse(dateString, 'dd MMM, yyyy', new Date());
    return format(parsedDate, 'yyyy-MM-dd');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Flight Search</h1>
          
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">From</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City or Airport Code"
                  value={searchParams.from}
                  onChange={(e) => setSearchParams({...searchParams, from: e.target.value.toUpperCase()})}
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">To</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City or Airport Code"
                  value={searchParams.to}
                  onChange={(e) => setSearchParams({...searchParams, to: e.target.value.toUpperCase()})}
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={getHtmlDateFormat(searchParams.whenDate)}
                  onChange={handleDateChange}
                  required
                />
                <div className="text-sm text-gray-500">{searchParams.whenDate}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={searchParams.isRoundTrip}
                  onChange={(e) => setSearchParams({...searchParams, isRoundTrip: e.target.checked})}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Round Trip</span>
              </label>
              
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 flex items-center space-x-2 disabled:opacity-50"
                disabled={loading}
              >
                <Search size={20} />
                <span>{loading ? 'Searching...' : 'Search Flights'}</span>
              </button>
            </div>
          </form>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {flights.map((flight) => (
            <div key={flight.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div className="flex items-center space-x-8">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">{flight.flyFrom}</span>
                    <span className="text-sm text-gray-500">{flight.cityFrom}</span>
                  </div>
                  <Plane className="text-blue-600 h-8 w-8" />
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">{flight.flyTo}</span>
                    <span className="text-sm text-gray-500">{flight.cityTo}</span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    ${flight.price}
                  </div>
                  <div className="text-sm text-gray-500">
                    €{flight.conversion.EUR.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                <div>
                  <div className="font-medium text-gray-500">Departure</div>
                  <div className="mt-1">{formatDateTime(flight.local_departure)}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-500">Arrival</div>
                  <div className="mt-1">{formatDateTime(flight.local_arrival)}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-500">Duration</div>
                  <div className="mt-1">{formatDuration(flight.duration.total / 60)}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-500">Available Seats</div>
                  <div className="mt-1">{flight.availability.seats}</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="text-sm text-gray-500">
                  Airlines: {flight.airlines.join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlightSearch;
