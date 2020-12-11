import React, { useContext, useEffect } from 'react';
import MapContext from '../common/MapContext';

const Feature = ({data, id, type}) => {
  const map = useContext(MapContext);
  useEffect(() => {
    return () => {
      if (map && map.getSource(id)) {
        map.removeSource(id);
      }
    };
  }, []);

  if (!(map && data && id && type)) {
    return null;
  }

  const addOrUpdateSource = (id, sourceData) => {
    const existingSource = map.getSource(id);

    if (existingSource) {
      existingSource.setData(sourceData);
    } else {
      const source = {
        type: 'geojson',
        data: sourceData
      };

      map.addSource(id, source);
    }
  };

  const createLine = (data, id, type) => {
    const sourceData = {
      type: 'Feature',
      properties: {
        ...data.attributes
      },
      geometry: {
        type: type,
        coordinates: data.legs
      }
    };

    addOrUpdateSource(id, sourceData);
  };

  createLine(data, id, type);

  return null;
};

export default Feature;
