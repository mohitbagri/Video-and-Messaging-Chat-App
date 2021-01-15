import React, { Component } from "react";
import axios from 'axios';
import { API_URL } from './Utils.js';

class DeactivateAccount extends Component {
    constructor(props) {
        super(props);
        this.deactivate = this.deactivate.bind(this);
      }
    
      async deactivate() {
          console.log("i am in deactive acc" + localStorage.getItem('username'));
          const data =  "username="+localStorage.getItem('username'); 
          const result =  await axios.post(API_URL + '/changeAccountStatus', data);
          var messageStatus = result.data.message;
          console.log(messageStatus);
          if (messageStatus ==='Success'){
            alert('Changed account status successfully!');
          }else{
              alert("something went wrong!");
          }
        
      }
      
  render() {
    return (
      <div>
        <h2>activate/deactivate account</h2>
       
        <button onClick={this.deactivate}>   
      Click me!
    </button>
      </div>
    );
  }
}
 
export default DeactivateAccount;
