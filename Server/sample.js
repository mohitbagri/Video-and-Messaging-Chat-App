const bcrypt = require('bcrypt')
const saltRounds = 10;

const myPlaintextPassword = 'Test'
const hash = bcrypt.hashSync(myPlaintextPassword, saltRounds);

console.log(hash)



const  checkUser = async()=> {
    const match1 = await bcrypt.compare('Test', '$2b$10$VNaLr/SPD2gKgmA5Z3MKauaYkLssKjtOzzAd3gEeqOkxBeAQiNVJ.');
    const match2 = await bcrypt.compare('test', '$2b$10$cyBcXCTa42tWmiCGqf/Mv.h4zN2HePYW08e.ag8DFIYW4PxiahUm.');
    console.log(match1)
    console.log(match2)
} 

checkUser()

function toDateTime(secs) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs);
}

console.log(`Time now: ${Date.now()}`)



var minutesToAdd=30;
var currentDate = Date.now();
var pastDate = currentDate - 30*60000;


// var currentDate = new Date();
// var pastDate = new Date(currentDate.getTime() - minutesToAdd*60000);

console.log(` current date: ${currentDate}`)
console.log(` past date: ${pastDate}`)




var date = new Date(pastDate);


// Hours part from the timestamp
var hours = date.getHours();
// Minutes part from the timestamp
var minutes = "0" + date.getMinutes();
// Seconds part from the timestamp
var seconds = "0" + date.getSeconds();

// Will display time in 10:30:23 format
var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

console.log(`Formatted time: ${formattedTime}`);

// Might need to switch APIKey and ACCOUNTsID??
const twilioAccountSid = 'AC36b4a1de8a0d4f9fb11bfec91527fe4f';
const twilioApiKey = 'SK8fc5dcd661c7c0a627a4fa12db28a4cc';
const twilioApiSecret = 'aqtGqjguer6S6pD0xDMSkuPHN8dakkwS';



```
To write tests for 
/profileDetails 
updateProfilePic

// Update Password 


/addToConversationsTable
/createConversationTable
/FetchUserContacts
/FetchAllOtherContacts


/postStatus 
/postImageStatus

/saveImage
/saveAudio
/saveVideo
```