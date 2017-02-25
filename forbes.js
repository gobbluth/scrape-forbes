var request = require('request')
var highland = require('highland')
var csvWriter = require('csv-write-stream')
var fs = require('fs')


var years = [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016].reverse();

function retrieve(query, callback) {
    var data = {
	uri: 'http://www.forbes.com/ajax/list/data',
	qs: query
    }
    request(data, function (error, response, body) {
	var errorStatus = (response.statusCode >= 400) ? new Error(response.statusCode) : null
	callback(error || errorStatus, body)
    })
}

years.forEach(function(year){
    var lists = [
        {type: 'person', year: year, uri: 'billionaires' }
    ]
    lists.map(function (list) {
        highland([list])
    	.flatMap(highland.wrapCallback(retrieve))
    	.flatMap(JSON.parse)
    	.through(csvWriter())
    	.pipe(fs.createWriteStream('data/forbes-' + list.uri + '-' + year + '.csv'))
    })
});

