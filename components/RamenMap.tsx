import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Shop, Location } from '../types';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Ramen Icon
const createRamenIcon = (isSelected: boolean) => {
  const color = isSelected ? '#FFD700' : '#D32F2F'; // Gold or Red
  const scale = isSelected ? 'scale(1.25)' : 'scale(1)';
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="width: 40px; height: 40px; transform: ${scale}; transition: transform 0.3s; position: relative;">
             <div style="position: absolute; inset: 0; background-color: #0f0f0f; border-radius: 9999px; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
             </div>
             <div style="position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); width: 16px; height: 4px; background-color: rgba(0, 0, 0, 0.5); filter: blur(2px); border-radius: 9999px;"></div>
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-location-icon',
    html: `<div style="position: relative; width: 16px; height: 16px;">
             <div style="position: absolute; width: 100%; height: 100%; background-color: #3b82f6; border-radius: 9999px; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); z-index: 20;"></div>
             <div style="position: absolute; width: 100%; height: 100%; background-color: #60a5fa; border-radius: 9999px; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75; z-index: 10;"></div>
           </div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

interface MapClickProps {
  onMapClick: (loc: Location) => void;
}

const MapClickEvents: React.FC<MapClickProps> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

interface RecenterProps {
  location: Location | null;
}

const RecenterMap: React.FC<RecenterProps> = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 16, { 
        duration: 1,
        easeLinearity: 0.5
      });
    }
  }, [location, map]);
  return null;
};

interface RamenMapProps {
  shops: Shop[];
  selectedShopId: string | null;
  onShopSelect: (shop: Shop) => void;
  onAddShopRequest: (loc: Location) => void;
  targetLocation: Location | null;
  userLocation: Location | null;
}

export const RamenMap: React.FC<RamenMapProps> = ({ 
  shops, 
  selectedShopId, 
  onShopSelect, 
  onAddShopRequest,
  targetLocation,
  userLocation
}) => {
  return (
    <MapContainer 
      center={[25.0330, 121.5654]} // Default Taipei
      zoom={13} 
      zoomControl={false}
      style={{ height: '100%', width: '100%', zIndex: 0, backgroundColor: '#0f0f0f' }}
      minZoom={3}
      maxZoom={18}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="dark-map-tiles"
      />
      
      <MapClickEvents onMapClick={onAddShopRequest} />
      <RecenterMap location={targetLocation} />

      {/* User Location Marker */}
      {userLocation && (
        <Marker 
          position={[userLocation.lat, userLocation.lng]} 
          icon={createUserLocationIcon()}
          interactive={false}
          zIndexOffset={1000}
        />
      )}

      {shops.map((shop) => (
        <Marker
          key={shop.id}
          position={[shop.location.lat, shop.location.lng]}
          icon={createRamenIcon(shop.id === selectedShopId)}
          eventHandlers={{
            click: () => {
              onShopSelect(shop);
            },
          }}
        />
      ))}
    </MapContainer>
  );
};