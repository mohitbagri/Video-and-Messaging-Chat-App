import React, { Component } from "react";
import fb_default from "./fb_default.jpg";
import axios from 'axios';
import { API_URL } from './Utils.js';

class Home extends Component {

  render() {
      console.log("home page " + localStorage.getItem('username'));
    return (
      <div>
        <h2>HELLO</h2>
        <img src={fb_default} height='200px' width='200px' alt="fireSpot"/>
 
        
      </div>
    );
  }
}
 
export default Home;