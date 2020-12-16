import { SELECT_TIME, SELECT_NEXT_TIME, SELECT_PREVIOUS_TIME, SET_TIMELINE_PREVIEW } from './types';

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
export const selectPreviousTime = () => {
  return (dispatch) => {
    dispatch({
      type: SELECT_PREVIOUS_TIME
    });
  }
};

export const setTimelinePreview = (source, mapper) => {
  return (dispatch) => {
    dispatch({
      type: SET_TIMELINE_PREVIEW,
      payload: {
        source,
        mapper
      }
    });
  }
}
