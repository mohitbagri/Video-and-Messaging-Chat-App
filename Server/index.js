const express = require('express')
const path = require('path')
const cors = require('cors')
const mysql = require('mysql');
const util = require('util') // This is need to promisify mysql
const bcrypt = require('bcrypt')
const multer = require('multer')
const multerS3 = require('multer-s3')
const aws = require('aws-sdk')
const axios = require('axios')
const { VoiceResponse } = require("twilio").twiml;
const ClientCapability = require('twilio').jwt.ClientCapability
const saltRounds = 10;


const filter = require('./multimediaFilters');

const maxImageSize = 100 * 1000  * 1000 // 
const maxAudioSize = 100 * 1000 * 1000 
const maxVideoSize = 100 * 1000 * 1000 

let mySQLConfig  = {
  connectionLimit: 10,
  host: 'hostname',
  user: 'admin',
  password: 'password',
  database:'db'
}

const s3 = new aws.S3({
  accessKeyId: 'key',
  secretAccessKey: 'key'
})

const webapp = express();

const socket = require('socket.io')

webapp.use(cors())  
webapp.use(express.static(path.join(__dirname, 'build')))


const bodyParser = require('body-parser');
const { send } = require('process');
const { table } = require('console');
const port = process.env.PORT || 8081;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8081"

webapp.use(bodyParser.urlencoded({
  extended: true,
}));
webapp.use(express.json())

webapp.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

const server = webapp.listen(port, () => {
  console.log(`Server running on port:${port}`);
});

const io = socket(server, {
  cors: {
    origin: '*',
  }
});

webapp.get('/', (req, res) => res.send('Hey there!'))

webapp.post('/addUser', async (req,res)=> {
  let pool = mysql.createConnection(mySQLConfig);
  pool.query = util.promisify(pool.query);

  let username = req.body.username; 
  let password = req.body.password;
  let SecurityQuestion = req.body.SecurityQuestion;
  console.log("this is securtiy Question "+ SecurityQuestion);
  if (password.length < 6){
    const endIt = await pool.end();
    return res.status(405).json({message: 'Failure', error: 'Password is less than 6 characters'})
  }
  let checkIfUserExists = await pool.query(`SELECT * FROM userRegistration WHERE username=?`,[username]);
  if (!checkIfUserExists.length) {
    let pool = mysql.createConnection(mySQLConfig);
    pool.query = util.promisify(pool.query)
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const registrationTime = Date.now();
    try {
    let addUserQuery = await pool.query(`INSERT INTO userRegistration (username, password, registrationTime, SecurityQuestion) VALUES (?,?,?,?)`, [username, hashedPassword, registrationTime, SecurityQuestion])
    let addToProfile = await pool.query(`INSERT into userProfile (user) VALUES (?)`,[username]);
    const data = {username, registrationTime}
     return res.status(200).json({message: 'Success',data: data})
    }
    catch (e) {
     return res.status(400).json({message:'Failure', error: e})
    }
    finally {
      const endIt = await pool.end();

    }
    
  }
  else {
    res.status(400).json({message: 'Failure', error: 'Sorry, this username has been taken'});
  }
})


webapp.post('/loginUser', async (req,res)=> {
  let pool = mysql.createConnection(mySQLConfig);
  pool.query = util.promisify(pool.query);
  const username = req.body.username;
  const password = req.body.password;
  // Check if the user exists first 
  // Check if the username is unique. If not send an error message 
    let checkIfUserExists = await pool.query(`SELECT * FROM userRegistration WHERE username=?`,[username]);
    if (!checkIfUserExists.length){
      const endIt = await pool.end();
      return res.json({message: 'Failure', error: 'This user does not exist. Please sign up'});
    }
  // Check if the user has had more than 3 failed attempts in the last 30 mins 
  const currentTime = Date.now();
  const thirtyMinsBack = currentTime - 1*60000;

  let failedAttemptsLastThirtyMins = await pool.query(`SELECT COUNT(*) FROM signUpAttempts WHERE username=? AND successful=0 AND attemptTime > ?`,[username, thirtyMinsBack])
  failedAttemptsLastThirtyMins=JSON.parse(JSON.stringify(failedAttemptsLastThirtyMins))[0]['COUNT(*)']
  console.log("failed attempts "+ failedAttemptsLastThirtyMins);
  if (failedAttemptsLastThirtyMins > 3){
    const endIt = await pool.end();
    return res.json({message: 'Locked out', error: 'Too many unsuccessful attempts in the last 30 mins. Please try again later'});

  }
  else {
    // Check if the password is valid. If valid, log him in. Otherwise, send an error message
    // Let's obtain the hashpassword from the userRegistration Table 
    let hashedPassword = await pool.query(`SELECT password FROM userRegistration WHERE username=?`,[username]);
    hashedPassword = JSON.parse(JSON.stringify(hashedPassword))[0]['password']
    const match = await bcrypt.compare(password, hashedPassword);

    if (match){
      let addSignUpAttempt = await pool.query(`INSERT INTO signUpAttempts VALUES (?,?,?)`,[username,currentTime,1])
      // ?? This is where we might need a success JWT token to be sent
      const data = {username};
      const endIt = await pool.end();
      return res.json({message: 'Success', data});
    }
    else {
      // Add to the signedUp Attempt now 
      let addSignUpAttempt = await pool.query(`INSERT INTO signUpAttempts VALUES (?,?,?)`,[username,currentTime,0])
      const endIt = await pool.end();
      return res.json({message: 'Failure', error: 'The password you entered doesn\'t match'});
    }
  }
})



