import React from 'react';

import Mapbox from './components/mapbox/Mapbox';
import TrafficMap from './components/traffic/TrafficMap';
import Dashboard from './components/dashboard/Dashboard';

import './styles.scss';

const App = () => {
  return (
    <div>
      <Mapbox>
        <TrafficMap></TrafficMap>
      </Mapbox>
      <Dashboard />
    </div>
  );
};

export default App;
