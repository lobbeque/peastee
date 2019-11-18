/*
 * Ask Solr for many things 
 */

var app    = require("./lib/js/app.js").app;
var _      = require("underscore");
var fs     = require("fs");
var http   = require("http");
var async  = require("async");
var sha256 = require('js-sha256').sha256;

// home made js tools lib

require("./lib/js/tools.js")();
var sites  = require("./ressources/sites.js").sites;
var config = require("./ressources/conf.js").config;

app.configure();

http.createServer(app).listen(config.port, function() {
	console.log("Server listening on port " + config.port);
});

function solrQueryBuilder(param,reqType) {
  
  var query = "";

  var docType = param.docType;

  // common params

  query += (param.q != null) ? "q=" + encodeURIComponent(param.q) : ""; 
  query += (param.from != null && param.to != null) ? "&fq=" + docType + "_date:" + encodeURIComponent("[" + param.from + " TO " + param.to + "]") : "";
  query += (docType == "page") ? "&fq=is_page:true" : "&fq=is_page:false";
  query += "&df=" + docType + "_text_shingle"; 

  // param related to a specific request type

  switch(reqType) {
    case "archive":
      query += (param.rows != null) ? "&rows=" + param.rows : "&rows=10"; 
      query += (docType == "page") ? "&fl=page_url,page_site,page_url_id,page_title,page_date,page_date_accuracy,page_author,[child%20parentFilter=is_page:true%20limit=1000]" : "&fl=seq_type,seq_markup,seq_content,seq_author,seq_date,seq_date_accuracy,seq_site,seq_url,seq_url_id,seq_title,seq_page_id,seq_content_id";
      query += "&facet=true&facet.field=" + docType + "_author&facet.field=" + docType + "_site&facet.field=" + docType + "_space&facet.limit=5";
      query += "&debugQuery=true"
      query += (docType == "page") ? "" : "&group=true&group.field=seq_content_id&group.sort=seq_date%20asc&group.limit=1&group.format=simple";
      query += (param.sort != null && param.sort != "score" && param.sort != "") ? "&sort=" + docType + "_date%20" + param.sort : "";      
      break;
    case "loadPage":
      query += "&rows=1"; 
      query += "&fl=page_url,page_site,page_url_id,page_title,page_date,page_date_accuracy,page_author,[child%20parentFilter=is_page:true%20limit=1000]";     
      break;      
    case "ngram":
      query += "&rows=1";
      query += (docType == "page") ? "" : "&group=true&group.field=seq_content_id&group.sort=seq_date%20asc&group.limit=1&group.format=simple";
      break;
    case "date":
      query += "&rows=1";
      break;
  }    

  return query;
} 

function getVersions(resp,reqType,docType,res) {

  // if (reqType != "archive" || docType != "page") {
    res.send(resp)
    return;
  // }

  async.map(JSON.parse(resp).response.docs, function(doc,next){

    var path = "/solr/ediasporas_maroco/select?q=*:*&fq=page_url_id:" + doc.page_url_id + "&fl=download_date_f&sort=download_date_f%20asc&rows=100000";

      var options = {
          hostname: config.solr.hostname,
          port: config.solr.port,
          method: 'GET',
          path: path
      };  

      var versions = "";        

      var httpReq = http.request(options, function(httpRes) {

          httpRes.setEncoding('utf8');

          httpRes.on('data', function(results) {
              versions = versions + results;
          });

          httpRes.on('end', function(err) {
            doc["page_date_version"] = _.map(JSON.parse(versions).response.docs, function(d) {return d.download_date_f;});
            next(null,doc);
          });
      });   

      httpReq.end();  

  }, function(err, results) {
      JSON.parse(resp).response.docs = results;
      res.send(resp)
  });

}

