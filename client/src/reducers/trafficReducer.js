import { FETCH_TRAFFIC, SELECT_TRAFFIC, SELECT_NEXT_TRAFFIC } from '../actions/types';

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
    case SELECT_TRAFFIC:
      console.log(`SELECT_TRAFFIC: ${action.payload}`);
      state.selectedTrafficIndex = action.payload;
      return state;
    case SELECT_NEXT_TRAFFIC:
      if (state.trafficList.length === 0) {
        return state;
      }

      if (state.selectedTrafficIndex === null) {
        state.selectedTrafficIndex = 0;
      } else {
        state.selectedTrafficIndex = (state.selectedTrafficIndex + 1) % state.trafficList.length;
      }
      return state;
    default:
      return state;
  }
};
