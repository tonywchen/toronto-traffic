import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Mapbox from './components/mapbox/Mapbox';
import TrafficMap from './components/traffic/TrafficMap';
import SubrouteMap from './components/route/SubrouteMap';
import Dashboard from './components/dashboard/Dashboard';
import Info from './components/info/Info';

import { fetchTraffic } from './actions/traffic';
import { fetchPaths } from './actions/path';

const App = () => {
  const dispatch = useDispatch();

  const dispatchFetchTraffic = (dateString) => {
    return dispatch(fetchTraffic(dateString));
  };

  const dispatchFetchPaths = () => {
    return dispatch(fetchPaths());
  };

  useEffect(() => {
    (async () => {
      await dispatchFetchPaths();
      await dispatchFetchTraffic();
    })();
  }, []);

  return (
    <div>
      <Info />
      <Mapbox>
        <SubrouteMap></SubrouteMap>
        <TrafficMap></TrafficMap>
      </Mapbox>
      <Dashboard
        onDayChanged={dispatchFetchTraffic}
      />
    </div>
  );
};

export default App;
