import { FETCH_TRAFFIC, SELECT_TRAFFIC, SELECT_NEXT_TRAFFIC, UPDATE_TIMELINE } from './types';
import resource from '../resources/traffic';

export const fetchTraffic = (from) => {
  return async (dispatch) => {
    const response = await resource.fetchTraffic(from);

    dispatch({
      type: FETCH_TRAFFIC,
      payload: response.data
    });
    dispatch({
      type: UPDATE_TIMELINE,
      payload: {
        from
      }
    });
  }
};

