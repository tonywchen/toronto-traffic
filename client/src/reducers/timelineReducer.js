import moment from 'moment-timezone';
import {
  REFRESH_TIMELINE,
  UPDATE_TIMELINE,
  SELECT_TIME,
  SELECT_NEXT_TIME,
  SELECT_PREVIOUS_TIME,
  SET_TIMELINE_PREVIEW,
  SET_TIMELINE_DATA_STATUS
} from '../actions/types';

const initialState = {
  initialized: false,
  loading: false,
  timestamps: [],
  selected: null,
  preview: {
    data: []
  },
  dataStatus: {
    available: false,
    first: 0,
    last: 0
  }
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

const timelineReducer = (state = initialState, action) => {
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
        initialized: true,
        loading: false,
        timestamps: times,
        // TODO: add a way to pre-select a time from `action.payload`
        selected: times[0],
        preview: {
          data: []
        }
      };
    case SELECT_TIME:
      const time = action.payload.time;
      if (state.timestamps.indexOf(time) < 0) {
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
      if (!state.selected || currentIndex <= 0) {
        previousSelected = state.timestamps[0];
      } else {
        const nextIndex = (currentIndex - 1) % state.timestamps.length;
        previousSelected = state.timestamps[nextIndex];
      }

      return {
        ...state,
        selected: previousSelected
      };
    case SET_TIMELINE_PREVIEW:
      const { source, transform } = action.payload;
      if (source && transform) {
        const transformFn = transform(source);
        const preview = {
          data: transformFn(state.timestamps)
        }

        return {
          ...state,
          preview
        };
      }

      return {
        ...state,
        preview: {}
      };
    case SET_TIMELINE_DATA_STATUS:
      return {
        ...state,
        dataStatus: action.payload.dataStatus
      };
    default:
      return state;
  }
};

export default timelineReducer;


