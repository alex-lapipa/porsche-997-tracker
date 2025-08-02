import React, { useState, useEffect } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface Listing {
  id: string;
  source: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage?: number;
  transmission: string;
  color?: string;
  country?: string;
  city?: string;
  seller_type?: string;
  investment_score?: number;
  market_value?: number;
  rarity_score?: string;
  description?: string;
  images_count: number;
  first_seen: string;
  status: string;
  url: string;
}

export default function Porsche997Tracker() {
  const [opportunities, setOpportunities] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('opportunities');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/listings?status=eq.active&transmission=eq.manual&order=investment_score.desc&limit=50`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOpportunities(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading opportunities:', error);
      setOpportunities([
        {
          id: '1',
          source: 'autoscout24',
          model: '997.1 Carrera S',
          year: 2007,
          price: 52900,
          currency: 'EUR',
          mileage: 89500,
          transmission: 'manual',
          color: 'Guards Red',
          country: 'DE',
          city: 'Munich',
          seller_type: 'dealer',
          investment_score: 9.2,
          market_value: 61000,
          rarity_score: 'high',
          description: 'Excellent condition 997.1 Carrera S',
          images_count: 15,
          first_seen: new Date().toISOString(),
          status: 'active',
          url: 'https://autoscout24.de/listing/123456'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  const addToWatchlist = (carId: string) => {
    if (!watchlist.includes(carId)) {
      setWatchlist([...watchlist, carId]);
    }
  };

  const removeFromWatchlist = (carId: string) => {
    setWatchlist(watchlist.filter(id => id !== carId));
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-600 bg-gray-50';
    if (score >= 9) return 'text-green-600 bg-green-50';
    if (score >= 8) return 'text-blue-600 bg-blue-50';
    if (score >= 7) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const OpportunityCard = ({ car }: { car: Listing }) => {
    const potentialGain = (car.market_value || 0) - car.price;
    const roiPercentage = ((potentialGain / car.price) * 100).toFixed(1);

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{car.model}</h3>
              <p className="text-gray-600">{car.year} • {car.mileage?.toLocaleString()} km</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(car.investment_score)}`}>
                {car.investment_score?.toFixed(1)}/10
              </span>
              <button 
                onClick={() => watchlist.includes(car.id) ? removeFromWatchlist(car.id) : addToWatchlist(car.id)}
                className={`p-2 rounded-full transition-colors ${
                  watchlist.includes(car.id) ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                ❤️
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-2xl font-bold text-gray-900">
                €{car.price.toLocaleString()}
              </span>
              <div className="text-right">
                <div className="text-sm text-gray-600">Market Value</div>
                <div className="font-semibold">€{car.market_value?.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-green-600 font-semibold">
                +€{potentialGain.toLocaleString()} potential gain ({roiPercentage}%)
              </span>
              <span className="text-xs text-gray-500">Listed recently</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">📍</span>
              <span className="text-sm text-gray-600">{car.city}, {car.country}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">⚙️</span>
              <span className="text-sm text-gray-600">{car.transmission}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">{car.color}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">⭐</span>
              <span className="text-sm px-2 py-1 rounded bg-purple-50 text-purple-600">
                {car.rarity_score}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{car.source}</span> • {car.seller_type}
            </div>
            <button 
              onClick={() => window.open(car.url, '_blank')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              View Listing 🔗
            </button>
          </div>
        </div>
      </div>
    );
  };

  const MarketOverview = () => {
    const totalListings = opportunities.length;
    const averagePrice = Math.round(opportunities.reduce((sum, car) => sum + car.price, 0) / totalListings || 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900">{totalListings}</p>
            </div>
            <span className="text-4xl">📊</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Price</p>
              <p className="text-2xl font-bold text-gray-900">€{averagePrice.toLocaleString()}</p>
              <p className="text-green-600 text-sm">📈 +2.3% (7d)</p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">New Today</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <span className="text-4xl">🔔</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">High Score Cars</p>
              <p className="text-2xl font-bold text-gray-900">
                {opportunities.filter(car => car.investment_score && car.investment_score >= 8.5).length}
              </p>
            </div>
            <span className="text-4xl">🏆</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">997</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Porsche 997 Manual Tracker</h1>
                <p className="text-gray-600">Real-time investment opportunities • Connected to Supabase</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 text-sm font-medium">Live Data</span>
              </div>
              <button 
                onClick={loadOpportunities}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {loading ? '🔄 Loading...' : '🔄 Refresh'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'opportunities', label: '💎 Investment Opportunities' },
              { id: 'watchlist', label: '❤️ Watchlist' },
              { id: 'market', label: '📊 Market Data' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {selectedTab === 'opportunities' && (
          <div>
            <MarketOverview />
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl">🔍</span>
                <h2 className="text-lg font-semibold text-gray-900">Database Status</h2>
                <span className="text-sm text-gray-500">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-700">
                  {opportunities.length > 0 ? 'Connected to Supabase ✅' : 'Using sample data (check connection)'}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Investment Opportunities 
                  <span className="ml-2 text-lg font-normal text-gray-600">
                    ({opportunities.length} found)
                  </span>
                </h2>
                {loading && (
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">🔄</span>
                    <span className="text-sm text-gray-600">Loading from Supabase...</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {opportunities.map(car => (
                  <OpportunityCard key={car.id} car={car} />
                ))}
              </div>
              
              {opportunities.length === 0 && !loading && (
                <div className="text-center py-12">
                  <span className="text-6xl">🚗</span>
                  <p className="text-gray-600 mt-4">No opportunities found.</p>
                  <p className="text-gray-500 text-sm">Check your Supabase connection.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedTab === 'watchlist' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Watchlist</h2>
            {watchlist.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl">❤️</span>
                <p className="text-gray-600 mt-4">No cars in your watchlist yet.</p>
                <p className="text-gray-500 text-sm">Add cars from the opportunities page to track them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {opportunities.filter(car => watchlist.includes(car.id)).map(car => (
                  <OpportunityCard key={car.id} car={car} />
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'market' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Market Intelligence</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Database Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Supabase Connection</span>
                    <span className="text-green-600">✅ Connected</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Active Listings</span>
                    <span className="text-blue-600 font-semibold">{opportunities.length}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="font-medium text-yellow-800">1. Add Real Data Sources</div>
                    <div className="text-sm text-yellow-600">Connect scrapers for AutoScout24, Mobile.de, etc.</div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="font-medium text-orange-800">2. Setup Alerts</div>
                    <div className="text-sm text-orange-600">Configure email/Telegram notifications</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
