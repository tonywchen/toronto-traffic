import React from 'react';
import { useSelector } from 'react-redux';
import Layer from '../mapbox/Layer';
import Feature from '../mapbox/Feature';

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
      path.layerData = path.layerData || {};
      path.layerData.lineColor = 'white';
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

        const layerData = {
          colour,
          opacity
        };
        const sourceData = {
          legs,
          attributes: {
            from: datum.path.from,
            to: datum.path.to,
            timestamp: snapshot.timestamp
          }
        };

        const pathId = `${datum.path.from}_${datum.path.to}`;
        pathMap[pathId] = pathMap[pathId] || {
          layerData,
          sourceData
        }

        pathMap[pathId].layerData = {
          ...layerData,
          lineColor: colour,
          lineWidth: 3,
          lineOffset: 5,
          opacity
        };
        pathMap[pathId].sourceData = {
          ...sourceData,
          timestamp: snapshot.timestamp
        };
      });
    });
  };

  const renderTrafficPaths = () => {
    const pathMap = pathMapRef.current;
    return Object.keys(pathMap).map((pathId) => {
      const { layerData, sourceData } = pathMap[pathId];
      return (
        <Layer type="line" data={layerData} id={pathId} source={pathId} key={pathId} >
          <Feature data={sourceData} id={pathId} type="LineString"/>
        </Layer>
      )
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
