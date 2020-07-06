// nameSpace
const game = {};

// loads JS after document has finished loading
document.addEventListener('DOMContentLoaded', function (event) {
	game.init();
});

game.endPoint = `https://secure.toronto.ca/cc_sr_v1/data/swm_waste_wizard_APR?limit=1000`;
game.storeData = [];
game.blueBin = [];
game.greenBin = [];
game.garbage = [];
game.highScores = [];
game.keywordCategory = '';
game.getBins = document.querySelector('.homeContent');
game.selectedKeyword = document.querySelector('.keywordItem');
game.formSubmit = document.querySelector('#userPick');
game.gameContent = document.querySelector('.gameContent');
game.gameScore = document.querySelector('.score');
game.countDown = document.querySelector('.countDown');
game.answerBtn = document.querySelector('.answerBtn');
game.submitName = document.querySelector('.submitName');
game.getName = document.querySelector('.popUpForm');
game.isPlaying = false;
game.totalScore = 0;
game.time = 45;
game.playerName = '';


// Grabs Data and pushes into a new array
game.fetchData = async (callback) => {
	try {
		const { endPoint, storeData } = game;
		const res = await fetch(endPoint);
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
	getBins.classList.add('hide');
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
			// end game
			game.endGame();
		}
	}
};

game.endGame = () => {
	game.isPlaying = false;
	// do something after timer is done prob show final score and a playagain button
	game.answerBtn.setAttribute('disabled', true);
	console.log(`your final score is ${game.totalScore}`);
	game.getName.classList.remove('hide');
	
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
	console.log(game.playerName);
	game.getName.classList.add('hide');
	game.addNewHighScore()

	
};

// grabs scores from firebase and stores them in game.highScores
game.getHighScores = () => {
	const dbRef = firebase.database().ref();
	// listen for changes from the database
	
	dbRef.on('value', (snapshot) => {
		const data = snapshot.val();
		console.log(data, 'snapshot');
		game.highScores = []; //empty highscores so that they only appear once
		for (let key in data) {
			game.highScores.push({
				player: data[key].player,
				score: data[key].score,
			});
		}
		game.displayScore();
	});
};

// function to display scores
game.displayScore = () => {
	const list = document.querySelector('.scoreBoard');
	const allScores = game.highScores
		.map((i, index) => {
			return ` <div class="playerListing">
                <p>${index +1}.</p>
                <div class="nameAndScore">
                    <p>${i.player}</p>
                    <p>${i.score}</p>
                </div>
            </div>`;
		})
		.join('');
	list.innerHTML = allScores;
};

game.getBins.addEventListener('click', game.handleStart);
game.formSubmit.addEventListener('submit', game.handleUserSubmit);
game.submitName.addEventListener('submit', game.getPlayerName);

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
