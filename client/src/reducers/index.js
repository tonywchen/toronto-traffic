import { combineReducers } from 'redux';
import traffic from './trafficReducer';

const rootReducer = combineReducers({
  traffic
});

export default rootReducer;
