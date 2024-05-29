const mongoose = require('mongoose');
const { setThePassword } = require('whatwg-url');

const loginSchema=new mongoose.Schema({
    username:{
        type : String
    },
    password :{
        type: String
    }
});
const mailSchema=new mongoose.Schema({
    username:{
        type : String
    },
    course :{
        type: String
    },
    content:{
        type: String
    }
});
const Details=mongoose.model('logindetails',loginSchema);
const MailDetails=mongoose.model('maildetails',mailSchema);

module.exports={Details,MailDetails};

