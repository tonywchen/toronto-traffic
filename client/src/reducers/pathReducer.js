import {
  FETCH_PATHS,
  FETCH_PATH_DETAIL_INITIALIZED,
  FETCH_PATH_DETAIL,
  RESET_PATH_DETAIL
} from '../actions/types';

const initialState = {
  paths: [],
  selectedPath: null
};

const pathReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PATHS:
      return {
        ...state,
        paths: action.payload.paths || []
      };
    case FETCH_PATH_DETAIL_INITIALIZED:
      const { from, to } = action.payload;

      return {
        ...state,
        selectedPath: {
          isLoading: true,
          from: { tag: from },
          to: { tag: to }
        }
      };
    case FETCH_PATH_DETAIL:
      return {
        ...state,
        selectedPath: action.payload
      };
    case RESET_PATH_DETAIL:
      return {
        ...state,
        selectedPath: null
      }
    default:
      return state;
  }
};

export default pathReducer;
