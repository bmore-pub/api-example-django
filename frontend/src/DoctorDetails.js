import React from 'react'

const DoctorDetails = (props) => {
  const { first_name, last_name } = props.doctor

  return (
    <div>
      <h2> Hi, {first_name} {last_name}</h2>
    </div>
  )
}

export default DoctorDetails