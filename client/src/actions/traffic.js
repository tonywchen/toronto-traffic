import _ from 'lodash';

import {
  FETCH_TRAFFIC,
  FETCH_PATHS,
  UPDATE_TIMELINE,
  REFRESH_TIMELINE,
  SET_TIMELINE_PREVIEW,
  SET_TIMELINE_DATA_STATUS
} from './types';
import resource from '../resources/traffic';
import { TrafficToColour } from '../components/common/Util'

const trafficTransformer = (source) => {
  return (timestamps) => {
    let max = 0;
    timestamps.forEach((timestamp) => {
      const element = source[timestamp];
      if (!element) {
        return 0;
      }

      const sum = _.sumBy(element.data, 'weight');
      max = Math.max(max, sum);
    });

    const results = timestamps.map((timestamp) => {
      const element = source[timestamp];
      if (!element) {
        return {
          x: null
        }
      }

      const totalWeight = _.sumBy(element.data, 'weight');
      const totalScore = _.sumBy(element.data, 'score');
      const color = TrafficToColour(totalScore / totalWeight);
      const x = totalWeight / max;

      return {
        x,
        data: {
          color
        }
      };
    });

    return results;
  }
};

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
      transform: trafficTransformer
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

export const fetchPaths = () => {
  return async (dispatch) => {
    const response = await resource.fetchPaths();

    dispatch({
      type: FETCH_PATHS,
      payload: response.data
    });
  }
}

