import { SET_OLLI_ROUTE } from '../actions/index'

export default function (state = null, action) {
  if (action) {
    switch (action.type) {
      case SET_OLLI_ROUTE:
        state = action.route;
        break;
      default:
        break;
    }
  }
  return state;
}