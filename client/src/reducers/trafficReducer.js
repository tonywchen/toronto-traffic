import {
  FETCH_TRAFFIC,
} from '../actions/types';

const initialState = {
  trafficByTimestamp: {}
};

const trafficReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TRAFFIC:
      // TODO: consider the possibility to use a cache using timestamp/route as key
      // to reduce number of requests, since most of these data are historical and
      // should not change
      const trafficByTimestamp = {};
      for (const result of action.payload.results) {
        trafficByTimestamp[result.timestamp] = result;
      }

      return {
        ...state,
        trafficByTimestamp
      };
    default:
      return state;
  }
};

export default trafficReducer;
