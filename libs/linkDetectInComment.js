exports.commentLinkDetectFunction = function(commentobj1){

          var myLinkReg =  /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
               if(myLinkReg.test(commentobj1.comment)){
                var linksInText = commentobj1.comment.match(myLinkReg);
                  ////////console.log(linksInText);
                for (f in linksInText){
                  var find = linksInText[f]
                  //var re = new RegExp(find, 'g');
                  var position = commentobj1.comment.search(linksInText[f].trim());
                  var previousTwo = commentobj1.comment.substring(position-2,position);
                  ////////console.log(previousTwo);
                    commentobj1.comment =(previousTwo=='="'||previousTwo=='f=')?commentobj1.comment:commentobj1.comment.replace(linksInText[f],'<a target="_blank" href='+linksInText[f]+'>'+linksInText[f]+'</a>');
                 }
                 return commentobj1;
              }
                else{
                  ////////console.log("no links found");
                  return commentobj1;
                }
  }; // end link detect function 