exports.textLinkDetectFunction = function(postText){

          var myLinkReg =  /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
               if(myLinkReg.test(postText)){
                var linksInText = postText.match(myLinkReg);
                  ////////console.log(linksInText);
                for (f in linksInText){
                  var find = linksInText[f]
                  //var re = new RegExp(find, 'g');
                  var position = postText.search(linksInText[f].trim());
                  var previousTwo = postText.substring(position-2,position);
                  ////////console.log(previousTwo);
                    postText =(previousTwo=='="'||previousTwo=='f=')?postText:postText.replace(linksInText[f],'<a target="_blank" href='+linksInText[f]+'>'+linksInText[f]+'</a>');
                 }
                 return postText;
              }
                else{
                  ////////console.log("no links found");
                  return postText;
                }
  }; // end link detect function 