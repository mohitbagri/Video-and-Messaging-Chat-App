/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";

import useChat from "../useChatHook"; /// ??? Need to check if this is working fine
import ReactPaginate from 'react-paginate';
import {useState, useEffect, useStateIfMounted } from 'react'
import axios from 'axios'
import { API_URL } from './Utils.js';

const ChatRoom = (props) => {

    

    const { receiver } = props.match.params;
    const { messages, sendMessage } = useChat(receiver); // Creates a websocket and manages messaging
    const [newMessage, setNewMessage] = React.useState(""); // Message to be sent
    const [callHistory, setCallHistory] = useState('')
    const [messageType, setMessageType] = useState('text');
    const [feedbackMessage, setFeedbackMessage] = useState()


    function updateMessageType(event){
      console.log('updating status type')
      setMessageType(event.target.value)
  }
  // Functions to ensure we have the right file format for messages 
  function confirmImageType(filename){
    const [extension, ...nameParts] = filename.split('.').reverse();
    const imageFileTypes = ['png','img','jpeg','jpg']
    if (imageFileTypes.includes(extension.toLowerCase())){
        return true
    }
    else {
        alert('Sorry, only jpeg/jpg/png files are accepted')
        return false
    }
}
function confirmVideoType(filename){
  const [extension, ...nameParts] = filename.split('.').reverse();
  const videoFileTypes = ['mp4','avi']
  if (videoFileTypes.includes(extension.toLowerCase())){
      return true
  }
  else {
      alert('Sorry, only mp4/avi files are accepted')
      return false
  }
}
function confirmAudioType(filename){
  const [extension, ...nameParts] = filename.split('.').reverse();
  const videoFileTypes = ['mp3']
  if (videoFileTypes.includes(extension.toLowerCase())){
      return true
  }
  else {
      alert('Sorry, only mp3 files are accepted')
      return false
  }
}

// Code to post ImageMessage
function PostImageMessage(){
  const [selectedFile, setSelectedFile] = useState()
  const [preview, setPreview] = useState()

  useEffect(() => {
      if (!selectedFile) {
          setPreview(undefined)
          return
      }

      const objectUrl = URL.createObjectURL(selectedFile)
      setPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])
  const onSelectFile = e => {
      // Going to check for the image file type here to prevent wrong
      // file types from being accepted
      const imageType = confirmImageType(e.target.files[0].name)

      if (!e.target.files || e.target.files.length === 0 || !imageType) {
          setSelectedFile(undefined)
          return
      }

      setSelectedFile(e.target.files[0])

  }


  async function onImageUpload(e){

      e.preventDefault() // Stop form submit
      const url = `${API_URL}/genericFileUpload`; //Need to update this
      const formData = new FormData();
      formData.append('image',selectedFile); // Think this needs to be in sync
      formData.append('username', localStorage.getItem('username'));

      const config = {
          headers: {
              'content-type': 'multipart/form-data'
          }
      }
      const response = await axios.post(url, formData, config); // Need to get the url and save it
      const imageMessage = response.data; // This has the link  //Now we need a way to send it
      sendMessage(imageMessage);
      setSelectedFile(undefined)
      setPreview(undefined)
      setFeedbackMessage(response.data.message)
    }
  return  (
      <div>
          <div>
          <form onSubmit={onImageUpload} > 
              <input type='file' onChange={onSelectFile} />
              {selectedFile &&  <img style={{width: 300, height: 300}} src={preview} alt='Upload Preview' /> }
              { preview && <button type="submit" >Upload</button> }
          </form>
          </div>
      </div>
  )

}

function PostVideoMessage(){
  // Credit to https://stackoverflow.com/questions/38049966/get-image-preview-before-uploading-in-react 
  const [selectedFile, setSelectedFile] = useState()
  const [preview, setPreview] = useState()

  useEffect(() => {
      if (!selectedFile) {
          setPreview(undefined)
          return
      }

      const objectUrl = URL.createObjectURL(selectedFile)
      setPreview(objectUrl)

      // free memory when ever this component is unmounted
      return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])
  const onSelectFile = e => {
      // Going to check for the image file type here to prevent wrong
      // file types from being accepted
      const videoType = confirmVideoType(e.target.files[0].name)

      if (!e.target.files || e.target.files.length === 0 || !videoType) {
          setSelectedFile(undefined)
          return
      }

      setSelectedFile(e.target.files[0])

  }


  async function onVideoUpload(e){

      e.preventDefault() // Stop form submit
      const url = `${API_URL}/genericFileUpload`; //Need to update this
      const formData = new FormData();
      formData.append('image',selectedFile); // (this is just the label)
      formData.append('username', localStorage.getItem('username'));

      const config = {
          headers: {
              'content-type': 'multipart/form-data'
          }
      }
      const response = await axios.post(url, formData, config); // Need to get the url and save it
      // const expectedSuccessMessage = "We have saved your profile image";
      const videoMessage = response.data; // This has the link  //Now we need a way to send it
      sendMessage(videoMessage);
      setSelectedFile(undefined)
      setPreview(undefined)
      setFeedbackMessage(response.data.message);
    }
  return  (
      <div>
          <div>
          <form onSubmit={onVideoUpload} > 
              <input type='file' onChange={onSelectFile} />
              {selectedFile &&  <video  controls style={{width: 200, height: 200}} src={preview} alt='Upload Preview' /> }
              { preview && <button type="submit" >Upload</button> }
          </form>
          </div>
      </div>
  )

}

function PostAudioMessage(){
  const [selectedFile, setSelectedFile] = useState()
  const [preview, setPreview] = useState()

  useEffect(() => {
      if (!selectedFile) {
          setPreview(undefined)
          return
      }

      const objectUrl = URL.createObjectURL(selectedFile)
      setPreview(objectUrl)


      // free memory when ever this component is unmounted
      return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])
  const onSelectFile = e => {
      // Going to check for the image file type here to prevent wrong
      // file types from being accepted
      const audioType = confirmAudioType(e.target.files[0].name)

      if (!e.target.files || e.target.files.length === 0 || !audioType) {
          setSelectedFile(undefined)
          return
      }

      setSelectedFile(e.target.files[0])

  }


  async function onAudioUpload(e){

      e.preventDefault() // Stop form submit
      const url = `${API_URL}/genericFileUpload`; //Need to update this
      const formData = new FormData();
      formData.append('image',selectedFile); // (this is just the label)
      formData.append('username', localStorage.getItem('username'));

      const config = {
          headers: {
              'content-type': 'multipart/form-data'
          }
      }
      const response = await axios.post(url, formData, config); // Need to get the url and save it
      console.log(`Check out the ${response}`)
      const audioMessage = response.data; // This has the link  //Now we need a way to send it
      sendMessage(audioMessage); 
      setSelectedFile(undefined)
      setPreview(undefined)
      setFeedbackMessage(response.data.message)
    }
  return  (
      <div>
          <div>
          <form onSubmit={onAudioUpload} > 
              <input type='file' onChange={onSelectFile} /> 
              {selectedFile &&  <audio controls src={preview}/> }
              { preview && <button type="submit" > Upload</button> }
          </form>
          </div>
      </div>
  )

}

    useEffect(async ()=> { 
 

      const callRecords = await axios.get(`${API_URL}/getCallHistory?data=${receiver}`);
      await console.log('Printing out the call callrecords')
      await console.log(callRecords)
      await console.log(callRecords['data']['data'])
      await console.log('Done printing')

      let callHistoryList = callRecords.data.data.map((item, key)=>{ 
        return <li key={key}> {item.callerUser} | {item.calleeUser} | {item.callStatus} | On {new Date(item.callTime).toLocaleDateString()} at {new Date(item.callTime).toLocaleTimeString()}   </li>

      })
      await setCallHistory(callHistoryList)

    },[])

    const handleNewMessageChange = (event) => {
        console.log("inside handleNewMessageChange");
        setNewMessage(event.target.value);
      };

      const handleSendMessage = () => {
        console.log("inside handleSendMessage");
        sendMessage(newMessage);
        setNewMessage("");
      };
     
      const [offset, setOffset] = useState(0);
      const [data, setData] = useState([]);
      const [perPage] = useState(5);
      const [pageCount, setPageCount] = useState(0);

      const getData = async() => {
            var information = JSON.parse(JSON.stringify(messages));
            information = information.reverse();
            const slice = information.slice(offset, offset + perPage)      
            const postData = slice.map((message, i) => (
                <li
                key={i}
                className={`message-item ${
                    message.ownedByCurrentUser ? "my-message" : "received-message"
                }`}
                >

                <PrintUserSender message={message} />
                <button onClick={() => deleteMessage(message.MessageId)}>
                                    Delete message!
                                </button>
                </li>
            ));

            setData(postData)
            setPageCount(information.length - perPage + 1);
        }
        const handlePageClick = (e) => {
        const selectedPage = e.selected;
        
        setOffset(selectedPage);
        
    };     
    
    useEffect(async() =>{

        getData();

    }, [messages]);

    useEffect(async () => {
        if (messages.length > 1){
            console.log("printing latest msg "+ messages[messages.length-1].body);
        }
       
        getData();

    },[offset]);

    const PrintUserSender = (message) => {

          const currentMessage = message.message;
          let [extension, ...nameParts] = currentMessage.body.split('.').reverse();
          extension = extension.toLowerCase();

          let output = currentMessage.body;
          if (extension =='png' || extension== 'jpeg' || extension=='jpg'){
            output = (<img src={currentMessage.body} alt="userinputted" width="200" height="200"/>)
          }

          else if (extension == 'mp3'){
            output = (<audio controls src={currentMessage.body} />)
          }
          else if (extension == 'mp4' || extension == 'avi'){
            output = (<video controls src={currentMessage.body} width="200" height="200" />)
          }

          if (currentMessage.ownedByCurrentUser === true){
              return (<div> You: {output} </div>)

          }
          else {
              return (<div> {currentMessage.senderUsername}: {output} </div>)

          }

      }
      function MessageInputForm(){
        if(messageType === 'text'){
          return(
            <div>
              <textarea
              value={newMessage}
              onChange={handleNewMessageChange}
              placeholder="Write message..."
              className="new-message-input-field"
            />
            <button onClick={handleSendMessage} className="send-message-button">
              Send
            </button>
          </div>
          )
        }
        else if (messageType === 'image'){
          return <PostImageMessage/>

        }
        else if (messageType === 'video'){
          return <PostVideoMessage/>
        }
        else if (messageType === 'audio'){
          return <PostAudioMessage/>
        }
        else {
          return (<div>Space to enter the other sections </div>)
        }
      }
      
      async function deleteMessage(id){
          var tableName = receiver;
          var messageId = id;
          console.log("this is msg id "+ id);

          const data = "tablename="+tableName+"&messageId="+messageId; 

          const result =  await axios.post(`${API_URL}/deleteMessage`, data);
        
          console.log("this is delete result " + result.data.message);
          if(result.data.message === "Success"){
            window.location.reload(false);
            console.log("success");
          }

      }


      async function deleteConversation(tablename){
       
        console.log(" i am in delete conversation "+ tablename);
        const data = "tablename="+tablename; 

        const result =  await axios.post(`${API_URL}/deleteConversation`, data);
        if(result.data.message === "Success"){
          alert('you have deleted your conversation successfully');
          window.location.reload(false);
          console.log("success");
        }

    }

    console.log("tracing ");

      return (
        <div className="chat-room-container">
        <h1 className="room-name">Room: {receiver}</h1>
        
        <button onClick={() => deleteConversation(receiver)}>
                                Delete conversation!
        </button>

        <br/>
        <br/>  

        <div className="messages-container">
            
            {data}
          <ReactPaginate
                    previousLabel={"prev"}
                    nextLabel={"next"}
                    breakLabel={"..."}
                    breakClassName={"break-me"}
                    pageCount={pageCount}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={handlePageClick}
                    containerClassName={"pagination"}
                    subContainerClassName={"pages pagination"}
                    activeClassName={"active"}/>
            
             
                   
        </div>
        <form> 
            <div className="form-check">
                <label>
                    <input
                        type="radio"
                        name="statusChoice"
                        value="text"
                        checked={messageType === 'text'} 
                        onChange= {updateMessageType}
                        className="form-check-input"
                    />
                    📝
                </label>
                <label>
                    <input
                        type="radio"
                        name="statusChoice"
                        value="image"
                        checked={messageType === 'image'} 
                        onChange= {updateMessageType}
                        className="form-check-input"
                    />
                     📸 
                </label>
                {/* An issue to be resolved is that input focus is lost on each character input */}
                <label> 
                    <input
                        type="radio"
                        name="statusChoice"
                        value="video"
                        checked={messageType === 'video'} 
                        onChange= {updateMessageType}
                        className="form-check-input" 
                    />
                     📹
                </label>
                <label>
                    <input
                        type="radio"
                        name="statusChoice"
                        value="audio"
                        checked={messageType === 'audio'} 
                        onChange= {updateMessageType}
                        className="form-check-input"
                    />
                     🔊
                </label>

        </div>
      </form>
      {feedbackMessage}
      <MessageInputForm/>



        <div>
          <h4>Call History</h4>
          <div> 
            <li>Caller | Callee | Status | Time </li>
            <hr></hr>
            {callHistory}

          </div>
        </div>
      </div>




      )

}

export default ChatRoom;
