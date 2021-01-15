import React, { Component, Fragment } from 'react';
import { useHistory } from 'react-router-dom';
import { withRouter } from "react-router-dom";
import axios from 'axios';
import { API_URL } from './Utils.js';


class UserSignUp extends Component{

    constructor(props) {
        super(props);
    
        this.state = {value: ''};
    
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        }


   handleChange(event) {
    this.setState({
        value: event.target.value
    });
}

async handleSubmit(event) {
    event.preventDefault();

    const { value } = this.state;
    var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    const isOk = re.test(value);
    if(!isOk) {
        return alert('weak!');
    }

    if(isOk){
        var username= document.getElementById("username").value;
        var password = value;
        var SecurityQuestion = document.getElementById("security").value;
        alert('A password was submitted that was ' + value.length + ' characters long.');
        const data = "username="+username+"&password="+password+"&SecurityQuestion="+ SecurityQuestion; 
        const result =  await axios.post(API_URL + '/addUser', data);
        alert(result.data.message);
        localStorage.setItem('username',username);
        this.props.history.push("/MainView");    

    }
    
}


  render() {
    return (
      <form>
      <h3>Chat App!</h3>
      <h4>Login / Register</h4>
      <div className="form-group">
          <label>Username </label>
          <input type="username" id="username" className="form-control" placeholder=" Enter Username" />
      </div>

    <div className="form-group">
          <label>Password</label>
          <input type="password" value={this.state.value} onChange={this.handleChange} className="form-control" placeholder="Password" />
     </div>


     <div className="form-group">
          <label>Security Question </label>
          <input type="security" id="security" className="form-control" placeholder=" Enter Security Question" />
      </div>

    
    <button onClick={this.handleSubmit}>
      Submit
    </button>
      </form>
      );
      };
}

export default withRouter(UserSignUp);