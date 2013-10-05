


if (Meteor.isClient) {
  Meteor.Router.add({
    '/': 'ideaMap',
    '/index': 'ideaMapIndex',
    '/donebefore': 'doneBefore',
    '/instaquote': 'instaquote',
    '/votebox': 'votebox',
    '/outlinr': 'outlinr',
    '/thoughtstream': 'thoughtstream',
    '/hackathon': 'hackathon',

  //   '/:ideamapname': function(ideamapname) {
  //   var idea = Ideas.findOne({title: ideamapname});
  //   Session.set('ideaFromUrl', idea);
  //   // Now your restaurant is in the "restaurantFromUrl" Session
  //   return 'restaurantPage';
  // }

  });



  // Template.body.helpers({
  //   layoutName: function() {
  //     switch (Meteor.Router.page()) {
  //       case 'ideaMapIndex':
  //         return 'adminLayout';
  //       case 'userPage':
  //         return 'userLayout';
  //       default:
  //         return 'userLayout';
  //     }
  //   }
  // });

  var getMagicSuggestOptions = function() {
      return {
        cls: 'related-idea-add-ms',
        selectionCls: 'related-idea-selected-ms',
        valueField: '_id',
        displayField: 'title',
        renderer: function(idea){
            return '<div>' +
                    '<div style="font-family: Arial; font-weight: bold">' + idea.title + '</div>' +
                    '<div>' + idea.description + '</div>' +
                   '</div>';
        },
        minChars: 0,
        typeDelay: 20,
        selectionStacked: true,
        method:'GET',
        expanded:false,
        expandOnFocus:true,
        maxDropHeight:'500px',
        name:'query',
        data: Ideas.find().fetch(),
        // data: Ideas.find().fetch().map(function(x) { x.name = x.title; x._id = x.id; delete x._id; delete x.title; return x; }),
        selectionPosition: 'right',
        emptyText:'Connect related ideas',
        selectionStacked: true
      };
  };

  var autoSuggest = function() {
        $('.related-idea-add').each(function() {
          $($(this).magicSuggest(getMagicSuggestOptions())).on('selectionchange', function(events, combo, selection) {
            console.log('selected item:', selection);
            var newRelIdeas = selection;
            var mainIdeaId = combo.container.closest('.main-idea').data('id');

            for (var i = 0; i < newRelIdeas.length; i++) {
                var existingIdea = Ideas.find(newRelIdeas[i]._id).fetch()[0]; // see if related idea is already in db
                var relatedIdeaId;
                if (!existingIdea) { // if not already in db, insert the idea
                  relatedIdeaId = Ideas.insert({ title: newRelIdeas[i].title,
                                                      description: '',
                                                      relatedIdeas: [],
                                                      timestamp:Date.now()
                                                    });  //#TODO dates server side #thereisnoserver
                } else {
                  relatedIdeaId = existingIdea._id;
                }
                // relate main idea to related idea and vice versa
                Ideas.update(mainIdeaId, { $push: { relatedIdeas: relatedIdeaId } });
                Ideas.update(relatedIdeaId, { $push: { relatedIdeas: mainIdeaId } });
            }
          });
        });
  }

  /////// IDEALIST TEMPLATE ////////
  Template.ideaList.helpers({
    idea: function() {
      return Ideas.find({}, {sort: {timestamp: -1}}).fetch().map(function(e) {
        e.expandedId = 'expanded-' + Math.floor(Math.random() * 10000000);
        return e;
      });
    }
  });

  Template.ideaList.rendered = function() {
    autoSuggest(); // attach magicsuggest to 
  };

  /////// EXPANDED IDEA TEMPLATE ////////
  Template.expandedIdea.helpers({
    relatedIdea: function(id) {
      var relatedIdeas = [];
      var idea = Ideas.find(id).fetch()[0];
      for (var i = 0; i < idea.relatedIdeas.length; i++) {
        relatedIdeas.push( Ideas.find(idea.relatedIdeas[i]).fetch()[0] );
      }
      console.log('related idea for idea:', idea, ':', relatedIdeas);
      return relatedIdeas;
    }
  });

  /////// IDEA TEMPLATE ////////
  Template.idea.helpers({
    relatedIdea: function(id) {
      var relatedIdeas = [];
      var idea = Ideas.find(id).fetch()[0];
      for (var i = 0; i < idea.relatedIdeas.length; i++) {
        relatedIdeas.push( Ideas.find(idea.relatedIdeas[i]).fetch()[0] );
      }
      return relatedIdeas;
    },
    expandedChild: function(id) {
      var expandedChildren = [];
      var expandedChildrenIds = Session.get('expanded-' + id) || [];
      for (var i = 0; i < expandedChildrenIds.length; i++) {
        expandedChildren.push(Ideas.find(expandedChildrenIds[i]).fetch()[0]);
      }
      return expandedChildren;
    }
  })

  Template.idea.events({
    'click .related-ideas > li': function(e) {
      // $target = $(e.currentTarget);
      // var newIdea = Ideas.find($target.data('id')).fetch()[0]
      // console.log(newIdea);
      // $target.closest('.main-idea').children('.idea-list').prepend(Template.idea(newIdea));
      // autoSuggest();

      var parentId = $(e.currentTarget).closest('.main-idea').data('id'); // id of main idea
      var expandedIdea = Ideas.find($(e.currentTarget).data('id')).fetch()[0]; // current idea clicked on
      var currentPath = Session.get('expanded-' + parentId);

      if (currentPath) {
        currentPath.push(expandedIdea._id); // add expanded id onto path list
        Session.set('expanded-' + parentId, currentPath);
      } else {
        Session.set('expanded-' + parentId, [expandedIdea._id]);
      }
    }
  });
  
  ///////START IDEA NAMES LIST TEMPLATE ////////
  Template.ideaNamesList.helpers({
    idea: function() {
      return Ideas.find({}, {sort: {timestamp: -1}}).fetch();
    },
  });
  ///////END IDEA NAMES LIST TEMPLATE ////////

  //////START ideaMaps TEMPLATE ///////////
  Template.ideaMapList.ideaMaps = function () {
    return IdeaMaps.find().fetch();
  };
  //////END ideaMaps TEMPLATE ///////////





  ///////START doneBefore TEMPLATE ////////
  Template.doneBefore.events({
    'keyup .idea-query' : function () { //'click .submit'
      

      var ideaQuery = $('.idea-query').val();
      var result=Ideas.find({
        $or:[
        {title: {$regex:('.*'+ideaQuery+'.*'),$options:'i'}},
//         {description: {$regex:('.*'+ideaQuery+'.*'),$options:'i'}}
        ]
      }).fetch(); 



      if (result.length == 0){
        result={error:'None found'};
       }

      Session.set('queryResult',result);
      
      //console.log(result)
      //return result;

    },
  });

  Template.doneBeforeList.doneBeforeResult= function() {
   // console.log(Session.get('queryResult').error)
      return Session.get('queryResult')
    };
  ///////END doneBefore TEMPLATE ////////


  ///////START thoughtstream TEMPLATE ////////
  //Meteor #tutorial: http://www.skalb.com/2012/04/16/creating-a-document-sharing-site-with-meteor-js/

  Template.thoughtstream.events({
    'keyup .input > .text' : function (e) { //'click .submit'
    
      var text = $(e.currentTarget).text();
      result=text.replace("aoe","htn")

      Session.set('queryResult',result);
      
      //console.log(result)
      //return result;

    },
  });

  Template.thoughtstreamInput.thoughtstream= function() {
   // console.log(Session.get('queryResult').error)
      
      return Session.get('queryResult')
    };

  Template.thoughtstreamInput.rendered= function() {
   // console.log(Session.get('queryResult').error)
      return Session.get('cursor')
    };
  ///////END thoughtstream TEMPLATE ////////



  ///////START instaquote TEMPLATE ////////
  Template.instaquote.events({
    'keyup .text' : function (e) {
      

      var text = $(e.currentTarget).val();
      var result=Ideas.find({description: {$regex:('.*'+text+'.*'),$options:'i'}},{limit:5 }).fetch(); 
      //console.log(result)

      if (e.which === 13) { // enter

            if(text !== undefined || "") {
              var collision = QuotesLists.find({text: text}).fetch();
              if (collision.length !== 0) {
                alert('quote ' + text + ' already exists!' );
              } else {
                QuotesLists.insert({ text: text });
                $(e.currentTarget).val("");
              }
            }
      }


      for(var i=result.length;i<5;i++) {
        result[i]={description:''}
      }

      Session.set('queryResult',result);
      
      console.log(result)
      //return result;

    },



  });

  Template.instaquoteSugg.instaquoteSugg= function() {

   // console.log(Session.get('queryResult').error)
      var s=Session.get('queryResult') || []
      if(s.length>0)
        return s[0].description
      else
        return ''
    };

  Template.instaquoteSuggAbove.instaquoteSuggAbove= function() {
    
   // console.log(Session.get('queryResult').error)
      return Session.get('queryResult')
    };

  Template.instaquoteSuggBelow.instaquoteSuggBelow= function() {
   // console.log(Session.get('queryResult').error)
      return Session.get('queryResult')
    };


  Template.instaquoteList.quote= function() {
   // console.log(Session.get('queryResult').error)
      return QuotesLists.find().fetch()
    };
    ///////END instaquote TEMPLATE ////////





  ///////START votebox TEMPLATE ////////
  Template.votebox.events({
    'keyup .text' : function (e) {
      

      var text = $(e.currentTarget).val();

      if (e.which === 13) { // enter

            if(text !== undefined || "") {
              var collision = Ideas.find({description: text}).fetch();
              if (collision.length !== 0) {
                alert('Idea ' + text + ' already exists!' );
              } else {
                Ideas.insert({ description: text });
                $(e.currentTarget).val("");
                text ="";
              }

            }
      }

      
//      var result=Ideas.find({description: {$regex:('.*'+text+'.*'),$options:'i'}}).fetch(); 
      var result=Ideas.find({            
        $or:[
          {title: {$regex:('.*'+text+'.*'),$options:'i'}},
           {description: {$regex:('.*'+text+'.*'),$options:'i'}}
          ]
      }, {sort: { _id : -1 }}).fetch(); 



      Session.set('queryResult',result);
      
      //return result;

    },

  });
      

  Template.voteboxList.idea= function() {
     // console.log(Session.get('queryResult').error)
    //Session.setDefault('queryResult',Ideas.find({}, {sort: { _id : -1 }}).fetch());

      return Session.get('queryResult')

    };
  ///////END votebox TEMPLATE ////////




  ///////START IDEA INPUT TEMPLATE ////////
  Template.ideaInput.events({
    'click .idea-submit' : function () {
      var title = $('.idea-title').val();
      var description = $('.idea-description').val();
      Ideas.insert({ title: title, description: description, relatedIdeas: [],timestamp:Date.now() }); //#TODO dates server side
    }
  });

  var stringToUrl = function(text) {
    return JSON.stringify(text).replace(/\W/g, '').toLowerCase();
  }
  ///////END START IDEA INPUT TEMPLATE ////////


  //////START MAP INPUT TEMPLATE ///////
  Template.ideaMapInput.events({
    'click .map-submit' : function () {
      var mapTitle = $('.map-title').val();
      var mapUrl = stringToUrl(mapTitle);
      if(mapTitle !== undefined || "") {
        var collsion = IdeaMaps.find({url: mapUrl}).fetch();
        if (collsion.length !== 0) {
          alert('map ' + mapTitle + ' already exists! url: ' + mapUrl);
        } else {
          IdeaMaps.insert({ title: mapTitle, url: mapUrl });
          $('.map-title').val('');
        }
      }
      
       //#TODO dates server side

    }
  });
  //////END MAP INPUT TEMPLATE ///////



  //////START outlinr TEMPLATE ///////////
  Template.outlinrList.gestalt = function () {
    return Ideas.find({}, {sort: { timestamp : -1 }}).fetch();
    // return Ideas.find({}, {sort: { _id : 1 }}).fetch();
  };

  Template.outlinrVotes.on = function (id) {
      return Session.get("outlinrVoteOn-"+id) ? "on" : "";
      // return Ideas.find({}, {sort: { _id : 1 }}).fetch();
  };


  Template.outlinrGestalt.statusMsg = function () {
      var statusTable={0:"Not acknowledged",1:"Acknowledged",2:"In Progress", 3:"Done"}; 
      
      return statusTable[(this.status+0)];
  };


  Template.outlinrGestalt.created = function() { 
      var time = this.timestamp;
      if(time instanceof Date)
        return time.toDateString();

      return time;
  }; 


  Template.outlinrInput.events({
    'click .submit' : function () {

      var text = $('.input > .text').val();

      if(text !== undefined || "") {
          // Ideas.insert({ title:titleDesc[0], description:titleDesc[1], text:text, status:0, votes:0, creator:'anon' });
          //Meteor.call("addNewIdea",{ title:titleDesc[0], description:titleDesc[1], text:text, status:0, votes:0, creator:'anon' });
          
          addNewIdeas({text:text});
          $('.input > .text').val('');
      }

    },

  });



  Template.outlinrVotes.events({
    'click div.votes' : function (e) {
      
      var target=$(e.currentTarget);
      console.log(x=target)
      var id=target.data('id');
      

      if (!Session.get("outlinrVoteOn-"+id)) {
        
        Session.set("outlinrVoteOn-"+id,true)
//        target.children('.vote').addClass('on'); 
        Ideas.update({ _id: id }, { $inc: { 'votes': 1 } });
      }
      else {
        Session.set("outlinrVoteOn-"+id,false)
  //      target.children('.vote').removeClass('on');
        Ideas.update({ _id: id }, { $inc: { 'votes': -1 } });
      }
    }
  });

  //////END outlinr TEMPLATE ///////////


//////START hackathon TEMPLATE ///////////
  Template.hackathonList.gestalt = function () {
    return Ideas.find({}, {sort: { timestamp : -1 }}).fetch();
    // return Ideas.find({}, {sort: { _id : 1 }}).fetch();
  };

  Template.hackathonVotes.on = function (id) {
      return Session.get("hackathonVoteOn-"+id) ? "on" : "";
      // return Ideas.find({}, {sort: { _id : 1 }}).fetch();
  };


  Template.hackathonGestalt.statusMsg = function () {
      var statusTable={0:"Not acknowledged",1:"Acknowledged",2:"In Progress", 3:"Done"}; 
      
      return statusTable[(this.status+0)];
  };


  Template.hackathonGestalt.created = function() { 
      var time = this.timestamp;
      if(time instanceof Date)
        return time.toDateString();

      return time;
  }; 



  Template.hackathonGestalt.edit = function() { 
      var time = this.timestamp;
      if(time instanceof Date)
        return time.toDateString();

      return time;
  }; 

  Template.hackathonGestalt.numComments = function(id) { 
      // console.log(Ideas.find({_id:id}).comments);
      // console.log(this.comments.length);
      // return Ideas.find({_id:id}).comments.length;
      // var c = Ideas.find({_id:id}).fetch().comments;
      // var n = 0;
      // if(c)
      //   n=c.length;
      // console.log(c);
      // return n;
      if(this.comments){
        // console.log(this.comments.length);
        return this.comments.length;
      }
      else
        return 0;
  };


  Template.hackathonGestalt.commentsExpanded = function(id) { 
      return Session.get("commentsExpanded-"+id)===true;
  };

  Template.hackathonGestalt.ideaEditable = function() { 
      return Session.get("ideaEditable-"+this._id)===true
//      return true;
  }; 


  Template.hackathonGestalt.comment = function() { 
      if(this.comments)
        return this.comments.reverse();
      else 
        return []; 
  }; 


  Template.hackathonInput.events({
    'click .input>.submit' : function () {

      var text = $('.input > .text').val();

      if(text) {
          addNewIdeasText(text); 
          $('.input > .text').val('');
      }

    },
  });

  Template.hackathonGestalt.events({
    'click .expand-comments' : function (e) {
      var gestaltId=$(e.currentTarget).closest('.gestalt').data('id');
      Session.set("commentsExpanded-"+gestaltId,!(Session.get("commentsExpanded-"+gestaltId)===true));
      // console.log(Session.get("commentsExpanded-"+gestaltId)===true);
    },
    'click .add-comment > .submit' : function (e) {
        
        var gestaltId=$(e.currentTarget).closest('.gestalt').data('id');
        var comment=$(e.currentTarget).closest('.add-comment').find('.comment').val();
        if(comment)
          Ideas.update({_id:gestaltId}, {$push:{comments:{commentText:comment}}});  

      // console.log(comment)
    },
    'click .idea-body>.edit' : function (e) {
      //console.log('eue')
      Session.set("ideaEditable-"+this._id,true);
      $(e.currentTarget).closest('.idea-body').find('.idea-txt').focus()

//      var gestaltId=$(e.currentTarget).attr("contentEditable","true");
//      var gestaltId=$(e.currentTarget).parent().find('.update-idea').attr("contentEditable","true");
    },

    'click .idea-body>.cancel' : function (e) {
      //console.log('eue')
      Session.set("ideaEditable-"+this._id,false);
//      var gestaltId=$(e.currentTarget).attr("contentEditable","true");
//      var gestaltId=$(e.currentTarget).parent().find('.update-idea').attr("contentEditable","true");
    },
    'click .update-idea' : function (e) {
      console.log('oeuoeu')
      var gestaltId=$(e.currentTarget).closest('.gestalt').data('id');
      
      var newTxt=$(e.currentTarget).closest('.idea-body').find('.idea-txt').html();
      newTxt=stripHTML(newTxt)
      console.log(x=newTxt)

      updateIdea({_id:gestaltId},{text:newTxt});
      Session.set("ideaEditable-"+gestaltId,false);
      
    },

    'click .add-comment > .submit' : function (e) {
      var gestaltId=$(e.currentTarget).closest('.gestalt').data('id');
      var comment=$(e.currentTarget).closest('.add-comment').find('.comment').val();
      Ideas.update({_id:gestaltId}, {$push:{comments:{commentTxt:comment}}});  

    },
    'click .edit-idea' : function(e){
        var gestaltId=$(e.currentTarget).closest('.gestalt').data('id');
        console.log(gestaltId); 
    },
  });


  Template.hackathonVotes.events({
    'click div.votes' : function (e) {
      
      var target=$(e.currentTarget);
      console.log(x=target)
      var id=target.data('id');
      

      if (!Session.get("hackathonVoteOn-"+id)) {
        
        Session.set("hackathonVoteOn-"+id,true)
//        target.children('.vote').addClass('on'); 
        Ideas.update({ _id: id }, { $inc: { 'votes': 1 } });
      }
      else {
        Session.set("hackathonVoteOn-"+id,false)
  //      target.children('.vote').removeClass('on');
        Ideas.update({ _id: id }, { $inc: { 'votes': -1 } });
      }
    }
  });

  function stripHTML(html)
  {
     var tmp = document.createElement("DIV");
     tmp.innerHTML = html;
     return tmp.textContent || tmp.innerText || "";
  }
  //////END hackathon TEMPLATE ///////////

  function addNewIdeasText(ideas) {
    return $.map(splitIdeas(ideas), function(idea) { return addNewIdea({text:idea}) });
  }

  function splitIdeas(ideas) {
      return ideas.replace(/\r/, "").replace(/\n(\n)+/, "\n\n").split(/\n\n/);
  }

  function extractIdeaNameDesc(idea) {
      var TITLE_MAX_LEN=50;
      var TITLE_DELIM="--";

      idea=idea.trim();

      i=idea.substr(0,TITLE_MAX_LEN).indexOf(TITLE_DELIM);

      if(i<0) i=TITLE_MAX_LEN;

      return [idea.substr(0,i).trim(),idea.substr(i+TITLE_DELIM.length).trim()];
  }


  function addNewIdea(doc) {   
    if(!doc.title && !doc.description) {
      var titleDesc=extractIdeaNameDesc(doc.text);
      doc.title=titleDesc[0]
      doc.description=titleDesc[1]
    }

    if(!doc.status)
      doc.status=0;

    if(!doc.votes)
      doc.votes=0;
      
    if(!doc.creator)
      doc.creator='anon';

    if(!doc.relatedIdeas)
      doc.relatedIdeas=[];
        
    return Meteor.call("addIdea",doc); 
  }


  function updateIdea(sel,doc) {   
    if(!sel._id) {
      console.log('update failed')
      return false;
    }
    console.log('update: '+sel._id + " " + doc.text + " :upd")

    if(!doc.title && !doc.description) {
      var titleDesc=extractIdeaNameDesc(doc.text);
      doc.title=titleDesc[0]
      doc.description=titleDesc[1]
    }

        
    return Meteor.call("updateIdeaServer",{sel:sel,doc:doc}); 
  }




}

if (Meteor.isServer) {

  Meteor.methods({
    addIdea: function (doc) {
      doc.timestamp = new Date;
      return Ideas.insert(doc);
    },

    updateIdeaServer: function (selDoc) {
      
      doc.timestamp = new Date;
      console.log(selDoc.doc.text)
      return Ideas.update(selDoc.sel,selDoc.doc);
    }


  });


/*  Meteor.startup(function () {

  });*/
}
