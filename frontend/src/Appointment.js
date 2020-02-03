import React from 'react'

const Appointment = (props) => {
  const { scheduled_time: scheduledTime } = props
  return (
    <div>
      {scheduledTime}
    </div>
  )
}

export default Appointment