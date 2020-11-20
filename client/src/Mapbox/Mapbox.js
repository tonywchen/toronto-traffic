import React, { useState, useRef, useEffect } from 'react';
import MapboxGl from 'mapbox-gl';

const DEFAULT = {
  lng: 5,
  lat: 34,
  zoom: 2
};

const Mapbox = () => {
  const [lng, setLng] = useState(DEFAULT.lng);
  const [lat, setLat] = useState(DEFAULT.lat);
  const [zoom, setZoom] = useState(DEFAULT.zoom);

  const mapContainer = useRef(null);

  useEffect(() => {
    const map = new MapboxGl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [lng, lat],
      zoom: zoom
    });

    map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="map">
      <div className="map-container" ref={mapContainer}>  
      </div>
      <div className="map-detail">
        {`Coordinates: (${lng}, ${lat}), Zoom: ${zoom}`}
      </div>
    </div>
  );
};

export default Mapbox;