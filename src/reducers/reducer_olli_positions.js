import { SET_OLLI_POSITION } from '../actions/index'

export default function (state = [], action) {
  if (action) {
    switch (action.type) {
      case SET_OLLI_POSITION:
        let index = -1;
        for (let i=0; i<state.length; i++) {
          if (state[i].olliId === action.position.olliId) {
            index = i;
            break;
          }
        }
        let positions = state.slice(0);
        if (index >= 0) {
          positions.splice(index, 1);
        }
        positions.push({
          olliId: action.position.olliId, 
          coordinates: action.coordinates,
          offset: action.position.offset
        });
        state = positions;
        break;
      default:
        break;
    }
  }
  return state;
}