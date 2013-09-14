

if (Meteor.isClient) {
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
            var mainIdeaId = combo.container.closest('.main-idea').attr('id');

            for (var i = 0; i < newRelIdeas.length; i++) {
                var existingIdea = Ideas.find(newRelIdeas[i]._id).fetch()[0]; // see if related idea is already in db
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
      console.log(newIdea);
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