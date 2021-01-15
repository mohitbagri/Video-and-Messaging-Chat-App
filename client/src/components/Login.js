import React, { Component, Fragment } from 'react';
import { useHistory } from 'react-router-dom';
import { withRouter } from "react-router-dom";
import LockScreen from "react-lock-screen";
import axios from 'axios';
import { Button, Navbar } from 'react-bootstrap';
import { API_URL } from './Utils.js';

const getLockScreenUi = setLock => {
      return (
        <div className="react-lock-screen__ui" style={{width: "800px",  margin: "0 auto"}}>
            
          <img
            width="32"
            src="https://cdn3.iconfinder.com/data/icons/wpzoom-developer-icon-set/500/102-256.png"
            alt="lock"
          />
          <p>Just to be safe, we locked the screen</p>
          <button onClick={() => setLock(false)}>unlock</button>
        </div>
      );
    };

class Login extends Component{

    constructor(props) {
        super(props);
    
        this.state = {
            value: '',
            failedLoginAttempts: 0,
           
    
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSignInClick = this.handleSignInClick.bind(this);
    }

        

    
   handleChange(event) {
    this.setState({
        value: event.target.value
        });
    }    

    async handleSignInClick(event) {

        document.getElementById("pwd").value = "";
        /*

        To check a password between 6 to 20 characters which contain at least 
        one numeric digit, one uppercase and one lowercase letter
        */

        event.preventDefault();
    
        const { value } = this.state;
        //const re = new RegExp("^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,32}$");
        //var re = /^[A-Z]*$/;
        var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
        const isOk = re.test(value);
        var reason='';
    
    
        if(!isOk) {
            var checkLowerCaseRe= /(?=.*[a-z])/;

            var isLower= checkLowerCaseRe.test(value);
            if(!isLower){
                reason += "No Lower Case\n";
                console.log("not lower");
            }

            var checkUpperCaseRe= /(?=.*[A-Z])/;

            var isUpper= checkUpperCaseRe.test(value);
            if(!isUpper){
                reason += "No Upper Case\n";
            }

            var checkDigitseRe= /(?=.*\d)/ ;

            var isDigit= checkDigitseRe.test(value);
            if(!isDigit){
                reason += "No Digit\n";
            }

            if (value.length < 6 || value.length > 20 ){
                reason +=  "Length not between 6 and 20\n";
            }


            console.log("this is reason after everything" + reason);

            this.state.failedLoginAttempts = this.state.failedLoginAttempts + 1;

            var outputReason = 'Password is weak\n' + reason + 'Number of Attempts Used: ' + this.state.failedLoginAttempts;
            
            return alert(outputReason);
            
        }
    
        if(isOk){
            
            alert('A password was submitted that was ' + value.length + ' characters long.');
            var username= document.getElementById("username").value;
            var password = value;
            const data = "username="+username+"&password="+password; 

            const result =  await axios.post(API_URL + '/loginUser', data);

        
            var messageStatus = result.data.message;

            console.log(" THIS IS MESSAGE STATUS " + messageStatus);
            
            if (messageStatus=='Success'){
                alert('Welcome back '+ username);
                localStorage.setItem('username', username);                
                this.props.history.push({
                    pathname: '/MainView',
                    customNameData: username,
                  });
                  
            }else if (messageStatus == 'Locked out'){
                alert('Your account is locked. Please try again after 30 minutes');
            }else{
                alert("Sorry buddy you are not a registered user/entered wrong password");
            }
                
        }
        
    }

    handleSignUplick = () => {
        this.props.history.push("/UserSignUp");
    }


  render() {
      
    return (
        <LockScreen timeout={500000} ui={getLockScreenUi}>
            
      <form>
      <Navbar location={this.props.location}/>
      <h3>Chat App!</h3>
      <h4>Login / Register</h4>
      <div className="form-group">
      <div className="form-group">
          <label>Username </label>
          <input type="username" id="username" className="form-control" placeholder=" Enter Username" />
      </div>
      </div>

      <div className="form-group">
          <label>Password</label>
          <input type="password" id="pwd" value={this.state.value} onChange={this.handleChange} className="form-control" placeholder="Password" />
        </div>
        <button onClick={this.handleSignInClick}>
      Sign in!
    </button>
        <button onClick={this.handleSignUplick}>
      Sign up!
    </button>
        
     
    </form>
    </LockScreen>
    
  
     
      );
      };
}

export default withRouter(Login);