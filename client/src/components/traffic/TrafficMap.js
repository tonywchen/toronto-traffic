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
  const trafficList = useSelector(store => store.traffic.trafficList);
  const selectedTrafficIndex = useSelector(store => store.traffic.selectedTrafficIndex);

  const pathMapRef = React.useRef({});

  const computeTrafficSnapshots = () => {
    // const minIndex = Math.max(0, selectedTrafficIndex - 1);

    // return trafficList.slice(selectedTrafficIndex, selectedTrafficIndex + 1);
    if (trafficList[selectedTrafficIndex]) {
      return [trafficList[selectedTrafficIndex]];
    } else {
      return [];
    }
  };

  const buildTrafficPaths = (snapshots) => {
    const pathMap = pathMapRef.current;
    Object.values(pathMap).forEach((path) => {
      path.colour = 'grey';
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

  if (!Number.isInteger(selectedTrafficIndex)) {
    return null;
  }

  buildTrafficPaths(computeTrafficSnapshots());

  return (
    // renderTrafficSnapshot(computeTrafficSnapshots())
    renderTrafficPaths()
  );
};

export default TrafficMap;
