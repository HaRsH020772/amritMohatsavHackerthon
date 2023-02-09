const express = require('express');
const morgan = require("morgan");
const fileUpload = require('express-fileupload');

const app = express();

//* Middleware set-up

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan("tiny"));
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:'/tmp/'
}))


//* All routes controller imports
const customerAuth = require('./routes/authRoutes');
const writerSection = require('./routes/writerRoutes');
const needySection = require('./routes/needyRoutes');


//* All routes setup
app.use('/api/auth', customerAuth);
app.use('/api/writer',writerSection);
app.use('/api/needy',needySection);

module.exports = app;