var dataset = [];
var issues = [];
  
function handleClick(event){
    console.log(document.getElementById("myVal").value)
    draw(document.getElementById("myVal").value)
    return false;
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
		console.log(issues);
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
	});
}

function prepareIssues(){
	//
}