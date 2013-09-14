if (Ideas.find().fetch().length === 0) {
	var data =  [{
	      title: "Panda",
	      description: "Pandas are great furry animals",
	      
	  },{
	      title: "Butterfly",
	      description: "Butterflies fly better with theirs wings on",
	      
	  },{
	      title: "Dolphin",
	      description: "Dolphins call themselves by title like we do",
	      
	  },
	  {
	      title: "Lion",
	      description: "Females do 85 to 90 percent of the pride's hunting, while the males patrol the territory and protect the pride, for which they take the \"lion's share\" of the females' prey.",
	      
	  },{
	      title: "Platypus",
	      description: "A strike from a toxic platypus spur can kill a dog.",
	      
	  },
	  {
	      title: "Echidna",
	      description: "The echidna has a long tongue around 18cm long that can whip in and out of its mouth at incredible speeds.",
	      
	  }];

	for (var i = 0; i < data.length; i++) {
		Ideas.insert({title: data[i].title,
	                  description: data[i].description,
	                  relatedIdeas: [],
	                  timestamp:Date.now()});
	}
}