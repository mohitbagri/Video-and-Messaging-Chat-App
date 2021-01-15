// Credit: Phil Nash (Twilio)
import React, { useState } from "react";

const OnCall = ({ handleHangup, connection }) => {


// This where the timing should go isCallOn is true 


  return (
    <>
      <div className="call">

        <div className="hang-up">
          <button onClick={handleHangup} color="red">
            Hang up
          </button>
        </div>
      </div>
    </>
  );
};

export default OnCall;