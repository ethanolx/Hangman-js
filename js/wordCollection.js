"use strict";
// import statements
const Utilities = require("./utilities.js");
const HangmanUtils = require("./hangmanUtils");
const Word = require("./word");
const input = require("readline-sync");

// represents the pool of words (actual words are stored separately)
class WordCollection {
    constructor(sourceFileName, maxScore, difficultyLevel) {
        //* Constant Properties (for the WC object's lifetime)
        this.sourceFileName = sourceFileName;   // CSV File of words (with their categories & definitions)
        this.maxScore = maxScore;               // Number of rounds to be played each full game
        this.difficultyLevel = difficultyLevel; // One of seven difficulty levels

        //* Variable-state Properties (set to their initial values)
        this.score = 0;                         // Player's current score for the current game
        this.round = 1;                         // Current round number
        this.lifelinesLeft = [1, 2, 3, 4];      // Remaining lifelines available for the player to use
        this.livesPerRound = HangmanUtils.convertDiffLevelToLives(difficultyLevel);     // number of lives for current round

        //* Words
        this.words = this.getWords();           // Array of Word objects
        this.currentWord = this.words[0];       // Current Word object (target for player to guess)
    }

    //* "get" methods
    // returns Array<string> of all the available categories
    getCategories() {
        let catgs = new Array();
        for (let word of this.words) {
            if (!catgs.includes(word.category) && word.category !== "No Category") {
                catgs.push(word.category);
            }
        }
        return [...catgs.sort()];
    }

    // returns <string> of the player's chosen category
    getChoiceCategory() {
        let category;
        let categories = this.getCategories();
        do {
            if (categories.length === 0) {
                category = "";
                input.question("Press \"Enter\" to proceed...");
            }
            else {
                category = Utilities.formatString(input.question("Select Category (Press \"Enter\" to skip): "));
            }
            if (!categories.includes(category) && category.trim() !== "") {
                console.log(`Category \'${category}\' does not exist!`);
            }
        }
        while (!categories.includes(category) && category.trim() !== "");
        return category;
    }

    // returns Array<Word> of all the words in the source file
    getWords() {
        let wordsJSON = Utilities.convertCSVtoJSON(this.sourceFileName);
        let words = new Array();
        for (let wordJSON of wordsJSON) {
            words.push(this.convertJSONtoWord(wordJSON));
        }
        return words;
    }

    //* "generate" method
    // sets this WordCollection's currentWord
    // based on the player's chosen category
    generateRandomWord(category = "") {
        if (category.trim() === "") {
            this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
        }
        else {
            do {
                this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
            }
            while (this.currentWord.category !== Utilities.formatString(category));
        }
    }

    //* "convert" method
    convertJSONtoWord(jsonObj) {
        let word = new Word(Utilities.formatString(jsonObj.text), Utilities.formatString(jsonObj.category), Utilities.formatWithoutExtraSpaces(jsonObj.definition), this.livesPerRound);
        return word;
    }

    //* "display" methods
    // logs all the available categories on the console
    displayCategories() {
        let categories = this.getCategories();
        let catgs = "\nCategories: ";
        if (categories.length === 0) {
            catgs += "\rNo categories to choose from";
        }
        else {
            categories.forEach(category => { catgs += Utilities.formatString(category, true) + ", "; });
            catgs += "\b\b ";
        }
        console.log(catgs);
    }

    // logs the appropriate message when the player finishes one full game
    displayEndOfGameMessage() {
        if (this.score == this.maxScore) {
            console.log(`\nCongratulations!\nYou have guessed all ${this.maxScore} words/phrases successfully!`);
        }
        else {
            console.log(`\nSorry!\nYou only managed to guess ${this.score} out of ${this.maxScore} words/phrases successfully.\nTry again next time! :)`);
        }
    }

    // logs a failure message when the player fails to guess the word/phrase in time
    displayRoundFailure() {
        console.log(`Sorry! You have failed to guess the ${(this.currentWord.text.split(" ").length > 1) ? "phrase" : "word"} \"${this.currentWord.text}\" in time.`);
    }

    // logs the game's information to the console
    displayRoundInfo() {
        this.displayScore();
        this.displayRoundNumber();
    }

