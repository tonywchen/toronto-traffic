import { combineReducers } from 'redux';
import traffic from './trafficReducer';
import timeline from './timelineReducer';
import route from './routeReducer';

const rootReducer = combineReducers({
  traffic,
  timeline,
  route
});

export default rootReducer;
