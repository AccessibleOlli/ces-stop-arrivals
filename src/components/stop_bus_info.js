import React, { Component } from 'react'
import { connect } from 'react-redux'
import OLLI_STOPS from '../data/stops.json'

class StopBusArrival extends Component {
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

    this.stopoffset = props.stop.properties.simulation_offset

    this.state = {
      bus_approach_id: '',
      bus_approach_time: '--',
      bus_approach_seats: '--',
      bus_next_id: '',
      bus_next_time: '--',
      bus_next_seats: '--'
    }
  }

  getNextClosestOlli (positions, skipolli) {
    let closest = 1000
    let olli = null

    for (let i = 0; i < positions.length; i++) {
      let p = positions[i]
      if (!skipolli || skipolli !== p.olliId) {
        // console.log('skip: ', p.olliId, skipolli)
        let diff = this.stopoffset - p.offset
        if (diff >= 0 && diff < closest) {
          closest = diff
          olli = p
        }
      }
    }

    if (!olli) {
      for (let i = 0; i < positions.length; i++) {
        let p = positions[i]
        if (!skipolli || skipolli !== p.olliId) {
          // console.log('skip: ', p.olliId, skipolli)
          let diff = (this.stopoffset + 640) - p.offset
          if (diff < closest) {
            closest = diff
            olli = p
          }
        }
      }
    }

    if (olli) {
      return {
        olli: olli.olliId,
        offset: closest
      }
    }
  }

  updateBusInfo (positions) {
    let approach = this.getNextClosestOlli(positions)
    let next = this.getNextClosestOlli(positions, approach.olli)

    let time = ((approach.offset * 500) / 1000) / 60
    let min = Math.floor(time)
    let sec = Math.floor((time - min) * 60)

    let updatedState = {
      bus_approach_id: approach.olli,
      bus_approach_time: `${min}:${(sec < 10 ? '0' : '') + sec}`,
      bus_approach_seats: approach.olli.split('_')[1],
      bus_next_id: '',
      bus_next_time: '--',
      bus_next_seats: '--'
    }

    if (next) {
      time = ((next.offset * 500) / 1000) / 60
      min = Math.floor(time)
      sec = Math.floor((time - min) * 60)

      updatedState.bus_next_id = next.olli
      updatedState.bus_next_time = `${min}:${(sec < 10 ? '0' : '') + sec}`
      updatedState.bus_next_seats = next.olli.split('_')[1]
    }

    this.setState(updatedState)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.olliPositions !== this.props.olliPositions) {
      this.updateBusInfo(nextProps.olliPositions)
    }
  }

  render () {
    return (
      <div>
        <div className="bus-next">
          <h3>Next Bus</h3>
          <img src={'img/roller-list-stop.png'} alt={'roller-list-stop'}/>
          <div className="bus-time">{this.state.bus_next_time}</div>
          <div className="bus-seats">{this.state.bus_next_seats} seats available</div>
        </div>
        <div className="bus-approaching">
          <h3>Bus Approaching</h3>
          <img src={'img/roller-list-stop.png'} alt={'roller-list-stop'}/>
          <div className="bus-time">{this.state.bus_approach_time}</div>
          <div className="bus-seats">{this.state.bus_approach_seats} seats available</div>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    olliPositions: state.olliPositions
  }
}

export default connect(mapStateToProps)(StopBusArrival)
