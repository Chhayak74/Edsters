 var express = require('express');
var postRouter = express.Router();
var mongoose = require('mongoose');
var postModel = mongoose.model('Post');
var bodyParser = require('body-parser');
methodOverride = require('method-override'); 
var responseGenerator = require('./../../libs/responseGenerator');
var auth = require("./../../middlewares/auth");
var linkDetectInComment = require('./../../libs/linkDetectInComment');
var linkDetectInText = require('./../../libs/linkDetectInText');

var _ = require('lodash');



postRouter.use(bodyParser.urlencoded({ extended: true }));
postRouter.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}));

module.exports.controllerFunction= function(app){

    //route to create a post
	postRouter.post('/create' , auth.checkLogin, function( req ,res){

        console.log(req.session.user+ "At /create");
		var newPost = new postModel({

			userName 			: req.session.user.userName,
	        fullName			: req.session.user.firstName + " "+req.session.user.lastName,
	        postText 			: req.body.postText
	    
		});
		var tags = (req.body.tags!=undefined && req.body.tags!=null)? req.body.tags.split(" "):'';
		newPost.tags = tags;
        //console.log(newPost.postText);
        //console.log(newPost.tags);
        //console.log(req.session.user+ "At /create");
        var textInPost = newPost.postText;
        var text = linkDetectInText.textLinkDetectFunction(textInPost);
        var texthtml = "<!DOCTYPE html> <html> <head> <title>Page Title</title> </head> <body> <p>" + text +"</p> </body> </html>" ;

        newPost.postText = texthtml;

        newPost.save(function(error){
        	if(error){
        		var myResponse = responseGenerator.generate("true" , "some error is there" +error, 500, null);
                 //console.log("Error hai");
        		res.render('error' , {message : myResponse.message,
        		                      error   : myResponse.error});
        	}
        	else{
        		console.log(newPost);
        		var _id = newPost._id;
        		//res.render('post', {post:newPost});
        		res.redirect('/post/mypost/editable/show?id='+_id);
        	}
        });

	});
	//end create post

	//route to display create post screen
    postRouter.get('/create/screen' ,auth.checkLogin, function(req , res){
    	console.log(req.session.user + "at create/screen");
    	res.render('createpost' , {user:req.session.user});
    	console.log(req.session.user + "at create/screen");
    });
	//end post screen

	//route to find post by id
	postRouter.get('/findit', auth.checkLogin,function(req ,res){
		postModel.findOne({'_id':req.query.id} , function(err , result){
			if(err){
				console.log(err);
				res.send("not foundpost");
			}
			else{
				console.log(result);
				res.send(result);
			}
		});
	});
	//end find post

	//route to display a post
	 postRouter.get('/mypost/show' , auth.checkLogin,function( req , res ){
              //console.log(req.query.id);
        postModel.findOne({'_id':req.query.id}, function( err , foundpost){

           if(err){
            var myResponse = responseGenerator.generate("true" , "Some error "+err , 500 , null);

            res.render('error' , { message : myResponse.message , 
                                   error   : myResponse.error
                                 });
          }else if(foundpost==null || foundpost==undefined || foundpost.userName==undefined){
             var myResponse = responseGenerator.generate("true" , "post not found" , 404 , null);

            res.render('error' , { message : myResponse.message , 
                                   error   : myResponse.error
                                 });

          }
          else{
            
            var check = _.findIndex(foundpost.likedBy, function(o) { return o.userName == req.session.user.userName; });

            if(check > -1){
               var buttonvalue = {value : "Unlike"};
               res.render('post' , {post:foundpost , likebutton:buttonvalue});
             }else{
               var buttonvalue = {value : "Like"};
               res.render('post' , {post:foundpost , likebutton:buttonvalue});
                 }
             }

        });
 

    });
	//end display post


	//route to display a post
	 postRouter.get('/mypost/editable/show' , auth.checkLogin,function( req , res ){
              //console.log(req.query.id);
        postModel.findOne({'_id':req.query.id}, function( err , foundpost){

           if(err){
            var myResponse = responseGenerator.generate("true" , "Some error "+err , 500 , null);

            res.render('error' , { message : myResponse.message , 
                                   error   : myResponse.error
                                 });
          }else if(foundpost==null || foundpost==undefined || foundpost.userName==undefined){
             var myResponse = responseGenerator.generate("true" , "post not found" , 404 , null);

            res.render('error' , { message : myResponse.message , 
                                   error   : myResponse.error
                                 });

          }
          else{
            
            var check = _.findIndex(foundpost.likedBy, function(o) { return o.userName == req.session.user.userName; });

            if(check > -1){
               var buttonvalue = {value : "Unlike"};
               res.render('editablepost' , {post:foundpost , likebutton:buttonvalue});
             }else{
               var buttonvalue = {value : "Like"};
               res.render('editablepost' , {post:foundpost , likebutton:buttonvalue});
                 }
             }

        });
 

    });
	//end display post


    postRouter.get('/edit/screen' ,auth.checkLogin, function( req , res){
    	postModel.findOne({'_id': req.query.id }, function(err , foundpost){
    		if(err){
		 		var myResponse = responseGenerator.generate("true" , "Some error"+err , 500, null);
		 		res.render('error' ,{ message :myResponse.message,
		 		                      error   : myResponse.error });

		 	}
		 	else if(foundpost==null || foundpost==undefined ||foundpost.userName==undefined){
		 		var myResponse =responseGenerator.generate("true" , "Post not found" , 404, null);
		 		res.render('error', { message : myResponse.message,
		 		                      error   : myResponse.error });
		 	}
		 	else{
		 		res.render('editpost' , {post:foundpost});
		 	}


    	});
    });





	

	//route to modify a post
 postRouter.put('/edit' , auth.checkLogin,function( req , res){

      //var update = req.body;
    postModel.findOne({'_id':req.query.id} , function( err , post){

           if(err){
            var myResponse = responseGenerator.generate("true" , "post not found" , 404 , null);

            res.render('error' , { message : myResponse.message , 
                                   error   : myResponse.error
                                 });
          }
          else{
            var text = post.postText;
            //console.log(text);
            var newtext1 = req.body.newtext;
            var newtext2 = linkDetectInText.textLinkDetectFunction(newtext1);
            var texthtml = "<!DOCTYPE html> <html> <head> <title>Page Title</title> </head> <body> <p>" + newtext2 +"</p> </body> </html>" ;
            console.log(texthtml);
            post.postText = texthtml;
            post.modified = Date.now();
            console.log("Post updated");
            post.save(function(err){
              if(err){
                res.send(err);
                console.log(err);
              }
              else{
                
                
                //console.log(updated);
                res.redirect('/post/mypost/editable/show?id='+post._id);
              }
            });
            
          }

      });

}); //end edit


	//end modify post

	

	//route to display all the posts in sorted order
	postRouter.get('/feeds' ,auth.checkLogin, function( req ,res){
		postModel.find({'userName': {$in :req.session.user.following}} ,  function(err , feeds){
			if(err){
		 		var myResponse = responseGenerator.generate("true" , "Some error"+err , 500, null);
		 		res.render('error' ,{ message :myResponse.message,
		 		                      error   : myResponse.error });

		 	}
		 	else if(feeds=="" || feeds==undefined ){
		 		var myResponse =responseGenerator.generate("true" , "No posts to show :(" , 404, null);
		 		console.log("No posts yet...");
		 		res.render('errorpost', { message : myResponse.message,
		 		                      error   : myResponse.error });
		 	}
		 	else{
		 		//console.log(feeds+ "/feeds");
		 		//console.log(feeds[0].postText);
		 		var sorted = _.orderBy(feeds, ['modified'], ['desc']);
		 		//res.send(sorted);
				res.render('feeds' , {allposts:sorted});
		 	}

		});

	});
	//end display all posts

    
	//route to find & display all the posts by a particular user
	postRouter.get('/all' ,auth.checkLogin, function( req ,res){
		postModel.find({'userName':req.session.user.userName}, function(err , myposts){
			if(err){
		 		var myResponse = responseGenerator.generate("true" , "Some error"+err , 500, null);
		 		res.render('error' ,{ message :myResponse.message,
		 		                      error   : myResponse.error });

		 	}
		 	else if(myposts=="" || myposts==undefined ){
		 		var myResponse =responseGenerator.generate("true" , "No posts yet :(" , 404, null);
		 		console.log("No post found");
		 		res.render('errorpost', { message : myResponse.message,
		 		                      error   : myResponse.error });
		 	}
		 	else{
		 		console.log(myposts + "post/all");
		 		var sorted = _.orderBy(myposts, ['modified'], ['desc']);
		 		res.render('myposts' , {allposts:sorted});
		 	}

		});

	});
	//end all posts by a user

	//route to find & display all the posts by a particular user by email
	postRouter.get('/allby' ,auth.checkLogin, function( req ,res){
		postModel.find({'email':req.query.email}, function(err , myposts){
			if(err){
		 		var myResponse = responseGenerator.generate("true" , "Some error"+err , 500, null);
		 		res.render('error' ,{ message :myResponse.message,
		 		                      error   : myResponse.error });

		 	}
		 	else if(myposts=="" || myposts==undefined ){
		 		var myResponse =responseGenerator.generate("true" , "No posts yet :(" , 404, null);
		 		console.log("No post found");
		 		res.render('error', { message : myResponse.message,
		 		                      error   : myResponse.error });
		 	}
		 	else{
		 		console.log(posts + "post/all");
		 		var sorted = _.orderBy(myposts, ['modified'], ['desc']);
		 		res.render('myposts' , {allposts:sorted});
		 	}

		});

	});
	//end all posts by a user


	//route to find a post by postText and userName
	postRouter.get('/details' ,auth.checkLogin, function(req , res){
		postModel.findOne({$and:[{'postText':req.query.postText},{'userName':req.query.userName}]}, function(err , post){
			if(err){
		 		var myResponse = responseGenerator.generate("true" , "Some error"+err , 500, null);
		 		res.render('error' ,{ message :myResponse.message,
		 		                      error   : myResponse.error });

		 	}
		 	else if(post==null || post==undefined || post.userName== undefined){
		 		var myResponse =responseGenerator.generate("true" , "Post not found" , 404, null);
		 		console.log("Post not found");
		 		res.render('error', { message : myResponse.message,
		 		                      error   : myResponse.error });
		 	}
		 	else{
                var liked = _.some(post.likedBy, ['userName' , req.session.user.userName]);
		 		console.log(liked +'Liked');
		 		if(liked){
		 			var likeStatus = "Unlike";
		 		}else{
		 			var likeStatus = "Like";
		 		}
		 		var likebutton = {value:likeStatus};
		 		//console.log(post);
		 		res.render('post' , {post:post , likebutton:likebutton});

		 	 	}

		});

	});

				

	//route to comment on a post
	postRouter.post('/comment' ,auth.checkLogin, function( req ,res){
		postModel.findOne({$and:[{'postText':req.query.postText},{'userName':req.query.userName}]}, function(err , post){
			if(err){
		 		var myResponse = responseGenerator.generate("true" , "Some error"+err , 500, null);
		 		res.render('error' ,{ message :myResponse.message,
		 		                      error   : myResponse.error });

		 	}
		 	else if(post==null || post==undefined || post.userName== undefined){
		 		var myResponse =responseGenerator.generate("true" , "Post not found" , 404, null);
		 		console.log("Post not found");
		 		res.render('error', { message : myResponse.message,
		 		                      error   : myResponse.error });
		 	}
		 	else{
		 		var commentobj1 = {
		 			commentedBy : req.session.user.firstName+" "+req.session.user.lastName,
		 			comment     : req.body.comment,
		 			userName    : req.session.user.userName
		 		}
		 		var commentobj2 = linkDetectInComment.commentLinkDetectFunction(commentobj1);
		 		console.log(commentobj2);
		 		post.comments.push(commentobj2);
		 		post.totalComments+=1;
		 		post.save(function(error){
		 			if(error){
		 				var myResponse = responseGenerator.generate("true" , "some error is there" +error, 500, null);
                        //console.log("Error hai");
        		        res.render('error' , {message : myResponse.message,
        		                      error   : myResponse.error});
        	        }else{
        	        	console.log(post.comments+"at /comment");
                        res.redirect('/post/comments?postText='+post.postText+'&userName='+post.userName);
		 		        //res.render('showcomments' , {comments:JSON.stringify(post.comments)});
        	        }
		 		 });
		 	 	}


		});

	});
	//end comment on a post

	//route to show all the comments in a post
	postRouter.get('/comments' ,auth.checkLogin, function( req ,res){
		postModel.findOne({$and:[{'postText':req.query.postText},{'userName':req.query.userName}]}, function(err , post){
			if(err){
		 		var myResponse = responseGenerator.generate("true" , "Some error"+err , 500, null);
		 		res.render('error' ,{ message :myResponse.message,
		 		                      error   : myResponse.error });

		 	}
		 	else if(post=="" || post==undefined || post.userName== undefined){
		 		var myResponse =responseGenerator.generate("true" , "Post not found" , 404, null);
		 		console.log("Post not found");
		 		res.render('error', { message : myResponse.message,
		 		                      error   : myResponse.error });
		 	}
		 	else if(post.comments==""){
		 		var myResponse =responseGenerator.generate("true" , "No comments yet :(" , 404, null);
		 		console.log("Post not found");
		 		res.render('errorcomment', { message : myResponse.message,
		 		                      error   : myResponse.error, post : post });

		 	}
		 	else{
		 		
		 		console.log("comments displayed");
		 		console.log(post.comments+"At /comments");
                res.render('showcomments' , {comments:post.comments});
		 	}

        });

	});
	//end display comments

	//route to like/unlike a person
    postRouter.get('/likeorunlike' , auth.checkLogin,function(req , res){
      postModel.findOne({'_id': req.query.id} , function(err , post){
        if(err){
        var myResponse = responseGenerator.generate("true" , "Some error"+err , 500, null);
        res.render('error' ,{ message :myResponse.message,
                              error   : myResponse.error });

      }
      else if(post==null || post==undefined || post.userName== undefined){
        var myResponse =responseGenerator.generate("true" , "post not found" , 404, null);
        console.log("post not found");
        console.log(post);
        res.render('error', { message : myResponse.message,
                              error   : myResponse.error });
      }
      else{
        var button = req.query.button;

        if(button=="Like"){
          var like = { userName : req.session.user.userName , 
          	           fullname : req.session.user.firstName+ " " + req.session.user.lastName}
          post.likedBy.push(like);
          console.log(like);
          console.log(post.likedBy);
          
          post.totalLikes+=1;
          post.save(function(error){
              if(err){

                    var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                   //res.send(myResponse);
                   res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
                   });

                }
                else{
                     //console.log(post.likedBy);
                     res.redirect('/post/mypost/show?id='+req.query.id) ;
                    }
            });
        }
          else{
            var index = _.findIndex(post.likedBy, function(o) { return o.userName == req.session.user.userName; });
            post.likedBy.splice(index , 1);
            post.totalLikes-=1;
            post.save(function(error){
              if(err){
                    var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                   //res.send(myResponse);
                   res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
                   });

                }
                else{
                   //console.log(post);
                   res.redirect('/post/mypost/show?id='+req.query.id) ;
                    }
            });
          }
        }

      });
    });
    //end like/unlike

	//route to display all the likes in a post
	postRouter.get('/likes' , auth.checkLogin,function( req ,res){
		postModel.findOne({$and:[{'postText':req.query.postText},{'userName':req.query.userName}]}, function(err , post){
			if(err){
		 		var myResponse = responseGenerator.generate("true" , "Some error"+err , 500, null);
		 		res.render('error' ,{ message :myResponse.message,
		 		                      error   : myResponse.error });

		 	}
		 	else if(post==null || post==undefined || post.userName== undefined){
		 		var myResponse =responseGenerator.generate("true" , "Post not found" , 404, null);
		 		//console.log("Post not found");
		 		res.render('error', { message : myResponse.message,
		 		                      error   : myResponse.error });
		 	}else if(post.likedBy==0 ){
		 		var myResponse =responseGenerator.generate("true" , "No likes yet :(" , 404, null);
		 		//console.log("Post not found");
		 		res.render('error', { message : myResponse.message,
		 		                      error   : myResponse.error });
		 	}
		 	else{
		 		
		 		//console.log("LikedBy displayed");
		 		//console.log(post.likedBy+"At /likes");
		 		console.log(post.likedBy);
		 		res.render('array' , {likedBy : post.likedBy});
                
		 	}

        });


	});
	//end display all likes








	app.use('/post', postRouter);
 
}
