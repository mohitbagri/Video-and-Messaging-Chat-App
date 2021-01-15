/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react' 
import {useState, useEffect } from 'react'
import axios, {post} from 'axios'
import { API_URL } from './Utils.js';



const ViewStatus =  (props) => {

    const [username, setUsername] =  useState(localStorage.getItem('username'))

    const [contacts, setContacts] = useState([]);

    const [statusList, setStatusList] = useState([])

    const [count, setCount] = useState(0)

    const [postIdArray, setPostIdArray] = useState([])

    const [lengthStatus, setLengthStatus] = useState(null)
    const [showOn, setShowOn] = useState(false)
    // Note we are using seconds here as the counter. Moving it up every 3 seconds
    const [seconds, setSeconds] = useState(0);


    useEffect(async ()=> {
        const contactArray = await axios.post(API_URL + '/GetUserContactArray', `username=${username}`)
        setContacts(contactArray.data)
    },[])
    useEffect(async ()=> {
        let statusArray = await axios.get(API_URL + `/GetStatusList?username=${username}`) //http://localhost:8081/GetStatusList?username=hellomindy
        console.log(statusArray.data.data)
        statusArray = statusArray.data.data;
        setStatusList(statusArray)
        // Strip out the idpostStatus 
        const idPosts = statusArray.map((item)=> item.idpostStatus)
        setPostIdArray(idPosts)

        setLengthStatus(statusArray.length)
        if (statusArray.length > 0){
            setShowOn(true)
        }

        
    },[])

      useEffect(() => {
        let interval = null;
        if (showOn) {
          interval = setInterval(() => {
            setSeconds(seconds => seconds + 1);
          }, 2000);
        } else if (!showOn && seconds !== 0) {
          clearInterval(interval);
        }
        return () => clearInterval(interval);
      }, [showOn, seconds]);

    
      useEffect(async () => {

        if (seconds>=lengthStatus){
            setShowOn(false)
        }
        if (postIdArray[seconds]){
            let idToTrack = postIdArray[seconds]
            // API takes in id and username 
            const updateViewed = await axios.post(API_URL + '/trackViewedStatus', `username=${username}&statusId=${idToTrack}`)


        }
        
      }); 
    let statusOutput = statusList.map((item,k) => {
 
        console.log(item)
        if (item.image == 1){
            return (<div key={item.idPostStatus}> 
                <img src={item.imageLink} alt="User Input" width="500" height="600"/>
                <p>Posted on {new Date(item.timestamp).toLocaleDateString()},{new Date(item.timestamp).toTimeString()} by {item.username}</p>
                <hr></hr>
            </div>)

        }
        else {
            return (
                <div key={item.idPostStatus}> 
                    <p>{item.textstatus}</p>
                    <p>Posted on {new Date(item.timestamp).toLocaleDateString()},{new Date(item.timestamp).toTimeString()} by {item.username}</p>
                    <hr></hr> 
                </div>
            )
        }

    })

    const output  = (<div> <p> That's it. 👏 Please come back again to view new statuses </p> </div>)
        return  (
            <div>
                <h3>Activity Feed for {username} </h3>
                <h5> We have {lengthStatus} updates to show you. </h5> 
                <h5> Every 2 seconds, a new update will be shown</h5>
                <div> 
                {showOn && statusOutput[seconds]}
                {!showOn && output}
                </div>

            </div>
        )

}




 






export default ViewStatus;
