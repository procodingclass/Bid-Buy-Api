const cors = require('cors');
const express = require('express')
const fireStore = require('./config')
const { body, validationResult } = require('express-validator');

const app = express()

// Use this to allow CROS request. Add domain of the hosted frontend app.
app.use(cors({
  origin: 'https://snack-web-player.s3.us-west-1.amazonaws.com'
}));

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));


const port = 3000

app.use(express.json())

app.use('/api/auction', require('./routes/auction'))

app.use('/api/user', require('./routes/user'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})  