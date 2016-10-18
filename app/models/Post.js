 
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var postSchema = new Schema({

	userName 			: {type:String,required:true},
	fullName			: {type:String},
	postText 			: {type:String},
	created				: {type:Date,default:Date.now()},
	modified			: {type:Date,default:Date.now()},
	comments			: [{
		                      commentedAt : {type : Date, default : Date.now()},
                              commentedBy : {type : String, required : true},
                              comment     : {type : String},
                              userName    : {type : String}

	                       }], 
	totalComments		: {type:Number,default:0},
	totalLikes			: {type:Number,default:0},
	likedBy             : [{ userName : {type: String, required : true},
	                         fullname : {type : String}
                          }],
	tags 				: []
	
	

});


mongoose.model('Post',postSchema);