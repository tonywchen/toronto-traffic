import React from 'react';

import Mapbox from './components/mapbox/Mapbox';
import TrafficMap from './components/traffic/TrafficMap';
import TrafficDetail from './components/traffic/TrafficDetail';

import './styles.scss';

const App = () => {
  return (
    <div>
      Hello World!
      <Mapbox>
        <TrafficMap></TrafficMap>
      </Mapbox>
      <TrafficDetail />
    </div>
  );
};

export default App;
