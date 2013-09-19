if (Ideas.find().fetch().length === 0) {
	var data =  [{
	      title: "Panda",
	      description: "Pandas are great furry animals",
	      text:'', status:0, votes:0, creator:'anon'
	      
	  },{
	      title: "Butterfly",
	      description: "Butterflies fly better with theirs wings on",
	      text:'', status:0, votes:0, creator:'anon'
	      
	  },{
	      title: "Dolphin",
	      description: "Dolphins call themselves by title like we do",
	      text:'', status:0, votes:0, creator:'anon'
	      
	  },
	  {
	      title: "Lion",
	      description: "Females do 85 to 90 percent of the pride's hunting, while the males patrol the territory and protect the pride, for which they take the \"lion's share\" of the females' prey.",
	      text:'', status:0, votes:0, creator:'anon'
	      
	  },{
	      title: "Platypus",
	      description: "A strike from a toxic platypus spur can kill a dog.",
	      text:'', status:0, votes:0, creator:'anon'
	      
	  },
	  {
	      title: "Echidna",
	      description: "The echidna has a long tongue around 18cm long that can whip in and out of its mouth at incredible speeds.",
	      text:'', status:0, votes:0, creator:'anon'
	      
	  }];

	for (var i = 0; i < data.length; i++) {
		var doc = {
	      title: data[i].title,
	      description: data[i].description,
	      text:data[i].text ? data[i].text : data[i].title+data[i].description,
	       status:data[i].status, votes:data[i].votes, creator:data[i].creator,
	                  relatedIdeas: [],
	                  timestamp: Date.now()}


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


		Ideas.insert(doc);
	}
}