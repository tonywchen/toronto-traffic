import { FETCH_SUBROUTES } from './types';
import resource from '../resources/route';

export const fetchSubroutes = () => {
  return async (dispatch) => {
    const response = await resource.fetchSubroutes();

    dispatch({
      type: FETCH_SUBROUTES,
      payload: response.data
    });
  }
};

