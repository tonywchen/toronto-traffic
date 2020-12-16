import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Mapbox from './components/mapbox/Mapbox';
import TrafficMap from './components/traffic/TrafficMap';
import SubrouteMap from './components/route/SubrouteMap';
import Dashboard from './components/dashboard/Dashboard';

import { fetchTraffic, fetchPaths } from './actions/traffic';
import { fetchSubroutes } from './actions/route';

import './styles.scss';

const App = () => {
  const dispatch = useDispatch();

  const dispatchFetchSubroutes = () => {
    return dispatch(fetchSubroutes());
  }

  const dispatchFetchTraffic = (newTime) => {
    return dispatch(fetchTraffic(newTime));
  };

  const dispatchFetchPaths = () => {
    return dispatch(fetchPaths());
  };

  useEffect(async () => {
    // await dispatchFetchSubroutes();
    await dispatchFetchPaths();
    await dispatchFetchTraffic();
  }, []);

  return (
    <div>
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
