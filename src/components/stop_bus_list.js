import React, { Component } from 'react'
import { connect } from 'react-redux'

class StopBusList extends Component {
  constructor (props) {
    super(props)

    this.stopoffset = props.stop.properties.simulation_offset

    this.state = {
      buses: [
        { id: '--', status: '--', img: 'roller-list-stop' },
        { id: '--', status: '--', img: 'roller-list-stop' },
        { id: '--', status: '--', img: 'roller-list-stop' }
      ]
    }
  }

  getOlliArrivalStatus (position) {
    let diff = this.stopoffset - position.offset
    if (diff < 0) {
      diff += 640
    }

    return {
      id: position.olliId,
      status: this.getArrivingMessage(diff),
      img: this.getRollingListStatus(diff)
    }
  }

  getArrivingMessage (diff) {
    let msg = '--'

    if (diff === 0) {
      msg = `Arrived`
    } else if (diff < 4) {
      msg = `Arriving now`
    } else {
      let time = ((diff * 500) / 1000) / 60
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
    let src = 'roller-list-stop'
    /* if (diff <= 2) {
      src = 'roller-list-stop-arriving'
    } else */ if (diff <= 60) {
      src = 'roller-list-stop-next'
    }
    return src
  }

  updateArrivalInfoPositions (positions) {
    this.setState({
      buses: positions.map(p => {
        return this.getOlliArrivalStatus(p)
      }).sort((a, b) => {
        return a.id.localeCompare(b.id)
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
      return <div>Bus info not yet available</div>
    } else {
      return (
        <ul className="arrival-buses">
          {this.state.buses.map(bus =>
            <li>
              <div className="arrival-stop-img"><img src={'img/' + bus.img + '.png'} alt={bus.img}/></div>
              {/* <div className="arrival-stop-img"><img src={'img/roller-list-stop.png'} alt={'bus-' + bus.id}/></div> */}
              <div className="arrival-stop-info">
                <div>{bus.status}</div>
                <span>{bus.id}</span>
              </div>
            </li>
          )}
        </ul>
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
