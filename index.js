'use strict'

/**
 * Module dependencies.
 */

const { JsonDB, Config } = require('node-json-db')
const express = require('express')
var cors = require('cors')
var app = module.exports = express();
app.use(cors())
app.use(express.json())
app.use(express.urlencoded())

const DB = {
    help: {},
    volunteer:{}
}

function dbBackup() {
    
    console.log(DB);
    setTimeout(() => {
        dbBackup()
      }, "5000")
}
dbBackup()


// create an error with .status. we
// can then use the property in our
// custom error handler (Connect respects this prop as well)

function error(status, msg) {
  var err = new Error(msg);
  err.status = status;
  return err;
}

// if we wanted to supply more than JSON, we could
// use something similar to the content-negotiation
// example.

// here we validate the API key,
// by mounting this middleware to /api
// meaning only paths prefixed with "/api"
// will cause this middleware to be invoked

app.use('/api', function(req, res, next){
  var key = req.query['api-key'];
  // key isn't present
  if (!key) return next(error(400, 'api key required'));

  // key is invalid
  if (apiKeys.indexOf(key) === -1) return next(error(401, 'invalid api key'))

  // all good, store req.key for route access
  req.key = key;
  next();
});

// map of valid api keys, typically mapped to
// account info with some sort of database like redis.
// api keys do _not_ serve as authentication, merely to
// track API usage or help prevent malicious behavior etc.

var apiKeys = [
    'deprem'
];


/* 
Help
name, number, address, need, content
*/
app.post('/api/help', function(req, res){
    
  try{
    const formData = req.body

    if(Object.keys(DB["help"]).length > 1000){
        delete DB["help"][Object.keys(DB["help"])[0]];
    }

    DB["help"][Date.now()] = {
      name: formData.name || "",
      number: formData.number || "",
      address: formData.address || "",
      need: formData.need || "",
      content: formData.content || "",
      time: Date.now()
    }
  
    res.send({status: 1, request: formData});
  }catch(e){
    res.send({status: 0, error: e.message});
  }
});

// Help List
app.get('/api/helpList', function(req, res, next){
  res.send(DB["help"]);
});


/* 
Volunteer
surName phone Number email volunteer sendMessage sendEmail sendCall
*/
app.post('/api/volunteer', function(req, res, next){
    try{
      const formData = req.body
      
      if(Object.keys(DB["volunteer"]).length > 1000){
          delete DB["volunteer"][Object.keys(DB["volunteer"])[0]];
      }
  
      DB["volunteer"][Date.now()] = {
        surName: formData.surName || "",
        phoneNumber: formData.phoneNumber || "",
        email: formData.email || "",
        volunteer: formData.volunteer || "",
        sendMessage: formData.sendMessage || "",
        sendEmail: formData.sendEmail || "",
        sendCall: formData.sendCall || "",
        time: Date.now()
      }
    
      res.send({status: 1, request: formData});
    }catch(e){
      res.send({status: 0, error: e});
    }
  });

// Volunteer List
app.get('/api/volunteerlİST', function(req, res, next){
    res.send(DB["volunteer"]);
});
 
// middleware with an arity of 4 are considered
// error handling middleware. When you next(err)
// it will be passed through the defined middleware
// in order, but ONLY those with an arity of 4, ignoring
// regular middleware.
app.use(function(err, req, res, next){
  // whatever you want here, feel free to populate
  // properties on `err` to treat it differently in here.
  res.status(err.status || 500);
  res.send({ error: err.message });
});

// our custom JSON 404 middleware. Since it's placed last
// it will be the last middleware called, if all others
// invoke next() and do not respond.
app.use(function(req, res){
  res.status(404);
  res.send({ error: "Sorry, can't find that" })
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}