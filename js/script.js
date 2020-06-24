// nameSpace
const game = {};

document.addEventListener('DOMContentLoaded', function (event) {
	game.init();
});

game.endPoint = `https://secure.toronto.ca/cc_sr_v1/data/swm_waste_wizard_APR?limit=1000`;
game.storeData = [];
game.blueBin = [];
game.greenBin = [];
game.garbage = [];
game.keywordCategory = '';
game.getBins = document.querySelector('.getBins');
game.selectedKeyword = document.querySelector('.keywordItem');
game.formSubmit = document.querySelector('#userPick');
game.gameContent = document.querySelector('.gameContent');
game.gameScore = document.querySelector('.score');
game.totalScore = 0;
game.countDown = document.querySelector('.countDown');
game.time = 30;

game.init = () => {
	game.fetchData(game.separate);
};

// Grabs Data and pushes into a new array
game.fetchData = async (callback) => {
	const { endPoint, storeData } = game;
	const res = await fetch(endPoint);
	const data = await res.json();
	data.forEach((i) => {
		storeData.push(i);
	});
	callback();
};

// separates obj into their bin colors
game.separate = () => {
	const { storeData, blueBin, greenBin, garbage } = game;
	storeData.forEach((i) => {
		if (i.category === 'Green Bin') {
			greenBin.push(i);
		} else if (i.category === 'Blue Bin') {
			blueBin.push(i);
		} else if (i.category === 'Garbage') {
			garbage.push(i);
		}
	});
};

game.scoreUp = () => {
	game.totalScore = game.totalScore + 3;
	game.gameScore.innerHTML = game.totalScore;
};

game.scoreDown = () => {
	if (game.totalScore > 0) {
		game.totalScore = game.totalScore - 1;
		game.gameScore.innerHTML = game.totalScore;
	} else {
		game.totalScore = 0;
	}
};

// pull random word out of obj.keywords
game.handleStart = () => {
	const { generateQs, getBins, gameContent, startTimer } = game;
	getBins.classList.add('hide');
	generateQs();
	startTimer();
	gameContent.classList.remove('hide');
};

game.generateQs = () => {
	const { getRandom, greenBin, blueBin, garbage, keywordCategory } = game;
	const allKeyWords = []; //will store all keywords from selectedBin
	const allBins = [greenBin, blueBin, garbage]; //Three bins to pick from
	const selectedBin = getRandom(allBins); //Will pick one of the three bins at random
	const correctCat = selectedBin[0].category; //keeps track of which color bin has been picked

	// Loops through all the objs in the selected bin array and separates /splits the string of keywords Then the inner loop removes whitespace and pushes keywords into a new array to use later
	selectedBin.forEach((i) => {
		let keyword = i.keywords.split(',');
		keyword.forEach((x) => {
			allKeyWords.push(x.trim());
		});
	});

	game.selectedKeyword.innerHTML = getRandom(allKeyWords);
	game.keywordCategory = correctCat;
};

// get random item from an array
game.getRandom = (array) => array[Math.floor(Math.random() * array.length)];

game.handleUserSubmit = (e) => {
	e.preventDefault();
	game.userSelection = document.querySelector('[name=whichBin]:checked').value;
	game.checkAnswer();
};

game.checkAnswer = () => {
	const {
		userSelection,
		keywordCategory,
		generateQs,
		scoreUp,
		scoreDown,
	} = game;
	const us = userSelection.replace(/ /g, '').toLowerCase();
	const kw = keywordCategory.replace(/ /g, '').toLowerCase();
	if (us === kw) {
		generateQs();
		scoreUp();
	} else {
		console.log('wrong');
		scoreDown();
	}
};

// add timer
game.startTimer = () => {
	game.interval = setInterval(countDown, 1000);

	function countDown() {
		game.time--;
		game.countDown.innerHTML = game.time;
		if (game.time <= 0) {
			clearInterval(game.interval);
			// do something after timer is done prob show final score and a playagain button
			console.log(`your final score is ${game.totalScore}`);
		}
	}
};

game.getBins.addEventListener('click', game.handleStart);
game.formSubmit.addEventListener('submit', game.handleUserSubmit);
