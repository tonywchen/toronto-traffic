import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTraffic } from '../../actions/traffic';
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
  const [currentTrafficIndex, setCurrentTrafficIndex] = useState(null);

  const requestRef = React.useRef();
  const previousTimeRef = React.useRef();

  const traffic = useSelector(state => state.traffic);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTraffic()).then(() => {
      requestRef.current = requestAnimationFrame(animateTraffic);
    });

    return () => {
      cancelAnimationFrame(requestRef.current);
    }
  }, []);

  const animateTraffic = (timestamp) => {
    if (previousTimeRef.current != undefined) {
      const timeDiff = timestamp - previousTimeRef.current;

      if (timeDiff > 1000) {
        previousTimeRef.current = timestamp;
        setCurrentTrafficIndex(previousValue => {
          if (traffic.length === 0) {
            return null;
          }

          if (Number.isInteger(previousValue)) {
            return (previousValue + 1) % traffic.length;
          } else {
            return 0;
          }
        });
      }
    } else {
      previousTimeRef.current = timestamp;
    }

    requestRef.current = requestAnimationFrame(animateTraffic);
  };

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

  if (!Number.isInteger(currentTrafficIndex)) {
    return null;
  }

  return (
    renderTrafficSnapshot(traffic[currentTrafficIndex])
  );
};

export default TrafficMap;
