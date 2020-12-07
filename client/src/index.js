import React from 'react';
import ReactDOM from 'react-dom';
import MapboxGl from 'mapbox-gl';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import './styles.scss'

import App from './App';
import rootReducer from './reducers';

const composeEnhancers = (process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
const enhancer = composeEnhancers(
  applyMiddleware(thunk)
);

const store = createStore(rootReducer, enhancer);

MapboxGl.accessToken = 'pk.eyJ1IjoidG9ueXdjaGVuIiwiYSI6ImNraHBlODYwZDBjcTMyem54YWw5bm8yajAifQ.3j0gYt0zWIa_5rXk63grLQ';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector('#root')
);