webapp.post('/validateSecurityQuestion', async (req,res)=> {
    let pool = mysql.createConnection(mySQLConfig);
    pool.query = util.promisify(pool.query);
    const username = req.body.username;
    const SecurityQuestion = req.body.SecurityQuestion;  
        try {
            let checkSecurityQuestionQuery = await pool.query(`
            select count(*) from userRegistration where username = ? and SecurityQuestion = ?`
            ,[username, SecurityQuestion]);
            const data = {username};
            checkSecurityQuestionQuery=JSON.parse(JSON.stringify(checkSecurityQuestionQuery))[0]['count(*)']
            if (checkSecurityQuestionQuery > 0){
                res.status(200).json({message: 'Success', data})

            }
            else{
                res.status(200).json({message: 'Failure', data})
            }
        }
            catch (e) {
            res.status(400).json({message:'Security Question not valid', error: e})
            }
            finally {
              const endIt = await pool.end();
        
            }
})

webapp.post('/checkConversationsTable', async (req,res)=> {
    let pool = mysql.createConnection(mySQLConfig);
    pool.query = util.promisify(pool.query);
    const tablename = req.body.tablename;    
        try {
            let checkMessageQuery = await pool.query(`SELECT COUNT(*) as cnt FROM Conversations WHERE cId=?`,[tablename])
            res.status(200).json({message: 'Success',data: checkMessageQuery[0].cnt})
            }
            catch (e) {
            res.status(400).json({message:'Table does not exist', error: e})
            }
            finally {
              const endIt = await pool.end();
        
            }
})


webapp.post('/addToConversationsTable', async (req,res)=> {
    let pool = mysql.createConnection(mySQLConfig);
    pool.query = util.promisify(pool.query);
    const tablename = req.body.tablename;    
    let currTime =   Date.now();
    let contactRemoved ='No';
        try {
            let addMessageQuery = await pool.query(`insert into Conversations values (?,?,?) `,[tablename,contactRemoved,currTime]);
            const data = {tablename};
            res.json({message: 'Successfully added to Conversations table',data: data})
            }
            catch (e) {
            res.status(400).json({message:'Could not add to Conversations table', error: e})
            }
            finally {
              const endIt = await pool.end();
        
            }
})






webapp.post('/createConversationTable', async (req,res)=> {
    let pool = mysql.createConnection(mySQLConfig);
    pool.query = util.promisify(pool.query);
    const tablename = req.body.tablename;    
        try {
            let checkMessageQuery = await pool.query(`create table ?? 
            (MessageId MEDIUMINT NOT NULL AUTO_INCREMENT,
                sender CHAR(30) NOT NULL,
                receiver CHAR(30) NOT NULL,
                message CHAR(200),
                PRIMARY KEY (MessageId)); `,[tablename])
            const data = {tablename}
            res.json({message: 'Success',data: data})
            }
            catch (e) {
            res.status(400).json({message:'Could not create table', error: e})
            }
            finally {
              const endIt = await pool.end();
        
            }
})


webapp.post('/changeAccountStatus', async (req,res)=> {
    let pool = mysql.createConnection(mySQLConfig);
    pool.query = util.promisify(pool.query);
    const username = req.body.username;    
        try {
            let checkMessageQuery = await pool.query(`UPDATE userRegistration 
            SET AccountStatus = IF(AccountStatus='Active', 'Inactive', 'Active') where username=?;
            `,[username])
            const data = {username}
            res.json({message: 'Success',data: data})
            }
            catch (e) {
            res.json({message:'Could not change account status', error: e})
            }
            finally {
              const endIt = await pool.end();
        
            }
})

