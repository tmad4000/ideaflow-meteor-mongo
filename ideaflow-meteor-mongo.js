Ideas = new Meteor.Collection('ideas');

if (Meteor.isClient) {




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
    'click .idea-submit, keypress .' : function () {
      var title = $('.idea-title').val();
      var description = $('.idea-description').val();
      Ideas.insert({ title: title, description: description, relatedIdeas: [],timestamp:Date.now() }); //#TODO dates server side
    }
  });

  Template.ideaList.events({
    'click .related-idea-submit': function(e) {
      /*var title = $(e.target).prevAll('.related-idea-add-ms:first input').val();
      console.log('related idea title:', title);
*/
      
      //console.log(x=$(e.target).nextAll('.related-idea-add-ms').first());
      var newRelIdeas = $(e.target).nextAll('.related-idea-add-ms').first().magicSuggest().getSelectedItems();
      console.log(x=newRelIdeas);

       



      var mainIdeaId = $(e.target).closest('.main-idea').attr('id');

      for(var i=0;i<newRelIdeas.length;i++) {
        var relatedIdeaId = Ideas.insert({ title: newRelIdeas[i].name, description: ''+newRelIdeas[i].description, relatedIdeas: [],timestamp:Date.now() });  //#TODO dates server side
        Ideas.update(mainIdeaId, { $push: {relatedIdeas: relatedIdeaId} })
      }

    }
  });

  Template.ideaList.rendered = function() {
     window.msAutofillInline = $('.related-idea-add').magicSuggest({
          // selectionPosition: 'right',
          cls: 'related-idea-add-ms',
          selectionCls: 'related-idea-selected-ms',
          renderer: function(idea){
              //console.log(idea.name)
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
              
          }],
          //data: '/ajax/autocomplete/', //jsonData2
          selectionPosition: 'right',
          emptyText:'Add related ideas',
          selectionStacked: true
        });
  }
}

if (Meteor.isServer) {
  Meteor.startup(function () {

  });
}
        