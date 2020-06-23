// nameSpace
const trashGame = {};

document.addEventListener('DOMContentLoaded', function (event) {
	trashGame.init();
});

trashGame.endPoint = `https://secure.toronto.ca/cc_sr_v1/data/swm_waste_wizard_APR?limit=1000`;
trashGame.storeData = [];
trashGame.blueBin = [];
trashGame.greenBin = [];
trashGame.garbage = [];
trashGame.keywordCategory = '';
trashGame.getBins = document.querySelector('.getBins');
trashGame.selectedKeyword = document.querySelector('.keywordItem');
trashGame.formSubmit = document.querySelector('#userPick');
trashGame.gameContent = document.querySelector('.gameContent');
trashGame.gameScore = document.querySelector('.score');
trashGame.totalScore = 0;

trashGame.init = () => {
	trashGame.garbageData(trashGame.separate);
};

// Grabs Data and pushes into a new array
trashGame.garbageData = async (callback) => {
	const { endPoint, storeData } = trashGame;
	const res = await fetch(endPoint);
	const data = await res.json();
	data.forEach((i) => {
		storeData.push(i);
	});
	callback();
};

// separates obj into their bin colors
trashGame.separate = () => {
	const { storeData, blueBin, greenBin, garbage } = trashGame;
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

trashGame.keepScore = () => {
	trashGame.totalScore = trashGame.totalScore + 3;
	trashGame.gameScore.innerHTML = trashGame.totalScore;
};

// pull random word out of obj.keywords
trashGame.handleStart = () => {
	const { generateQs, getBins, gameContent } = trashGame;
	getBins.className = 'hide';
	generateQs();
	gameContent.className = 'gameContent show';
};

trashGame.generateQs = () => {
	const { getRandom, greenBin, blueBin, garbage } = trashGame;
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
	trashGame.selectedKeyword.innerHTML = randomWord;
	trashGame.keywordCategory = correctCat;
};

// get random item from an array
trashGame.getRandom = (array) =>
	array[Math.floor(Math.random() * array.length)];

trashGame.getUserSelection = (e) => {
	e.preventDefault();
	trashGame.userSelection = document.querySelector(
		'[name=whichBin]:checked'
	).value;
	console.log(trashGame.userSelection);
	trashGame.checkAnswer();
};

trashGame.checkAnswer = () => {
	const { userSelection, keywordCategory, generateQs, keepScore } = trashGame;
	const us = userSelection.replace(/ /g, '').toLowerCase();
	const kw = keywordCategory.replace(/ /g, '').toLowerCase();
	if (us === kw) {
		generateQs();
		keepScore();
	} else {
		console.log('wrong');
	}
};

trashGame.getBins.addEventListener('click', trashGame.handleStart);
trashGame.formSubmit.addEventListener('submit', trashGame.getUserSelection);
