import { SELECT_TIME, SELECT_NEXT_TIME } from './types';

export const selectTime = (time) => {
  return (dispatch) => {
    dispatch({
      type: SELECT_TIME,
      payload: {
        time
      }
    });
  }
};

export const selectNextTime = () => {
  return (dispatch) => {
    dispatch({
      type: SELECT_NEXT_TIME
    });
  }
};
