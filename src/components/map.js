import React from 'react'
import mapboxgl from 'mapbox-gl'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setMapReady } from '../actions/index'
import { mapMessage } from '../actions/index'
import OLLI_STOPS from '../data/stops.json'
import POIS from '../data/pois.json'

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';
const MSG_NEAR_MEDICAL = 'Your destination is near a medical facility. If you need to go to one of these places after, I can give you directions.';
const CENTER_LON = -92.466;
const CENTER_LAT = 44.0214;

let Map = class Map extends React.Component {
  map;
  warningpopup;

  constructor(props) {
    super(props);
    this.state = {
      stopSelected: false
    };
  }

  updateMapBounds(coordinates) {
    const initalBounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord)
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    this.map.fitBounds(initalBounds, {
      padding: 100
    });
  }

  updateOlliRouteVisibility(visibility) {
    this.map.setLayoutProperty('olli-route', 'visibility', visibility);
  }

  calculatePosition(fromPosition, toPosition, progress) {
    const lat1 = fromPosition[1];
    const long1 = fromPosition[0];
    const lat2 = toPosition[1];
    const long2 = toPosition[0];
    return [lat1 + (lat2 - lat1) * progress, long1 + (long2 - long1) * progress].reverse();
  }

  // Support multiple ollis (without smoothing)
  updateOlliPositionsAoSimNoSmooth(positions) {
    for (let position of positions) {
      let coordinates = [position.coordinates[0], position.coordinates[1]];
      const data = {
        'type': 'FeatureCollection',
        'features': [{
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': coordinates
          }
        }]
      };
      let layerId = `olli-bus-${position.olliId}`;
      let layer = this.map.getSource(layerId);
      if (layer) {
        layer.setData(data);
      }
      else {
        this.map.addLayer({
          'id': layerId,
          'source': {
            'type': 'geojson',
            'data': data
          },
          'type': 'symbol',
          'layout': {
            'icon-image': 'olli',
            'icon-size': 0.75
          }
        });
      }
    }
  }

  // Support multiple ollis
  updateOlliPositionsAOSim(positions) {
    let firstPosition = false;
    if (! this.olliPositions) {
      firstPosition = true;
      this.olliPositions = {};
      this.olliPositionTimes = {};
    }
    for (let position of positions) {
      if (! position.processed) {
        position.processed = true;
        let olliId = position.olliId;
        let coordinates = [position.coordinates[0], position.coordinates[1]];
        if (! (olliId in this.olliPositions)) {
          this.olliPositions[olliId] = [];
          this.olliPositionTimes[olliId] = [];
        }
        this.olliPositions[olliId].push(coordinates);
        this.olliPositionTimes[olliId].push(new Date().getTime());
      }
    }
    if (firstPosition) {
      requestAnimationFrame(this.animateOlliPositions.bind(this));
    }
  }

  animateOlliPositions(timestamp) {
    Object.keys(this.olliPositions).forEach((key) => {
      this.animateOlliPositionsForOlli(key, timestamp);
    });
    requestAnimationFrame(this.animateOlliPositions.bind(this));
  }

  animateOlliPositionsForOlli(olliId, timestamp) {
    if (this.olliPositions[olliId].length > 1) {
      // map the time the position was recorded (in updateOlliPosition) to the
      // animation timestamp (passed into this function)
      // the very first time map it to the current animation timestamp
      // this is the baseline
      if (! this.olliPositionTimestamps) {
        this.olliPositionTimestamps = {};
      }
      if (! (olliId in this.olliPositionTimestamps)) {
        this.olliPositionTimestamps[olliId] = [];
        this.olliPositionTimestamps[olliId].push(timestamp);
      }
      // anytime a subsequent position has been recorded (in updateOlliPosition)
      // we map to an animation timestamp. the value is set to the animation timestamp
      // for the position recorded right before this one plus the duration between positions
      // (the time from the previous recorded position to the next recorded position)
      for(let i=1; i<this.olliPositionTimes[olliId].length; i++) {
        if (this.olliPositionTimestamps[olliId].length < (i+1)) {
          let d = (this.olliPositionTimes[olliId][i] - this.olliPositionTimes[olliId][i-1]);
          this.olliPositionTimestamps[olliId].push(this.olliPositionTimestamps[olliId][i-1] + d);
        }
      }
      // calculate the progress between the first and second stops in our list
      let progress = (timestamp - this.olliPositionTimestamps[olliId][0])/(this.olliPositionTimestamps[olliId][1] - this.olliPositionTimestamps[olliId][0]);
      // if the progress is >= 1 that means we have reached our destination (or enough time has elapsed from the last animation)
      // if that's the case we pop of the first position and then start at the next position
      if (progress >= 1) {
        this.olliPositions[olliId].splice(0, 1);
        this.olliPositionTimes[olliId].splice(0, 1);
        this.olliPositionTimestamps[olliId].splice(0, 1);
      }
      else {
        // if progress is < 1 then we calculate the position between the two based on the progress
        let fromPosition = this.olliPositions[olliId][0];
        let toPosition = this.olliPositions[olliId][1];
        let position = fromPosition;
        if (progress > 0) {
          position = this.calculatePosition(fromPosition, toPosition, progress);
        }
        const data = {
          'type': 'FeatureCollection',
          'features': [{
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': []
            }
          }]
        };
        data.features[0].geometry.coordinates = position;
        // update the map
        let layerId = `olli-bus-${olliId}`;
        let layer = this.map.getSource(layerId);
        if (layer) {
          layer.setData(data);
        }
        else {
          this.map.addLayer({
            'id': layerId,
            'source': {
              'type': 'geojson',
              'data': data
            },
            'type': 'symbol',
            'layout': {
              'icon-image': 'olli',
              'icon-size': 0.75
            }
          });
        }
      }
    }
  }

  // Support single olli
  // USE THIS WITH OLLI-SIM
  updateOlliPositionForOlliSim(positionObj) {
    let cs = null;
    if (positionObj.position) {
      cs = positionObj.position.coordinates;
    }
    else {
      cs = positionObj.coordinates;
    }
    let coordinates = [cs[0], cs[1]];
    if (! this.olliPositions) {
      this.olliPositions = [];
      this.olliPositionTimes = [];
      this.totalOlliPositions = 1;
    }
    else {
      this.totalOlliPositions++;
    }
    // here we ignore duplicate positions for the very 1st position recorded
    // this is a hack because the first two positions we get are when the olli stops
    // and there is a large gap in those positions
    // the very first gap dictates the lag for the rest of the session
    // here we minimize the lag by waiting until there are two different positions
    // and resetting the time for the first position
    // const l = this.olliPositions.length;
    if (this.totalOlliPositions === 2 && this.olliPositions[0][0] === coordinates[0] && this.olliPositions[0][1] === coordinates[1]) {
      this.totalOlliPositions = 1;
      this.olliPositionTimes[0] = new Date().getTime();
    }
    else {
      this.olliPositions.push(coordinates);
      this.olliPositionTimes.push(new Date().getTime());
    }
    if (this.totalOlliPositions === 2) {
      // start animating on the 2nd position recorded
      requestAnimationFrame(this.animateOlliPosition.bind(this));
    }
  }

  animateOlliPosition(timestamp) {
    if (this.olliPositions.length > 1) {
      // map the time the position was recorded (in updateOlliPosition) to the
      // animation timestamp (passed into this function)
      // the very first time map it to the current animation timestamp
      // this is the baseline
      if (! this.olliPositionTimestamps) {
        this.olliPositionTimestamps = [];
        this.olliPositionTimestamps.push(timestamp);
      }
      // anytime a subsequent position has been recorded (in updateOlliPosition)
      // we map to an animation timestamp. the value is set to the animation timestamp
      // for the position recorded right before this one plus the duration between positions
      // (the time from the previous recorded position to the next recorded position)
      for(let i=1; i<this.olliPositionTimes.length; i++) {
        if (this.olliPositionTimestamps.length < (i+1)) {
          let d = (this.olliPositionTimes[i] - this.olliPositionTimes[i-1]);
          this.olliPositionTimestamps.push(this.olliPositionTimestamps[i-1] + d);
        }
      }
      // calculate the progress between the first and second stops in our list
      let progress = (timestamp - this.olliPositionTimestamps[0])/(this.olliPositionTimestamps[1] - this.olliPositionTimestamps[0]);
      // if the progress is >= 1 that means we have reached our destination (or enough time has elapsed from the last animation)
      // if that's the case we pop of the first position and then start at the next position
      if (progress >= 1) {
        this.olliPositions.splice(0, 1);
        this.olliPositionTimes.splice(0, 1);
        this.olliPositionTimestamps.splice(0, 1);
      }
      else {
        // if progress is < 1 then we calculate the position between the two based on the progress
        let fromPosition = this.olliPositions[0];
        let toPosition = this.olliPositions[1];
        let position = fromPosition;
        if (progress > 0) {
          position = this.calculatePosition(fromPosition, toPosition, progress);
        }
        const data = {
          'type': 'FeatureCollection',
          'features': [{
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': []
            }
          }]
        };
        data.features[0].geometry.coordinates = position;
        // update the map
        let layerId = 'olli-bus';
        let layer = this.map.getSource(layerId);
        if (layer) {
          layer.setData(data);
        }
        else {
          this.map.addLayer({
            'id': layerId,
            'source': {
              'type': 'geojson',
              'data': null
            },
            'type': 'symbol',
            'layout': {
              'icon-image': 'olli',
              'icon-size': 0.75
            }
          });
        }
      }
    }
    requestAnimationFrame(this.animateOlliPosition.bind(this));
  }

  // THIS IS ALL MOCKUP. REPLACE WITH WATSON ASSISTANT YELP SKILL
  getNearbyPOIs(stopfeature) {
    // quick hack to give a relevant message to those near a medical center
    if ( ['Mayo Guggenheim', 'Mayo Gonda', 'Peace Plaza'].includes(stopfeature.properties.name)) {
      this.props.mapMessage({__html: "<h2>&#8220;"+MSG_NEAR_MEDICAL+"&#8221;<h2>"}, []);
    }

    this.map.setLayoutProperty('olli-pois', 'visibility', 'visible');
}

  updatePOICategory(category) {
    let showpois = POIS;
    if (category) {
      let categories = [category.toLowerCase()];
      if ( categories[0] === 'attractions' ) 
        categories = categories.concat(['arts', 'publicservicesgovt']);
      showpois = {"type":"FeatureCollection","features":[]};
      POIS.features.forEach(poi => {
        poi.properties.category.forEach(cat => {
          if ( categories.includes(cat.term) ) {
            showpois.features.push(poi);
          }
        }, this);
      }, this);
      switch (category) {
        case 'food':
          this.map.setLayoutProperty('olli-pois', 'icon-image', 'restaurant-noun');
          break;
        case 'health':
          this.map.setLayoutProperty('olli-pois', 'icon-image', 'medical-noun');
          break;
        default: 
          this.map.setLayoutProperty('olli-pois', 'icon-image', 'circle-15');
      }
    }
    this.map.getSource('olli-pois').setData(showpois);
    this.map.setLayoutProperty('olli-pois', 'visibility', 'visible');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.olliRoute !== this.props.olliRoute) {
      const coordinates = nextProps.olliRoute.coordinates.map(coord => {
        return [coord.coordinates[0], coord.coordinates[1]];
      });
      this.updateMapBounds(coordinates);
      //this.map.getSource('olli-route').setData(nextProps.olliRoute);
      // this.updateOlliRoute(coordinates);
    }
    if (nextProps.olliRouteVisibility !== this.props.olliRouteVisibility) {
      this.updateOlliRouteVisibility(nextProps.olliRouteVisibility);
    }
    // olli-sim/single olli support
    if (nextProps.olliPosition !== this.props.olliPosition) {
      this.updateOlliPositionOlliSim(nextProps.olliPosition);
    }
    // ao_sim/multiple olli support
    if (nextProps.olliPositions !== this.props.olliPositions) {
      this.updateOlliPositionsAOSim(nextProps.olliPositions);
    }
    if (nextProps.poiCategory !== this.props.poiCategory) {
      this.updatePOICategory(nextProps.poiCategory);
    }
    if (nextProps.destinationStopName && nextProps.destinationStopName !== this.props.destinationStopName) {
        this.setNewDestination(nextProps.destinationStopName);
    }
    if (nextProps.pois !== this.props.pois) {
      this.updatePOIs(nextProps.pois);
    }
  }

  loadImage(imagename, imageid) {
    this.map.loadImage('./img/'+imagename, (error, image) => {
      if (error) {
        throw error
      } else {
        this.map.addImage(imageid, image);
      }
    });
  }

  componentWillUpdate(prevProps, prevState) {
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [CENTER_LON, CENTER_LAT], 
      zoom: 16
    });

    let imagenames = ['olli-icon-svg.png', 'olli-stop-color.png', 'noun_1012350_cc.png', 'noun_854071_cc.png', 'noun_1015675_cc.png', 'youarehere.png','yourdest.png'];
    let imageids = ['olli', 'olli-stop', 'restaurant-noun', 'medical-noun', 'museum-noun', 'youarehere','yourdest'];
    for (var idx = 0; idx < imagenames.length; idx++) {
      this.loadImage(imagenames[idx], imageids[idx]);
    }
    
    this.map.on('click', evt => {
      if (warningpopup) warningpopup.remove();

      let bbox = [[evt.point.x-5, evt.point.y-5], [evt.point.x+5, evt.point.y+5]]; // set bbox as 5px rectangle area around clicked point
      let features = this.map.queryRenderedFeatures(bbox, {layers: ['olli-stops']});
      if (this.state.stopSelected && features.length>0) {
        if (this.state.destination && this.state.destination.properties.name === features[0].properties.name) {
          // reset the destination stop and leave map in a clean state
          this.props.mapMessage({__html: "<h2>Welcome. Where would you like to go?</h2><p>Select a stop on the map.</p>"}, []);
          this.map.getSource('olli-destination').setData({'type': 'FeatureCollection', 'features': []});
          this.setState({destination: null, stopSelected: false});
          return;
        }
      }

      let layerid = this.state.stopSelected ? 'olli-pois' : 'olli-stops';
      features = this.map.queryRenderedFeatures(bbox, {layers: [layerid]});

      if (!this.state.stopSelected) {
        if (features.length>0) {
          this.map.getSource('olli-destination').setData(features[0]);
          this.setState({destination: features[0], stopSelected: true});
          this.getNearbyPOIs(features[0]);
        } else {
          this.beep(300, 300);
          var warningpopup = new mapboxgl.Popup({closeButton: false})
            .setLngLat([CENTER_LON, CENTER_LAT])
            .setHTML('Please press on a bus stop')
            .addTo(this.map);
        }

      } else {
        if (features.length>0) {
          // there's a stop selected, and the click has found some features from the POIs layer
          this.props.mapMessage({__html: "<h3>"+features[0].properties.name+"</h3>"});
        }
      }
    });

    this.map.on('load', () => {
      this.map.resize();
      this.addBasicMapLayers();
      this.props.setMapReady(true);
    });
  }

  addBasicMapLayers() {
    let routeGeoJson = this.props.olliRoute;
    if (routeGeoJson.type !== 'FeatureCollection') {
      routeGeoJson = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeGeoJson.coordinates
          }
        }]
      };
    }
    this.map.addLayer({
      'id': 'olli-route',
      'type': 'line',
      'source': {
        'type': 'geojson',
        'data': routeGeoJson
      },
      'layout': {
        'line-cap': 'round',
        'line-join': 'round',
        'visibility': this.props.olliRouteVisibility
      },
      'paint': {
        'line-color': '#0087bd',
        'line-width': 10,
        'line-opacity': 0.4
      }
    });
      this.map.addLayer({
        'id': 'olli-stops',
        'source': {
          'type': 'geojson',
          'data': OLLI_STOPS
        },
        'type': 'symbol',
        'paint': {
          'text-halo-color': "#fff", //"#0087bd",
          'text-halo-width': 4, 
          'text-halo-blur': 1
        },
        'layout': {
          'icon-image': 'olli-stop',
          'icon-size': 0.35, 
          'text-font': ["Open Sans Semibold","Open Sans Regular","Arial Unicode MS Regular"],
          'text-field': '{name}', 
          'text-size': 14, 
          'text-offset': [0, -2]
        }
      });
      this.map.addLayer({
        'id': 'olli-current-stop',
        'source': {
          'type': 'geojson',
          'data': this.props.stop
        },
        'type': 'symbol',
        'layout': {
          'icon-image': 'youarehere',
          'icon-size': 0.35,
          'icon-anchor': 'top',  
          'icon-offset': [-212, 0]
        }
      });
      // destination -- set by user click
      this.map.addLayer({
        'id': 'olli-destination',
        'source': {
          'type': 'geojson',
          'data': null
        },
        'type': 'symbol',
        'layout': {
          'icon-image': 'yourdest',
          'icon-size': 0.35,
          'icon-anchor': 'top',  
          'icon-offset': [-212, 0]
        }
      });
      // this.map.addLayer({
      //   'id': 'olli-bus',
      //   'source': {
      //     'type': 'geojson',
      //     'data': null
      //   },
      //   'type': 'symbol',
      //   'layout': {
      //     'icon-image': 'olli',
      //     'icon-size': 0.75
      //   }
      // });
      this.map.addLayer({
        'id': 'olli-pois',
        'source': {
          'type': 'geojson',
          'data': POIS
        },
        'type': 'symbol',
        'paint': {
          'text-color': '#0087bd',
          'text-halo-color': "#fff",
          'text-halo-width': 4, 
          'text-halo-blur': 1,
          'icon-halo-color': "#fff",
          'icon-halo-width': 4, 
          'icon-halo-blur': 1
        },
        'layout': {
          'visibility': 'none',
          'icon-image': 'circle-15',
          'icon-size': 0.5, 
          'text-font': ["Open Sans Semibold","Open Sans Regular","Arial Unicode MS Regular"],
          'text-size': 12, 
          // 'text-offset': [0, 2],
          'text-field': '{name}'
        }
      });
  }

  render() {
    return (
      <div ref={el => this.mapContainer = el} />
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    setMapReady: setMapReady, 
    mapMessage: mapMessage
  }, dispatch);
}

function mapStateToProps(state) {
  return {
    olliPositions: state.olliPositions,
    // olliPosition: state.olliPosition,
    olliRoute: state.olliRoute,
    olliRouteVisibility: state.olliRouteVisibility,
    poiCategory: state.poiCategory
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);
