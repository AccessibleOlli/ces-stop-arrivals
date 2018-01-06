import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Unity from 'react-unity-webgl'
import { SendMessage } from 'react-unity-webgl'

const WAIT_TIME_AFTER_WELCOME = 3000;
const WAIT_TIME_AFTER_STOP = 5000;

class KinTrans extends Component {

  constructor (props) {
    super(props);
    this.stopoffset = props.stop.properties.simulation_offset
    this.unityLoaded = false;
    this.unityLoading = false;
    this.state = {
      currentKinTransMessage: '',
      currentText: ''
    };
  }

  onUnityProgress(progression) {
    if (! this.unityLoaded && ! this.unityLoading) {
      if (progression === 1) {
        this.unityLoading = true;
        setTimeout( () => {
          this.unityLoaded = true;
          if (this.state.currentKinTransMessage.length > 0) {
            this.setAvatarMessage(this.state.currentKinTransMessage, this.state.currentText);
          }
        }, 2000);
      }
    }
  }

  setAvatarMessage(kintransMessage, text) {
    this.setState({currentKinTransMessage: kintransMessage});
    this.setState({currentText: text});
    if (this.unityLoaded) {
      try {
        SendMessage('OlliCommunication', 'startSimulationMessage', kintransMessage);
      }
      catch(e) {
        console.log(e);
      }
    }
  }

  getArrivedKinTransMessage(olliId) {
    // return XXX
    return 'i need help';
  }

  getArrivedTextMessage(olliId) {
    return `${olliId} has arrived.`;
  }

  getArrivingTime(diff) {
    if (diff === 0 ) return -1;
    if (diff < 4 ) return 0;
    return ( ((diff * 500) / 1000) / 60 );
  }

  getOlliArrivalTime(position) {
    let diff = this.stopoffset - position.offset
    if (diff < 0) {
      diff += 640
    }
    return this.getArrivingTime(diff);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.olliPositions !== this.props.olliPositions) {
      for (let position of this.props.olliPositions) {
        if (this.getOlliArrivalTime(position) < 0) {
          this.setAvatarMessage(this.getArrivedKinTransMessage(position.olliId), this.getArrivedTextMessage(position.olliId));
        }
      }
    }
  }

  render() {
    let text = this.unityLoaded ? this.state.currentText : '';   
    return (
      <div>
        <div className="kintrans-avatar">
          <Unity
              src='./kintrans/Build/KinTransAvatarBuild.json'
              loader='./kintrans/Build/UnityLoader.js'
              onProgress={(e) => {this.onUnityProgress(e)} }
          />
        </div>
        <div className="kintrans-avatar-text">
          <h2>{text}</h2>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    olliPositions: state.olliPositions
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    //
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(KinTrans);