import React, { Component, Fragment } from 'react';
import { useHistory } from 'react-router-dom';
import { withRouter } from "react-router-dom";



class UserSignUp extends Component{

    constructor(props) {
        super(props);
    
        this.state = {value: ''};
    
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        }

   
        /*
    handleSignUpClick = () => {
        this.props.history.push("/MainView");
    }
    */

   handleChange(event) {
    this.setState({
        value: event.target.value
    });
}

handleSubmit(event) {
    event.preventDefault();

    const { value } = this.state;
    //const re = new RegExp("^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,32}$");
    var re = /^[A-Z]*$/;
    const isOk = re.test(value);

    console.log(isOk);

    if(!isOk) {
        return alert('weak!');
    }

    if(isOk){
        
        alert('A password was submitted that was ' + value.length + ' characters long.');
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
          <input type="username" className="form-control" placeholder=" Enter Username" />
      </div>

    <div className="form-group">
          <label>Password</label>
          <input type="password" value={this.state.value} onChange={this.handleChange} className="form-control" placeholder="Password" />
     </div>

    
    <button onClick={this.handleSubmit}>
      Submit
    </button>
      </form>
      );
      };
}

export default withRouter(UserSignUp);