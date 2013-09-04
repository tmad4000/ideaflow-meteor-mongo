Ideas = new Meteor.Collection('ideas');

if (Meteor.isClient) {

  $(function() {


    window.msAutofillInline = $('.related-idea-add').magicSuggest({
        // selectionPosition: 'right',
        selectionCls: 'selectedx',
        renderer: function(idea){
            //console.log(idea.name)
            return '<div>' +
                    '<div style="font-family: Arial; font-weight: bold">' + idea.name + '</div>' +
                    '<div><b>Text</b>: ' + idea.desc + '</div>' +
                   '</div>';
        },
        minChars: 0,
        typeDelay: 20,
        selectionStacked: true,
        method:'GET',
        expanded:true,
        expandOnFocus:true,
        maxDropHeight:'500px',
        name:'query',
        data: [{
            id: 0,
            name: "Panda",
            desc: "Pandas are great furry animals",
            
        },{
            id: 1,
            name: "Butterfly",
            desc: "Butterflies fly better with theirs wings on",
            
        },{
            id: 2,
            name: "Dolphin",
            desc: "Dolphins call themselves by name like we do",
            
        }],
        //data: '/ajax/autocomplete/', //jsonData2
        selectionPosition: 'right',
        emptyText:'Add related ideas',
        selectionStacked: true
      });    

  });



  Template.ideaList.helpers({
    idea: function() {
//      return Ideas.find().fetch();
      return Ideas.find({}, {sort: {timestamp: -1}}).fetch();
//TODO: reverse order

//      return Ideas.find({}, {sort: {$natural: 1}}).fetch();
//      return Ideas.find({}, {sort: {timestamp: -1}}).fetch();
    },
    relatedIdea: function(id) {
      var relatedIdeas = [];
      var idea = Ideas.find(id).fetch()[0];

      for (var i = 0; i < idea.relatedIdeas.length; i++) {
        relatedIdeas.push( Ideas.find(idea.relatedIdeas[i]).fetch()[0] );
      }
      // sort here
      return relatedIdeas;
    }
  });



  Template.ideaInput.events({
    'click .idea-submit' : function () {
      var title = $('.idea-title').val();
      var description = $('.idea-description').val();
      Ideas.insert({ title: title, description: description, relatedIdeas: [],timestamp:Date.now() });
    }
  });

  Template.ideaList.events({
    'click .related-idea-submit': function(e) {
      var title = $(e.target).prevAll('.related-idea-add:first').val();
      console.log('related idea title:', title);
      var mainIdeaId = $(e.target).closest('.main-idea').attr('id');

      var relatedIdeaId = Ideas.insert({ title: title, description: '', relatedIdeas: [],timestamp:Date.now() });    
      Ideas.update(mainIdeaId, { $push: {relatedIdeas: relatedIdeaId} })

    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {

  });
}
        