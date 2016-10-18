var mongoose = require('mongoose');
var express = require('express');


// express router // used to define routes 
var profileRouter  = express.Router();

var mongoose = require('mongoose'); //mongo connection
var bodyParser = require('body-parser'), //parses information from POST
methodOverride = require('method-override'); //used to manipulate POST
var _ = require('lodash');

profileRouter.use(bodyParser.urlencoded({ extended: true }));
profileRouter.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}));


var profileModel = mongoose.model('Profile')
var responseGenerator = require('./../../libs/responseGenerator');
var auth = require("./../../middlewares/auth");


module.exports.controllerFunction = function(app) {
    //route to get create profile screen
     profileRouter.get('/create/screen',auth.checkLogin,function(req,res){
            
            res.render('createprofile', {user:req.session.user });

     });//end get create profile screen

     
  
    //route to create  profile
    profileRouter.post('/create',auth.checkLogin,function(req,res){

        if(req.body.careerPath!=undefined && req.body.degree!=undefined ){
           
            var newProfile = new profileModel({
                                     
                                     userName        : req.session.user.userName,
                                     email           : req.session.user.email,
                                     name            : req.session.user.firstName+ " " +req.session.user.lastName,           
                                     mobileNumber    : req.session.user.mobileNumber,
                                     jobProfile      : req.body.jobProfile,
                                     currentCompany  : req.body.currentCompany,
                                     jobRole         : req.body.jobRole,
                                     careerPath      : req.body.careerPath,
                                     degree          : req.body.degree ,
                                     school          : req.body.school ,
                                     company         : req.body.company ,
                                     noOfYears       : req.body.noOfYears,
                                     accountType     : req.body.accountType



            });// end new user 

            var skills = (req.body.skills!=null && req.body.skills!=undefined)?req.body.skills.split(" "):'';
            newProfile.skills = skills;
            if(newProfile.jobProfile==""){
              newProfile.jobProfile="Student";
            }
             if(newProfile.company==""){
              newProfile.company="Student";
            }
            newProfile.following = req.session.user.following;
            newProfile.save(function(err){
                if(err){

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
                   console.log(newProfile);
                   res.redirect('/profile/myprofile');
                }

            });//end new profile save

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
        

    });//end create profile


    //route to get the logged in user's profile
     profileRouter.get('/myprofile',auth.checkLogin,function(req,res){
              
              //console.log(req.session.user.email);
      profileModel.findOne({'email': req.session.user.email} , function(err, foundprofile){
        if(err){
            var myResponse = responseGenerator.generate("true" , "Some error "+err , 500 , null);

            res.render('error' , { message : myResponse.message , 
                                   error   : myResponse.error
                                 });
          }else if(foundprofile==null || foundprofile==undefined || foundprofile.name==undefined){
             var myResponse = responseGenerator.generate("true" , "Profile not found" , 404 , null);
             console.log("Profile not found");
             console.log(foundprofile);
             res.render('error' , { message : myResponse.message , 
                                   error   : myResponse.error
                                 });

          }
          else{
            console.log('Success');
            console.log(foundprofile);
            res.render('profile',{profile:foundprofile});
            }

      });
             

    });//end get myprofile


    //route to get the logged in user's updated profile
     profileRouter.get('/myprofile/updated',auth.checkLogin,function(req,res){
              
              //console.log(req.session.user.email);
      profileModel.findOne({'email': req.session.user.email} , function(err, foundprofile){

        if(foundprofile){
          //console.log(foundprofile);
          res.render('profile',{profile:foundprofile});
        }
        else{
          //console.log("Profile not found");
          res.render("Profile not found");
        }
      });
             

    });//end get myprofile


    //route to show edit profile screen
     profileRouter.get('/edit/screen',auth.checkLogin,function(req,res){
              
              //console.log(req.session.user.email);
      profileModel.findOne({'email': req.session.user.email} , function(err, foundprofile){

        if(foundprofile){
          console.log(foundprofile);
          res.render('editprofile',{profile:foundprofile});

          //res.redirect('/profile/edit');
        }
        else{
          //console.log("Profile not found");
          res.render("Profile not found");
        }
      });
             

    });//end get myprofile



    //route to edit profile
    profileRouter.put('/edit' ,auth.checkLogin, function( req , res){

      //var update = req.body;
    profileModel.findOne({'email':req.session.user.email} , function( err , profile){

           if(err){
            var myResponse = responseGenerator.generate("true" , "Profile not found" , 404 , null);

            res.render('error' , { message : myResponse.message , 
                                   error   : myResponse.error
                                 });
          }
          else{
            console.log(profile+"profile");
            profile.email          = req.body.email;
            profile.mobileNumber   = req.body.mobileNumber;
            profile.jobProfile     = req.body.jobProfile;
            profile.currentCompany = req.body.currentCompany;
            profile.jobRole        = req.body.jobRole;
            profile.careerPath     = req.body.careerPath;
            profile.degree         = req.body.degree;
            profile.school         = req.body.school;
            profile.company        = req.body.company;
            profile.noOfYears      = req.body.noOfYears;
            profile.acountType     = req.body.accountType ;
            console.log(req.body.accountType);
            console.log(profile.accountType);
            profile.save(function(err){
              if(err){
                res.send(err);
                console.log(err);
              }
              else{
                //res.render('profile' , {profile:profile});
                console.log("Profie updated");
                console.log(profile.accountType);
                //console.log(updated);
                res.redirect('/profile/myprofile');
              }
            });
            
          }

      });

    }); //end edit



    //route to get all profile
    profileRouter.get('/all' ,auth.checkLogin, function( req , res ){
      profileModel.find(function(err , result){
        if(err){
            var myResponse = responseGenerator.generate("true" , "Some error "+err , 500 , null);

            res.render('error' , { message : myResponse.message , 
                                   error   : myResponse.error
                                 });
          }else if(result==null || result==undefined){
             var myResponse = responseGenerator.generate("true" , "No alumni found" , 404 , null);

            res.render('error' , { message : myResponse.message , 
                                   error   : myResponse.error
                                 });

          }
          else{
            //console.log(alumni);
            //var sorted = _.orderBy(result, ['modified'], ['desc']);
            var members = _.reject(result, ['userName', req.session.user.userName]);
            res.render('alumni2' , {alumni : members});

          }


      });
    });//end get all profiles


    //route to get others profile 
    profileRouter.get('/others' ,auth.checkLogin, function( req , res ){
              //console.log(req.query.id);
        profileModel.findOne({'_id':req.query.id}, function( err , foundprofile){

           if(err){
            var myResponse = responseGenerator.generate("true" , "Some error "+err , 500 , null);

            res.render('error' , { message : myResponse.message , 
                                   error   : myResponse.error
                                 });
          }else if(foundprofile==null || foundprofile==undefined || foundprofile.name==undefined){
             var myResponse = responseGenerator.generate("true" , "Profile not found" , 404 , null);

            res.render('error' , { message : myResponse.message , 
                                   error   : myResponse.error
                                 });

          }
          else{
            //var check = foundprofile.followers.indexOf(req.session.user.userName);
            var check = _.findIndex(foundprofile.followers, function(o) { return o.userName == req.session.user.userName; });
            console.log(check +"checkothers");
            var button;
            if(check > -1){
               
               var buttonvalue = {value : "Unfollow"};
               //console.log("profile");
               //console.log(buttonvalue.value+"button.value");
               //console.log(foundprofile);
               if(foundprofile.userName==req.session.user.userName){
                res.render('profile' ,{profile:foundprofile});
               }else{
               res.render('othersprofile' , {profile : foundprofile , button : buttonvalue});
               }
            }
            else{
               
               var buttonvalue = {value : "Follow"};
               //console.log("profile");
               //console.log(buttonvalue.value+"button.value");
               //console.log(foundprofile);
               //res.render('othersprofile' , {profile : foundprofile , button : buttonvalue});
                if(foundprofile.userName==req.session.user.userName){
                res.render('profile' ,{profile:foundprofile});
               }else{
               res.render('othersprofile' , {profile : foundprofile , button : buttonvalue});
               }
            }
            }

        });


    });//end get other's profile
    

     //route to get others profile  by userName
    profileRouter.get('/others/userName' ,auth.checkLogin, function( req , res ){
              //console.log(req.query.id);
        profileModel.findOne({'userName':req.query.userName}, function( err , foundprofile){

           if(err){
            var myResponse = responseGenerator.generate("true" , "Some error "+err , 500 , null);

            res.render('error' , { message : myResponse.message , 
                                   error   : myResponse.error
                                 });
          }else if(foundprofile==null || foundprofile==undefined || foundprofile.name==undefined){
             var myResponse = responseGenerator.generate("true" , "Profile not found" , 404 , null);

            res.render('error' , { message : myResponse.message , 
                                   error   : myResponse.error
                                 });

          }
          else{
            var check = _.findIndex(foundprofile.followers, function(o) { return o.userName == req.session.user.userName; });
            console.log(check +"checkusername");
            var button;
            if(check > -1){
               
               var buttonvalue = {value : "Unfollow"};
               //console.log("profile");
               console.log(buttonvalue.value+"button.value");
               console.log(foundprofile);
               //res.render('othersprofile' , {profile : foundprofile , button : buttonvalue});
               if(foundprofile.userName==req.session.user.userName){
                res.render('profile' ,{profile:foundprofile});
               }else{
               res.render('othersprofile' , {profile : foundprofile , button : buttonvalue});
               }
            }
            else{
               
               var buttonvalue = {value : "Follow"};
               //console.log("profile");
               console.log(buttonvalue.value+"button.value");
               console.log(foundprofile);
               //res.render('othersprofile' , {profile : foundprofile , button : buttonvalue});
                if(foundprofile.userName==req.session.user.userName){
                res.render('profile' ,{profile:foundprofile});
               }else{
               res.render('othersprofile' , {profile : foundprofile , button : buttonvalue});
               }
            }
            }

        });


    });//end get other's profile by userName



    //route to get alumni screen
     profileRouter.get('/alumni/screen',auth.checkLogin,function(req,res){
            
        res.render('alumni');

    }); //end screen



    //route to get alumni
    profileRouter.get('/alumni', auth.checkLogin,function(req , res){
      profileModel.find({$and:[{'careerPath': req.query.careerPath},{'accountType':"Alumni"}]}, function(err , alumni){
         if(err){
            var myResponse = responseGenerator.generate("true" , "Some error "+err , 500 , null);
            console.log("profile err");
            res.render('error' , { message : myResponse.message , 
                                   error   : myResponse.error
                                 });
          }else if(alumni=="" || alumni==undefined){
             var myResponse = responseGenerator.generate("true" , "No alumni found :(" , 404 , null);
             console.log("profile null");
            res.render('error' , { message : myResponse.message , 
                                   error   : myResponse.error
                                 });

          }
          else{
            //console.log(alumni);
            var alumniNew = _.reject(alumni, ['userName', req.session.user.userName]);
            //console.log(alumniNew +"alumniNew");
            res.render('alumni2' , {alumni : alumniNew});
          }


      });

    });


    //route to follow/unfollow a person
    profileRouter.get('/followunfollow' ,auth.checkLogin, function(req , res){
      profileModel.findOne({'_id': req.query.id} , function(err , profile){
        if(err){
        var myResponse = responseGenerator.generate("true" , "Some error"+err , 500, null);
        res.render('error' ,{ message :myResponse.message,
                              error   : myResponse.error });

      }
      else if(profile==null || profile==undefined || profile.name== undefined){
        var myResponse =responseGenerator.generate("true" , "profile not found" , 404, null);
        console.log("profile not found");
        console.log(profile);
        res.render('error', { message : myResponse.message,
                              error   : myResponse.error });
      }
      else{
        var button = req.query.button;
        if(button=="Follow"){
          var follower = { userName : req.session.user.userName , 
                           fullname : req.session.user.firstName+ " " + req.session.user.lastName}
          profile.followers.push(follower);
          profile.noOfFollowers+=1;
          req.session.user.following.push(profile.userName);
          req.session.user.noOfFollowing+=1;
          //console.log(profile.userName);
          //console.log(profile);
          req.session.user.save(function(err){
                if(err){

                    var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                   //res.send(myResponse);
                   res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
                   });

                }
                else{

                    }
                  });
          profile.save(function(error){
              if(err){

                    var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                   //res.send(myResponse);
                   res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
                   });

                }
                else{
                   console.log(profile);
                   console.log(req.session.user);
                   res.redirect('/profile/others?id='+req.query.id) ;
                    }
            });
        }
          else{
            var index1 = profile.followers.indexOf(req.session.user.userName);
            profile.followers.splice(index1 , 1);
            profile.noOfFollowers-=1;
            var index2 = req.session.user.following.indexOf(profile.userName);
            req.session.user.following.splice(index2 , 1);
            req.session.user.noOfFollowing-=1;

            req.session.user.save(function(err){
            if(err){

                    var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                   //res.send(myResponse);
                   res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
                   });

                }
                else{
                   
                    }
                  });
            profile.save(function(error){
              if(err){

                    var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                   //res.send(myResponse);
                   res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
                   });

                }
                else{
                   //console.log(profile);
                   //console.log(req.session.user);
                   res.redirect('/profile/others?id='+req.query.id) ;
                    }
            });
          }
        }

      });
    });
    //end follow/unfollow
    

  //route to display all the likes in a post
  profileRouter.get('/followers' , auth.checkLogin,function( req ,res){
    profileModel.findOne({'_id':req.query.id}, function(err , profile){
      if(err){
        var myResponse = responseGenerator.generate("true" , "Some error"+err , 500, null);
        res.render('error' ,{ message :myResponse.message,
                              error   : myResponse.error });

      }
      else if(profile==null || profile==undefined || profile.userName== undefined){
        var myResponse =responseGenerator.generate("true" , "Profile not found" , 404, null);
        //console.log("Post not found");
        res.render('error', { message : myResponse.message,
                              error   : myResponse.error });
      }else if(profile.noOfFollowers==0 ){
        var myResponse =responseGenerator.generate("true" , "No followers" , 404, null);
        //console.log("Profile not found");
        res.render('error', { message : myResponse.message,
                              error   : myResponse.error });
      }
      else{
        
        console.log(profile.followers);
        res.render('array1' , {array1 : profile.followers , profile:profile});
                
      }

        });


  });
  //end display all followers


  profileRouter.get('/', function (req, res) {

    res.send("This is a blog application");
    var users = [
    { 'user': 'barney', 'age': 36, 'active': false },
    { 'user': 'red',   'age': 40, 'active': true },
    { 'user': 'fd',   'age': 41, 'active': true },
    { 'user': 'fre',   'age': 42, 'active': true }
    ]

    //var o =_.reject(users, function(o) { return !o.active; });
    res.send(users);

  });


    
    

    // this should be the last line
    // now making it global to app using a middleware
    // think of this as naming your api 
    app.use('/profile', profileRouter);



 
} //end contoller code
