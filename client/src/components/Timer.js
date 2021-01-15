// Adapted from https://upmostly.com/tutorials/build-a-react-timer-component-using-hooks
import React, { useState, useEffect } from 'react';

const Timer = ({isCallOn}) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  function toggle() {
    setIsActive(!isActive);
  }

  function reset() {
    setSeconds(0);
    setIsActive(false);
  }

  useEffect(() => {
    let interval = null;
    setIsActive(isCallOn)
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
      setSeconds(0)
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, isCallOn]);
  let output = '';

  if (isActive) {
    return (
        <div className="app">
      <div className="time">
        {seconds}s since your Twilio connection
      </div>
    </div>
    )
  }
  return null
};
  

  



export default Timer;