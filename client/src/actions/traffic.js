import { FETCH_TRAFFIC, UPDATE_TIMELINE, REFRESH_TIMELINE } from './types';
import resource from '../resources/traffic';

export const fetchTraffic = (from) => {
  return async (dispatch) => {
    dispatch({
      type: REFRESH_TIMELINE
    });

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

