import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";
import axios from 'axios';
import { API_URL } from './components/Utils.js';


const NEW_CHAT_MESSAGE_EVENT = "newChatMessage"; // Name of the event
const SOCKET_SERVER_URL = API_URL;  // ??? Potential heroku issue

const useChat = (receiver) => {
    const [messages, setMessages] = useState([]); // Sent and received messages
    const socketRef = useRef();

    // Intervention to get the first tranch of data 
    // ??? Solve this async issue later. I am using it because I dislike using then
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect( async () => {
        console.log('First Data Fetch')
        console.log(receiver)
        console.log("right before api");
        /*
        let getPastMessages = await axios.get('http://localhost:8081/getChatMessages', { params: { chatRoomName: receiver } }); //??Receiver is a terrible name btw
        console.log("right after api");
        */
        let getPastMessages = await axios.get(API_URL + '/getChatMessages', { params: { chatRoomName: receiver } }); //??Receiver is a terrible name btw
        const pastRawMessages = getPastMessages.data.data;
        const currentUser = localStorage.getItem('username');
        let targetUser = ''
        let receiverUsername = ''
        const splitWords = receiver.split('$')
        let user1 = splitWords[0]
        let user2 = splitWords[1]
        
        if (user1 == currentUser){
          targetUser = user2
        }
        else {
          targetUser = user1
        }
        let pastProcessedMessages = []
        console.log("middle of use effect 1");
        for (let m of pastRawMessages) {
            // code block to be executed
            let processedMessage = Object.create( {} );
            processedMessage.MessageId = m.MessageId; 
            processedMessage.body = m.message;
            processedMessage.chatroom = receiver;
            processedMessage.senderUsername = m.sender;
            if (m.sender === currentUser){
                processedMessage.ownedByCurrentUser = true;
            }
            else {
                processedMessage.ownedByCurrentUser = false;
            }
            pastProcessedMessages.push(processedMessage);
          }
          setMessages((messages) => pastProcessedMessages);
          //console.log("isnide usefeect 1 pringting messages" + messages);
          console.log("inside useffect 1");
          setMessages(pastProcessedMessages);



    
        
//         body: "jkhgfghjg"
// chatroom: "hellomindy$username1"
// ownedByCurrentUser: true
// senderId: "Zf9w4pvUJKnbLurHAAA-"
// senderUsername: "username1"

//         MessageId: 1
// message: "aadasda"
// receiver: "hellomindy"
// sender: "username1"

    },[]) // ?? INTERVENTION : REMOVED [] 
  
    useEffect(  async () => {

        console.log("inside useffect 2");

      // Creates a WebSocket connection
      socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
        query: { receiver },
      });
    
      // Listens for incoming messages
      socketRef.current.on(NEW_CHAT_MESSAGE_EVENT, (message) => {
          console.log("incoming msg" + message);
        const incomingMessage = {
          ...message,
          ownedByCurrentUser: message.senderId === socketRef.current.id,
        };
        console.log(incomingMessage)
        setMessages((messages) => [...messages, incomingMessage]);
      });
      
      // Destroys the socket reference
      // when the connection is closed
      return () => {
        socketRef.current.disconnect();
      };
    }, [receiver]);

    console.log("reciever is  " + receiver);
    // Sends a message to the server that
    // forwards it to all users in the same room
    // ??? This where we need to save to the database as well 
    
    const sendMessage = (messageBody) => {
      socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, {
        
        body: messageBody,
        senderId: socketRef.current.id,
        senderUsername: localStorage.getItem('username'),
        chatroom: receiver

      });
      // This is where I think we need to save to mySQL
    };

    return { messages, sendMessage };

};

    export default useChat;