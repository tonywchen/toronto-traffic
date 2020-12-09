import React from 'react';
import { useSelector } from 'react-redux';
import Layer from '../mapbox/Layer';
import moment from 'moment-timezone';

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
  const trafficByTimestamp = useSelector(store => store.traffic.trafficByTimestamp);
  const selectedTime = useSelector(store => store.timeline.selected);

  const pathMapRef = React.useRef({});

  const computeTrafficSnapshots = () => {
    const traffic = trafficByTimestamp[selectedTime];
    return (traffic)
      ? [traffic]
      : [];
  };

  const buildTrafficPaths = (snapshots) => {
    const pathMap = pathMapRef.current;
    Object.values(pathMap).forEach((path) => {
      path.colour = 'white';
    });

    if (snapshots.length === 0) {
      return;
    }

    snapshots.forEach((snapshot, index) => {
      const opacity = 1; // (index + 1) / snapshots.length;

      snapshot.data.forEach((datum) => {
        const legs = datum.path.legs;
        const average = datum.average;
        const colour = TRAFFIC_COLOUR(average);
        const pathData = {
          legs,
          colour,
          opacity,
          from: datum.path.from,
          to: datum.path.to,
          timestamp: snapshot.timestamp
        };

        const pathId = `${datum.path.from}_${datum.path.to}`;
        pathMap[pathId] = pathMap[pathId] || pathData;
        pathMap[pathId] = {
          ...pathMap[pathId],
          colour: pathData.colour,
          opacity: pathData.opacity,
          timestamp: pathData.timestamp
        };
      });
    });

    Object.keys(pathMap).forEach((pathId) => {
      const pathData = pathMap[pathId];
    });
  };

  const renderTrafficPaths = () => {
    const pathMap = pathMapRef.current;
    return Object.keys(pathMap).map((pathId) => {
      const pathData = pathMap[pathId];
      return <Layer type="lineString" data={pathData} id={pathId} key={pathId} />;
    });
  };

  if (!Number.isInteger(selectedTime)) {
    return null;
  }

  buildTrafficPaths(computeTrafficSnapshots());

  return (
    renderTrafficPaths()
  );
};

export default TrafficMap;
