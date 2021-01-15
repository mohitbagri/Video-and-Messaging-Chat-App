import React, { Component } from "react";
import axios from 'axios';
import { API_URL } from './Utils.js';

class ChangePassword extends Component {

    constructor(props) {
        super(props);
        this.changePwd = this.changePwd.bind(this);
        this.state = {oldPassword: '',
                      newPassword: '',
                      verifiedNewPassword:'Unsuccesful',
                      verifiedSecurityQuestion:'Unsuccesful'
            };
    
        this.handleOldPasswordChange = this.handleOldPasswordChange.bind(this);
        this.handleNewPasswordChange = this.handleNewPasswordChange.bind(this);
        this.validateNewPassWord = this.validateNewPassWord.bind(this);
        this.validateSecurityQuestion = this.validateSecurityQuestion.bind(this);
      }
    
       async changePwd() {

        console.log("old pwd is " + this.state.oldPassword + " new pwd is" + this.state.newPassword);
        await this.validateNewPassWord();
        await this.validateSecurityQuestion();
        console.log(" I am in changePwd and " + this.state.verifiedNewPassword + "^^" + this.state.verifiedSecurityQuestion);
        if (this.state.verifiedNewPassword === 'Success' && this.state.verifiedSecurityQuestion == 'Success'){
        const data =  "username="+localStorage.getItem('username')+"&newPassword="+this.state.newPassword; 
        const result =  await axios.post(`${API_URL}/updatePassword`, data);

           var messageStatus = result.data.message;
           console.log(messageStatus);
           alert('changePwd!');

        }else{
            this.newPassword='';
        }
        
        

      }

      async validateSecurityQuestion(){
        var SecurityQuestion = document.getElementById("security").value;
        const data =  "username="+localStorage.getItem('username')+"&SecurityQuestion="+SecurityQuestion; 
        console.log("in validateSQ " + SecurityQuestion);

        const result1 =  await axios.post(`${API_URL}/validateSecurityQuestion`, data);
        console.log("Result is "+ result1.data.message);
        this.state.verifiedSecurityQuestion = result1.data.message;
        console.log(" this.state.verifiedSecurityQuestion" +  this.state.verifiedSecurityQuestion);

        if (this.state.verifiedSecurityQuestion !='Success'){

            alert("Wrong security question entered!");
        }


      }

      async validateNewPassWord(){
        var value= this.state.newPassword;
        console.log("we are in validate password "+ value);
        var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
        const isOk = re.test(value);
        var reason='';
        
        if(!isOk) {

            var checkLowerCaseRe= /(?=.*[a-z])/;

            var isLower= checkLowerCaseRe.test(value);
            if(!isLower){
                reason += "No Lower Case\n";
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
            alert("New Password invalid\n"+ reason);
        }
        else{
            this.state.verifiedNewPassword = 'Success';
        }
      }  

      handleOldPasswordChange(event) {
        this.setState({
            oldPassword: event.target.value
        });
       
      }   
      
      handleNewPasswordChange(event) {
        this.setState({
            newPassword: event.target.value
        });
       
      }   

  render() {
    return (
      <div>
        <h2>change password page </h2>
        
    

     <div className="form-group">
          <label>Security Question </label>
          <input type="security" id="security" className="form-control" placeholder=" Enter Security Question" />
      </div>

     <div className="form-group">
          <label>New Password</label>
          <input type="password" value={this.state.newPassword} onChange={this.handleNewPasswordChange} className="form-control" placeholder="Password" />
     </div>
     
        <button onClick={this.changePwd}>
      Click me!
    </button>
        
      </div>
    );
  }
}
 
export default ChangePassword;
