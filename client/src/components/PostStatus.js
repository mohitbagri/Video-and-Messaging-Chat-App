

import React from 'react' 
import {useState, useEffect } from 'react'
import axios, {post} from 'axios'
import { API_URL } from './Utils.js';


const PostStatus = (props) => {
    const [statusType, setStatusType] = useState('text');
    const [thisUser, setThisUser] = useState(localStorage.getItem('username'));
    const [feedbackMessage, setFeedbackMessage] = useState()
    console.log(props.twilioToken)

    const testSubmit = async () => {
        var username = localStorage.getItem('username')
        var status = document.getElementById("status").value;
        const data = "username="+username+"&status="+status; 
        const result = await axios.post(API_URL + '/postStatus', data)
        console.log('Printing result from Test Submit')
        console.log(result)
    }

    function PostTextStatus(){  
       return  (<form>
        <div className="form-group">
        <div className="form-group">
            <label>Status </label>
            <input type="status" id="status" className="form-control" placeholder=" Enter Status" />
        </div>
        </div>
        <button onClick={()=> testSubmit()}> Post Status </button>
    </form>)
    }
    function confirmImageType(filename){
        const [extension, ...nameParts] = filename.split('.').reverse();
        const imageFileTypes = ['png','img','jpeg']
        if (imageFileTypes.includes(extension.toLowerCase())){
            return true
        }
        else {
            alert('Sorry, only img/jpeg/png files are accepted')
            return false
        }
    }

    function PostImageStatus(){
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
            const url = API_URL + '/postImageStatus';
            const formData = new FormData();
            formData.append('image',selectedFile);
            formData.append('username', thisUser);

            const config = {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            }
            const response = await axios.post(url, formData, config);
            const expectedSuccessMessage = "We have saved your profile image";
            if(response.data.message == expectedSuccessMessage) {
                // Now we will refresh the page 
                setSelectedFile(undefined)
                setPreview(undefined)
                setFeedbackMessage(response.data.message)

            }
            else {
                setFeedbackMessage(response.data.message)
            }
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

    function ShowStatusForm(){
        if (statusType=='text'){
            return <PostTextStatus/>
        }
        else {
            return <PostImageStatus/>
        }


    }

    function updateStatusType(event){
        console.log('updating status type')
        setStatusType(event.target.value)
    }
    function StatusTypePicker(){
        return (
        <form> 
            <div className="form-check">
                <label>
                    <input
                        type="radio"
                        name="statusChoice"
                        value="text"
                        checked={statusType === 'text'} 
                        onChange= {updateStatusType}
                        className="form-check-input"
                    />
                    📝
                </label>
                <label>
                    <input
                        type="radio"
                        name="statusChoice"
                        value="image"
                        checked={statusType === 'image'} 
                        onChange= {updateStatusType}
                        className="form-check-input"
                    />
                     📸
                </label>
        </div>
      </form>
        )
    }



    return (
        <div>
            <h1>Post Status View</h1>
            <h4>Post a Status</h4>
            <h5> Choose Between a Text or Image Status </h5>
            <h5>{feedbackMessage}</h5> 
            <StatusTypePicker/>
            {/* Based on the status type the user will be shown the right form */}
            <ShowStatusForm/>

        </div> 
    )

}

export default PostStatus;
