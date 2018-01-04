export const SET_MAP_READY = 'SET_MAP_READY';
export const SET_OLLI_POSITION = 'SET_OLLI_POSITION';
export const SET_OLLI_ROUTE = 'SET_OLLI_ROUTE';
export const SET_OLLI_ROUTE_VISIBILITY = 'SET_OLLI_ROUTE_VISIBILITY';
export const START_OLLI_TRIP = 'START_OLLI_TRIP';
export const END_OLLI_TRIP = 'END_OLLI_TRIP';
export const SET_POI_CATEGORY = 'SET_POI_CATEGORY';
export const MAP_MSG = 'MAP_MSG';

export function setMapReady(ready) {
  return {
    type: SET_MAP_READY,
    ready: ready
  };
}

export function setOlliRoute(routeInfo) {
  return {
    type: SET_OLLI_ROUTE,
    route: routeInfo
  };
}

export function setOlliRouteVisibility(visibility) {
  return {
    type: SET_OLLI_ROUTE_VISIBILITY,
    visibility: visibility
  };
}

export function setOlliPosition(geoPosition) {
  return {
    type: SET_OLLI_POSITION,
    position: geoPosition, 
    coordinates: geoPosition.coordinates,
    progress: geoPosition.distance_travelled / (geoPosition.distance_travelled + geoPosition.distance_remaining),
    distanceRemaining: geoPosition.distance_remaining
  };
}

export function startOlliTrip(tripStart) {
  return {
    type: START_OLLI_TRIP,
    coordinates: tripStart.from_coordinates,
    fromStop: tripStart.from_stop,
    toStop: tripStart.to_stop,
    distanceRemaining: tripStart.distance
  };
}

export function endOlliTrip(tripEnd) {
  return {
    type: END_OLLI_TRIP,
    coordinates: tripEnd.to_coordinates,
    fromStop: tripEnd.from_stop,
    toStop: tripEnd.to_stop,
    distanceRemaining: 0
  };
}

export function setPOICategory(category) {
  return {
    type: SET_POI_CATEGORY,
    category: category
  };
}

export function mapMessage(html, poiNames) {
  return {
    type: MAP_MSG,
    messageHtml: html, 
    poiNames: poiNames
  };
}