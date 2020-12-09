import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Mapbox from './components/mapbox/Mapbox';
import TrafficMap from './components/traffic/TrafficMap';
import Dashboard from './components/dashboard/Dashboard';

import { fetchTraffic } from './actions/traffic';

import './styles.scss';

const App = () => {
  const dispatch = useDispatch();

  const dispatchFetchTraffic = (newTime) => {
    console.log('dispatchFetchTraffic');
    return dispatch(fetchTraffic(newTime));
  };

  useEffect(() => {
    dispatchFetchTraffic();
  }, []);

  return (
    <div>
      <Mapbox>
        <TrafficMap></TrafficMap>
      </Mapbox>
      <Dashboard
        onDayChanged={dispatchFetchTraffic}
      />
    </div>
  );
};

export default App;
