import React from 'react';
import { useSelector } from 'react-redux';
import Layer from '../mapbox/Layer';

const TRAFFIC_COLOUR = (score) => {
  if (score > 10) {
    return 'red';
  } else if (score < -10) {
    return 'green';
  } else {
    return 'yellow';
  }
};

const TrafficMap = () => {
  const trafficList = useSelector(store => store.traffic.trafficList);
  const selectedTrafficIndex = useSelector(store => store.traffic.selectedTrafficIndex);

  const renderTrafficSnapshot = (snapshot) => {
    return snapshot.data.map((datum) => {
      const legs = datum.path.legs;
      const average = datum.average;
      const colour = TRAFFIC_COLOUR(average);
      const layerData = {
        legs,
        colour
      };

      const layerId = `${snapshot.timestamp}_${datum.path.from}_${datum.path.to}`;

      return (
        <Layer type="lineString" data={layerData} id={layerId} key={layerId} />
      );
    })
  };

  if (!Number.isInteger(selectedTrafficIndex)) {
    return null;
  }

  return (
    renderTrafficSnapshot(trafficList[selectedTrafficIndex])
  );
};

export default TrafficMap;