webapp.post('/addMessage', async (req,res)=> {
    let pool = mysql.createConnection(mySQLConfig);
    pool.query = util.promisify(pool.query);
    const sender = req.body.sender;
    const receiver = req.body.receiver;
    const message = req.body.message;
    const tablename = req.body.tablename || (sender + '$' + receiver); ///???Intervention A

    let currTime =  Date.now();
        try {

            let updateConversationLastInteractionTime = await pool.query(`update Conversations SET LastInteractionTime = ? where cID= ?`,[currTime, tablename]);

            let addMessageQuery = await pool.query(`INSERT INTO ?? (sender, receiver, message) VALUES (?,?,?)`,[tablename,sender,receiver,message])
            const data = {sender, receiver,message}
            res.json({message: 'Success',data: data})
            }
            catch (e) {
            res.status(200).json({message:'Failure', error: e})
            }
            finally {
              const endIt = await pool.end();
        
            }
})


webapp.post('/deleteMessage', async (req,res)=> {
    let pool = mysql.createConnection(mySQLConfig);
    pool.query = util.promisify(pool.query);
    const tablename = req.body.tablename;
    const messageId = req.body.messageId;    
        try {

            let deleteMessage = await pool.query(`delete from ?? where MessageId = ?`,[tablename, messageId]);
            const data = {tablename}
            res.json({message: 'Success',data: data})
            }
            catch (e) {
            res.json({message:'Failure', error: e})
            }
            finally {
              const endIt = await pool.end();
        
            }
})

webapp.post('/deleteConversation', async (req,res)=> {
    let pool = mysql.createConnection(mySQLConfig);
    pool.query = util.promisify(pool.query);
    const tablename = req.body.tablename;
 
    console.log("inside delete conversation api  "+ tablename);
    
        try {

            let deleteMessage = await pool.query(`truncate table ?? `,[tablename]);
            const data = {tablename}
            res.json({message: 'Success',data: data})
            }
            catch (e) {
            res.json({message:'Failure', error: e})
            }
            finally {
              const endIt = await pool.end();
        
            }
})

// Fetch the relevant chat information 
// MessageID, sender, receiver, message

  webapp.get('/getChatMessages', async(req,res)=>{
    try {
      let pool = mysql.createConnection(mySQLConfig);
      pool.query = util.promisify(pool.query);
      const chatRoomName = req.query.chatRoomName;
      let chatMessages = await pool.query(`SELECT MessageId,sender,receiver,message FROM ??;`,[chatRoomName]);
      chatMessages = JSON.parse(JSON.stringify(chatMessages))
      const endIt = await pool.end();
      return res.status(200).json({message: 'Success', data: chatMessages})
      
    }
    catch(e){
      console.log(e)
      return res.status(500).json({message: 'Failure', data: []})

    }

  })


  webapp.post('/getAccountStatus', async(req,res)=>{
    try {
        let pool = mysql.createConnection(mySQLConfig);
        pool.query = util.promisify(pool.query);
        const username = req.body.username;
        let AccountStatus = await pool.query(`select AccountStatus from userRegistration where username = ?`,[username]);
        const endIt = await pool.end();
        return res.status(200).json({message: 'Success', data: AccountStatus[0].AccountStatus})
      
    }
    catch(e){
      console.log(e)
      return res.status(500).json({message: 'Failure', data: []})

    }

  })



webapp.post('/FetchUserContacts', async (req,res)=> {
    console.log('inside 364')
    console.log(req.body.username)
    let pool = mysql.createConnection(mySQLConfig);
    pool.query = util.promisify(pool.query);
    const usernamePrefix = req.body.username + "%";
    const usernameSuffix = "%" + req.body.username;    

        try {
            let fetchUserContactsQuery = await pool.query
            (
                `select cID from Conversations where cID in 
                    (
                        select concat(username,REPLACE(?,'%','$')) as cID from userRegistration where username in
                        (select SUBSTRING_INDEX(cID,'$',1) as firstname from Conversations where cID like ?)
                    
                        UNION 

                        select concat(REPLACE(?,'%','$'),username) as cID from userRegistration where  username in
                        (select SUBSTRING_INDEX(cID,'$',-1) as firstname from Conversations where cID like ?)
                    )
                and ContactRemoved= 'No' order by LastInteractionTime DESC`,
            [usernameSuffix, usernameSuffix, usernamePrefix, usernamePrefix]

            )
           var objs = [];
           for (var i = 0;i < fetchUserContactsQuery.length; i++) {
               objs.push({cID: fetchUserContactsQuery[i].cID});
           }
           return res.json({message:'success contact feteching' , data: objs})
            
            }
            catch (e) {
            res.json({message:'Error', error: e})
            }
            finally {
              const endIt = await pool.end();
        
            }
})

