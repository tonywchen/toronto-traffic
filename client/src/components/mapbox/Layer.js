import React, { useContext, useEffect } from 'react';
import MapContext from '../common/MapContext';

import Feature from './Feature';

const TYPES = {
  'line': {
    type: 'line',
    layout: {
      'line-join': 'round',
      'line-cap': 'square'
    },
    paint: {
      'line-color': 'white',
      'line-width': 3,
      'line-offset': 1
    }
  }
};

const getTypeData = (type, data) => {
  let typeData = TYPES[type];
  if (typeData && data) {
    typeData.paint['line-color'] = data.lineColor || typeData.paint['line-color'];
    typeData.paint['line-offset'] = data.lineOffset || typeData.paint['line-offset'];
  }

  return typeData;
};

const Layer = ({children, data, id, type, source}) => {
  const map = useContext(MapContext);

  useEffect(() => {
    return () => {
      if (map && map.getLayer(id)) {
        console.log('remove');
        map.removeLayer(id);
      }
    };
  }, []);

  const addOrUpdateLayer = (id, layer) => {
    const existingLayer = map.getLayer(id);

    if (existingLayer) {
      map.setPaintProperty(id, 'line-color', layer.paint['line-color']);
    } else {
      map.addLayer(layer);
    }
  };

  if (map) {
    let typeData = getTypeData(type, data);
    if (!typeData) {
      return null;
    }

    const layer = {
      id,
      type,
      source,
      layout: typeData.layout,
      paint: typeData.paint
    };

    React.Children.forEach(children, (child, index) => {
      if (child.type === Feature) {
        child.type(child.props);
      }
    });

    addOrUpdateLayer(id, layer);
  }

  return null;
};

export default Layer;
