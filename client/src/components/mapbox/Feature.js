import React, { useContext, useEffect } from 'react';
import MapContext from '../common/MapContext';

const Feature = ({children, data, id, featureId, type}) => {
  const {map, mapAttrs} = useContext(MapContext);

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

  const createFeature = (data, id, featureId, type) => {
    switch (type) {
      case 'LineString':
        return createLine(data, id, featureId);
      case 'Point':
        return createPoint(data, id, featureId);
      case 'FeatureCollection':
        return createCollection();
      default:
        return null;
    }
  };

  const createLine = (data, id, featureId) => {
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

  const createPoint = (data, id, featureId) => {
    return {
      type: 'Feature',
      properties: {
        ...data.attributes
      },
      geometry: {
        type: 'Point',
        coordinates: data.coordinates || []
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
      const feature = createFeature(child.props.data, child.props.id, child.props.featureId, child.props.type);
      if (feature) {
        sourceData.features.push(feature);
      }
    });

    return sourceData;
  };

  const sourceData = createFeature(data, id, featureId, type);
  addOrUpdateSource(id, sourceData);

  return null;
};

export default Feature;
