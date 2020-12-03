import React, { useState, useRef, useEffect } from 'react';
import MapboxGl from 'mapbox-gl';

import MapMetadata from './MapMetadata';
import MapContext from '../common/MapContext';

const DEFAULT = {
  lng: -79.3930,
  lat: 43.6560,
  zoom: 12.05
};

const Mapbox = ({ children }) => {
  const [map, setMap] = useState(null);
  const [ready, setReady] = useState(false);
  const mapContainer = useRef(null);

  useEffect(() => {
    const mapInstance = new MapboxGl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [DEFAULT.lng, DEFAULT.lat],
      zoom: DEFAULT.zoom
    });
    setMap(mapInstance);

    mapInstance.on('load', () => {
      setReady(true);
    });

    return () => {
      mapInstance.remove();
    };
  }, []);

  const renderChildren = () => {
    if (!ready) {
      return null;
    }

    return React.Children.map(children, (child) => {
      return React.cloneElement(child, { map: map })
    });
  };

  return (
    <MapContext.Provider value={map}>
      <div className="map">
        <div className="map-container" ref={mapContainer}>
          { renderChildren() }
        </div>
        <div className="map-detail">
          { ready && (
            <MapMetadata></MapMetadata>
          )}
        </div>
      </div>
    </MapContext.Provider>
  );
};

export default Mapbox;
