import React from 'react';
import ReactDOM from 'react-dom';
import MapboxGl from 'mapbox-gl';

import App from './App';

MapboxGl.accessToken = 'pk.eyJ1IjoidG9ueXdjaGVuIiwiYSI6ImNraHBlODYwZDBjcTMyem54YWw5bm8yajAifQ.3j0gYt0zWIa_5rXk63grLQ';

ReactDOM.render(
  <App />,
  document.querySelector('#root')
);
