import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TripMapView = ({ markers = [] }) => {
  const mapId = React.useMemo(() => `map_${Math.random().toString(36).slice(2)}`,[ ]);
  useEffect(() => {
    const map = L.map(mapId).setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    const layerGroup = L.layerGroup().addTo(map);
    markers.filter(m => typeof m.lat === 'number' && typeof m.lng === 'number').forEach((m) => {
      L.marker([m.lat, m.lng]).addTo(layerGroup).bindPopup(m.title || '');
    });
    if (markers.length > 0) {
      const coords = markers.filter(m => typeof m.lat === 'number' && typeof m.lng === 'number').map(m => [m.lat, m.lng]);
      if (coords.length) {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
    return () => map.remove();
  }, [mapId, markers]);

  return <div id={mapId} className="w-full h-64 rounded-md border border-secondary-200 dark:border-secondary-700" />;
};

export default TripMapView;