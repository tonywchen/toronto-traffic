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

  const createFeature = (type) => {
    switch (type) {
      case 'LineString':
        return createLine()
      case 'FeatureCollection':
        return createCollection();
      default:
        return null;
    }
  };

  const createLine = () => {
    return {
      type: 'Feature',
      properties: {
        ...data.attributes
      },
      geometry: {
        type: 'LineString',
        coordinates: data.legs || []
      },
      id: featureId
    };
  };

  const createCollection = () => {
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

    return sourceData;
  };

  const sourceData = createFeature(type);
  addOrUpdateSource(id, sourceData);

  return null;
};

export default Feature;
