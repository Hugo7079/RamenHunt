import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RamenMap } from './components/RamenMap';
import { ShopModal } from './components/ShopModal';
import { CompassModal } from './components/CompassModal';
import { AddShopModal } from './components/AddShopModal';
import { JournalModal } from './components/JournalModal';
import { Shop, BowlLog, Location, CompassResult } from './types';
import { getShops, saveShops, getLogs, saveLogs } from './utils/storage';
import { Compass, Book, LocateFixed, Search, X, MapPin, Globe } from 'lucide-react';

// Custom Logo Component
const RamenLogo = () => (
  <div className="ramen-logo">
    <img src={import.meta.env.BASE_URL + 'image.png'} alt="拉麵" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
  </div>
);

// Debounce helper
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const App: React.FC = () => {
  // Data State
  const [shops, setShops] = useState<Shop[]>([]);
  const [logs, setLogs] = useState<BowlLog[]>([]);

  // UI State
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [isCompassOpen, setIsCompassOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  
  // Add Shop State (Manual or from Search)
  const [addShopData, setAddShopData] = useState<{location: Location, name?: string, address?: string} | null>(null);
  
  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [remoteSearchResults, setRemoteSearchResults] = useState<any[]>([]);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 800);

  // Map Control State
  const [targetLocation, setTargetLocation] = useState<Location | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  // Load Data
  useEffect(() => {
    setShops(getShops());
    setLogs(getLogs());
  }, []);

  // Remote Search Effect
  useEffect(() => {
    if (debouncedSearchTerm.length < 2) {
      setRemoteSearchResults([]);
      return;
    }

    const searchOSM = async () => {
      setIsSearchingRemote(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedSearchTerm)}&accept-language=zh-TW&limit=5`
        );
        const data = await response.json();
        setRemoteSearchResults(data);
      } catch (error) {
        console.error("OSM search failed", error);
      } finally {
        setIsSearchingRemote(false);
      }
    };

    searchOSM();
  }, [debouncedSearchTerm]);

  // Local Filter Logic
  const filteredLocalShops = useMemo(() => {
    if (!searchTerm) return [];
    const lowerTerm = searchTerm.toLowerCase();
    return shops.filter(shop => 
      shop.name.toLowerCase().includes(lowerTerm) || 
      shop.address.toLowerCase().includes(lowerTerm)
    );
  }, [searchTerm, shops]);

  const handleLocalSelect = (shop: Shop) => {
    setSelectedShopId(shop.id);
    setTargetLocation(shop.location);
    setSearchTerm('');
    setIsSearchOpen(false);
  };

  const handleRemoteSelect = (result: any) => {
    const loc: Location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };
    
    // Set map view
    setTargetLocation(loc);
    
    // Open Add Modal with pre-filled data
    setAddShopData({
      location: loc,
      name: result.name || searchTerm, // Fallback to search term if name is missing
      address: result.display_name
    });

    setSearchTerm('');
    setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    const newState = !isSearchOpen;
    setIsSearchOpen(newState);
    if (newState) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchTerm('');
    }
  };

  // Handle Geolocation
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          setTargetLocation({...loc}); 
        },
        (error) => {
          console.error("Error getting location", error);
          alert("無法取得您的位置，請確認瀏覽器權限。");
        }
      );
    } else {
      alert("您的瀏覽器不支援地理定位。");
    }
  };

  const handleMapClickForAdd = (loc: Location) => {
    if (!isSearchOpen) {
      setSelectedShopId(null);
      setAddShopData({ location: loc });
    }
  };

  const confirmAddShop = (name: string, address: string) => {
    if (!addShopData) return;
    
    const newShop: Shop = {
      id: crypto.randomUUID(),
      name,
      address,
      location: addShopData.location,
      createdAt: Date.now(),
    };

    const updatedShops = [...shops, newShop];
    setShops(updatedShops);
    saveShops(updatedShops);
    setAddShopData(null);
    setSelectedShopId(newShop.id);
  };

  const handleAddLog = (logData: Omit<BowlLog, 'id' | 'shopId' | 'date'>) => {
    if (!selectedShopId) return;

    const newLog: BowlLog = {
      ...logData,
      id: crypto.randomUUID(),
      shopId: selectedShopId,
      date: Date.now(),
    };

    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);
    saveLogs(updatedLogs);
  };

  const handleUpdateLog = (logId: string, logData: Omit<BowlLog, 'id' | 'shopId' | 'date'>) => {
    const updatedLogs = logs.map(log => {
      if (log.id === logId) {
        return {
          ...log,
          ...logData
        };
      }
      return log;
    });

    setLogs(updatedLogs);
    saveLogs(updatedLogs);
  };

  const handleCompassResult = (result: CompassResult) => {
    setIsCompassOpen(false);
    setSelectedShopId(result.shop.id);
    setTargetLocation(result.shop.location);
  };

  const handleLogJump = (shopId: string) => {
    const shop = shops.find(s => s.id === shopId);
    if (shop) {
      setSelectedShopId(shopId);
      setTargetLocation(shop.location);
    }
  };

  const selectedShop = shops.find(s => s.id === selectedShopId) || null;

  return (
    <div className="app-container">
      
      {/* Floating Header */}
      <div className={`floating-header ${isSearchOpen ? 'search-open' : 'search-closed'} animate-fade-in-up`}>
        
        <div className="header-content">
          {/* Logo / Title */}
          <div className={`logo-title-wrapper ${isSearchOpen ? 'search-open' : 'search-closed'}`}>
            <RamenLogo />
            <h1 className={`app-title ${isSearchOpen ? 'search-open' : ''}`}>
              <span className="title-part-1">麵對</span>
              <span className="title-part-2">現實</span>
            </h1>
          </div>

          {/* Search Input Area */}
          <div className={`search-wrapper ${isSearchOpen ? 'search-open' : 'search-closed'}`}>
             {isSearchOpen ? (
               <div className="search-input-container">
                 <Search size={16} className="search-icon" />
                 <input 
                    ref={searchInputRef}
                    placeholder="搜尋..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 <button onClick={() => { setSearchTerm(''); setIsSearchOpen(false); }} className="btn-close-search">
                   <X size={16} />
                 </button>
               </div>
             ) : (
               <button onClick={toggleSearch} className="btn-search-toggle">
                 <Search size={20} />
               </button>
             )}
          </div>
          
          {/* Right Actions */}
          {!isSearchOpen && (
            <div className="header-actions">
              <button
                onClick={() => setIsJournalOpen(true)}
                className="btn-journal"
                title="我的麵簿"
              >
                <Book size={20} />
                {logs.length > 0 && (
                  <span className="journal-badge"></span>
                )}
              </button>
              
              <button
                onClick={() => setIsCompassOpen(true)}
                className="btn-compass"
              >
                <Compass className="animate-spin-slow" size={20} />
                <span>吃哪碗？</span>
              </button>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && searchTerm && (
          <div className="search-results-dropdown custom-scrollbar">
            
            {/* Local Results */}
            {filteredLocalShops.length > 0 && (
              <div className="search-section-divider">
                <div className="search-section-header">已儲存店家</div>
                {filteredLocalShops.map(shop => (
                  <button
                    key={shop.id}
                    onClick={() => handleLocalSelect(shop)}
                    className="search-result-item"
                  >
                    <div className="search-result-icon local">
                      <MapPin size={16} />
                    </div>
                    <div className="search-result-content">
                      <div className="search-result-name">{shop.name}</div>
                      <div className="search-result-address">{shop.address}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Remote Results */}
            <div>
              <div className="search-section-header">
                <span>搜尋新地點</span>
                {isSearchingRemote && <span className="search-loading">搜尋中...</span>}
              </div>
              
              {remoteSearchResults.length > 0 ? (
                remoteSearchResults.map((result, idx) => (
                   <button
                    key={idx}
                    onClick={() => handleRemoteSelect(result)}
                    className="search-result-item"
                  >
                    <div className="search-result-icon remote">
                      <Globe size={16} />
                    </div>
                    <div className="search-result-content">
                      <div className="search-result-name line-clamp-1">{result.name || searchTerm}</div>
                      <div className="search-result-address line-clamp-1">{result.display_name}</div>
                    </div>
                  </button>
                ))
              ) : (
                !isSearchingRemote && filteredLocalShops.length === 0 && (
                   <div className="search-no-results">
                    找不到相關地點
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Map Area */}
      <div className="map-container">
        <RamenMap 
          shops={shops}
          selectedShopId={selectedShopId}
          onShopSelect={(shop) => setSelectedShopId(shop.id)}
          onAddShopRequest={handleMapClickForAdd}
          targetLocation={targetLocation}
          userLocation={userLocation}
        />
        
        {/* Locate Me Floating Button */}
        <button
          onClick={handleLocateMe}
          className="btn-locate-me"
          title="定位我的位置"
        >
          <LocateFixed size={24} />
        </button>
      </div>

      {/* Modals */}
      <ShopModal 
        shop={selectedShop} 
        logs={logs} 
        onClose={() => setSelectedShopId(null)}
        onAddLog={handleAddLog}
        onUpdateLog={handleUpdateLog}
      />

      <CompassModal 
        isOpen={isCompassOpen} 
        onClose={() => setIsCompassOpen(false)}
        shops={shops}
        logs={logs}
        onResult={handleCompassResult}
      />

      {/* Reused AddShopModal for both Map Click and Search Result Add */}
      <AddShopModal 
        location={addShopData?.location || null}
        initialName={addShopData?.name}
        initialAddress={addShopData?.address}
        onConfirm={confirmAddShop}
        onCancel={() => setAddShopData(null)}
      />

      <JournalModal 
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        logs={logs}
        shops={shops}
        onLogClick={handleLogJump}
      />

      {/* Helper text */}
      {shops.length < 2 && !selectedShopId && !isCompassOpen && !isJournalOpen && !isSearchOpen && !addShopData && (
         <div className="helper-tooltip">
           <div className="helper-tooltip-content">
             <p>點擊地圖任意處<br/>或搜尋新增店家！</p>
             <div className="helper-tooltip-arrow"></div>
           </div>
         </div>
      )}
    </div>
  );
};

export default App;