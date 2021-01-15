/* eslint-disable react-hooks/exhaustive-deps */

//Authenticated users should be routed to the main view.
// How to check users are authenticated 
/*  
The main view should
Display the contacts ordered by most recent interaction descending
The list of contacts should be clickable
Clicking on a contact should launch the  messaging view
The view should allow the user to search for a specific contact
Step 1: Display contacts 
Step 2: Search 
Step 3: Make it possible to got to a message view  
*/ 

import React from 'react' 
import {useState, useEffect, useStateIfMounted , useRef} from 'react'
import axios from 'axios'
import Pagination from 'reactjs-hooks-pagination';
import ReactPaginate from 'react-paginate';

import { Device } from "twilio-client"; // Twilio part 
import states from "./twilioStates"; // Twilio States 
import Phone from "./Phone";
import Timer from './Timer'

import { API_URL } from './Utils.js';


import {
    Route,
    NavLink,
    HashRouter
  } from "react-router-dom";
 
  import { withRouter } from "react-router-dom";
  import Chat from "./Chat";
  import fb_default from "./fb_default.jpg";
  import { Link } from "react-router-dom";
import { render } from 'react-dom';

import { useHistory } from "react-router";
import socketIOClient from "socket.io-client";

const SOCKET_SERVER_URL = `${API_URL}`; //Need to update for Heroku


