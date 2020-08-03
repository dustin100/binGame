import tips from './modules/tipData.js';

// nameSpace
const game = {};

// loads JS after document has finished loading
document.addEventListener('DOMContentLoaded', function (event) {
	game.init();
});

game.endPoint = `./data/waste_wizard.json`;
game.storeData = [];
game.blueBin = [];
game.greenBin = [];
game.garbage = [];
game.highScores = [];
game.keywordCategory = '';
game.getBins = document.querySelector('.getBins');
game.selectedKeyword = document.querySelector('.keywordItem');
game.homeContent = document.querySelector('.homeContent');
game.formSubmit = document.querySelector('#userPick');
game.gameContent = document.querySelector('.gameContent');
game.gameScore = document.querySelector('.score');
game.finalScore = document.querySelector('.finalScore');
game.closeBox = document.querySelector('.closeBox');
game.countDown = document.querySelector('.countDown');
game.answerBtn = document.querySelector('.answerBtn');
game.submitName = document.querySelector('.submitName');
game.getName = document.querySelector('.popUpForm');
game.highScoresInfo = document.querySelector('.highScoresInfo');
game.wasteTip = document.querySelector('.wasteTip');
game.playAgain = document.querySelector('.playAgain');
game.home = document.querySelector('.home-link');
game.home2 = document.querySelector('.home-link2');
game.homeScores = document.querySelector('.highScoresBtn');
game.isPlaying = false;
game.totalScore = 0;
game.time = 45;
game.playerName = '';

// Grabs Data and pushes into a new array
game.fetchData = async (callback) => {
	try {
		const { endPoint, storeData } = game;
		const res = await fetch(`${endPoint}`);
		const data = await res.json();
		data.forEach((i) => {
			storeData.push(i);
		});
		callback();
	} catch (err) {
		console.log(err);
	}
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
	game.isPlaying = true;
	game.homeContent.classList.add('hide');
	generateQs();
	startTimer();
	gameContent.classList.remove('hide');
};

game.generateQs = () => {
	const { getRandom, greenBin, blueBin, garbage } = game;
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
	const right = `./imgs/CorrectAnswer.png`;
	const wrong = `./imgs/wrongAnswer.png`;
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
		game.displayRightWrong(right);
	} else {
		game.displayRightWrong(wrong);
		scoreDown();
	}
};

// timer that counts down to the end of the game
game.startTimer = () => {
	game.interval = setInterval(countDown, 1000);
	function countDown() {
		game.time--;
		game.countDown.innerHTML = game.time;
		if (game.time <= 0) {
			clearInterval(game.interval);
			game.endGame();
		} else if (game.isPlaying === false) {
			clearInterval(game.interval);
		}
	}
};

// if the user gets a top ten score allow them to enter their name and show scoreboard else show recycling tip screen
game.playerInTopTen = () => {
	const { totalScore, highScores } = game;
	if (totalScore > highScores[9].score) {
		game.gameContent.classList.add('hide');
		game.getName.classList.remove('hide');
	} else {
		game.gameContent.classList.add('hide');
		game.wasteTip.classList.remove('hide');
	}
};

game.endGame = () => {
	game.isPlaying = false;
	game.playerInTopTen();
	game.finalScore.innerHTML = game.totalScore;
};

game.addNewHighScore = () => {
	const dbRef = firebase.database().ref();
	const playerResults = {
		player: game.playerName,
		score: game.totalScore,
	};

	dbRef.push(playerResults);
};

game.getPlayerName = (e) => {
	e.preventDefault();
	game.playerName = document.querySelector('#playerName').value;
	game.getName.classList.add('hide');
	game.addNewHighScore();
	game.highScoresInfo.classList.remove('hide');
};

// grabs scores from firebase and stores them in game.highScores
game.getHighScores = () => {
	const dbRef = firebase.database().ref();

	// listen for changes from the database
	dbRef.on('value', (snapshot) => {
		const data = snapshot.val();
		game.highScores = []; //empty high scores so that they only appear once
		for (let key in data) {
			game.highScores.push({
				player: data[key].player.toLowerCase(),
				score: data[key].score,
			});
		}
		game.highScores.sort(function (a, b) {
			if (a.score > b.score) {
				return -1;
			} else if (b.score > a.score) {
				return 1;
			} else {
				return 0;
			}
		});

		game.highScores = game.highScores.splice(0, 10);
		game.displayScore();
	});
};

// function to display scores
game.displayScore = () => {
	const list = document.querySelector('.scoreBoard');
	const allScores = game.highScores
		.map((i, index) => {
			return ` <div class="playerListing">
                <p>${index + 1}.</p>
                <div class="nameAndScore">
                    <p>${i.player}</p>
                    <p>${i.score}</p>
                </div>
            </div>`;
		})
		.join('');
	list.innerHTML = allScores;
};

game.handleCloseScoreBox = () => {
	game.highScoresInfo.classList.add('hide');
	game.wasteTip.classList.remove('hide');
	game.getTip();
};

// show / hide function
game.displayRightWrong = (url) => {
	const img = document.querySelector('.correctWrong');
	img.src = url;
	img.classList.add('show');
	setTimeout(flash, 500);
	function flash() {
		img.classList.remove('show');
	}
};

game.newGame = () => {
	game.reset();
	game.wasteTip.classList.add('hide');
	game.handleStart();
	game.isPlaying = true;
};

game.reset = () => {
	game.keywordCategory = '';
	game.totalScore = 0;
	game.gameScore.innerHTML = 0;
	game.countDown.innerHTML = 45;
	game.time = 45;
};

game.returnHome = () => {
	game.wasteTip.classList.add('hide');
	game.gameContent.classList.add('hide');
	game.homeContent.classList.remove('hide');
	game.reset();
	game.isPlaying = false;
};

game.getBins.addEventListener('click', game.handleStart);
game.formSubmit.addEventListener('submit', game.handleUserSubmit);
game.submitName.addEventListener('submit', game.getPlayerName);
game.closeBox.addEventListener('click', game.handleCloseScoreBox);
game.playAgain.addEventListener('click', game.newGame);
game.home.addEventListener('click', game.returnHome);
game.home2.addEventListener('click', game.returnHome);
game.homeScores.addEventListener('click', game.getPlayerName);

game.init = () => {
	game.fetchData(game.separate);
	game.getHighScores();
};

game.firebaseConfig = {
	apiKey: 'AIzaSyAq0FtgPYzd10Ld0-RoUXOY-6bmkJ1bXAY',
	authDomain: 'bingame-e7541.firebaseapp.com',
	databaseURL: 'https://bingame-e7541.firebaseio.com',
	projectId: 'bingame-e7541',
	storageBucket: 'bingame-e7541.appspot.com',
	messagingSenderId: '1035272280357',
	appId: '1:1035272280357:web:23431e9db6bd545f12e2cc',
};
// Initialize Firebase
firebase.initializeApp(game.firebaseConfig);

// gets a random tip at the end of the game
game.getTip = () => {
	const storeTip = game.getRandom(tips);
	const insertTip = document.querySelector('.tipChange');
	insertTip.innerHTML = `<h2>Waste Tip:</h2>
            <h3>${storeTip.tip}</h3>
            <img src="${storeTip.img}" alt="trash tips">
			<p class="tipText">${storeTip.des}</p>`;
};
