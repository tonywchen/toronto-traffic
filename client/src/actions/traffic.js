import { FETCH_TRAFFIC } from './types';
import resource from '../resources/traffic';

export const fetchTraffic = () => {
  return async (dispatch) => {
    const response = await resource.fetchTraffic();

    dispatch({
      type: FETCH_TRAFFIC,
      payload: response.data
    });
  }
}
