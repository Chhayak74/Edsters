 var mongoose = require('mongoose');
var userModel = mongoose.model('User')


//used where the user needs to be loggedin in order to access the particular page 

//To be used i the case of dashboard and post(like ,comment , etc. )
exports.checkLogin = function(req,res,next){

	if(!req.user && !req.session.user){
		res.redirect('/users/login/screen');
	}
	else{
		userModel.findOne({'userName': req.session.user.userName}, function(err , foundUser){
			if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.render('error' , {message: myResponse.message,
                                      error: myResponse.data});
            }
            else if(foundUser==null || foundUser==undefined || foundUser.userName==undefined){

                var myResponse = responseGenerator.generate(true,"user not found",404,null);
                //res.send(myResponse);
                res.render('error', {
                  message: myResponse.message,
                  error: myResponse.data
                });

            }
            else{ 

         
                  console.log(req.session);
                  req.session.user = foundUser;
                  delete req.session.user.password;
                   //if it exists move forward
		          next();
                  
            }

		});
        
	}

}// end checkLogin