import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from 'axios';
import watsonSpeech from 'watson-speech';

class Talk extends Component {

  constructor() {
    super();
    this.state = {
      talking: false
    }
    this.stream = null;
  }

  toggleTalking() {
    if (this.state.talking) {
      this.setState({ talking: false });
      if (this.stream) {
        this.stream.stop();
      }
    }
    else {
      this.setState({ talking: true });
      axios({
        method: 'GET',
        url: '/api/stt/token'
      }).then((response) => {
        this.stream = watsonSpeech.SpeechToText.recognizeMicrophone({
          token: response.data.token,
          keepMicrophone: true,
          continuous: false,
          outputElement: null
        });
        this.stream.promise().then((sttResponse) => {
          console.log('User: ' + sttResponse);
          var responseObject = {
            text: sttResponse
          };
          return axios({
            method: 'POST',
            url: '/api/conversation/converse',
            data: responseObject
          });
        }).then((converationResponse) => {
          console.log('Olli: ' + converationResponse.data.response);
          var byteString = atob(converationResponse.data.voice);
          // write the bytes of the string to an ArrayBuffer
          var ab = new ArrayBuffer(byteString.length);
          var ia = new Uint8Array(ab);
          for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          // write the ArrayBuffer to a blob, and you're done
          var blob = new Blob([ab], { type: 'audio/ogg' });
          const url = window.URL.createObjectURL(blob);
          var audioElement = new Audio(url);
          audioElement.play();
        }).catch(err => {
          console.log(err);
        });
        this.stream.on('error', (err) => {
          console.log(err);
        });
      });
    }
  }

  render() {
    const text = this.state.talking ? "Press to Send" : "Ask Olli";
    return (
      <div className="stop-panel">
        <h2>{text}</h2>
        <button className='bx--btn bx--btn--secondary btn--bigaction' 
          onClick={() => this.toggleTalking()}>
          <img src="./img/noun_1012333_cc.png" alt="Press to talk to Olli" height="48px" />
      </button>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    //
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    //
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Talk);