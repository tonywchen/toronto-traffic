import _ from 'lodash';

import { FETCH_TRAFFIC, FETCH_PATHS, UPDATE_TIMELINE, REFRESH_TIMELINE, SET_TIMELINE_PREVIEW } from './types';
import resource from '../resources/traffic';

const TRAFFIC_COLOUR = (score) => {
  if (score > 2) {
    return '#F9874E';
  } else if (score < -2) {
    return '#8CC788';
  } else {
    return '#FAC758';
  }
};

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
      const color = TRAFFIC_COLOUR(totalScore / totalWeight);
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

export const fetchTraffic = (from) => {
  return async (dispatch, getState) => {
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

    const trafficByTimestamp = getState().traffic.trafficByTimestamp;
    console.log('dispatch SET_TIMELINE_PREVIEW');
    dispatch({
      type: SET_TIMELINE_PREVIEW,
      payload: {
        source: trafficByTimestamp,
        transform: trafficTransformer
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

