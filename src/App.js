import axios from 'axios';
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux'
import reducers from './reducers';
import Clock from './components/clock';
import Map from './components/map';
import OlliLogo from './components/olli_logo';
import StopHeader from './components/stop_header';
import StopInfo from './components/stop_info';
import StopsArrivalList from './components/stops_arrival_list';
import StopBusList from './components/stop_bus_list';
import StopBusArrival from './components/stop_bus_info';
import Weather from './components/weather';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { setOlliRoute, setOlliPosition, startOlliTrip, endOlliTrip } from './actions/index';
import Stops from './data/stops.json';
import OLLI_ROUTE from './data/route.json';

require('dotenv').config()
PouchDB.plugin(PouchDBFind);

const store = createStore(reducers);
const REMOTE_WS = process.env['REACT_APP_REMOTE_WS'];
const REMOTE_TELEMETRY_DB = process.env['REACT_APP_REMOTE_TELEMETRY_DB'];
const REMOTE_EVENT_DB = process.env['REACT_APP_REMOTE_EVENT_DB'];
const REMOTE_DB = process.env['REACT_APP_REMOTE_DB'] || 'https://0fdf5a9b-8632-4315-b020-91e60e1bbd2b-bluemix.cloudant.com/ollilocation';
const OLLI_STOP_IDX = parseInt(process.env['REACT_APP_OLLI_STOP_IDX'], 10) || 0;

// REACT_APP_WEATHER_URL should be in the format similar to: http://host.domain.com/weather/{lat}/{lon}
// {lat} and {lon} will be replaced with actual latitude and longitude later by the Weather component
const WEATHER_URL = process.env['REACT_APP_WEATHER_URL'] || (REMOTE_WS ? REMOTE_WS.replace('ws', 'http') + '/weather/{lat}/{lon}' : '')
const WEATHER_REFRESH_MIN = 10

class App extends Component {

  constructor() {
    super();
    this.state = {
      stop: Stops.features[OLLI_STOP_IDX]
    }
    store.dispatch(setOlliRoute(OLLI_ROUTE));
    if (REMOTE_TELEMETRY_DB && REMOTE_EVENT_DB) {
      this.startPouchDBAOSim();
    } else if (REMOTE_WS) {
      this.startWebsocket();
    }
    else {
      this.startPouchDBOlliSim();
    }
  }

  connectWebsocket() {
    if (this.websocketConnected) {
      console.log('Websocket already connected...');
    }
    else {
      console.log('Trying to connect to websocket...');
      this.websocketConnected = true;
      this.websocket = new WebSocket(REMOTE_WS);
      this.websocket.onopen = () => {
        this.websocketConnected = true;
        console.log('Socket opened');
      }
      this.websocket.onclose = () => {
        console.log('Socket closed');
        this.websocket = null;
        this.websocketConnected = false;
        setTimeout(() => {this.connectWebsocket()}, 5000);
      }
      this.websocket.onerror = (err) => {
        console.log('Socket error', err);
        this.websocket = null;
        this.websocketConnected = false;
        setTimeout(() => {this.connectWebsocket()}, 5000);
      }
      this.websocket.onmessage = (message) => {
        try {
          let doc = JSON.parse(message.data);
          if (doc.type === 'route_info') {
            store.dispatch(setOlliRoute(doc));
          }
          else if (doc.type === 'trip_start') {
            store.dispatch(startOlliTrip(doc));
          }
          else if (doc.type === 'trip_end') {
            store.dispatch(endOlliTrip(doc));
          }
          else if (doc.type === 'geo_position') {
            store.dispatch(setOlliPosition(doc));
          }
        }
        catch(e) {
          console.log(message.data);
        }
      }
    }
  }

  startWebsocket() {
    let remoteUrl = REMOTE_WS.replace('ws','http');
    axios.get(remoteUrl + '/info')
    .then(response => {
      console.log(response);
      if (response.data.started) {
        console.log('Simulator already running...');
        store.dispatch(setOlliRoute(response.data.route));
        return Promise.resolve(response);
      }
      else {
        console.log('Starting simulator...');
        return axios.get(remoteUrl + '/start');
      }
    })
    .then(response => {
      return axios.get(remoteUrl + '/info');
    })
    .then(response => {
      store.dispatch(setOlliRoute(response.data.route));
      this.connectWebsocket();
    })
    .catch(() => {
      setTimeout(() => {this.startWebsocket()}, 5000);
    });
  }

