import logo from './logo.svg';
import './App.css';
import Login from './components/Login.js'
import MainView from './components/MainView.js'
import Main from './components/Main.js'
import UserSignUp from './components/UserSignUp.js'
import PostStatus from './components/PostStatus.js'
import ViewStatus from './components/ViewStatus.js'
import Chat from './components/Chat.js'
import ActivityFeed from './components/ActivityFeed.js'
import ChatRoom from './components/ChatRoom.js'
import {useState, useEffect, useStateIfMounted } from 'react'



import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function App() {
  // Setting this up so all children have access to twilioToken
  const [twilioToken, setTwilioToken] = useState(0);
  console.log(`Printing inside app.js ${twilioToken}`)

  return (
    <div className="App">
      <Router> 
        <Switch>

          
          <Route path="/login" >
          <Login></Login>
          </Route>
          <Route path="/main" >
            <Main> </Main>
          </Route>
        

          <Route path="/mainView">
            <MainView twilioToken={twilioToken} setTwilioToken={setTwilioToken}/>
          </Route>
          <Route path="/UserSignUp">
            <UserSignUp/>
          </Route>
          <Route path="/PostStatus">
            <PostStatus twilioToken={twilioToken}/>
          </Route>
          <Route path='/ViewStatus'>
            <ViewStatus/>
          </Route>
          <Route path="/ActivityFeed">
            <ActivityFeed/>
          </Route>
          <Route exact path="/chat/:receiver" component={ChatRoom }  />

          <Route exact path="/chat/:receiver" component={ChatRoom} />
          <Route path="/Chat">
            <Chat/>
          </Route>



          


          



        </Switch> 

      </Router>


      <div></div>
    </div>
  );
}

export default App;

