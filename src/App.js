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
import ArrivalInfo from './components/arrival_info';
import Weather from './components/weather';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { setOlliRoute, setOlliPosition, startOlliTrip, endOlliTrip } from './actions/index';
import Stops from './data/stops.json';

require('dotenv').config()
PouchDB.plugin(PouchDBFind);

const store = createStore(reducers);
const REMOTE_WS = process.env['REACT_APP_REMOTE_WS'];
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
    if (REMOTE_WS) {
      this.startWebsocket();
    }
    else {
      this.startPouchDB();
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

  startPouchDB() {
    this.db = new PouchDB(REMOTE_DB, {});
    this.changes = this.db.changes({
      since: 'now',
      live: true,
      include_docs: true
    })
      .on('change', change => {
        if (store.getState().mapReady && change && change.doc && change.doc.type) {
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
            if (! store.getState().ollieRoute) {
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

  render() {
    return (
      <Provider store={store}>

        <div className="cssgrid">

          <div className="stop-placard"></div>
          <OlliLogo />
          <StopHeader stop={this.state.stop} />

          <div className="arrival-list">
            {/* <img src="./img/roller-list.png" width="284px"/> */}
            <ArrivalInfo/>
          </div>

          <StopInfo stop={this.state.stop} />

          <div className="clock-weather">
            <h2><Clock /></h2>
            <Weather serviceurl={WEATHER_URL} refreshrate={WEATHER_REFRESH_MIN} />
          </div>
          {/* <div className="bx--col-xs-4 stop-panel"><div className="box-title">Bus Approaching</div></div>
          <div className="bx--col-xs-4 stop-panel"><div className="box-title">Next Bus</div></div> */}

          <Map stop={this.state.stop} />
        </div>
      </Provider>
    );
  }
}

export default App;
