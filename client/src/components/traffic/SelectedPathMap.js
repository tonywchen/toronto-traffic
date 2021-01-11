import React from 'react';
import { useSelector } from 'react-redux';

import MapContext from '../common/MapContext';
import Layer from '../mapbox/Layer';
import Feature from '../mapbox/Feature';

const SELECTED_LAYER_DATA = {
  lineColor: 'white',
  lineWidth: 12,
  lineOffset: 6
};
const SELECTED_BASE_LAYER_DATA = {
  lineColor: '#171717',
  lineWidth: 6,
  lineOffset: 6
};

const SelectedPathMap = () => {
  const selectedPath = useSelector(store => store.path.selectedPath);

  let from = '0',
      to = '0',
      legs = [];

  if (selectedPath) {
    from = selectedPath.fromStop.tag;
    to = selectedPath.toStop.tag;
    legs = selectedPath.legs;
  }

  const sourceData = {
    legs,
    attributes: {
      from,
      to,
      legs
    }
  };
  const pathId = `selected-${from}-${to}`;

  const selectedPathSourceId = `selected-path`;
  const selectedLayerId = `selected-path`;
  const selectedBaseLayerId = `selected-path-base`;

  console.log(sourceData);

  return (
    <>
      <Feature type="FeatureCollection" id={selectedPathSourceId}>
        <Feature data={sourceData} id={pathId} key={pathId} type="LineString" />
      </Feature>
      <Layer
        type="line"
        data={SELECTED_LAYER_DATA}
        id={selectedLayerId}
        source={selectedPathSourceId}
        key={selectedLayerId}
        filter="LineString"
      />
      <Layer
        type="line"
        data={SELECTED_BASE_LAYER_DATA}
        id={selectedBaseLayerId}
        source={selectedPathSourceId}
        key={selectedBaseLayerId}
        filter="LineString"
      />
    </>
  );
};

export default SelectedPathMap;
