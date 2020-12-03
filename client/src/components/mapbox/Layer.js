import React, { useContext, useEffect } from 'react';
import MapContext from '../common/MapContext';

const Layer = ({data, id}) => {
  const map = useContext(MapContext);

  useEffect(() => {
    return () => {
      if (map) {
        map.removeLayer(id);
        map.removeSource(id);
      }
    };
  }, []);

  const createLine = (data, id) => {
    const source = {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: data.legs
        }
      }
    };

    const layer = {
      id: id,
      type: 'line',
      source: id,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': data.colour,
        'line-width': 8
      }
    };

    map.addSource(id, source);
    map.addLayer(layer);
  };

  if (map) {
    createLine(data, id);
  }

  return null;
};

// export default withMap(Layer);
export default Layer;
