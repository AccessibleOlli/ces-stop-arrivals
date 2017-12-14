import { SET_MAP_READY } from '../actions/index'

export default function (state = false, action) {
  if (action) {
    switch (action.type) {
      case SET_MAP_READY:
        state = action.ready;
        break;
      default:
        break;
    }
  }
  return state;
}