webapp.post('/GetUserContactArray', async(req,res)=> {
  const username = req.body.username;
  let userInput = `username=${username}`

  let rawData = await axios.post(API_URL + '/FetchUserContacts', userInput)
  // Need to have some validation if time is available 
  rawData = rawData.data.data
  let contacts = new Set()

  for (let i=0; i<rawData.length; i++){
    let phrase = rawData[i].cID
    let splitWords = phrase.split('$')
    let user1 = splitWords[0]
    let user2 = splitWords[1]
    if (user1 != username){
      contacts.add(user1)
    }
    if (user2 != username){
      contacts.add(user2)
    }


  }
  contacts = Array.from(contacts)
  res.send(contacts)

  
})

webapp.get('/GetStatusList', async(req,res)=> {
  const username = req.query.username;
  let userInput = `username=${username}`
  let pool = mysql.createConnection(mySQLConfig);
  pool.query = util.promisify(pool.query);
  let contacts = await axios.post(API_URL + '/GetUserContactArray', userInput)
  contacts = contacts.data
  try {
    let fullStatusFeed = await pool.query(`SELECT * FROM postStatus WHERE username in (?) AND idpostStatus NOT IN (SELECT statusId from trackStatus where username=?) ;
    `,[contacts,username]);
    console.log(fullStatusFeed)
    fullStatusFeed = await JSON.parse(JSON.stringify(fullStatusFeed))
    res.json({message:'Success' , data: fullStatusFeed})

  }
  catch(e){
    res.json({message:'Error', error: e})

  }
  finally {
    const endIt = await pool.end();
  }
})

// API to track what has been viewed 

webapp.post('/trackViewedStatus', async(req,res)=> {
  const username = req.body.username;
  const statusId = req.body.statusId; 
  let pool = mysql.createConnection(mySQLConfig);
  pool.query = util.promisify(pool.query); 

  try {
    let trackStatus = await pool.query(`INSERT INTO trackStatus (username, statusId) VALUES (?,?)`, [username, statusId]);
    res.json({message:'Success'})

  }
  catch(e){
    res.json({message:'Error', error: e})
  }
  finally {
    const endIt = await pool.end();
  }
})

webapp.post('/FetchUserRemovedContacts', async (req,res)=> {
    let pool = mysql.createConnection(mySQLConfig);
    pool.query = util.promisify(pool.query);
    const usernamePrefix = req.body.username + "%";
    const usernameSuffix = "%" + req.body.username;    
        try {
            let fetchUserContactsQuery = await pool.query
            (
                `
                    (select SUBSTRING_INDEX(cID,'$',1) as username from Conversations where cID like ? and ContactRemoved ='Yes' )
                    
                UNION 

                    (select SUBSTRING_INDEX(cID,'$',-1) as username from Conversations where cID like ? and ContactRemoved ='Yes')
                  `,
            [usernameSuffix, usernamePrefix]

            )
           var objs = [];
           for (var i = 0;i < fetchUserContactsQuery.length; i++) {
               objs.push({username: fetchUserContactsQuery[i].username});
           }
           return res.json({message:'Success' , data: objs})
            
            }
            catch (e) {
            res.json({message:'Error', error: e})
            }
            finally {
              const endIt = await pool.end();
        
            }
})


webapp.post('/changeUserContactRemoveStatus', async (req,res)=> {
    let pool = mysql.createConnection(mySQLConfig);
    pool.query = util.promisify(pool.query);
    const tablename = req.body.tablename;    
    console.log("inside changeUserContactRemoveStatus api " + tablename);

        try {
            let checkMessageQuery = await pool.query(`UPDATE Conversations 
            SET ContactRemoved = IF(ContactRemoved='No', 'Yes', 'No') where cID=?;
            `,[tablename])
            const data = {tablename}
            res.json({message: 'Success',data: data})
            }
            catch (e) {
            res.status(400).json({message:'Could not change account status', error: e})
            }
            finally {
              const endIt = await pool.end();
        
            }
})


