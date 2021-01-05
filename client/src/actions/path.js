import moment from 'moment-timezone';

import {
  FETCH_PATHS,
  FETCH_PATH_DETAIL_INITIALIZED,
  FETCH_PATH_DETAIL,
  RESET_PATH_DETAIL
} from './types';
import resource from '../resources/traffic';

export const fetchPaths = () => {
  return async (dispatch) => {
    const response = await resource.fetchPaths();

    dispatch({
      type: FETCH_PATHS,
      payload: response.data
    });
  }
};

export const fetchPathDetail = (from, to, average, selectedTime) => {
  return async (dispatch) => {
    dispatch({
      type: FETCH_PATH_DETAIL_INITIALIZED,
      payload: {
        from,
        to
      }
    });

    const date = moment(selectedTime).format();

    const response = await resource.fetchPathDetail(from, to, date);

    dispatch({
      type: FETCH_PATH_DETAIL,
      payload: {
        ...response.data,
        currentView: {
          average,
          selectedTime
        }
      }
    });
  };
};

export const resetPathDetail = () => {
  return (dispatch) => {
    dispatch({
      type: RESET_PATH_DETAIL
    });
  };
}
