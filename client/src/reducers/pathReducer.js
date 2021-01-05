import {
  FETCH_PATHS,
  FETCH_PATH_DETAIL_INITIALIZED,
  FETCH_PATH_DETAIL
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
      return {
        ...state,
        selectedPath: null
      };
    case FETCH_PATH_DETAIL:
      return {
        ...state,
        selectedPath: action.payload.pathDetail
      };
    default:
      return state;
  }
};

export default pathReducer;
