import React from 'react'
import * as moment from 'moment'
import * as R from 'ramda'
import {
  Container,
  Divider,
  Dropdown,
  Grid,
  Header,
  Image,
  Card,
  Button,
  List,
  Menu,
  Segment,
} from 'semantic-ui-react'

// TODO remove this
const activeEncounterStatuses = ['In Session']
const inRoomStatuses = ['In Room']
const arrivedOrCheckedInStatuses = ['Arrived', 'Checked In', 'Checked In Online']
const remainingStatuses = []
const allStatuses = ['Arrived', 'Checked In', 'Checked In Online', 'In Room', 'In Session', 'Complete', 'Confirmed', 'Not Confirmed', 'Rescheduled', 'Cancelled', 'No Show']
const getTime = (datetime) => moment(datetime).format("HH:mm")
const AllAppointments = (props) => {
  const { appointments, updateAppointment } = props
  const sortedAppointments = R.sortBy(appointment => moment(appointment['scheduled_time']))(appointments)

  const renderSelect = (appointmentId, status) => {
    return (
      <select value={status} onChange={(event) => updateAppointment(appointmentId, {
        status: event.target.value
      })}>
        {allStatuses.map(item => <option key={item} value={item}>{item}</option>)}
      </select >
    )

  }

  const renderCard = (appointment) => {
    const { id, color, scheduled_time, status, reason, exam_room } = appointment
    var style = {}
    if (color) {
      style['borderBottom'] = `2px solid {color}`
    }
    const formattedTime = getTime(scheduled_time)
    const header = status ? `${formattedTime} (${status})` : formattedTime
    return (
      <Card style={style}>
        <Card.Content header={header} />
        <Card.Content extra>
          {renderSelect(id, status)}
        </Card.Content>
        <Card.Content extra>
          <div>
            Room: {exam_room}
          </div>
          <div>
            {reason}
          </div>
        </Card.Content>
      </Card >
    )
  }

  return (
    <Card.Group itemsPerRow={4}>
      {sortedAppointments.map(appointment => renderCard(appointment))}
    </Card.Group >
  )
}

export default AllAppointments