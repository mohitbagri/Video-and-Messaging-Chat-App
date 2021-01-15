// Credit: https://github.com/philnash/react-twilio-phone/blob/493d336ccdea3bb27efc017e02ad7bdb81b08224/src/Phone.js

import React, { useState, useEffect } from "react";
import { Device, Connection } from "twilio-client";
import Incoming from "./Incoming";
import OnCall from "./OnCall";
import states from "./twilioStates";
import axios from 'axios'
import { API_URL } from './Utils.js';



const Phone = ({ token, setTwilioDevice, setSocketCallUpdates, socketRef, setCallOn, caller, callee }) => {
  const [state, setState] = useState(states.CONNECTING);
  const [conn, setConn] = useState(null);
  const [device, setDevice] = useState(null);

  useEffect(() => {
    const device = new Device();

    device.setup(token, { debug: true });

    device.on("ready", () => {
      setDevice(device);
      setState(states.READY);
      alert('ready')
    });
    device.on("connect", connection => {
      console.log("Connect event");
      // Set up a timer 
      setConn(connection);
      setState(states.ON_CALL);
      alert('connect')
      setCallOn(true)
      setSocketCallUpdates('')

    });
    device.on("disconnect", () => {
      setState(states.READY);
      setConn(null);
      setCallOn(false)
      setSocketCallUpdates('')
    });
    device.on("incoming", connection => {
      setState(states.INCOMING);
      setConn(connection);
      connection.on("reject", () => {
        setState(states.READY);
        setConn(null);
        setCallOn(false)

      });
    });
    device.on("cancel", () => {
      setState(states.READY);
      setConn(null);
      setCallOn(false)

      setSocketCallUpdates('N/A')
    });
    device.on("reject", () => {
      setState(states.READY);
      setConn(null);
      setCallOn(false)
      setSocketCallUpdates('')
    });
    setTwilioDevice(device)

    return () => {
      device.destroy();
      setDevice(null);
      setState(states.OFFLINE);
    };
  }, [token]);

  const handleCall = async () => {
    alert(`Call I am inside`)
    const params = {To: 'username1'} // ?? remove this. for testing  
    device.connect(params)

  };

  const handleHangup = async () => { 
    const data = "callerUser=" + caller+ "&calleeUser="+callee; 
    await axios.post(`${API_URL}/registerCall`, data); // Heroku issue??

    device.disconnectAll();

  };

  let render;
  if (conn) {
    if (state === states.INCOMING) {
      render = <Incoming device={device} connection={conn} socketRef={socketRef} caller={caller} setSocketCallUpdates={setSocketCallUpdates}></Incoming>;
    } else if (state === states.ON_CALL) {
      render = <OnCall handleHangup={handleHangup} connection={conn} caller={caller} callee={callee} ></OnCall>;
    }
  } else {
    render = (
      <>
        <div className="call">
          <button onClick={handleCall} color="green">
            Call Test
          </button>
        </div>
      </>
    );
  }
  return (
    <>
      {render}
      <p className="status">{state}</p>
    </>
  );
};

export default Phone;