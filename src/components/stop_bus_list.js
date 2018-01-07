import React, { Component } from 'react'
import { connect } from 'react-redux'

class StopBusList extends Component {
  constructor (props) {
    super(props)

    this.stopoffset = props.stop.properties.simulation_offset

    this.state = {
      buses: [
        { id: '--', status: '--', img: 'olli-side-icon.svg' },
        { id: '--', status: '--', img: 'olli-side-icon.svg' },
        { id: '--', status: '--', img: 'olli-side-icon.svg' }
      ]
    }
  }

  getOlliArrivalStatus (position) {
    let diff = this.stopoffset - position.offset
    if (diff < 0) {
      diff += 640
    }
    let time = this.getArrivingTime(diff);
    return {
      id: position.olliId,
      time: time,
      status: this.getArrivingMessage(time),
      img: this.getRollingListStatus(diff)
    }
  }

  getArrivingTime(diff) {
    if (diff === 0 ) return -1;
    if (diff < 4 ) return 0;
    return ( ((diff * 500) / 1000) / 60 );
  }

  getArrivingMessage (time) {
    let msg = '--'

    if (time < 0 ) {
      msg = `Arrived`
    } else if (time === 0) {
      msg = `Arriving now`
    } else {
      let min = Math.floor(time)
      let sec = Math.floor((time - min) * 60)
      if (time <= 1) {
        msg = `Arriving in 1 min`
      } else {
        msg = `Arriving in ${min}:${(sec < 10 ? '0' : '') + sec} mins`
      }
    }

    return msg
  }

  getRollingListStatus (diff) {
    let src = 'olli-side-icon.svg'
    /* if (diff <= 2) {
      src = 'roller-list-stop-arriving'
    } else */ if (diff <= 60) {
      src = 'olli-side-icon-next.svg'//'roller-list-stop-next.png'
    }
    return src
  }

  updateArrivalInfoPositions (positions) {
    this.setState({
      buses: positions.map(p => {
        return this.getOlliArrivalStatus(p)
      }).sort((a, b) => {
        // return a.id.localeCompare(b.id)
        return a.time - b.time
      })
    })
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.olliPositions !== this.props.olliPositions) {
      this.updateArrivalInfoPositions(nextProps.olliPositions)
    }
  }

  render () {
    if (this.state.buses.length === 0) {
      return <div><h2>Bus info not yet available</h2></div>
    } else {
      // let sortedbuses = [];
      // for (let i = 0; i < this.state.buses.length; i++) 
      //   sortedbuses.push(this.state.buses[i]);
      // sortedbuses = sortedbuses.sort( (a, b) => {
      //   return (a.status - b.status);
      // });

      return (
        <div className="arrivals-list-stop">
          <h2>Arrivals</h2>
          <ul className="arrival-buses">
            {this.state.buses.map(bus =>
              <li>
                <img className="arrival-stop-img" src={'img/' + bus.img} alt={bus.id+' '+bus.status}/>
                {/* <div className="arrival-stop-img"><img src={'img/olli-side-icon.svg'} alt={'bus-' + bus.id}/></div> */}
                <div className="arrival-stop-info">
                  <div>{bus.status}</div>
                  <span>{bus.id.replace("_", " ")}</span>
                </div>
              </li>
            )}
          </ul>
        </div>
      )
    }
  }
}

function mapStateToProps (state) {
  return {
    olliPositions: state.olliPositions,
    olliRoute: state.olliRoute
  }
}

export default connect(mapStateToProps)(StopBusList)