webapp.post('/FetchAllOtherContacts', async (req,res)=> {
    let pool = mysql.createConnection(mySQLConfig);
    pool.query = util.promisify(pool.query);
    let lor_text_Array = req.body.contacts.split(",");
    let lor_in_list = lor_text_Array.map(function (a) { return "'" + a.replace("'", "''") + "'"; }).join();
        try {
           let fetchAllOtherContactsQuery = await pool.query(`select username from userRegistration where username not in (${lor_in_list}) and AccountStatus ='Active' ORDER BY RAND()`);          
           var objs = [];
           for (var i = 0;i < fetchAllOtherContactsQuery.length; i++) {
               objs.push({username: fetchAllOtherContactsQuery[i].username});
           }
           return res.json({message:'success contact all other feteching' , data: objs})
            
            }
            catch (e) {
            res.json({message:'Error fetching user contacts from Conversations table', error: e})
            }
            finally {
              const endIt = await pool.end();
        
            }
})
webapp.get('/retrieveContacts', async (req,res)=> {
  let pool = mysql.createConnection(mySQLConfig);
  pool.query = util.promisify(pool.query);
  const username = req.query.username;
  let contactedUsers = await pool.query(`SELECT * FROM
  (SELECT sender, timeSent FROM messageMetarecord WHERE sender=? OR receiver=?
  UNION
  SELECT receiver,timeSent FROM messageMetarecord WHERE sender=? OR receiver=?) AS combined
  WHERE sender!=?
  ORDER BY timeSent;`,[username,username,username,username,username]);
  if (contactedUsers.length == 0){
    const endIt = await pool.end();
    return res.json({message: 'Success', data: [], comment: 'No contacts have been found'});
  }
  let listContacts = contactedUsers.map(i => ({contact: i['sender'], sent: i['timeSent']}));
  const endIt = await pool.end();
  return res.json({message: 'Success', data: listContacts, comment: 'Contacts have been found'});

})

// Get profileDetails for that specific user 
webapp.get('/profileDetails', async(req,res)=> {
  try {
    let pool = mysql.createConnection(mySQLConfig);
    pool.query = util.promisify(pool.query);
    const username = req.query.username;
    let fullUserProfile = await pool.query(`SELECT username,profilePicture,registrationTime 
    FROM userRegistration where username = ?`,[username])
    const endIt = await pool.end();
    // This means that the user doesn't exist 
    if (fullUserProfile.length == 0) {
      console.log(`Cant find anything for${username}`)
      return res.json({message: 'Failure'})
    }
    else {
      return res.json({message: 'Success', data:fullUserProfile[0]})
    }
  }
  catch(e) {
    res.json({message:'Failure', error: e})
  }
})

//Change profile picture for user | Update the link
// ?? Need to check about AWS storage | Maybe create another function to generate the link and trigger this request
// Note default is: https://www.equityvp.com/images/placeholder-images/placeholder_profile_photo.png
webapp.post('/updateProfilePic', async(req,res)=> {
  let pool = mysql.createConnection(mySQLConfig);
  pool.query = util.promisify(pool.query);
  const username = req.body.username;
  const profileLink = req.body.profileLink;
  try {
    // Check if the user exists in the first place within userProfile
    let checkUser = await pool.query(`SELECT * FROM userProfile WHERE user=?`,[username]);
    if (checkUser.length == 0) {
      return res.json({message:'Failure'})
    }
    let updateProfileLink = await pool.query(`UPDATE userProfile 
      SET profilePicture =?
      WHERE user=?;`,[profileLink, username])
    return res.json({message:'Success'})

  }
  catch(e) {
    return res.json({message:'Failure',e:e});
  }
  finally {
    const endIt = await pool.end();

  }

});
// This generic file upload will be used to obtain an AWS link that we can then later
// send via socket
webapp.post("/genericFileUpload", async (req,res)=> {
  const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "cis557project",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            cb(null, Date.now().toString()+file.originalname)
        },
        fileFiler: filter.imageFilter,
        acl: "public-read-write",
    })
  }).single('image'); 

  upload(req, res, async function(err){
 
    if (req.fileValidationError) {
      return res.send(req.fileValidationError);
    }
  else if (!req.file) {
    return res.send('Please select an image to upload');
  }
  else if (err instanceof multer.MulterError) {
    return res.send(err);
  }
  else if (req.file.size > maxImageSize){
    return res.send('Image is too big')
  }
  else if (err) {
    return res.send(err);
  }
  let link = req.file.location;
  let username = req.body.username;
  res.send(link)
  })
});

