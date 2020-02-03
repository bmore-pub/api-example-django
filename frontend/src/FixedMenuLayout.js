import React, { useState, useEffect, usePrevious } from 'react'
import * as R from 'ramda'
import {
  Container,
  Divider,
  Dropdown,
  Grid,
  Header,
  Image,
  List,
  Menu,
  Button,
  Segment,
} from 'semantic-ui-react'
import DoctorDetails from './DoctorDetails'
import Appointments from './Appointments'
import AllAppointments from './AllAppointments'
import API from './API'

const FixedMenuLayout = (props) => {
  const socketConn = props.socketConn
  const [appointments, setAppointments] = useState([])
  const [showAllAppointments, setShowAllAppointments] = useState(false)
  const [doctor, setDoctor] = useState(false)
  const url = location.origin.replace('http', 'ws') + '/test-socket'

  socketConn.onmessage = e => {
    console.log(e.data)
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
  }, [])

  const renderMenu = () => {
    return (<Menu fixed='top' inverted>
      <Container>
        <Menu.Item as='a' header>
          DrChrono Hackathon
        </Menu.Item>
        <Menu.Item as='a'>Home</Menu.Item>

        <Dropdown item simple text='Dropdown'>
          <Dropdown.Menu>
            <Dropdown.Item>List Item</Dropdown.Item>
            <Dropdown.Item>List Item</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Header>Header Item</Dropdown.Header>
            <Dropdown.Item>
              <i className='dropdown icon' />
              <span className='text'>Submenu</span>
              <Dropdown.Menu>
                <Dropdown.Item>List Item</Dropdown.Item>
                <Dropdown.Item>List Item</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Item>
            <Dropdown.Item>List Item</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Container>
    </Menu>
    )
  }

  return (
    <div>
      {renderMenu()}
      <Container style={{ marginTop: '7em' }}>
        <DoctorDetails doctor={doctor} />
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

export default FixedMenuLayout
