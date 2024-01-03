require("dotenv").config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 5000;
const rateLimitMiddleware = require('./middleware/ratelimiter');

//Requiring Models Schemas
const Note = require('./models/note');

app.use(cookieParser());

//Set up MongoDB Database 
mongoose.connect(process.env.MONGOURI);

mongoose.connection.on('connected',()=>{
    console.log("Database connection On");
});
mongoose.connection.on('error',(err)=>{
    console.log("Error Connecting: ", err);
});

//Middleware Functions
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Rate Limiter Middleware
app.use(rateLimitMiddleware);

//Route Requests
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/note'));
app.use('/api', require('./routes/query-search'));

//Listen Port
app.listen(PORT, (req,res)=>{
    console.log(`Listening to the port ${PORT}`);
});

module.exports = app;