webapp.post("/postImageStatus", async (req,res)=> {
  const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "cis557project",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            cb(null, Date.now().toString()+file.originalname)
        },
        fileFiler: filter.imageFilter,
        acl: "public-read-write",
    })
  }).single('image');

  upload(req, res, async function(err){
 
    if (req.fileValidationError) {
      return res.send(req.fileValidationError);
    }
  else if (!req.file) {
    return res.send('Please select an image to upload');
  }
  else if (err instanceof multer.MulterError) {
    return res.send(err);
  }
  else if (req.file.size > maxImageSize){
    return res.send('Image is too big')
  }
  else if (err) {
    return res.send(err);
  }
  // We are now in call back space. Refactoring: Make this an async function
  let imageLink = req.file.location;
  let username = req.body.username;

  // Now let's save it to the right table 
  let pool = mysql.createConnection(mySQLConfig);
  pool.query = util.promisify(pool.query);
  try {
    let currTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let postImage = await pool.query(`INSERT INTO postStatus (timestamp, username, image, imageLink) VALUES (?,?,?,?)`, [currTime, username, 1, imageLink]);
  } 
  catch(e) {
    console.log(e)
  }
  finally {
    const endIt = await pool.end();

  }

  console.log( `Success check out ${imageLink}`)


  res.status(200).json({message:'We have saved your profile image'})
  });
  

})

webapp.post("/saveImage", (req, res) => {
  // Note that the argument inside 'single' needs to match the HTML form
  // let upload = multer({storage: storage, fileFilter: filter.imageFilter}).single('image');

  const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "cis557project",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            cb(null, Date.now().toString()+file.originalname)
        },
        fileFiler: filter.imageFilter,
        acl: "public-read-write",
    })
  }).single('image'); 

  upload(req, res, function(err){

    if (req.fileValidationError) {
      return res.send(req.fileValidationError);
    }
  else if (!req.file) {
    return res.send('Please select an image to upload');
  }
  else if (err instanceof multer.MulterError) {
    return res.send(err);
  }
  else if (req.file.size > maxImageSize){
    return res.send('Image is too big')
  }
  else if (err) {
    return res.send(err);
  }
  res.status(200).json({message: 'Success', data: {location: req.file.location, size: req.file.size}});
  });
  
})


webapp.post("/saveAudio", (req, res) => {
  // Note that the argument inside 'single' needs to match the HTML form
  const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "cis557project",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            cb(null, Date.now().toString()+file.originalname)
        },
        fileFiler: filter.audioFilter,
        acl: "public-read-write",
    })
  }).single('audio'); 
  upload(req, res, function(err){

    if (req.fileValidationError) {
      return res.send(req.fileValidationError);
    }
  else if (!req.file) {
    return res.send('Please select an audio file to upload');
  }
  else if (err instanceof multer.MulterError) {
    return res.send(err);
  }
  else if (err) {
    return res.send(err);
  }
  res.status(200).json({message: 'Success', data: {location: req.file.location, size: req.file.size}});

  });
  
})


webapp.post("/saveVideo", (req, res) => {
  // Note that the argument inside 'single' needs to match the HTML form
  const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "cis557project",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            cb(null, Date.now().toString()+file.originalname)
        },
        fileFiler: filter.videoFilter,
        acl: "public-read-write",
    })
  }).single('video'); 
  upload(req, res, function(err){

    if (req.fileValidationError) {
      return res.send(req.fileValidationError);
    }
  else if (!req.file) {
    return res.send('Please select an video file to upload');
  }
  else if (err instanceof multer.MulterError) {
    return res.send(err);
  }
  else if (err) {
    return res.send(err);
  }
  res.status(200).json({message: 'Success', data: {location: req.file.location, size: req.file.size}});

  });
  
})

webapp.post("/updatePassword", async (req, res) => {

  let pool = mysql.createConnection(mySQLConfig);
  pool.query = util.promisify(pool.query);

  let username = req.body.username; 
  let newPassword = req.body.newPassword;
  if (newPassword.length < 6){
    const endIt = await pool.end();
    return res.status(411).json({message: 'Failure', error: 'The new password is less than 6 characters'})
  }
  let hashedPassword = await pool.query(`SELECT password FROM userRegistration WHERE username=?`,[username]);
  hashedPassword = JSON.parse(JSON.stringify(hashedPassword))[0]['password']
  const match = true;
  if (match){
    let newHashedPassword = bcrypt.hashSync(newPassword, saltRounds);
    let updatedPassword = await pool.query(`UPDATE userRegistration SET password=? WHERE username=?`,[newHashedPassword,username]);
    return res.send({message: 'Success'})
  }
  else {
    return res.status(400).send({message: 'Failure', error:'Current password is incorrect'})
  }

})

// Post user status 

// Variable to keep track of live users now  //Wonder if this will work on deployment
const liveUsers = {};

//Chat Socket 

const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";

