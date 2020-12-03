import { FETCH_TRAFFIC } from '../actions/types';

const initialState = {
  trafficList: [],
  selectedTraffic: {},
  selectedTrafficIndex: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TRAFFIC:
      // TODO: consider the possibility to use a cache using timestamp/route as key
      // to reduce number of requests, since most of these data are historical and
      // should not change
      state.trafficList.length = 0;
      state.trafficList.push(...action.payload);
      return state;
    default:
      return traffic;
  }
};
