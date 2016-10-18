 var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var profileSchema = new Schema({

    userName        : {type : String},
	accountType     : {type : String},
	name            : {type : String, required : true},
	jobRole         : {type : String, default : 'Student'},
	jobProfile      : {type : String },
	currentCompany  : {type : String},
	careerPath      : {type : String, default : '' , required: true},
	company         : {type : String , default : 'Student' } ,
	noOfYears       : {type : String},
	degree          : {type : String , required : true} ,
    school          : {type : String , required: true} , 
    email           : {type : String},
    mobileNumber    : {type : Number},
    skills          : [],
    noOfFollowers   : {type : Number, default:0},
    followers       : [{ userName : {type : String, required : true},
                         fullname : {type : String}
                      }]

    
});

mongoose.model('Profile', profileSchema);



