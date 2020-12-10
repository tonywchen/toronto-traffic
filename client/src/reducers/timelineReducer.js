import moment from 'moment-timezone';
import { REFRESH_TIMELINE, UPDATE_TIMELINE, SELECT_TIME, SELECT_NEXT_TIME, SELECT_PREVIOUS_TIME } from '../actions/types';

const initialState = {
  loading: false,
  timestamps: [],
  selected: null
};

const computeTimes = (from, to, interval) => {
  interval = interval || {
    value: 5,
    unit: 'minutes'
  };

  const times = [];
  let current = moment(from);
  while (current.isSameOrBefore(to)) {
    times.push(current.valueOf());
    current = current.add(interval.value, interval.unit);
  }

  return times;
}

export default (state = initialState, action) => {
  let currentIndex;

  switch(action.type) {
    case REFRESH_TIMELINE:
      return {
        ...state,
        loading: true
      };
    case UPDATE_TIMELINE:
      const from = action.payload.from;
      const adjustedFrom = moment(from).startOf('day').valueOf();
      const adjustedTo = moment(from).endOf('day').valueOf();
      const times = computeTimes(adjustedFrom, adjustedTo);

      return {
        ...state,
        loading: false,
        timestamps: times,
        // TODO: add a way to pre-select a time from `action.payload`
        selected: times[0]
      };
    case SELECT_TIME:
      const time = action.payload.time;
      if (state.timestamps.indexOf(time) < 0) {
        console.log(action.payload);
        console.error(`[SELECT_TIME] - the time value of ${time} is not valid`);
        return state;
      }

      return {
        ...state,
        selected: time
      };
    case SELECT_NEXT_TIME:
      let nextSelected;
      currentIndex = state.timestamps.indexOf(state.selected);
      if (!state.selected || currentIndex < 0) {
        nextSelected = state.timestamps[0];
      } else {
        const nextIndex = (currentIndex + 1) % state.timestamps.length;
        nextSelected = state.timestamps[nextIndex];
      }

      return {
        ...state,
        selected: nextSelected
      };
    case SELECT_PREVIOUS_TIME:
      let previousSelected;
      currentIndex = state.timestamps.indexOf(state.selected);
      if (!state.selected || currentIndex < 0) {
        previousSelected = state.timestamps[0];
      } else {
        const nextIndex = (currentIndex - 1) % state.timestamps.length;
        previousSelected = state.timestamps[nextIndex];
      }

      return {
        ...state,
        selected: previousSelected
      };
    default:
      return state;
  }
}


