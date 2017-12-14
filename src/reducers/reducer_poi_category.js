import { SET_POI_CATEGORY } from '../actions/index'

export default function (state = false, action) {
  if (action) {
    switch (action.type) {
      case SET_POI_CATEGORY:
        state = action.category;
        break;
      default:
        break;
    }
  }
  return state;
}