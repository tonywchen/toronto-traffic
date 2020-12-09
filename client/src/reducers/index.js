import { combineReducers } from 'redux';
import traffic from './trafficReducer';
import timeline from './timelineReducer';

const rootReducer = combineReducers({
  traffic,
  timeline
});

export default rootReducer;
