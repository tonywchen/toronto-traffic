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
  const traffic = useSelector(state => state.traffic);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTraffic()).then(startAnimateTraffic);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (traffic && traffic.length) {
        if (currentTrafficIndex === null) {
          setCurrentTrafficIndex(0);
        } else {
          setCurrentTrafficIndex((currentTrafficIndex + 1) % traffic.length);
        }
      }
    }, 2000);
  }, [currentTrafficIndex]);

  const startAnimateTraffic = () => {
    // setCurrentTrafficIndex(0);
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

  if (currentTrafficIndex === null) {
    return null;
  }

  return (
    renderTrafficSnapshot(traffic[currentTrafficIndex])
  );
};

export default TrafficMap;
