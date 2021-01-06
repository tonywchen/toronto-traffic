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

      if (typeData && data) {
        typeData.paint['line-color'] = data.lineColor || typeData.paint['line-color'];
        typeData.paint['line-offset'] = data.lineOffset || typeData.paint['line-offset'];
        typeData.paint['line-width'] = data.lineWidth || typeData.paint['line-width'];
      }

      break;
    case 'circle':
      typeData = {
        type: 'circle',
        layout: {

        },
        paint: {
          'circle-color': 'white',
          'circle-radius': 2,
          'circle-stroke-color': 'white',
          'circle-stroke-width': 1
        }
      }

      if (typeData && data) {
        typeData.paint['circle-color'] = data.circleColor || typeData.paint['circle-color'];
        typeData.paint['circle-radius'] = data.circleRadius || typeData.paint['circle-radius'];
        typeData.paint['circle-stroke-color'] = data.circleStrokeColor || typeData.paint['circle-stroke-color'];
        typeData.paint['circle-stroke-width'] = data.circleStrokeWidth || typeData.paint['circle-stroke-width'];
      }

      break;
    default:
      // do nothing
  }

  return typeData;
};

const Layer = ({children, data, id, type, source, filter, onClick, onMousemove, onMouseleave}) => {
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
      if (layer.paint && layer.paint['line-color']) {
        map.setPaintProperty(id, 'line-color', layer.paint['line-color']);
      }
    } else {
      map.addLayer(layer);

      const customEventData = {
        sourceId: source,
        map,
        mapAttrs
      };

      if (onClick) {
        map.on('click', id, (e) => onClick(e, customEventData));
      }

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

    if (filter) {
      layer.filter = ['==', '$type', filter];
    }

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
