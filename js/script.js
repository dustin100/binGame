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

game.init = () => {
	game.garbageData(game.separate);
};

// Grabs Data and pushes into a new array
game.garbageData = async (callback) => {
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

game.keepScore = () => {
	game.totalScore = game.totalScore + 3;
	game.gameScore.innerHTML = game.totalScore;
};

// pull random word out of obj.keywords
game.handleStart = () => {
	const { generateQs, getBins, gameContent } = game;
	getBins.className = 'hide';
	generateQs();
	gameContent.className = 'gameContent show';
};

game.generateQs = () => {
	const { getRandom, greenBin, blueBin, garbage } = game;
	const allKeyWords = []; //will store all keywords from selectedBin
	const allBins = [greenBin, blueBin, garbage]; //Three bins to pick from
	const selectedBin = getRandom(allBins); //Will pick one of the three bins at random
	const correctCat = selectedBin[0].category; //keeps track of which color bin has been picked
	selectedBin.forEach((i) => {
		let keyword = i.keywords.split(',');
		keyword.forEach((x) => {
			allKeyWords.push(x.trim());
		});
	});

	let randomWord = getRandom(allKeyWords);
	console.log(randomWord, correctCat);
	// sets the local variables to the global object to use for questions
	game.selectedKeyword.innerHTML = randomWord;
	game.keywordCategory = correctCat;
};

// get random item from an array
game.getRandom = (array) =>
	array[Math.floor(Math.random() * array.length)];

game.getUserSelection = (e) => {
	e.preventDefault();
	game.userSelection = document.querySelector(
		'[name=whichBin]:checked'
	).value;
	console.log(game.userSelection);
	game.checkAnswer();
};

game.checkAnswer = () => {
	const { userSelection, keywordCategory, generateQs, keepScore } = game;
	const us = userSelection.replace(/ /g, '').toLowerCase();
	const kw = keywordCategory.replace(/ /g, '').toLowerCase();
	if (us === kw) {
		generateQs();
		keepScore();
	} else {
		console.log('wrong');
	}
};

game.getBins.addEventListener('click', game.handleStart);
game.formSubmit.addEventListener('submit', game.getUserSelection);
