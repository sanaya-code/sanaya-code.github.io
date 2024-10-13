var qList 		= "";
var currQue 	= 0;
var totalQue	= 0;
var totalCorrect	= 0;

function loadJS(FILE_URL, async = true) {
  let scriptEle = document.createElement("script");

  scriptEle.setAttribute("src", FILE_URL);
  scriptEle.setAttribute("type", "text/javascript");
  scriptEle.setAttribute("async", async);

  document.body.appendChild(scriptEle);

  // success event
  scriptEle.addEventListener("load", () => {
    console.log("File loaded")
  });
   // error event
  scriptEle.addEventListener("error", (ev) => {
    console.log("Error on loading file", ev);
  });
}

function importData() {

	//var data = require('questions_js/science.json');
	//console.log(data);

  let input = document.createElement('input');
  input.type = 'file';
  input.onchange = _ => {
    // you can use this method to get file and perform respective operations
            // let files =   Array.from(input.files);
			let file = input.files[0];
			let reader = new FileReader();
			reader.readAsText(file);

			reader.onload = function() {
				const myArr = JSON.parse(reader.result);
				// console.log(reader.result);
				// console.log(myArr);
				qList = JSON.parse(reader.result);
			};

			reader.onerror = function() {
				console.log(reader.error);
			};
            //console.log(files);
        };
  input.click();

}


var quizApp = function() {

	this.score = 0;
	this.qno = 1;
	this.currentque = 0;


	var totalque = quiz.JS.length;

	this.displayQuiz = function(cque) {
		this.currentque = cque;
		if(this.currentque <  totalque) {
			$("#tque").html(totalque);
			$("#previous").attr("disabled", false);
			$("#next").attr("disabled", false);
			$("#qid").html(quiz.JS[this.currentque].id + '.');


			$("#question").html(quiz.JS[this.currentque].question);
			 $("#question-options").html("");

			for (var key in quiz.JS[this.currentque].options[0]) {
			  if (quiz.JS[this.currentque].options[0].hasOwnProperty(key)) {

				$("#question-options").append(
					"<div class='form-check option-block'>" +
					"<label class='form-check-label'>" +
							  "<input type='radio' class='form-check-input' name='option'   id='q"+key+"' value='" + quiz.JS[this.currentque].options[0][key] + "'><span id='optionval'>" +
								  quiz.JS[this.currentque].options[0][key] +
							 "</span></label>"
				);
			  }
			}
		}
		if(this.currentque <= 0) {
			$("#previous").attr("disabled", true);
		}
		if(this.currentque >= totalque) {
				$('#next').attr('disabled', true);
				for(var i = 0; i < totalque; i++) {
					this.score = this.score + quiz.JS[i].score;
				}
			return this.showResult(this.score);
		}
	}

	this.showResult = function(scr) {
		$("#result").addClass('result');
		$("#result").html("<h1 class='res-header'>Total Score: &nbsp;" + scr  + '/' + totalque + "</h1>");
		for(var j = 0; j < totalque; j++) {
			var res;
			if(quiz.JS[j].score == 0) {
					res = '<span class="wrong">' + quiz.JS[j].score + '</span><i class="fa fa-remove c-wrong"></i>';
			} else {
				res = '<span class="correct">' + quiz.JS[j].score + '</span><i class="fa fa-check c-correct"></i>';
			}
			$("#result").append(
			'<div class="result-question"><span>Q ' + quiz.JS[j].id + '</span> &nbsp;' + quiz.JS[j].question + '</div>' +
			'<div><b>Correct answer:</b> &nbsp;' + quiz.JS[j].answer + '</div>' +
			'<div class="last-row"><b>Score:</b> &nbsp;' + res +

			'</div>'

			);

		}
	}

	this.checkAnswer = function(option) {
		var answer = quiz.JS[this.currentque].answer;
		option = option.replace(/\</g,"&lt;")   //for <
		option = option.replace(/\>/g,"&gt;")   //for >
		option = option.replace(/"/g, "&quot;")

		if(option ==  quiz.JS[this.currentque].answer) {
			if(quiz.JS[this.currentque].score == "") {
				quiz.JS[this.currentque].score = 1;
				quiz.JS[this.currentque].status = "correct";
		}
		} else {
			quiz.JS[this.currentque].status = "wrong";
		}

	}

	this.changeQuestion = function(cque) {
			this.currentque = this.currentque + cque;
			this.displayQuiz(this.currentque);

	}

}

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


function readQuestion(event) {

	//var data = require('questions_js/science.json');
	//console.log("apple");

  let input = document.createElement('input');
  input.type = 'file';
  input.onchange = _ => {
    // you can use this method to get file and perform respective operations
            // let files =   Array.from(input.files);
			let file = input.files[0];
			let reader = new FileReader();
			reader.readAsText(file);

			reader.onload = function() {
				qList = JSON.parse(reader.result);
				// console.log(reader.result);
				processQueList(qList);
				//loadJS("questions_js/index.js", false);
			};

			reader.onerror = function() {
				console.log(reader.error);
			};
            //console.log(files);
        };
  input.click();

}

function processQueList(qList) {
	var q1 = qList.questions[0];
	totalQue = qList.questions.length;

	currQue = 1;
	processQuestion(qList.questions[currQue-1], currQue);

}

function processQuestion(que, num){
	setQuestion(que.question , num);
	unMarkOption(1); unMarkOption(2); unMarkOption(3); unMarkOption(4);
	hideOption(1); hideOption(2); hideOption(3); hideOption(4);
	que.answers.map(processAnswers);
	if (qList.questions[currQue-1].choice === undefined) {
		qList.questions[currQue-1].choice = 0;
	}
	else if(qList.questions[currQue-1].choice > 0){
		markOption(qList.questions[currQue-1].choice)
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
	questionElement.innerText = q;

	questionElement = document.getElementById("qid");
	questionElement.innerText = n;
	questionElement.innerText = questionElement.innerText + "."
}

function markOption(num){
	var ansID = "r"+num;
	document.getElementById(ansID).checked = true;
}

function unMarkOption(num){
	var ansID = "r"+num;
	document.getElementById(ansID).checked = false;
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
	document.getElementById(ansID).innerText = option;
	showOption(num);
}

function showResult(e){
	qList.questions.map(displayCorrectChoice)

	const parentDiv = document.getElementById("res-header");
	parentDiv.innerText = "Total Score is : " + totalCorrect + "/" + totalQue;
}

function displayCorrectChoice(que, index, array){

	const parentDiv = document.getElementById("result");

	const queDiv = document.createElement("div");
	queDiv.setAttribute("class", "result-question");
	queDiv.innerText = "Q " + (index+1) +". "+ que.question;
	parentDiv.appendChild(queDiv);


	const correctDiv = document.createElement("div");
	 var str = "Correct Answer is : " + que.answers[que.correct_answer -1] ;
	if(que.correct_answer != que.choice)
	{
		str = str + " &nbsp; &nbsp; &nbsp; (you marked - " + que.answers[que.choice -1] + ")"
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

}

//loadJS("questions_js/index.js", false);