  startPouchDBOlliSim() {
    this.db = new PouchDB(REMOTE_DB, {});
    this.db.changes({
      since: 'now',
      live: true,
      include_docs: true
    })
      .on('change', change => {
        if (store.getState().mapReady && change && change.doc && change.doc.type) {
          // olli-sim
          if (change.doc.type === 'route_info') {
            store.dispatch(setOlliRoute(change.doc));
          }
          else if (change.doc.type === 'trip_start') {
            store.dispatch(startOlliTrip(change.doc));
          }
          else if (change.doc.type === 'trip_end') {
            store.dispatch(endOlliTrip(change.doc));
          }
          else if (change.doc.type === 'geo_position') {
            if (! store.getState().olliRoute) {
              this.db.createIndex({
                index: {
                  fields: [{'type': 'desc'},{'ts': 'desc'}]
                }
              }).then(() => {
                return this.db.find({
                  selector: { "type": "route_info"},
                  sort: [{"type": "desc"}, {"ts": "desc"}],
                  limit: 1
                });
              }).then((result) => {
                if (result.docs && result.docs.length > 0) {
                  store.dispatch(setOlliRoute(result.docs[0]));
                  store.dispatch(setOlliPosition(change.doc));
                }
              }).catch((err) => {
                console.log(err);
              });
            }
            else {
              store.dispatch(setOlliPosition(change.doc));
            }
          }
        }
      }).on('complete', info => {
      }).on('paused', () => {
      }).on('error', err => {
        console.log(err);
    });
  }

  startPouchDBAOSim() {
    // telemetry
    this.db = new PouchDB(REMOTE_TELEMETRY_DB, {});
    this.db.changes({
      since: 'now',
      live: true,
      include_docs: true
    })
      .on('change', change => {
        if (store.getState().mapReady && change && change.doc) {
          if (change.doc._id === 'telemetry_transition') {
            // ao_sim
            let ollis = [];
            while(true) {
              let i = ollis.length;
              let property = `olli_${i+1}`;
              if (change.doc.transport_data.olli_vehicles.hasOwnProperty(property)) {
                ollis.push(change.doc.transport_data.olli_vehicles[property]);
              }
              else {
                break;
              }
            }
            for(let i=0; i<ollis.length; i++) {
              let doc = {
                olliId: `olli_${i+1}`,
                coordinates: ollis[i].geometry.coordinates,
                distance_travelled: 0.14278461869690082,
                distance_remaining: 0.05605209177030407,
                properties: ollis[i].properties,
                offset: ollis[i].offset,
                ts: change.doc.timestamp
              };
              if (! store.getState().olliRoute) {
                console.log('No olli route. Cannot update olli position.');
              }
              else {
                store.dispatch(setOlliPosition(doc));
              }
            }
          }
        }
      }).on('complete', info => {
      }).on('paused', () => {
      }).on('error', err => {
        console.log(err);
    });
    // events
    this.db2 = new PouchDB(REMOTE_EVENT_DB, {});
    this.db2.changes({
      since: 'now',
      live: true,
      include_docs: true
    })
      .on('change', change => {
        if (store.getState().mapReady && change && change.doc) {
          if (change.doc._id.startsWith('Trip Start')) {
            console.log('Trip Start - TBD');
            console.log(change.doc);
            //store.dispatch(stopOlliTrip(change.doc));
          }
          else if (change.doc._id.startsWith('Trip Stop')) {
            console.log('Trip Stop - TBD');
            console.log(change.doc);
            //store.dispatch(stopOlliTrip(change.doc));
          }
        }
      }).on('complete', info => {
      }).on('paused', () => {
      }).on('error', err => {
        console.log(err);
    });
    
  }

  render() {
    return (
      <Provider store={store}>
        <div className="cssgrid">
          <OlliLogo />
          <StopHeader stop={this.state.stop} />

          <div id="col1">
            <StopInfo stop={this.state.stop} />
            <StopBusList stop={this.state.stop} />
            <StopsArrivalList />
          </div>

          <div id="col2">
            <div className="clock-weather">
              <h2><Clock /></h2>
              <Weather serviceurl={WEATHER_URL} refreshrate={WEATHER_REFRESH_MIN} />
            </div>

            <Map stop={this.state.stop} />
          </div>

          {/* <div className="stop-bus-arrival">
            <StopBusArrival stop={this.state.stop} />
          </div> */}
        </div>
      </Provider>
    );
  }
}

export default App;
