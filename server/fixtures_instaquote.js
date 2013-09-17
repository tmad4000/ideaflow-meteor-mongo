if (AllQuotes.find().fetch().length === 0) {
	var data =  [{
	      
	      text: "Pandas are great furry animals",
	      
	  },{
	      
	      text: "Butterflies fly better with theirs wings on",
	      
	  },{
	      
	      text: "Dolphins call themselves by name",
	      
	  },
	  {
	      
	      text: "Females do 85 to 90 percent of the pride's hunting, while the males patrol the territory and protect the pride, for which they take the \"lion's share\" of the females' prey.",
	      
	  },{
	      
	      text: "A strike from a toxic platypus spur can kill a dog.",
	      
	  },
	  {
	      text: "The echidna has a long tongue around 18cm long that can whip in and out of its mouth at incredible speeds.",
	      
	  }];

	for (var i = 0; i < data.length; i++) {
		AllQuotes.insert({
	                  text: data[i].text,
	                 });
	}
}