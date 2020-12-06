import React from 'react';

import Mapbox from './components/mapbox/Mapbox';
import TrafficMap from './components/traffic/TrafficMap';
import NavigationControl from './components/navigation/NavigationControl';

import './styles.scss';

const App = () => {
  return (
    <div>
      Hello World!
      <Mapbox>
        <TrafficMap></TrafficMap>
      </Mapbox>
      <NavigationControl />
    </div>
  );
};

export default App;
