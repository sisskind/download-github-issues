var dataset = [];
var issues = [];
  
function handleClick(event){
	var url = document.getElementById("myVal").value;
	url = cleanURL(url);
    draw(url);
    return false;
}

function cleanURL(site)     
{     
    return site.replace(/\/$/, "");
} 

function draw(val){
    var urlDiv = d3.select("#repoList").append("div").classed('urlRepo',true);
    urlDiv.append('i').classed('fa fa-github fa-lg',true);
    urlDiv.append('p');

    dataset.push(val);
    var p = d3.select("body").selectAll("p")
    .data(dataset)
    .text(function(d,i){return d;})
    .on('click',function(){
        var selUrl = d3.select(this).text();
        dataset = dataset.filter(function(a){return a !== selUrl});
        d3.select(this.parentElement).remove();
    });

}

function gatherRepoList(){
	var repoList = [];
	d3.selectAll('p').each(function(d){
		var url = d.split('/');
		var org = url[url.length-2];
		var repo = url[url.length-1];
		var repoUrl = 'https://api.github.com/repos/' + org + '/' + repo + '/issues';

		repoList.push(repoUrl);
	});

	var token = 'token ' + d3.select('#authToken').property('value');
	downloadIssues(repoList,token, 0);
}

function downloadIssues(repoList, token, i){
	var url = repoList[i];
	var j = i+1;

	if(j>repoList.length){
		issues = [].concat.apply([],issues);
		prepareIssues(issues);
		return;
	}

	$.ajax({
		url: url,
		type: 'GET',
		beforeSend: function(xhr) { 
		        xhr.setRequestHeader("Authorization", token); 
		    }    
	}).done(function(response) {
	    console.log(response);
	    issues.push(response);
	    downloadIssues(repoList, token, j);
	}).fail(function (response){
		console.log("Error: " + response.responseJSON.message);
		downloadIssues(repoList, token, j);
	});
}

function prepareIssues(){
	var cleaned = [];
	for (i = 0; i < issues.length; i++){
		var issue = issues[i];

		var closed = issue.closed_at == null ? "open" : issue.closed_at;
		var milestone = issue.milestone == null ? "none" : issue.milestone;
		
		var assignee = issue.assignee == null ? "none" : issue.assignee.login;
		var author = issue.user == null ? "none" :  issue.user.login;

		var labels = [];
		for (var l in issue.labels) { labels.push(issue.labels[l].name); }

		var row = {
			repository: issue.repository_url.substr(issue.repository_url.lastIndexOf('/') + 1),
			issue_number: issue.number,
			title: issue.title,
			author: author,
			status: issue.state,
			body: issue.body,
			assignee: assignee,
			created: issue.created_at,
			labels: labels,
			milestone: milestone,
			closed: closed,
			link: issue.url
		};

		cleaned.push(row);
    }

    exportToCSV(cleaned);
}


var objectToCSVRow = function(dataObject) {
    var dataArray = new Array;
    for (var o in dataObject) {
        var innerValue = dataObject[o]===null?'':dataObject[o].toString();
        var result = innerValue.replace(/"/g, '""');
	result = result.replace(/(\r\n|\n|\r)/gm,"");
        result = '"' + result + '"';
        dataArray.push(result);
    }
    return dataArray.join(' ') + '\r\n';
}

var exportToCSV = function(arrayOfObjects) {

    if (!arrayOfObjects.length) {
        return;
    }

    var csvContent = "data:text/csv;charset=utf-8,";

    // headers
    csvContent += objectToCSVRow(Object.keys(arrayOfObjects[0]));

    arrayOfObjects.forEach(function(item){
        csvContent += objectToCSVRow(item);
    }); 

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "issues.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link); 
    issues = [];
}
