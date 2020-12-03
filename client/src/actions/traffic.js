import { FETCH_TRAFFIC, SELECT_TRAFFIC, SELECT_NEXT_TRAFFIC } from './types';
import resource from '../resources/traffic';

export const fetchTraffic = () => {
  return async (dispatch) => {
    const response = await resource.fetchTraffic();

    dispatch({
      type: FETCH_TRAFFIC,
      payload: response.data
    });
  }
};

export const selectTraffic = (index) => {
  return (dispatch) => {
    dispatch({
      type: SELECT_TRAFFIC,
      payload: index
    });
  }
};

export const selectNextTraffic = () => {
  return (dispatch) => {
    dispatch({
      type: SELECT_NEXT_TRAFFIC,
      payload: index
    });
  }
};

