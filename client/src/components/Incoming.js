// Credit: Phil Nash (Twilio)

import React from "react";

const Incoming = ({ connection, device, socketRef, caller, setSocketCallUpdates }) => {
  const acceptConnection = () => {
    connection.accept();
    setSocketCallUpdates('')
  };
  const rejectConnection = () => {
    socketRef.current.emit('rejecting', {rejectedEntity: `${caller}`, rejectingEntity:`${localStorage.getItem('username')}`, room: `${caller}_updates` })
    setSocketCallUpdates('')
    connection.reject();
  };
  return (
    <>
      <button onClick={acceptConnection}>Accept</button>
      <button onClick={rejectConnection}>Reject</button>
    </>
  );
};

export default Incoming;