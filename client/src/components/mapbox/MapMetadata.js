import React, { useState, useEffect, useContext } from 'react';
import MapContext from '../common/MapContext';

const Metadata = () => {
  const map = useContext(MapContext);

  const [lng, setLng] = useState(0);
  const [lat, setLat] = useState(0);
  const [zoom, setZoom] = useState(0);

  useEffect(() => {
    if (!map) {
      return;
    }

    setLng(map.getCenter().lng.toFixed(4));
    setLat(map.getCenter().lat.toFixed(4));
    setZoom(map.getZoom().toFixed(2));

    map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));
    });
  }, [map]);

  return (
    <div>{`Coordinates: (${lng}, ${lat}), Zoom: ${zoom}`}</div>
  );
};

export default Metadata;
