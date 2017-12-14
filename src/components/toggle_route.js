import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setOlliRouteVisibility } from '../actions/index'

class ToggleRoute extends Component {

  toggleRoute(hide) {
    if (hide) {
      this.props.setOlliRouteVisibility('none');
    }
    else {
      this.props.setOlliRouteVisibility('visible');
    }
  }

  render() {
    // const visibility = this.props.olliRoute ? 'visible' : 'hidden';
    const visibility = 'hidden';
    let hide = false;
    let text = 'Show';
    if (this.props.olliRouteVisibility === 'visible') {
      hide = true;
      text = 'Hide';
    }
    return <button className='button' style={{'visibility': visibility}} onClick={() => this.toggleRoute(hide)}>{text} Route</button>
  }
}

function mapStateToProps(state) {
  return {
    olliRoute: state.olliRoute,
    olliRouteVisibility: state.olliRouteVisibility
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    setOlliRouteVisibility: setOlliRouteVisibility
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ToggleRoute);