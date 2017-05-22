function parseQuery(q) {
  
  return res;
}

function queryBuilder(param) {

    // Is there any ',' ?

    var query = "";

    var tmp = _.map(param.search.split(','), function(q)
    {
      var filters = _.uniq(q.match(/((\(.+\))|\S+\:)/i))

      _.each(filters, function(f){
        if (param.reqType == null || param.reqType != "loadPage")  
          q = q.replace(f,param.docType + '_' + f);
        
      });

      return q;
    });

  	query += "q=" +  encodeURIComponent(tmp.join(" OR "));
  	query += "&from=" + param.from;
  	query += "&to=" + param.to;
  	query += "&docType=" + param.docType;
    query += "&sort=" + param.sort;
    query += "&rows=" + param.rows;
    if (param.reqType != null) 
      query += "&reqType=" + param.reqType;

  	return query;
} 

function normalizedDocs(result,docType) {

  if (result.data.grouped != null) {
    result.data.response = {}
    result.data.response.numFound = result.data.grouped.seq_content_id.doclist.numFound;
    result.data.response.start    = result.data.grouped.seq_content_id.doclist.start;
    result.data.response.maxScore = result.data.grouped.seq_content_id.doclist.maxScore;
    result.data.response.docs     = result.data.grouped.seq_content_id.doclist.docs;
    result.data.grouped = {}
  }

	result.data.response.docs = _.map(result.data.response.docs, function(d){
		d.site = d[docType + "_site"];
		d.url = d[docType + "_url"];
		d.url_id = d[docType + "_url_id"];
    d.page_id = d[docType + "_page_id"];
		d.title = d[docType + "_title"];
		d.date = d[docType + "_date"];
    d.date_accuracy = d[docType + "_date_accuracy"];
		d.author = d[docType + "_author"];

		if (docType == "seq") {
			d.content = [_.pick(d,["seq_type","seq_markup","seq_content"])];
			d = _.omit(d,["seq_site","seq_url","seq_url_id","seq_title","seq_date_accuracy","seq_type","seq_markup","seq_content","seq_author","seq_date","seq_page_id"]);
		} else {
			d.content = d._childDocuments_;
			d = _.omit(d,["page_site","page_url","page_url_id","page_title","_childDocuments_","page_author","page_date","page_date_accuracy"]);
		}

		return d;
	});

	if (result.data.facet_counts != null) {
		result.data.facet_counts.facet_fields.author = result.data.facet_counts.facet_fields[docType + "_author"];
		result.data.facet_counts.facet_fields.site   = result.data.facet_counts.facet_fields[docType + "_site"];
		result.data.facet_counts.facet_fields.space  = result.data.facet_counts.facet_fields[docType + "_space"];
		result.data.facet_counts.facet_fields = _.omit(result.data.facet_counts.facet_fields,[docType + "_author",docType + "_site",docType + "_space"]);
	}

	return result;
}