io.on("connection", (socket) => {
  // Join a conversation
  const { receiver } = socket.handshake.query;
  socket.join(receiver);
  // Listen for new messages
  socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
    sendChatData(data);
    //temp_data="abc";
    io.in(receiver).emit(NEW_CHAT_MESSAGE_EVENT, data);
    console.log("inside socket data " + data.id); // We have body, senderId, senderUsername, chatroom
    
  });

  socket.on("new_image_event", (data) => {
    io.in(receiver).emit(NEW_CHAT_MESSAGE_EVENT, data);
    // console.log(data) // We have body, senderId, senderUsername, chatroom
    sendImageMessageData(data)
  });

  // This is to track who's online on the mainView 
  // liveUsersArray will be the output sent to the clientside
  socket.on('newUser', (data) => {
    liveUsers[socket.id] = data.liveUser;
    let liveUsersArray = Object.values(liveUsers);

    io.emit('liveUsersFromServer', liveUsersArray)
    socket.join(`${data.liveUser}_updates`);
    // socket.to(`${data.liveUser}_updates`).emit("receivedCallUpdate", `Hi A Call for You`);

  })
  // socketRef.current.emit('sendCallerId',{callerId:`${localStorage.getItem('username')}`, room:`${contact}_updates`})

  socket.on('sendCallerId', (data)=> {
    console.log('Inside send Caller Id')
    console.log(data)
    const callerId = data.callerId;
    const room = data.room;
    // The reason for the bug is that we can only emit to a specific room from the server
    // Can't do it from the client side 
    socket.broadcast.to(room).emit('receivedCallUpdate', `${callerId}`)

    //If it works, time to emit to that specific room
    // Need to check if we are connected to that specific room as well
  })
  
  //Handling the message to the rejected entity in a call

  socket.on('rejecting', (data)=> {
    console.log('Inside the function to send a message to the rejected entity')
    console.log(data)
    const rejectedEntity = data.rejectedEntity;
    const rejectingEntity = data.rejectingEntity;
    const room = data.room;
    socket.broadcast.to(room).emit('rejectionUpdate', `${rejectingEntity} has rejected your call`)
    function setRejectionMessageToBlank() {
      // all the stuff you want to happen after that pause
      console.log('Tadah Tadah');
      socket.broadcast.to(room).emit('rejectionUpdate', ``);

  }
  setTimeout(setRejectionMessageToBlank, 5000);
  })
  socket.on('disconnect', ()=>{
    delete liveUsers[socket.id]
    let liveUsersArray = Object.values(liveUsers);
    //Socket.broadcast.emit means everyone apart from the user who sent
    // gets this message
    socket.broadcast.emit('liveUsersFromServer', liveUsersArray)
  })

  // Leave the room if the user closes the socket
  socket.on("disconnect", () => {
    socket.leave(receiver);
  });
});

const sendChatData = async (data)=> {
  const {body, senderUsername, chatroom} = data;

  const splitWords = chatroom.split('$')
  let receiverUsername = ''
  let user1 = splitWords[0]
  let user2 = splitWords[1]
  // We need to make that that user1 is always smaller than user2 alphabetically 
  if (user1 > user2){
    console.log('The formatting is incorrect. The user on the left has to be always alphabetically smaller than the user on the right')
    return
  }

  if (user1 == senderUsername){
    receiverUsername = user2
  }
  else {
    receiverUsername = user1
  }
  // First step, check if this chat is valid. Should have happend before hand 
  // Second step, check if this chat table exists x$y. If not, create a table 
  // Third step, add the message
  // Remember to add validation to split at $ to check these are valid users and in 
  // in the right order 
  console.log(chatroom)
  console.log(`The chat message was ${body}`)
  const tableInput = "tablename="+ chatroom; 
  const messageInput = `tablename=${chatroom}&sender=${senderUsername}&receiver=${receiverUsername}&message=${body}`

  console.log(tableInput)
  const chatStatus = await axios.post(API_URL + '/checkConversationsTable',tableInput)
  let firstChat = false;
  // Eventually wrap these all up such that if there is one failure, exit completely 
  if (chatStatus.data.message === 'Success'){
    if (chatStatus.data.data == 0){
      firstChat = true 
    }
    // Now if this is the firstChat let's create a new table for them 
    if (firstChat){
      const createConvoTable = await axios.post(API_URL + '/createConversationTable', tableInput)
      // **** Intervention ??? Need to check this is working 
      const updateConversationsTable = await axios.post(API_URL + '/addToConversationsTable', tableInput);
    }

    // Now let's add the message to the appropriate tables 
    
    const addMessageToTable = await axios.post(API_URL + '/addMessage', messageInput)
    if (addMessageToTable.data.message === 'Success'){
      var id =3;
      data.id = 5;    
    }
  }
  else {
    console.log('This is the wrong conversation table')
  }
  return data;

}


