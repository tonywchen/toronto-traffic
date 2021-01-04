import {
  FETCH_TRAFFIC,
  FETCH_PATHS,
  FETCH_PATH_DETAIL_INITIALIZED,
  FETCH_PATH_DETAIL
} from '../actions/types';

const initialState = {
  trafficByTimestamp: {},
  paths: [],
  selectedPathDetail: null
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
    case FETCH_PATHS:
      return {
        ...state,
        paths: action.payload.paths || []
      };
    case FETCH_PATH_DETAIL_INITIALIZED:
      return {
        ...state,
        selectedPathDetail: null
      };
    case FETCH_PATH_DETAIL_INITIALIZED:
      return {
        ...state,
        selectedPathDetail: action.payload.pathDetail
      };
    default:
      return state;
  }
};

export default trafficReducer;
