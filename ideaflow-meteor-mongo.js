Ideas = new Meteor.Collection('ideas');

if (Meteor.isClient) {

  Template.ideaList.helpers({
    idea: function() {
      return Ideas.find().fetch();
    },
    relatedIdea: function(id) {
      var relatedIdeas = [];
      var idea = Ideas.find(id).fetch()[0];
      console.log('idea:', idea);
      for (var i = 0; i < idea.relatedIdeas.length; i++) {
        relatedIdeas.push( Ideas.find(idea.relatedIdeas[i]).fetch()[0] );
      }
      console.log('related ideas:', relatedIdeas);
      return relatedIdeas;
    }
  });



  Template.ideaInput.events({
    'click .idea-submit' : function () {
      console.log('clieckd');
      var title = $('.idea-title').val();
      var description = $('.idea-description').val();
      Ideas.insert({ title: title, description: description, relatedIdeas: [] });
    }
  });

  Template.ideaList.events({
    'click .related-idea-submit': function(e) {
      var title = $(e.target).prevAll('.related-idea-title:first').val();
      var mainIdeaId = $(e.target).closest('.main-idea').attr('id');

      var relatedIdeaId = Ideas.insert({ title: title, description: '', relatedIdeas: [] });    
      Ideas.update(mainIdeaId, { $push: {relatedIdeas: relatedIdeaId} })
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {

  });
}
