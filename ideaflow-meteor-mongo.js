Ideas = new Meteor.Collection('ideas');

var msOpts = {
  cls: 'related-idea-add-ms',
  selectionCls: 'related-idea-selected-ms',
  renderer: function(idea){
      return '<div>' +
              '<div style="font-family: Arial; font-weight: bold">' + idea.name + '</div>' +
              '<div><b>Text</b>: ' + idea.description + '</div>' +
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
  data: [{
      id: 0,
      name: "Panda",
      description: "Pandas are great furry animals",
      
  },{
      id: 1,
      name: "Butterfly",
      description: "Butterflies fly better with theirs wings on",
      
  },{
      id: 2,
      name: "Dolphin",
      description: "Dolphins call themselves by name like we do",
      
  },
  {
      id: 3,
      name: "Lion",
      description: "Females do 85 to 90 percent of the pride's hunting, while the males patrol the territory and protect the pride, for which they take the \"lion's share\" of the females' prey.",
      
  },{
      id: 4,
      name: "Platypus",
      description: "A strike from a toxic platypus spur can kill a dog.",
      
  },
  {
      id: 5,
      name: "Echidna",
      description: "The echidna has a long tongue around 18cm long that can whip in and out of its mouth at incredible speeds.",
      
  }],
  //data: '/ajax/autocomplete/', //jsonData2
  selectionPosition: 'right',
  emptyText:'Connect related ideas',
  selectionStacked: true
};

if (Meteor.isClient) {
  var autoSuggest = function() {
        $('.related-idea-add').each(function() {
          $($(this).magicSuggest(msOpts)).on('selectionchange', function(events, combo, selection) {
            var newRelIdeas = selection;
            var mainIdeaId = combo.container.closest('.main-idea').attr('id');

            for (var i = 0; i < newRelIdeas.length; i++) {
                var existingIdea = Ideas.find(newRelIdeas[i].id).fetch()[0]; // see if related idea is already in db
                var relatedIdeaId;
                if (!existingIdea) { // if not already in db, insert the idea
                  relatedIdeaId = Ideas.insert({ title: newRelIdeas[i].name,
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
      return Ideas.find({}, {sort: {timestamp: -1}}).fetch();
    }
  });

  Template.ideaList.rendered = function() {
    autoSuggest(); // attach magicsuggest to 
  };

  /////// IDEA TEMPLATE ////////
  Template.idea.helpers({
    relatedIdea: function(id) {
      var relatedIdeas = [];
      var idea = Ideas.find(id).fetch()[0];

      for (var i = 0; i < idea.relatedIdeas.length; i++) {
        relatedIdeas.push( Ideas.find(idea.relatedIdeas[i]).fetch()[0] );
      }
      // sort here
      return relatedIdeas;
    },
    expandedIdea: function(id) {
      var expandedIdeas = Session.get('expandedIdeas');

    }
  })

  Template.idea.events({
    'click .related-ideas > li': function(e) {
      $target = $(e.target);
      var newIdea = Ideas.find($target.data('id')).fetch()[0]
      Session.set()
      $target.closest('.main-idea').children('.idea-list').prepend(Template.idea(newIdea));
      autoSuggest();
    }
  });
  
  /////// IDEA NAMES LIST TEMPLATE ////////
  Template.ideaNamesList.helpers({
    idea: function() {
      return Ideas.find({}, {sort: {timestamp: -1}}).fetch();
    },
  });

  /////// IDEA INPUT TEMPLATE ////////
  Template.ideaInput.events({
    'click .idea-submit, keypress .' : function () {
      var title = $('.idea-title').val();
      var description = $('.idea-description').val();
      Ideas.insert({ title: title, description: description, relatedIdeas: [],timestamp:Date.now() }); //#TODO dates server side
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {

  });
}