import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Calendar, 
  UserCheck, 
  Utensils, 
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Restaurant } from './types';
import { fetchRestaurantDetails } from './services/gemini';
import { cn } from './lib/utils';

const INITIAL_RESTAURANTS: Restaurant[] = [
  { name: "東京肉しゃぶ家 秀彬", category: "しゃぶしゃぶ, すき焼き, とんかつ", lunchBudget: "￥15,000～￥19,999", dinnerBudget: "￥40,000～￥49,999", rating: 4.2, status: 'idle' },
  { name: "銀座かつかみ", category: "とんかつ", lunchBudget: "￥6,000～￥7,999", dinnerBudget: "￥10,000～￥14,999", rating: 3.71, status: 'idle' },
  { name: "にし邑", category: "とんかつ", lunchBudget: "￥1,000～￥1,999", dinnerBudget: "￥1,000～￥1,999", rating: 3.71, status: 'idle' },
  { name: "銀座 とんかつ 斉藤", category: "とんかつ", lunchBudget: "￥3,000～￥3,999", dinnerBudget: "￥3,000～￥3,999", rating: 3.63, status: 'idle' },
  { name: "イマカツ 銀座店", category: "とんかつ", lunchBudget: "￥1,000～￥1,999", dinnerBudget: "￥2,000～￥2,999", rating: 3.6, status: 'idle' },
  { name: "銀座とんかつ檍 銀座4丁目店", category: "とんかつ", lunchBudget: "￥2,000～￥2,999", dinnerBudget: "￥4,000～￥4,999", rating: 3.58, status: 'idle' },
  { name: "和心とんかつ あんず はなれ", category: "とんかつ, 牛カツ", lunchBudget: "￥4,000～￥4,999", dinnerBudget: "￥4,000～￥4,999", rating: 3.54, status: 'idle' },
  { name: "銀座 梅林 本店", category: "かつ丼, とんかつ, コロッケ", lunchBudget: "￥3,000～￥3,999", dinnerBudget: "￥2,000～￥2,999", rating: 3.54, status: 'idle' },
  { name: "銀座かつかみ弐", category: "とんかつ", lunchBudget: "￥6,000～￥7,999", dinnerBudget: "￥10,000～￥14,999", rating: 3.53, status: 'idle' },
  { name: "晴のちカツ", category: "とんかつ", lunchBudget: "￥1,000～￥1,999", dinnerBudget: "￥2,000～￥2,999", rating: 3.5, status: 'idle' },
  { name: "とんかつ 丸七 銀座店", category: "かつ丼, とんかつ, サンドイッチ", lunchBudget: "￥1,000～￥1,999", dinnerBudget: "￥1,000～￥1,999", rating: 3.48, status: 'idle' },
  { name: "とんかつ不二", category: "とんかつ", lunchBudget: "￥1,000～￥1,999", dinnerBudget: "￥1,000～￥1,999", rating: 3.46, status: 'idle' },
  { name: "名古屋名物 みそかつ 矢場とん 東京銀座店", category: "かつ丼, しゃぶしゃぶ, とんかつ", lunchBudget: "￥2,000～￥2,999", dinnerBudget: "￥2,000～￥2,999", rating: 3.39, status: 'idle' },
  { name: "銀座 肉流", category: "とんかつ, 豚しゃぶ, 豚料理", lunchBudget: "￥1,000～￥1,999", dinnerBudget: "￥6,000～￥7,999", rating: 3.3, status: 'idle' },
];