const MainView = props=>  {


    const [userContacts, setUserContacts] = useState("")
    const [searchFriendContact, setSearchFriendContact] = useState("")
    const [searchOtherContact, setSearchOtherContact] = useState("")
    const[searchRemovedContact, setSearchRemovedContact] = useState("")

    const [testExpress, setTestExpress] = useState("")
    const[otherContacts, setOtherContacts] = useState("")

    const[removedContacts, setRemovedContacts]= useState("")

    const [TwilioDevice, setTwilioDevice] = useState(null);
    
    const [liveUsers, setLiveUsers] = useState([]);
    const [isCallOn, setCallOn] = useState(false)
    const [caller, setCaller] = useState(null)
    const [callee, setCallee] = useState(null)

    const [socketCallUpdates, setSocketCallUpdates] = useState("")
    const [rejectionCallUpdates, setRejectionCallUpdates] = useState("")
    const socketRef = useRef();



    // To track whether users are active on their respective main pages 

    useEffect(() => {
        socketRef.current = socketIOClient(SOCKET_SERVER_URL);

        const thisUser = localStorage.getItem('username');
        socketRef.current.emit('newUser',{
            liveUser: thisUser
        })
        socketRef.current.on('liveUsersFromServer', data => {
            setLiveUsers(data)
        });


        // How to join a room
        socketRef.current.on('receivedCallUpdate', async (data) => {
            setSocketCallUpdates(`📳 Incoming ${data} is calling you now`)
            setCaller(data);
            setCallee(`${localStorage.getItem('username')}`);
          }); 


          socketRef.current.on('rejectionUpdate', data => {
              setRejectionCallUpdates(`${data}`)
          })
        // Cleanup to prevent leaks
        return () => socketRef.current.disconnect(); 

    },[])

    // Function to allow only connection between live users 

    const ContactOnlyLiveUsers = ({contact})=>{
        if (liveUsers.includes(contact)){
            return ( <button onClick={()=> callContact(contact)}>
            🤙 🟢
            </button>)
        }
        return ( <button onClick={()=> callInactiveContact(contact)}> 
        🤙 😴
        </button>)


    }
    const callInactiveContact = (contact)=> {
        alert(`Sorry you can\'t call ${contact} because they are not logged in now`)
    }


  const [offset, setOffset] = useState(0);
  const [data, setData] = useState([]);
  const [perPage] = useState(5);
  const [pageCount, setPageCount] = useState(0)
    
    useEffect(async () => {
        const username = localStorage.getItem('username');
        const data = "username=" + username;
        const userContactsResult =  await axios.post(API_URL + '/FetchUserContacts', data);
        var AccountStatus = await axios.post(`${API_URL}/getAccountStatus`, data);
        AccountStatus = AccountStatus.data.data;
        var userContactsList =[]
        var allOtherContactsList =[]
        var userRemovedContactList=[]
        if(AccountStatus === 'Active'){
           const userContactsResult =  await axios.post(`${API_URL}/FetchUserContacts`, data);
           const responseMessage = userContactsResult.data.message;           
           if (responseMessage == 'Error'){
               console.log("User has no contacts");
           }else{
   
               var userContactsObjectList = userContactsResult.data.data;
               for (var i = 0; i < userContactsObjectList.length; i++) {
                   var tempStr = userContactsObjectList[i].cID.split("$");
                   if (tempStr[0]==username){
                       // add the other person to the user contact not the user itself
                       userContactsList[i] = tempStr[1];
                   }else{
                       userContactsList[i] = tempStr[0];
                   }
                   
               }
              
           }
        }
        //GET THE REMOVED CONTACTS OF A PARTICULAR USER 

        const removedContactsResult = await axios.post(API_URL + '/FetchUserRemovedContacts', data);

        const removedContactAPIResonseMessage = removedContactsResult.data.message; 
        if (removedContactAPIResonseMessage === 'Success'){
            var userRemovedContactsObjectList = removedContactsResult.data.data;
            for(var i=0;i< userRemovedContactsObjectList.length;i++){
                userRemovedContactList[i] = userRemovedContactsObjectList[i].username;
            }
        }

       var combinedUserFriendsList = userContactsList.concat(userRemovedContactList);        
        const allOtherContactsParam = "contacts=" + combinedUserFriendsList;
        const getAllOtherContactsResult =  await axios.post(API_URL + '/FetchAllOtherContacts', allOtherContactsParam);
      
        var allOtherContactsObjectList = getAllOtherContactsResult.data.data;

        
        for (var i = 0; i < allOtherContactsObjectList.length; i++) {
            allOtherContactsList[i]=allOtherContactsObjectList[i].username;
            
        }
        setUserContacts(userContactsList);
        setOtherContacts(allOtherContactsList);

        setRemovedContacts(userRemovedContactList);


    },[offset]);

   
    const inputUpdate = (e) => {
        setSearchFriendContact(e.target.value)
    }

    const inputOtherUpdate = (e) => {
        setSearchOtherContact(e.target.value)
    }

    const inputRemovedContactUpdate = (e) => {
        setSearchRemovedContact(e.target.value)
    }
    const getChatLink = (receiver) => {
        let user = localStorage.getItem('username')
        if (user > receiver){
            return `/chat/${receiver}$${user}`
        }
        return `/chat/${user}$${receiver}`
    }
    var outputList = userContacts.length ? userContacts.
    filter(contact => contact.toLowerCase().includes(searchFriendContact.toLowerCase()) )
                    .map(contact => (
                        <HashRouter>
                        <div key={contact.id}> 
                            <img src={fb_default} height='200px' width='200px' alt="placeholder"/>
                            <p> {contact} </p>
                            
                            <button onClick={() => {
                                
                                var receiver = contact;

                                 window.open(getChatLink(receiver));
                                
                            }
                        }>
                                Click to open chat
                            </button>
  
                            <ContactOnlyLiveUsers contact={contact} />
   

                            <button onClick={() => addRemoveContact(contact)}>
                                remove contact!
                            </button>


            
            </div> 
            </HashRouter> 
                      
                    )) : ""

   async function addContact(name) {
        
        var tempArr = [localStorage.getItem('username'), name] // CREATE ARRAY TO SORT 
        tempArr.sort();
        console.log("first name second name " + tempArr[0] + tempArr[1]);
        var tableName = tempArr[0] + "$" + tempArr[1];
        const data = "tablename="+tableName; 
        // CALL CREATE TABLE API to create table
        const createTableResult =  await axios.post(API_URL + '/createConversationTable', data); 
        var messageStatus = createTableResult.data.message;
        // ADD THE NEWLY CREATED CONVERSATION ID TO THE MASTER CONVERSATION TABLE 
        const addToConversationTableResult =  await axios.post(API_URL + '/addToConversationsTable', data); 
        var messageStatus = addToConversationTableResult.data.message;
        alert("You are now friends with " + name);
        window.location.reload(false);
        
    }


    async function addRemoveContact(name){
        console.log("i am in addRemoveContatc");
        var tempArr = [localStorage.getItem('username'), name] // CREATE ARRAY TO SORT 
        tempArr.sort();
        console.log("first name second name " + tempArr[0] + tempArr[1]);
        var tableName = tempArr[0] + "$" + tempArr[1];
        const data = "tablename="+tableName; 

        const changeUserContactRemoveResult =  await axios.post(API_URL + '/changeUserContactRemoveStatus', data); 
        var messageStatus = changeUserContactRemoveResult.data.message;
        console.log("tried changing user remove and " + messageStatus); 
        setSearchRemovedContact("");
        alert('done');
        window.location.reload(false);
    }
                  
    const onClickUserProfilePage = () => {
          console.log(props);
          props.history.push("/Main");
    };

    const actualTwilioConnect = async (contact, socketRef)=>{
            TwilioDevice.connect({To: `${contact}`, senderUsername:`${localStorage.getItem('username')}`})
            setCaller(localStorage.getItem('username'))
            setCallee(contact)
            socketRef.current.emit('sendCallerId',{callerId:`${localStorage.getItem('username')}`, room:`${contact}_updates`})

    }
    const [callContact, setCallContact] = useState(()=>()=> (alert(`You can\'t call now. Have you switched on your phone mode`)) )
    useEffect(() => {
        //Intitally, we should disallow calls 
        if (TwilioDevice != null){
            setCallContact(()=> (contact) => (actualTwilioConnect(contact, socketRef)))

        }
      },[TwilioDevice]);
       
    // Twilio Call 
    const [token, setToken] = useState(null);
    const [clicked, setClicked] = useState(false);
    const identity = localStorage.getItem('username');
    const inp="username="+identity;

    const handleClick = async () => {
        setClicked(true);
          const tToken =  await axios.post(`${API_URL}/obtainTwilioToken`, inp);
          setToken(tToken.data)
      };


    return (
    <div>

        <button onClick={onClickUserProfilePage}>
        <b>Go to UserProfile Page</b>
      </button>

      {/* Twilio Experiment */}
      <main>
        {!clicked && <button onClick={handleClick}>Connect to Phone</button>}
        {socketCallUpdates} 
        {rejectionCallUpdates}
        <Timer isCallOn={isCallOn}/>
        {token ? <Phone token={token} caller={caller} callee={callee} setCallOn={setCallOn} setTwilioDevice={setTwilioDevice} socketRef={socketRef} setSocketCallUpdates={setSocketCallUpdates} ></Phone> : <p>Loading...</p>}
      </main>
      <div>


        {/* Insert the search component here */}
        <input 
            type="text" 
            name="search_other_contact" 
            onChange={inputOtherUpdate} 
            placeholder="Search for other contacts" 
            value={searchOtherContact}/>
            {/* To replace with margins later instead */}
            <br/>
            <br/>   

      {otherContacts.length ? 
        <ul>
        {otherContacts. filter(contact => contact.toLowerCase().includes(searchOtherContact.toLowerCase()) ).slice(0,5).map(name => (
            <li>
            <p> {name}</p>  
            <button onClick={() => addContact(name)}>
                Click me!
            </button>
            </li>
        ))}
        </ul>
    :
        <p></p>
    }
    </div>
      
            <h1>{localStorage.getItem('username')} Main View</h1>
            <h1> {testExpress} </h1>
            <input 
            type="text" 
            name="search_contact" 
            onChange={inputUpdate} 
            placeholder="Search for my friends" 
            value={searchFriendContact}/>
            <br/>
            <br/>

            <div>{userContacts.length ? outputList : "" } </div> 
            
           <br/> <br/>

        <input 
            type="text" 
            name="search_removed_contact" 
            onChange={inputRemovedContactUpdate} 
            placeholder="Search for Removed contacts" 
            value={searchRemovedContact}
        />
        <br/>
        <br/>  
 
        {  
            
            removedContacts.length && searchRemovedContact.length ? 
                <ul>          
                        {removedContacts. filter(contact => contact.toLowerCase().includes(searchRemovedContact.toLowerCase())).slice(0,5).map(name => (
                            <li>
                            <p> {name}</p>  
                            <button onClick={() => addRemoveContact(name)}>
                                Re-add contact!
                            </button>
                            </li>
                        ))}
                </ul>
                :<p></p>
        }
        </div> 
    )

}

export default withRouter(MainView);
