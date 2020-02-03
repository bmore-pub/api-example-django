import React from 'react'

import Appointment from './Appointment'
import WaitingAppointment from './WaitingAppointment'
import * as moment from 'moment'
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

const activeEncounterStatuses = ['In Session']
const inRoomStatuses = ['In Room']
const arrivedOrCheckedInStatuses = ['Arrived', 'Checked In', 'Checked In Online']
const Appointments = (props) => {
  const { appointments, updateAppointment } = props
  const arrivedOrCheckedInAppointments = appointments.filter(appointment => {
    return arrivedOrCheckedInStatuses.includes(appointment.status)
  })
  const activeEncounters = appointments.filter(appointment => {
    return activeEncounterStatuses.includes(appointment.status)
  })
  const inRoomAppointments = appointments.filter(appointment => {
    return inRoomStatuses.includes(appointment.status)
  })

  const getTime = (datetime) => moment(datetime).format("HH:mm")

  const getExpectedEndTime = (startTime, duration) => {
    return moment(startTime).add('minute', duration).format("HH:mm")
  }

  const renderActiveEncounter = (appointment) => {
    const { color, reason, exam_room, scheduled_time, notes, duration } = appointment
    var style = {}
    if (color) {
      style['borderBottom'] = `2px solid ${color}`
    }

    console.log(style)
    return (
      <Card fluid key={appointment.id} style={style}>
        <Card.Content>
          <Card.Header>Room {exam_room}</Card.Header>
          <Card.Meta>Scheduled: {getTime(scheduled_time)} - {getExpectedEndTime(scheduled_time, duration)}</Card.Meta>
          <Card.Description>
            Reason: {reason}
            <div>
              {notes}
            </div>
          </Card.Description>
        </Card.Content>
        <Card.Content extra>
          <Card.Meta>Vitals</Card.Meta>
        </Card.Content>
        <Card.Content extra>
          <div className='ui two buttons'>
            <Button basic color='blue' onClick={() => updateAppointment(appointment.id, { status: 'Complete' })}>
              Complete Encounter
            </Button>
          </div>
        </Card.Content>
      </Card>
    )
  }

  const renderActiveEncounters = (appointments) => {
    return (
      <Card.Group>
        {appointments.map(appointment =>
          renderActiveEncounter(appointment)
        )}
      </Card.Group>
    )
  }

  const renderWaitingPatients = (appointments) => {
    return (
      <Card.Group>
        {appointments.map(appointment =>
          <WaitingAppointment key={appointment.id} appointment={appointment} updateAppointment={updateAppointment} />
        )}
      </Card.Group>
    )
  }

  return (
    <div>
      <div>{activeEncounters.length} active {activeEncounters.length === 1 ? "encounter" : "encounters"}</div>
      <div>{inRoomAppointments.length} {inRoomAppointments.length === 1 ? "patient" : "patients"} ready in room</div>

      {renderActiveEncounters(activeEncounters)}
      <h4>Waiting in room patients ({inRoomAppointments.length})</h4>
      {renderWaitingPatients(inRoomAppointments)}
      <h4>Checked-in patients ({arrivedOrCheckedInAppointments.length})</h4>
      {renderWaitingPatients(arrivedOrCheckedInAppointments)}
    </div>
  )
}

export default Appointments