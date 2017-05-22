/*
 * home made tools
 */

module.exports = function() { 

	// diff in days between 2 dates like '2011-11-15'
    this.datesDiff = function(d1, d2) { 
    	// 24 * 60 * 60 * 1000
    	var diff =  Math.floor(( Date.parse(d2) - Date.parse(d1) ) / 86400000);
    	return diff;
    };

    // return an array of dates from a given days to occ * nbDays
    this.datesSeries = function(from,occ,nbDays) {
	    dates = [];
	    for (var i = 0; i < occ; i++) {
	      var d = new Date(from);
	      d.setDate(d.getDate() + i*nbDays);
	      dates.push(d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2));             
	    }  
	    return dates;
	}

}