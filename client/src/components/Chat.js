import React, { Component } from "react";
import ReactPlayer from "react-player";
import ReactDOM from 'react-dom';
import { API_URL } from './Utils.js';


 
class Chat extends React.Component {
    constructor(props) {
      super(props);
      this.state = {file: '',imagePreviewUrl: ''};
    }
  
   
    _handleSubmit(e) {
        console.log('handle uploading-', this.state.file);
      e.preventDefault();      
    }
    
  
    _handleImageChange(e) {
        console.log("im in handle image chaneg");
        console.log("my location is " +window.location.href);
      e.preventDefault();
  
      let reader = new FileReader();
      let file = e.target.files[0];
  
      reader.onloadend = () => {
        this.setState({
          file: file,
          imagePreviewUrl: reader.result
        });
      }
  
      reader.readAsDataURL(file)
    }
  
    render() {
      let {imagePreviewUrl} = this.state;
      let $imagePreview = null;
      if (imagePreviewUrl) {
          console.log("imagepreview url is " + imagePreviewUrl.substring(0,25));
          var fileType = imagePreviewUrl.substring(0,25);
          fileType = fileType.split("/")[0];
          console.log("filetype is " + fileType);
          fileType = fileType.split(":")[1];
          console.log("final filetype is  "+ fileType);

          
          if (fileType == "video"){
            $imagePreview = <video width="750" height="500" controls >
            <source src= {imagePreviewUrl} type="video/mp4"/>
            </video>
          }
          if(fileType == "image"){
            $imagePreview = (<img src={imagePreviewUrl} width="100px" height="100px" />);
          }
        

        if (fileType =="audio"){
           $imagePreview = <audio src={imagePreviewUrl} controls />
        }
        

      } else {
        $imagePreview = (<div className="previewText">Please select the file for Preview</div>);
      }
  
      return (
        <div className="previewComponent">
          <form onSubmit={(e)=>this._handleSubmit(e)}>
            <input className="fileInput" 
              type="file" 
              onChange={(e)=>this._handleImageChange(e)} />
            <button className="submitButton" 
              type="submit" 
              onClick={(e)=>this._handleSubmit(e)}>Upload Multimedia file</button>
          </form>
          <div className="imgPreview">
            {$imagePreview}
          </div>
        </div>
      )
    }
  }
 
export default Chat;
