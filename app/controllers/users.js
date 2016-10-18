var mongoose = require('mongoose');
var express = require('express');

// express router // used to define routes 
var userRouter  = express.Router();
var userModel = mongoose.model('User')
var responseGenerator = require('./../../libs/responseGenerator');
var auth = require("./../../middlewares/auth");


module.exports.controllerFunction = function(app) {

    userRouter.get('/login/screen',function(req,res){
            
        res.render('login');

    });//end get login screen

     userRouter.get('/signup/screen',function(req,res){
            
        res.render('signup');

    });//end get signup screen

     userRouter.get('/dashboard',auth.checkLogin,function(req,res){
        
            res.render('dashboard',{user:req.session.user});
       

    });//end get dashboard

    userRouter.get('/logout',function(req,res){
      
      req.session.destroy(function(err) {

        res.redirect('/users/login/screen');

      })  

    });//end logout
    

    userRouter.get('/all',function(req,res){
        userModel.find({},function(err,allUsers){
            if(err){                
                res.send(err);
            }
            else{

                res.send(allUsers);

            }

        });//end user model find 

    });//end get all users

    userRouter.get('/:userName/info' , auth.checkLogin,function(req,res){

        userModel.findOne({'userName':req.params.userName}, function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
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
                  //if( auth.checkLogin(req , res ,next))
                  res.render('dashboard', { user :req.session.foundUser  });
                 // else{
                  //  res.redirect('/users/login/screen');
                  

            }

        });// end find
      

    });//end get all users

    userRouter.post('/signup',function(req,res){

        if(req.body.firstName!=undefined && req.body.lastName!=undefined && req.body.email!=undefined && req.body.password!=undefined){

            var newUser = new userModel({
                userName            : req.body.firstName+''+req.body.lastName+ Math.floor(Math.random()*100+1),
                firstName           : req.body.firstName,
                lastName            : req.body.lastName,
                email               : req.body.email,
                mobileNumber        : req.body.mobileNumber,
                password            : req.body.password


            });// end new user 
            
            console.log(req.body.firstName+''+req.body.lastName+ Math.floor(Math.random()*100+1));
            

            newUser.save(function(err){
                if(err){
                     console.log("Some error");
                    var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                   //res.send(myResponse);
                   res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
                   });

                }
                else{

                    //var myResponse = responseGenerator.generate(false,"successfully signup user",200,newUser);
                   // res.send(myResponse);

                   //storing the  current user information in req.session, which is an app level middleware
                   //hence available in the whole app
                   //sessions are executed through cookies
                   //later this middleware(session) will be used everywhere to check the user information
                   req.session.user = newUser;     
                   console.log(req.session);

                   //****V.V.IMP
                   //delete the password from the session information
                   //Basic security practice
                   //Hacker may have the temporary access but cannot have the permanent access
                   delete req.session.user.password;
                   res.redirect('/profile/create/screen')
                }

            });//end new user save


        }
        else{

            var myResponse = {
                error: true,
                message: "Some body parameter is missing",
                status: 403,
                data: null
            };

            //res.send(myResponse);

             res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
              });

        }
        

    });//end get all users

  

    userRouter.post('/login',function(req,res){
 
        userModel.findOne({$and:[{'email':req.body.email},{'password':req.body.password}]},function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else if(foundUser==null || foundUser==undefined || foundUser.userName==undefined){

                var myResponse = responseGenerator.generate(true,"user not found. Check your email and password",404,null);
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
                  res.redirect('/users/dashboard')

            }

        });// end find


    });//end get signup screen


    // this should be the last line
    // now making it global to app using a middleware
    // think of this as naming your api 
    app.use('/users', userRouter);



 
} //end contoller code