// Code for backend status 



// These are all test API end points. Can be taken out

webapp.get('/testExpress', (req,res)=> {
    res.send("API is working well. Test now");
})

webapp.post('/postStatus', async (req, res) => {
  // API 1: write into the database that hosts my status
  // API 2: read from the database to display status for everyone
  let pool = mysql.createConnection(mySQLConfig);
  pool.query = util.promisify(pool.query);
  console.log("before try")
  try {
    let currTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let status = req.body.status
    let username = req.body.username
    console.log(status)
    console.log(username)
    console.log(currTime)
    let postStatusQuery = await pool.query(`INSERT INTO postStatus (textstatus, timestamp, username) VALUES (?,?,?)`, [req.body.status, currTime, req.body.username])
    res.json({ message: 'Success' })
    }
    catch (e) {
    res.json({message:'Table does not exist', error: e})
    }
    finally {
      const endIt = await pool.end();
    }
})


webapp.get('/getActivityFeed', async(req,res)=>{
  let pool = mysql.createConnection(mySQLConfig);
  pool.query = util.promisify(pool.query);
  res.json({ message: 'Success' })
})


// Calling Code 

webapp.post('/obtainTwilioToken', (req, res) => {
  const user = req.body.username
  // put your Twilio API credentials here
  const accountSid = 'key';
  const authToken = 'key';

  // put your Twilio Application Sid here
  const appSid = 'key';

  const capability = new ClientCapability({
    accountSid: accountSid,
    authToken: authToken,
  });
  capability.addScope(
    new ClientCapability.OutgoingClientScope({ applicationSid: appSid })
  );
  capability.addScope(new ClientCapability.IncomingClientScope(user));


  const token = capability.toJwt();
  console.log(`Just assigned ${token} to ${user}`)

  res.set('Content-Type', 'application/jwt');
  res.send(token);
});


webapp.post("/voice", (req, res) => {
  const To = req.body.To || '+123456789';
  const response = new VoiceResponse();
  const dial = response.dial({ callerId: '+18648062467' });
  dial.client(To);
  res.set("Content-Type", "text/xml");
  res.send(response.toString());
});

//TWILIO NEED TO FILL IN THE RIGHT VALUE HERE
webapp.post("/voice/incoming", (req, res) => {
  const response = new VoiceResponse();
  const dial = response.dial({ callerId: '+18648062467', answerOnBridge: true });
  // ?? Probably this is where we need to pipe in the right value
  dial.client("helloMindy"); // ?? Need to be dynamic
  res.set("Content-Type", "text/xml");
  res.send(response.toString());
});

webapp.post("/registerCall", async (req, res) => {
  console.log('Inside Register Call Now')
  const callerUser = req.body.callerUser;
  const calleeUser = req.body.calleeUser;
  const callTime = Date.now();
  const callStatus = 'Completed';
  let pool = mysql.createConnection(mySQLConfig);
  pool.query = util.promisify(pool.query);
  try {
    // Note the typo in the table name. 
    let saveCallStatus = await pool.query(`INSERT INTO callAtempts (callerUser, calleeUser, callTime, callStatus) VALUES (?,?,?,?)`, [callerUser, calleeUser, callTime, callStatus ])
    console.log('Boom! Just saved the call successfully!')
    res.json({ message: 'Success' })
  } 
  catch(e) {
    res.json({message:'Oops. We have an error', error: e})

  } 
  finally {
    const endIt = await pool.end();
  }

})

webapp.get("/getCallHistory", async (req, res) => {
  const data = req.query.data;
  const splitWords = data.trim().split('$');
  const userOne = splitWords[0];
  const userTwo = splitWords[1];
  let pool = mysql.createConnection(mySQLConfig);
  pool.query = util.promisify(pool.query);
                                               
  try {                    

    let retrieveCallData = await pool.query(`SELECT * FROM callAtempts where (callerUser=? and calleeUser=?) OR  (callerUser=? and calleeUser=?) ORDER BY callTime DESC`,[userOne, userTwo,userTwo, userOne]) ;
    let callData = JSON.parse(JSON.stringify(retrieveCallData))
    console.log(callData)
    return res.status(200).json({message: 'Success', data: callData})


  }
  catch(e){
    res.json({message:'Oops. We have an error', error: e})


  }
  finally {
    const endIt = await pool.end();
  }


})

// For testing
module.exports = webapp; 