app.get('/getArchives', function(req, res){

  console.log("\n==============================\n");

  var reqType = "archive"

  if (req.query.reqType != null)
    reqType = req.query.reqType;

	var path = "/solr/ediasporas_maroco/select?" + solrQueryBuilder(req.query,reqType);

  console.log("> Get Archives\n" + "http://lame11.enst.fr:8800" + path)

  var options = {
        hostname: config.solr.hostname,
        port: config.solr.port,
        method: 'GET',
        path: path
    };  

    var resp = "";        

    var httpReq = http.request(options, function(httpRes) {

        httpRes.setEncoding('utf8');

        httpRes.on('data', function(results) {
            resp = resp + results;
        });

        httpRes.on('end', function(err) {
          res.send(resp)
        });
    });

    httpReq.end();    

});

app.get('/getEvents', function(req, res){

  console.log("\n==============================\n");

  var path = "/solr/events_maroco/select?q=" + encodeURIComponent(req.query.q) +"&fq=date:[" + req.query.from +"%20TO%20" + req.query.to + "]&rows=1";

  console.log("> Get Events\n" + "http://lame11.enst.fr:8800" + path)

  var options = {
        hostname: config.solr.hostname,
        port: config.solr.port,
        method: 'GET',
        path: path
    };  

    var resp = "";        

    var httpReq = http.request(options, function(httpRes) {

        httpRes.setEncoding('utf8');

        httpRes.on('data', function(results) {
            resp = resp + results;
        });

        httpRes.on('end', function(err) {
          res.send(resp)
        });
    });

    httpReq.end();    

});

function getDateBorder (path, dateField, order, next) {

  path += "&rows=1&sort=" + dateField + "%20" + order;

  console.log("> Get Min Date\n" + "http://lame11.enst.fr:8800" + path)

  var options = {
      hostname: config.solr.hostname,
      port: config.solr.port,
      method: 'GET',
      path: path
  };  

  var resp = "";

  var httpReq = http.request(options, function(httpRes) {

      httpRes.setEncoding('utf8');

      httpRes.on('data', function(results) {
        resp = resp + results;
      });

      httpRes.on('end', function(err) {
        if (JSON.parse(resp).response != null && JSON.parse(resp).response.docs[0][dateField] != null) {
          next(null,JSON.parse(resp).response.docs[0][dateField]);
        } else if (JSON.parse(resp).grouped.seq_content_id.doclist.docs[0][dateField] != null) {
          next(null,JSON.parse(resp).grouped.seq_content_id.doclist.docs[0][dateField]);
        } else {
          next(null,"*");
        } 
      });

  });

  httpReq.end();         

}


app.get('/getNgrams', function(req, res){

  var from = req.query.from;
  var to   = req.query.to;
  var q    = encodeURIComponent(req.query.q.trim());

  req.query.q = "*";

  var dateField;

  if (req.query.docType == "seq") {
    dateField = "seq_date";
  } else {
    dateField = "page_date";
  }

  var path = "/solr/ediasporas_maroco/select?" + solrQueryBuilder(_.omit(req.query,["from","to"]),"ngram");

  async.waterfall([

    function(next) {
      if (from != "*") {
        next(null,from);
      } else {
        getDateBorder(path,dateField,"asc",next);
      }
    },
    function(from, next) {
      if (to == "*") {
        to = "NOW/DAY"
      }
      var facet={
        "bydate" : {
          "range" : {
            "field" : dateField,
            "start" : from,
            "end" : to,
            "gap" : "%2B7DAY",
            "facet" : {
              "match" : { 
                "query" : {
                  "q" : q
                }
              },
              "all" : { 
                "query" : {
                  "q" : "*"
                }
              }       
            }
          }
        }
      }       
      path += "&json.facet=" + JSON.stringify(facet);

      console.log("> Get Ngrams\n" + "http://lame11.enst.fr:8800" + path);

      var options = {
          hostname: config.solr.hostname,
          port: config.solr.port,
          method: 'GET',
          path: path
      };  

      var resp = "";

      var httpReq = http.request(options, function(httpRes) {

          httpRes.setEncoding('utf8');

          httpRes.on('data', function(results) {
              resp = resp + results;
          });

          httpRes.on('end', function(err) {
              next(null,resp);
          });

      });

      httpReq.end(); 
    }
  ], function (err, resp) {
     res.send(resp);
  });


   

});