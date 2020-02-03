import React, { useState, useEffect } from 'react'
import * as moment from 'moment'
import * as R from 'ramda'

import {
  Card,
  Button,
} from 'semantic-ui-react'

const getTime = (datetime) => moment(datetime).format("HH:mm")
const getTimeWaiting = (appointment) => {
  // TODO consider status transitions?
  const { status_transitions, scheduled_time } = appointment
  const diff = moment().diff(moment(scheduled_time))
  if (diff <= 0) {
    return 'n/a'
  } else {
    return moment.duration(diff).humanize()
  }
}
const WaitingAppointment = (props) => {
  const [currentTime, setCurrentTime] = useState(moment())
  const { appointment, updateAppointment } = props
  const { status, color, reason, exam_room, scheduled_time } = appointment
  const timeWaiting = getTimeWaiting(appointment)
  const formattedScheduledTime = getTime(scheduled_time)
  var style = {}

  useEffect(() => {
    // const interval = setInterval(() => this.setCurrentTime(moment(), 1000 * 60))
    const interval = setInterval(() => setCurrentTime(moment()), 1000 * 60)

    return () => {
      clearInterval(interval)
    }
  }, [])

  if (color) {
    style['borderBottom'] = `2px solid {color}`
  }

  return (
    <Card key={appointment.id} style={style}>
      <Card.Content>
        <Card.Header>Status: {status} -- Room: {exam_room}</Card.Header>
        <Card.Meta>Scheduled Time: {formattedScheduledTime}</Card.Meta>
        <Card.Meta>Waiting: {timeWaiting}</Card.Meta>
        <Card.Description>
          {reason}
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className='ui two buttons'>
          <Button basic color='blue' onClick={() => updateAppointment(appointment.id, { status: 'In Session' })}>
            Begin Encounter
            </Button>
        </div>
      </Card.Content>
    </Card >
  )
}

export default WaitingAppointment