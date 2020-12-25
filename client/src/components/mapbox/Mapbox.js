import React, { useState, useRef, useEffect } from 'react';
import MapboxGl from 'mapbox-gl';

import MapMetadata from './MapMetadata';
import MapContext from '../common/MapContext';

const DEFAULT = {
  lng: -79.39823201128098,
  lat: 43.6404135590131,
  zoom: 12.22,
  bounds: [
    [-79.33653822635407, 43.68403908190626],
    [-79.46197886176948, 43.59920256784201]
  ]
};

const Mapbox = ({ children }) => {
  const [map, setMap] = useState(null);
  const [ready, setReady] = useState(false);
  const mapContainer = useRef(null);

  useEffect(() => {
    const mapInstance = new MapboxGl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      // center: [DEFAULT.lng, DEFAULT.lat],
      // zoom: DEFAULT.zoom,
      bounds: DEFAULT.bounds,
    });
    setMap(mapInstance);

    mapInstance.on('load', () => {
      setReady(true);

      // A hack to disabled touchscreen tap-and-drag zoom behaviour introduced
      // in Mapbox GL JS v2. The default timing (ie. time between taps) is
      // too long and introduced unintentional tap behaviour and there is no
      // way to change the timing or only disabled tag-and-drag throuhg the
      // official API.
      mapInstance.touchZoomRotate._tapDragZoom._enabled = false;
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

  const mapContextValue = {
    map: map,
    mapAttrs: {}
  };

  return (
    <MapContext.Provider value={mapContextValue}>
      <div className="map">
        <div className="map-container absolute inset-0 z-0" ref={mapContainer}>
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
