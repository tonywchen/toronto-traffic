import React, { useContext, useEffect } from 'react';
import MapContext from '../common/MapContext';

import Feature from './Feature';

const getTypeData = (type, data) => {
  let typeData = null;

  switch (type) {
    case 'line':
      typeData = {
        type: 'line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          'line-round-limit': 2
        },
        paint: {
          'line-color': 'white',
          'line-width': 1,
          'line-offset': 0
        }
      }
      break;
    default:
      // do nothing
  }

  if (typeData && data) {
    typeData.paint['line-color'] = data.lineColor || typeData.paint['line-color'];
    typeData.paint['line-offset'] = data.lineOffset || typeData.paint['line-offset'];
    typeData.paint['line-width'] = data.lineWidth || typeData.paint['line-width'];
  }

  return typeData;
};

const Layer = ({children, data, id, type, source, onClick, onMousemove, onMouseleave}) => {
  const {map, mapAttrs} = useContext(MapContext);

  useEffect(() => {
    return () => {
      if (map && map.getLayer(id)) {
        map.removeLayer(id);
      }
    };
  }, []);

  const addOrUpdateLayer = (id, layer, source) => {
    const existingLayer = map.getLayer(id);
    if (existingLayer) {
      map.setPaintProperty(id, 'line-color', layer.paint['line-color']);
    } else {
      map.addLayer(layer);

      if (onClick) {
        map.on('click', id, onClick);
      }

      const customEventData = {
        sourceId: source,
        map,
        mapAttrs
      };

      if (onMousemove) {
        map.on('mousemove', id, (e) => onMousemove(e, customEventData));
      }

      if (onMouseleave) {
        map.on('mouseleave', id, (e) => onMouseleave(e, customEventData));
      }

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

    React.Children.forEach(children, (child) => {
      if (child.type === Feature) {
        child.type(child.props);
      }
    });

    addOrUpdateLayer(id, layer, source);
  }

  return null;
};

export default Layer;
