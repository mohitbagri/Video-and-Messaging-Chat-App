import React, { Component } from "react";
import { useLocation } from "react-router-dom";
import { API_URL } from './Utils.js';

import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import Home from "./Home";
import { withRouter } from "react-router-dom";
import ChangePassword from "./ChangePassword";
import DeactivateAccount from "./DeactivateAccount";
import MainView from "./MainView";
import axios from 'axios';
import fb_default from "./fb_default.jpg";


 
class Main extends Component {

    constructor(props) {
        super(props);

        this.state = {
            profilePic: '',
            registrationTime: '',
            hasFetchedDetails: false
           
        };
        this.helper = this.helper.bind(this);
     
    }

    componentDidMount(){    
            this.helper();
    }
    
    async helper(event){
        
       const getProfile = await axios.get(API_URL + '/profileDetails', { params: { username: localStorage.getItem('username') } });
       
       var profileUserName =  getProfile.data.data.user;
       this.state.registrationTime = getProfile.data.data.registrationTime
       this.state.registrationTime = new Date(this.state.registrationTime).toLocaleDateString("en-US")
       this.state.hasFetchedDetails = true;
       this.state.profilePic =  getProfile.data.data.profilePicture;
       this.setState({registrationTime: this.state.registrationTime});
    }

    handleMainView = () => {
        this.props.history.push("/MainView");
    }
    
  render() {    
    return (
        
        <HashRouter>
        <div>
          <h1>{localStorage.getItem('username')} Profile Page</h1>
         
        <button onClick={this.handleMainView}>
            Go back to main view 
        </button>
          { this.state.registrationTime && 
                <div>registration date {this.state.registrationTime} 
                        <img src={this.state.profilePic} height='100px' width='100px' alt="fireSpot"/>
                </div>
            }          
          <ul className="header">
            <li><NavLink to="/ChangePassword">Change Password</NavLink></li>
            <li><NavLink to="/DeactivateAccount">Deactivate Account</NavLink></li>
          </ul>
          <div className="content">
            <Route path="/ChangePassword" component={ChangePassword}/>
            <Route path="/DeactivateAccount" component={DeactivateAccount}/>
             
          </div>
          
        </div>
        </HashRouter>
    );
  }
}
 
export default withRouter(Main);