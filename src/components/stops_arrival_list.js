import React, { Component } from 'react'
import { connect } from 'react-redux'
import OLLI_STOPS from '../data/stops.json'

class StopsArrivalList extends Component {
  constructor (props) {
    super(props)

    this.stops = (OLLI_STOPS.features || OLLI_STOPS).map((stop, index) => {
      return {
        id: (stop.properties || stop).stop_id,
        coord: (stop.geometry || stop).coordinates,
        name: (stop.properties || stop).name,
        offset: (stop.properties || stop).simulation_offset
      }
    })

    this.state = {
      stops: this.stops.map((stop, index) => {
        return {
          id: stop.id,
          name: stop.name,
          arriving: this.getArrivingMessage(null),
          status: this.getRollingListStatus(null)
        }
      }).sort((a, b) => {
        return a.id.localeCompare(b.id)
      })
    }
  }

  getNextClosestOlli (stopoffset, positions) {
    let closest = 1000
    let olli = null

    for (let i = 0; i < positions.length; i++) {
      let p = positions[i]
      let diff = stopoffset - p.offset
      if (diff >= 0 && diff < closest) {
        closest = diff
        olli = p
      }
    }

    if (!olli) {
      for (let i = 0; i < positions.length; i++) {
        let p = positions[i]
        let diff = (stopoffset + 640) - p.offset
        if (diff < closest) {
          closest = diff
          olli = p
        }
      }
    }

    return {
      olli: olli.olliId,
      offset: closest
    }
  }

  getArrivingMessage (closest) {
    let msg = '--'

    if (closest) {
      if (closest.offset === 0) {
        msg = `${closest.olli} arrived`
      } else if (closest.offset < 4) {
        msg = `${closest.olli} arriving now`
      } else {
        let time = ((closest.offset * 500) / 1000) / 60
        let min = Math.floor(time)
        let sec = Math.floor((time - min) * 60)
        if (time <= 1) {
          msg = `${closest.olli} arriving in 1 min`
        } else {
          msg = `${closest.olli} arriving in ${min}:${(sec < 10 ? '0' : '') + sec} mins`
        }
      }
    }

    return msg
  }

  getRollingListStatus (closest) {
    let src = 'roller-list-stop'
    if (closest) {
      if (closest.offset <= 2) {
        src = 'roller-list-stop-arriving'
      } else if (closest.offset <= 75) {
        src = 'roller-list-stop-next'
      }
    }
    return src
  }

  updateArrivalInfoPositions (positions) {
    this.setState({
      stops: this.stops.map((stop, index) => {
        let closest = this.getNextClosestOlli(stop.offset, positions)
        return {
          id: stop.id,
          name: stop.name,
          arriving: this.getArrivingMessage(closest),
          status: this.getRollingListStatus(closest)
        }
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
    if (this.state.stops.length === 0) {
      return <div>Stops not yet available</div>
    } else {
      return (
        <ul className="arrival-stops">
          {this.state.stops.map(stop =>
            <li key={stop.id}>
              {/* <div className="arrival-stop-img"><img src={'img/' + stop.status + '.png'} alt={stop.status}/></div> */}
              <div className="arrival-stop-img"><img src={'img/roller-list-stop.png'} alt={stop.status}/></div>
              <div className="arrival-stop-info">
                <div>{stop.name}</div>
                <span>{stop.arriving}</span>
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
    // olliPosition: state.olliPosition,
    olliRoute: state.olliRoute
  }
}

export default connect(mapStateToProps)(StopsArrivalList)
