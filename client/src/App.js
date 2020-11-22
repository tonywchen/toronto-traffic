import React from 'react';
import Mapbox from './Mapbox/Mapbox';
import Layer from './Mapbox/Layer';

import './styles.scss';

const App = () => {
  return (
    <div>
      Hello World!
      <Mapbox>
        <Layer id="marker" key="marker"></Layer>
      </Mapbox>
    </div>
  );
};

export default App;
