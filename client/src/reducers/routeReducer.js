import { FETCH_SUBROUTES } from '../actions/types';

const initialState = {
  subroutes: []
};

const routeReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SUBROUTES:
      return {
        ...state,
        subroutes: action.payload.subroutes
      };
    default:
      return state;
  }
};

export default routeReducer;
