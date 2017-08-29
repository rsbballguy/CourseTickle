var exports = module.exports = {};
var cheerioReq = require("cheerio-req");
var Q = require('q');

exports.buildURL = function(school, semester, crn){
	if(school == "VCU"){
		var yearID   = {"fall"  : "201810",
						"spring": "201820",
						"summer": "201830"}
		var url = "https://ssb.vcu.edu/proddad/bwckschd.p_disp_detail_sched?term_in="+yearID[semester]+"&crn_in="+crn
		return url
	}
}
exports.getSpace = function(url){
	return new Promise(function(resolve, reject){
		cheerioReq(url, (err, $) => {
		 if(err){
		 	reject(err);
		 }
		 var str = $(".datadisplaytable").text();
		 var title = str.split("\n")[2];
		 var className = title.split("-")[2].trim();
		 var CRN = title.split("-")[1].trim();
		 str = str.substring(str.indexOf("Seats"));
		 var remaining = parseInt(str.split("\n")[3]);
		 var returnString = ""
		 if(remaining > 0){
		 	if(remaining == 1){
		 		returnString = (className+" (CRN: "+CRN+") has 1 seat open! Sign up ASAP!")
		 	}
		 	else{
		 		returnString = (className+" (CRN: "+CRN+") has "+remaining+" spots open! Sign up now!");
		 	}
		 }
		 else if(remaining == 0){
			returnString = (className+" (CRN: "+CRN+") is full, it has zero seats open");
		 }
		 else{
			returnString = (className+" (CRN: "+CRN+") is "+Math.abs(remaining)+" over capacity, try to get an override!")
		 }
		 resolve([returnString, CRN, remaining]);
		});
	});
}

exports.runForSchool = function(school, crns){
	var fin = {}
    var deferred = Q.defer();

	var count = 0
	for (var id in crns){
		var url = this.buildURL("VCU", "fall", crns[id])
		this.getSpace(url).then(function(data){
		  fin[data[1]] = data[0];
		  if(count == crns.length-1){
			deferred.resolve([fin, data[2]]);
		  }
		  count++
		});
	}
	return deferred.promise;
}
exports.run = function(){
	var crns = {"VCU" : ["11726", "20097","36067", "28934", "34519", "36092", "36127", "27039", "10166"]}
	setInterval(function(){
		this.runForSchool("VCU", crns["VCU"]).then(function(data){
			console.log(data);
		});
	}, 1000);
}