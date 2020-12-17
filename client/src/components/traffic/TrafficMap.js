import React from 'react';
import { useSelector } from 'react-redux';
import Layer from '../mapbox/Layer';
import Feature from '../mapbox/Feature';

const TRAFFIC_COLOUR = (score) => {
  if (score > 10) {
    return '#F9874E';
  } else if (score < -10) {
    return '#8CC788';
  } else {
    return '#FAC758';
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
      path.layerData.lineColor = 'transparent';
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
            timestamp: snapshot.timestamp,
            legs
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
        <Layer type="line" data={layerData} id={pathId} source={pathId} key={pathId} onClick={onPathClicked}>
          <Feature data={sourceData} id={pathId} type="LineString"/>
        </Layer>
      )
    });
  };

  const onPathClicked = (e) => {
    /* var coordinates = e.features[0].geometry.coordinates.slice();
    var description = e.features[0].properties.description;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map); */

    console.log(e);
    console.log(e.features[0].properties);
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
