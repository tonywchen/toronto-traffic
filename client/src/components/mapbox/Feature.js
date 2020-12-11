import React, { useContext, useEffect } from 'react';
import MapContext from '../common/MapContext';

const Feature = ({children, data, id, type}) => {
  const map = useContext(MapContext);
  useEffect(() => {
    return () => {
      if (map && map.getSource(id)) {
        map.removeSource(id);
      }
    };
  }, []);

  if (!(map && id && type)) {
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

  const createFeature = (data, id, type) => {
    switch (type) {
      case 'LineString':
        return createLine(data, id)
      case 'FeatureCollection':
        return createCollection(data, id, type);
    }

    return null;
  };

  const createLine = (data, id) => {
    return {
      type: 'Feature',
      properties: {
        ...data.attributes
      },
      geometry: {
        type: 'LineString',
        coordinates: data.legs || []
      }
    };
  };

  const createCollection = (data, id) => {
    const sourceData = {
      type: 'FeatureCollection',
      features: []
    };

    React.Children.forEach(children, (child) => {
      const feature = createFeature(child.props.data, child.props.id, child.props.type);
      if (feature) {
        sourceData.features.push(feature);
      }
    });

    console.log(sourceData);

    return sourceData;
  };

  const sourceData = createFeature(data, id, type);
  addOrUpdateSource(id, sourceData);

  return null;
};

export default Feature;
