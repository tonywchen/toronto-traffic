import { FETCH_TRAFFIC } from '../actions/types';

export default (traffic = [], action) => {
  switch (action.type) {
    case FETCH_TRAFFIC:
      // TODO: consider the possibility to use a cache using timestamp/route as key
      // to reduce number of requests, since most of these data are historical and
      // should not change
      return action.payload;
    default:
      return traffic;
  }
};
