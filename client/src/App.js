import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Mapbox from './components/mapbox/Mapbox';
import TrafficMap from './components/traffic/TrafficMap';
import SubrouteMap from './components/route/SubrouteMap';
import Dashboard from './components/dashboard/Dashboard';
import Info from './components/info/Info';
import PathDetail from './components/path/PathDetail';

import { fetchTraffic } from './actions/traffic';
import { fetchPaths, resetPathDetail } from './actions/path';

const App = () => {
  const dispatch = useDispatch();

  const dispatchFetchTraffic = (dateString) => {
    return dispatch(fetchTraffic(dateString));
  };

  const dispatchFetchPaths = () => {
    return dispatch(fetchPaths());
  };

  const onDayChanged = async (dateString) => {
    dispatch(resetPathDetail());
    await dispatchFetchTraffic(dateString);
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
        onDayChanged={onDayChanged}
      />
      <PathDetail />
    </div>
  );
};

export default App;
