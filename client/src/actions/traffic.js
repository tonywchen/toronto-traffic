import { FETCH_TRAFFIC } from './types';
import resource from '../resources/traffic';

export const fetchTraffic = () => {
  console.log('fetchTraffic DISPATCH');
  return async (dispatch) => {
    console.log('fetchTraffic DISPATCHED');
    const response = await resource.fetchTraffic();

    dispatch({
      type: FETCH_TRAFFIC,
      payload: response.data
    });
  }
}