    // logs the current round number to the console
    displayRoundNumber() {
        console.log(`Round:\t${this.round}/${this.maxScore}`);
    }

    // logs the appropriate message at the end of each round (each word/phrase)
    displayRoundResults() {
        if (this.checkRoundSuccess()) {
            this.displayRoundSuccess();
        }
        else {
            this.displayRoundFailure();
        }
    }

    // logs a success message when the player guesses the word/phrase in time
    displayRoundSuccess() {
        console.log(`Great! You have guessed the ${(this.currentWord.text.split(" ").length > 1) ? "phrase" : "word"} \"${this.currentWord.text}\" successfully!`);
    }

    // logs the player's current score to the console
    displayScore() {
        console.log(`Score:\t${this.score}/${this.maxScore}`);
    }

    //* "check" methods
    // checks if the current round is the last round
    checkIfEndOfGame() {
        return this.round === this.maxScore;
    }

    // checks if the current round is over
    checkIfEndOfRound() {
        return (this.currentWord.lettersToGuess.length === 0 || this.currentWord.lives === 0);
    }

    // checks if the player is successful in the current round
    checkRoundSuccess() {
        return (this.currentWord.lettersToGuess.length === 0 && this.currentWord.lives > 0);
    }

    //* "perform" methods
    // end-of-round routine
    performEndOfRound() {
        this.displayRoundResults();
        if (this.checkIfEndOfGame()) {
            this.displayEndOfGameMessage();
        }
        else {
            this.round++;
        }
        input.question("\nPress \"Enter\" to proceed...");
    }

    // evaluates the player's input and redirects it to the responsible method
    performInputCheck(inp) {
        switch (inp) {
            case "9":
                console.log("\nAre you sure you wish to quit [y/n]?");
                let quit = Utilities.formatString(input.question(">> "));
                if (quit === "y" || quit === "yes") {
                    return true;
                }
                break;
            case "0":
                HangmanUtils.displayLifelineOptions(this.difficultyLevel);
                let lifeline = input.questionInt("\n>> ");
                this.performLifelineValidation(lifeline);
                break;
            case "1":
                console.log("\nAre you sure you wish to skip this word [y/n]?");
                let pass = Utilities.formatString(input.question(">> "));
                if (pass === "y" || pass === "yes") {
                    this.currentWord.lives = 0;
                }
                break;
            default:
                this.currentWord.performGuessCheck(inp);
        }
        return false;
    }

    // use a lifeline based on the player's choice
    performLifeline(lifelineID) {
        switch (lifelineID) {
            case 1:
                if (this.currentWord.checkIfVowelsAllRevealed()) {
                    this.lifelinesLeft.push(1);
                }
                this.currentWord.lldisplayAllVowels();
                break;
            case 2:
                this.currentWord.lldisplayWordDefinition();
                break;
            case 3:
                this.currentWord.llskipAndScoreWord();
                break;
            case 4:
                this.currentWord.lladdLives(this.difficultyLevel);
                break;
        }
    }

    // evaluates whether the player's lifeline choice is valid
    performLifelineValidation(lifelineID) {
        if (this.lifelinesLeft.length > 0 && lifelineID >= 1 && lifelineID <= 4) {
            if (this.lifelinesLeft.includes(lifelineID)) {
                this.performLifeline(lifelineID);
                this.lifelinesLeft.splice(this.lifelinesLeft.indexOf(lifelineID), 1);
            }
            else {
                console.log(`\nYou have already used lifeline ${lifelineID}!`);
            }
        }
        else if (lifelineID >= 1 && lifelineID <= 4) {
            console.log("\nYou have exhausted all your lifelines!");
        }
    }

    // increases the player's score if they were successful in the current round
    performScoreIncrement() {
        if (this.checkIfEndOfRound() && this.checkRoundSuccess()) {
            this.score++;
        }
    }

    // removes the previous currentWord object from this WordCollection
    performWordRemoval(wordText) {
        for (let i = 0; i < this.words.length; i++) {
            if (this.words[i].text === wordText) {
                this.words.splice(i, 1);
            }
        }
    }
}

module.exports = WordCollection;