export default function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS);
  const [isFetchingAll, setIsFetchingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const updateRestaurant = (name: string, data: Partial<Restaurant>) => {
    setRestaurants(prev => prev.map(r => r.name === name ? { ...r, ...data } : r));
  };

  const handleFetchDetails = async (restaurant: Restaurant) => {
    if (restaurant.status === 'loading') return;
    
    updateRestaurant(restaurant.name, { status: 'loading' });
    const details = await fetchRestaurantDetails(restaurant);
    
    if (details.status === 'error') {
      updateRestaurant(restaurant.name, { status: 'error' });
    } else {
      updateRestaurant(restaurant.name, { ...details, status: 'success' });
    }
  };

  const handleFetchAll = async () => {
    setIsFetchingAll(true);
    for (const restaurant of restaurants) {
      if (restaurant.status !== 'success') {
        await handleFetchDetails(restaurant);
      }
    }
    setIsFetchingAll(false);
  };

  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-orange-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-200">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">東京銀座炸豬排地圖</h1>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Tokyo Ginza Tonkatsu Guide</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="搜尋店名或分類..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-orange-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={handleFetchAll}
              disabled={isFetchingAll}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg shadow-gray-200"
            >
              {isFetchingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>{isFetchingAll ? '更新中...' : '更新全部資料'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6">
          {filteredRestaurants.map((restaurant, index) => (
            <RestaurantCard 
              key={restaurant.name} 
              restaurant={restaurant} 
              onFetch={() => handleFetchDetails(restaurant)}
              index={index}
            />
          ))}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-200 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
          <p>© 2026 東京銀座炸豬排地圖. 資料由 Google Maps 提供。</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-orange-500 transition-colors">關於本站</a>
            <a href="#" className="hover:text-orange-500 transition-colors">隱私政策</a>
            <a href="#" className="hover:text-orange-500 transition-colors">聯絡我們</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function RestaurantCard({ restaurant, onFetch, index }: { restaurant: Restaurant, onFetch: () => void, index: number, key?: string | number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-100 transition-all overflow-hidden group"
    >
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
                {restaurant.category.split(',')[0]}
              </span>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-sm font-bold">{restaurant.googleRating || restaurant.rating}</span>
              </div>
            </div>
            <h3 className="text-xl font-bold group-hover:text-orange-600 transition-colors">{restaurant.name}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>銀座, 東京</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-gray-400">午:</span>
                <span className="text-gray-600">{restaurant.lunchBudget}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-gray-400">晚:</span>
                <span className="text-gray-600">{restaurant.dinnerBudget}</span>
              </div>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-3">
            {restaurant.status === 'idle' && (
              <button 
                onClick={onFetch}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-orange-500 hover:text-white rounded-xl text-sm font-semibold transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                獲取詳細資料
              </button>
            )}
            {restaurant.status === 'loading' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-sm font-semibold">
                <Loader2 className="w-4 h-4 animate-spin" />
                正在搜尋 Google Maps...
              </div>
            )}
            {restaurant.status === 'success' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                已更新
              </div>
            )}
            {restaurant.status === 'error' && (
              <button 
                onClick={onFetch}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-all"
              >
                <AlertCircle className="w-4 h-4" />
                重試
              </button>
            )}
            
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "p-2 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all",
                isExpanded && "bg-gray-50 rotate-180"
              )}
            >
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Expanded Info */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-8 border-t border-dashed border-gray-100 mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <InfoItem 
                  icon={<Clock className="w-4 h-4 text-blue-500" />}
                  label="排隊情況"
                  value={restaurant.waitTime || '尚未獲取'}
                  loading={restaurant.status === 'loading'}
                />
                <InfoItem 
                  icon={<Calendar className="w-4 h-4 text-purple-500" />}
                  label="預約要求"
                  value={restaurant.reservationRequired || '尚未獲取'}
                  loading={restaurant.status === 'loading'}
                />
                <InfoItem 
                  icon={<UserCheck className="w-4 h-4 text-green-500" />}
                  label="Walk-in 友好"
                  value={restaurant.walkInFriendly || '尚未獲取'}
                  loading={restaurant.status === 'loading'}
                />
                <InfoItem 
                  icon={<Utensils className="w-4 h-4 text-orange-500" />}
                  label="招牌菜"
                  value={restaurant.signatureDishes || '尚未獲取'}
                  loading={restaurant.status === 'loading'}
                />
                
                <div className="md:col-span-2 lg:col-span-4 bg-gray-50 rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">評論摘要</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {restaurant.status === 'loading' ? (
                      <span className="flex items-center gap-2 italic text-gray-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        正在分析評論...
                      </span>
                    ) : (
                      restaurant.reviewsSummary || '點擊「獲取詳細資料」以查看 Google Maps 上的評論摘要。'
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function InfoItem({ icon, label, value, loading }: { icon: React.ReactNode, label: string, value: string, loading: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-sm font-semibold text-gray-800">
        {loading ? (
          <div className="h-4 w-24 bg-gray-100 animate-pulse rounded" />
        ) : (
          value
        )}
      </div>
    </div>
  );
}
