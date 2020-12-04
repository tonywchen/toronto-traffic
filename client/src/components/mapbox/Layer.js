import React, { useContext, useEffect } from 'react';
import MapContext from '../common/MapContext';

const Layer = ({data, id}) => {
  const map = useContext(MapContext);

  useEffect(() => {
    return () => {
      if (map && map.getLayer(id)) {
        map.removeLayer(id);
      }

      if (map && map.getSource(id)) {
        map.removeSource(id);
      }
    };
  }, []);

  const addOrUpdateLayer = (id, layer, sourceData) => {
    const existingLayer = map.getLayer(id);

    if (existingLayer) {
      const existingSource = map.getSource(id);
      existingSource.setData(sourceData);

      map.setPaintProperty(id, 'line-color', layer.paint['line-color']);
    } else {
      const source = {
        type: 'geojson',
        data: sourceData
      };
      map.addSource(id, source);
      map.addLayer(layer);
    }
  };

  const createLine = (data, id) => {
    const sourceData = {
      type: 'Feature',
      properties: {
        timestamp: data.timestamp,
        from: data.from,
        to: data.to
      },
      geometry: {
        type: 'LineString',
        coordinates: data.legs
      }
    };

    const layer = {
      id: id,
      type: 'line',
      source: id,
      layout: {
        'line-join': 'round',
        'line-cap': 'square'
      },
      paint: {
        'line-color': data.colour,
        'line-width': 8
      }
    };

    addOrUpdateLayer(id, layer, sourceData);
  };

  if (map) {
    createLine(data, id);
  }

  return null;
};

export default Layer;
