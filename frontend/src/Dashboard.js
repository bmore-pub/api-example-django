import React, { useState, useEffect } from 'react'
import * as R from 'ramda'
import {
  Container,
  Menu,
  Button,
} from 'semantic-ui-react'
import DoctorDetails from './DoctorDetails'
import Appointments from './Appointments'
import AllAppointments from './AllAppointments'
import API from './API'

const Dashboard = (props) => {
  const socketConn = props.socketConn
  const [appointments, setAppointments] = useState([])
  const [showAllAppointments, setShowAllAppointments] = useState(false)
  const [doctor, setDoctor] = useState(false)
  const [statistics, setStatistics] = useState({ 'patient_waiting': 0 })

  socketConn.onmessage = e => {
    let data = {}
    try {
      data = JSON.parse(e.data)
    } catch (err) {
      //ignore message
    }

    if (data.event == 'APPOINTMENT_CREATE') {
      setAppointments(R.append(data.data, appointments))
    } else if (data.event == 'APPOINTMENT_MODIFY') {
      const index = R.findIndex(R.propEq('id', data.data.id))(appointments)
      const updatedAppointments = R.update(index, data.data, appointments)
      setAppointments(updatedAppointments)
    } else {
      console.log(e)
    }
  };

  socketConn.onopen = () => {
    console.log("WebSocket open");
  };

  socketConn.onerror = e => {
    console.log(e.message);
  };

  socketConn.onclose = () => {
    console.log("WebSocket closed, restarting..");
  };

  async function getStatistics() {
    const res = API.getStatistics()
      .then(res => {
        setStatistics(res.data)
      })
  }

  async function fetchAppointments() {
    const res = API.getAppointments()
      .then(res => {
        setAppointments(res.data)
      })
  }

  async function fetchDoctor() {
    const res = API.getDoctor()
      .then(res => {
        console.log(res.data)
        setDoctor(res.data)
      })
  }

  const updateAppointment = (appointmentId, updateParams) => {
    const res = API.updateAppointment(appointmentId, updateParams)
      .then(res => {
        console.log(res.data)
        // TODO remove mutation
        const index = R.findIndex(R.propEq('id', appointmentId))(appointments)
        const updatedAppointment = {
          ...appointments[index],
          ...updateParams
        }
        const updatedAppointments = R.update(index, updatedAppointment, appointments)
        setAppointments(updatedAppointments)
      })
  }

  useEffect(() => {
    fetchAppointments();
    fetchDoctor();
    getStatistics();
  }, [])

  const renderMenu = () => {
    return (<Menu fixed='top' inverted>
      <Container>
        <Menu.Item as='a' header>
          DrChrono Hackathon
        </Menu.Item>
        <Menu.Item as='a'>Home</Menu.Item>
      </Container>
    </Menu>
    )
  }

  const getAverageWait = (statistics) => {
    if (statistics && statistics.time_waiting) {
      return moment.duration(statistics.time_waiting).humanize()
    }
    return 'No data available'
  }

  return (
    <div>
      {renderMenu()}
      <Container style={{ marginTop: '7em' }}>
        <DoctorDetails doctor={doctor} />
        <div>
          Average Patient Waiting: {getAverageWait(statistics)}
        </div>
        <Button style={{ margin: "5px;" }} onClick={() => setShowAllAppointments(!showAllAppointments)}>
          {!showAllAppointments && ("Show All Appointments")}
          {showAllAppointments && ("Show Dashboard")}
        </Button>
        <h5></h5>
        {showAllAppointments && (<AllAppointments appointments={appointments} updateAppointment={updateAppointment} />)}
        {!showAllAppointments && (<Appointments appointments={appointments} updateAppointment={updateAppointment} />)}
      </Container>

    </div >
  )
}

export default Dashboard
