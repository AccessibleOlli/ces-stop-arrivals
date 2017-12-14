import { SET_OLLI_ROUTE_VISIBILITY } from '../actions/index'

let initialVisibility = 'visible';

export default function (state = initialVisibility, action) {
  if (action) {
    switch (action.type) {
      case SET_OLLI_ROUTE_VISIBILITY:
        state = action.visibility;
        break;
      default:
        break;
    }
  }
  return state;
}