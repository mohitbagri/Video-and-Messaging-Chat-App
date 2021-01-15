const accountSid = 'AC36b4a1de8a0d4f9fb11bfec91527fe4f';
const authToken = '537e1a7e77cbcb6ff2d3ea4d9b293960';
const client = require('twilio')(accountSid, authToken);

// client.calls
//       .create({
//          url: 'http://c9771a916907.ngrok.io/voice', //'http://demo.twilio.com/docs/voice.xml',
//          to: 'client:hellomindy',
//          from: 'client:username1' //'+18648062463'
//        })
//       .then(call => console.log(call.sid));


      client.calls
      .create({
         url: 'http://demo.twilio.com/docs/voice.xml', //'http://845aa97c0fdf.ngrok.io/voice', //'http://demo.twilio.com/docs/voice.xml',
         to:  '+16502090062',  
         from: '+18648062463' //'+18648062463'
       })
      .then(call => console.log(call.sid));
      
// client.calls('CA75ad3ccd71a1ac19dc883db24c105849')
// .update({twiml: '<Response><Say>Just wanted to say hi! </Say></Response>'})
// .then(call => console.log(call.to));


