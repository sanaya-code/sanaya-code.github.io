var qList 		= "";
var currQue 	= 0;
var totalQue	= 0;
var totalCorrect	= 0;
var jsonfilePath = "";

function setNextQuestion(e) {
	e.preventDefault();
	currQue = (currQue == totalQue) ? 1 : (currQue+1);
	processQuestion(qList.questions[currQue-1], currQue);
}

function setPrevQuestion(e) {
	e.preventDefault();
	currQue = (currQue == 1) ? totalQue : (currQue-1);
	processQuestion(qList.questions[currQue-1], currQue);
}

function openDialog(event) {

	//var data = require('questions_js/science.json');
	//console.log("apple");

  let input = document.createElement('input');
  input.type = 'file';
  input.onchange = _ => {
    // you can use this method to get file and perform respective operations
            // let files =   Array.from(input.files);
			jsonfilePath = input.files[0];
			//console.log(jsonfilePath)
			readQuestion();
        };
  input.click();

}

function readQuestion() {
			let reader = new FileReader();

			reader.readAsText(jsonfilePath);
			console.log(jsonfilePath);
			// reader.readAsDataURL("/home/newuser/zz_data/repos/Library/sanaya/mcq_quiz/mcq_quiz_02/questions/science.json");

			reader.onload = function() {
				//console.log(reader.result);
				qList = JSON.parse(reader.result);
				// console.log(reader.result);
				processQueList();
				//loadJS("questions_js/index.js", false);
			};

			reader.onerror = function() {
				console.log(reader.error);
			};
            //console.log("readQuestion");
}

function processQueList() {
	var q1 = qList.questions[0];
	totalQue = qList.questions.length;

	document.getElementById("quizForm").style.display = "block";
	currQue = 1;
	processQuestion(qList.questions[currQue-1], currQue);

}

function processQuestion(que, num){
	setQuestion(que.question , num);
	unMarkOption(1); unMarkOption(2); unMarkOption(3); unMarkOption(4);unMarkOption(5);unMarkOption(6);unSetFill();
	hideOption(1); hideOption(2); hideOption(3); hideOption(4);hideOption(5);hideOption(6);hideFill();
	if(que.answers === undefined){
		showFill();
		if (qList.questions[currQue-1].choice === undefined) {
		}
		else {
			setFill(qList.questions[currQue-1].choice);
		}
	}
	else{
		que.answers.map(processAnswers);
		if (qList.questions[currQue-1].choice === undefined) {
			qList.questions[currQue-1].choice = 0;
		}
		else if(qList.questions[currQue-1].choice > 0){
			markOption(qList.questions[currQue-1].choice)
		}
	}
}

function processAnswers(val, index, arr){
	setOption(val, index+1);
}

function makeChoice(event){

	qList.questions[currQue-1].choice= event.target.value;
	//console.log(event.target.value);
}

function setQuestion(q, n) {
	questionElement = document.getElementById("question");
	questionElement.innerHTML = q;

	questionElement = document.getElementById("qid");
	questionElement.innerText = n + "." ;
}

function markOption(num){
	var ansID = "r"+num;
	document.getElementById(ansID).checked = true;
}

function unMarkOption(num){
	var ansID = "r"+num;
	document.getElementById(ansID).checked = false;
}

function hideFill() {
	document.getElementById("fill").style.display = "none";
}

function showFill() {
	document.getElementById("fill").style.display = "block";
}

function setFill(val ) {
	document.getElementById("fill").value = val;
	showFill();
}

function unSetFill(){
	document.getElementById("fill").value="";
}

function hideOption(num) {
	var ansID = "o"+num;
	document.getElementById(ansID).style.display = "none";
}

function showOption(num) {
	var ansID = "o"+num;
	document.getElementById(ansID).style.display = "block";
}

function setOption(option, num ) {
	var ansID = "o"+num+"val";
	document.getElementById(ansID).innerHTML = option;
	showOption(num);
}

function showResult(e){

	// document.getElementById("quizForm").style.display = "none";

	qList.questions.map(displayCorrectChoice)

	const parentDiv = document.getElementById("res-header");
	parentDiv.innerText = "Total Score is : " + totalCorrect + "/" + totalQue;
}

function displayCorrectChoice(que, index, array){

	const parentDiv = document.getElementById("result");

	const queDiv = document.createElement("div");
	queDiv.setAttribute("class", "result-question");
	queDiv.innerHTML = "Q " + (index+1) +". "+ que.question;
	parentDiv.appendChild(queDiv);


	const correctDiv = document.createElement("div");
	var str = "" ;

	if(que.answers === undefined){
		str = str + "Correct Answer is : " + que.correct_answer ;
		if(que.correct_answer != que.choice)
		{
			str = str + " &nbsp; &nbsp; &nbsp; (you marked - " + que.choice + ")"
		}
	}else{
		str = str + "Correct Answer is : " + que.answers[que.correct_answer -1] ;
		if(que.correct_answer != que.choice)
		{
			str = str + " &nbsp; &nbsp; &nbsp; (you marked - " + que.answers[que.choice -1] + ")"
		}
	}
	correctDiv.innerHTML = str;
	parentDiv.appendChild(correctDiv);

	const icon = document.createElement("i");
	icon.setAttribute("class", "fa fa-remove c-wrong");
	if(que.correct_answer == que.choice)
	{
		icon.setAttribute("class", "fa fa-check c-correct");
		totalCorrect = totalCorrect + 1;
	}
	queDiv.appendChild(icon);

	const hr = document.createElement("hr");
	parentDiv.appendChild(hr);

}

async function getJSONFromUrl(path) {
  const response = await fetch(path);
  const data = await response.json();
  return data;
}

async function init(){
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	var paper = urlParams.get('paperChoice')
	if( (paper!= null) && (window.location.protocol!="file:") ){
		filePath = window.location.pathname.split("index.html")[0]+"questions/"+urlParams.get('paperChoice')+".json";
		console.log(filePath);
		qList = await getJSONFromUrl(filePath);
		processQueList();
	}
}

init();

//loadJS("questions_js/index.js", false);
