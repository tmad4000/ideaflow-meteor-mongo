

if (Meteor.isClient) {
  Meteor.Router.add({
    '/': 'ideaMap',
    '/index': 'ideaMapIndex',
    '/donebefore': 'doneBefore',
    '/instaquote': 'instaquote',
    '/votebox': 'votebox',
    '/outlinr': 'outlinr',
    '/thoughtstream': 'thoughtstream',

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
      // $target = $(e.target);
      // var newIdea = Ideas.find($target.data('id')).fetch()[0]
      // console.log(newIdea);
      // $target.closest('.main-idea').children('.idea-list').prepend(Template.idea(newIdea));
      // autoSuggest();

      var parentId = $(e.target).closest('.main-idea').data('id'); // id of main idea
      var expandedIdea = Ideas.find($(e.target).data('id')).fetch()[0]; // current idea clicked on
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
    
      var text = $(e.target).text();
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
      

      var text = $(e.target).val();
      var result=Ideas.find({description: {$regex:('.*'+text+'.*'),$options:'i'}},{limit:5 }).fetch(); 
      //console.log(result)

      if (e.which === 13) { // enter

            if(text !== undefined || "") {
              var collision = QuotesLists.find({text: text}).fetch();
              if (collision.length !== 0) {
                alert('quote ' + text + ' already exists!' );
              } else {
                QuotesLists.insert({ text: text });
                $(e.target).val("");
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
      

      var text = $(e.target).val();

      if (e.which === 13) { // enter

            if(text !== undefined || "") {
              var collision = Ideas.find({description: text}).fetch();
              if (collision.length !== 0) {
                alert('Idea ' + text + ' already exists!' );
              } else {
                Ideas.insert({ description: text });
                $(e.target).val("");
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

    Template.outlinrInput.events({
    'click .submit' : function () {

      var text = $('.input > .text').val();

      var titleDesc=extractIdeaNameDesc(text);

     

      if(text !== undefined || "") {

          // Ideas.insert({ title:titleDesc[0], description:titleDesc[1], text:text, status:0, votes:0, creator:'anon' });
          Meteor.call("addItem",{ title:titleDesc[0], description:titleDesc[1], text:text, status:0, votes:0, creator:'anon' });
          $('.input > .text').val('');
      }

    }
  });


  Template.outlinrList.helpers({
      created: function() { 
          var time = this.timestamp;
          if(time instanceof Date)
            return time.toDateString()
  
          return time
      }
  }); 

  //////END outlinr TEMPLATE ///////////




  function extractIdeaNameDesc(idea) {
      var TITLE_MAX_LEN=50;
      var TITLE_DELIM="--";

      idea=idea.trim();

      i=idea.substr(0,TITLE_MAX_LEN).indexOf(TITLE_DELIM);

      if(i<0) i=TITLE_MAX_LEN;

      return [idea.substr(0,i).trim(),idea.substr(i+TITLE_DELIM.length).trim()];
  }



}

if (Meteor.isServer) {

    Meteor.methods({
    addItem: function (doc) {
      doc.timestamp = new Date;
      return Ideas.insert(doc);
    }
  });

  Meteor.startup(function () {

  });
}