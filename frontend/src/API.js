import axios from 'axios';

const getAppointments = () => {
  return axios.get("/get-appointments/")
}

const getDoctor = () => {
  return axios.get("/get-doctor/")
}

const updateAppointment = (appointmentId, updateParams) => {
  return axios.patch("/update-appointment/", {
    ...updateParams,
    appointment_id: appointmentId
  })
}

export default {
  getAppointments,
  getDoctor,
  updateAppointment
}