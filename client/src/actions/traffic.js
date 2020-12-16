import { FETCH_TRAFFIC, FETCH_PATHS, UPDATE_TIMELINE, REFRESH_TIMELINE } from './types';
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

export const fetchPaths = () => {
  return async (dispatch) => {
    const response = await resource.fetchPaths();

    dispatch({
      type: FETCH_PATHS,
      payload: response.data
    });
  }
}

