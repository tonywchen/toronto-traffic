import { combineReducers } from 'redux';
import traffic from './trafficReducer';
import timeline from './timelineReducer';
import route from './routeReducer';
import path from './pathReducer';

const rootReducer = combineReducers({
  traffic,
  timeline,
  route,
  path
});

export default rootReducer;
