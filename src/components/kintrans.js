import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Unity from 'react-unity-webgl'
import { SendMessage } from 'react-unity-webgl'

const CLEAR_ARRIVED_MESSAGE_TIME = 10000;

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
    return 'olli arrive';
  }

  getArrivedTextMessage(olliId) {
    return 'Olli is arriving';
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
          setTimeout(() => {

          }, CLEAR_ARRIVED_MESSAGE_TIME);
        }
      }
    }
  }

  render() {
    let text = this.unityLoaded ? this.state.currentText : '';   
    return (
      <div className="kintrans-wrapper">
      <div className="kintrans">
        <div className="kintrans-avatar">
          <Unity
              src='./kintrans/Build/KinTrans Avatar Build.json'
              loader='./kintrans/Build/UnityLoader.js'
              onProgress={(e) => {this.onUnityProgress(e)} }
          />
        </div>
        <div className="kintrans-avatar-text">
          <h2>{text}</h2>
        </div>
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