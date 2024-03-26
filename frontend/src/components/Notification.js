import React from 'react'

const Notification = ({ text, isError }) => {
  if (text === null) {
    return null
  }

  const messageTypeClassName = isError ? 'error-message' : 'success-message'
  console.log(messageTypeClassName)


  return (
    <div className={messageTypeClassName}>
      {text}
    </div>
  )
}

export default Notification