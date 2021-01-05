import _ from 'lodash';

import {
  FETCH_TRAFFIC,
  UPDATE_TIMELINE,
  REFRESH_TIMELINE,
  SET_TIMELINE_PREVIEW,
  SET_TIMELINE_DATA_STATUS,
} from './types';
import resource from '../resources/traffic';
import { trafficToPreview } from '../components/common/Util'

const dispatchToTimeline = (dispatch, getState, dateString, trafficResponse) => {
  dispatch({
    type: UPDATE_TIMELINE,
    payload: {
      dateString
    }
  });

  const dataStatus = {
    available: !!trafficResponse.data.results.length,
    first: trafficResponse.data.first,
    last: trafficResponse.data.last
  };
  dispatch({
    type: SET_TIMELINE_DATA_STATUS,
    payload: {
      dataStatus
    }
  });

  const trafficByTimestamp = getState().traffic.trafficByTimestamp;
  dispatch({
    type: SET_TIMELINE_PREVIEW,
    payload: {
      source: trafficByTimestamp,
      transform: trafficToPreview
    }
  });
};

export const fetchTraffic = (dateString) => {
  return async (dispatch, getState) => {
    dispatch({
      type: REFRESH_TIMELINE
    });

    const response = await resource.fetchTraffic(dateString);
    dispatch({
      type: FETCH_TRAFFIC,
      payload: response.data
    });

    dispatchToTimeline(dispatch, getState, dateString, response);
  }
};
