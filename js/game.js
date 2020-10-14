"use strict";
// import statements
const Utilities = require("./utilities");
const HangmanUtils = require("./hangmanUtils");
const Statistics = require("./statistics");
const WordCollection = require("./wordCollection");
const input = require("readline-sync");

// oversees the games' operations
class Game {
    constructor(sourceFileName, recordsFileName, maxScore) {
        //* These properties are constant for the lifetime of the program
        this.sourceFileName = sourceFileName;   // file where the words are stored
        this.recordsFileName = recordsFileName; // file where the records are stored
        this.maxScore = maxScore;               // number of rounds for each gameplay
        //* Variable-state properties
        this.wordCollection = new WordCollection(sourceFileName, maxScore, 1);  // current pool of words
    }

    //* "op" methods
    // executes multiple games in a row
    opContinuousGameplays() {
        let cont = true;
        do {
            console.clear();
            if (!this.opOneGameplay()) {
                break;
            }
            let ctn = Utilities.formatString(input.question("\nContinue [y/n]?\n>> "));
            cont = (ctn === "y" || ctn === "yes");
        }
        while (cont);
    }

    // executes one full game (10 rounds)
    opOneGameplay() {
        let cont = true;
        let playerName = HangmanUtils.getUsername();
        let difficultyLevel = HangmanUtils.getDifficultyLevel();
        this.wordCollection = new WordCollection(this.sourceFileName, this.maxScore, difficultyLevel);
        let start = new Date();
        for (let i = 0; i < this.maxScore; i++) {
            if (!this.opOneRound()) {
                cont = false;
                break;
            }
            this.wordCollection.performWordRemoval(this.wordCollection.currentWord.text);
        }
        let end = new Date();
        let recordScore = Utilities.formatString(input.question("\nDo you wish to record your score [y/n]?\n>> "));
        if (recordScore === "y" || recordScore === "yes") {
            let timing = Utilities.convert_ms_ToTimeString(end.getTime() - start.getTime());
            Statistics.performRecordScore(this.recordsFileName, playerName, this.wordCollection.score, this.maxScore, difficultyLevel, timing);
        }
        return cont;
    }

    // executes one round (helper method for opOneGameplay)
    opOneRound() {
        let cont = true;
        console.clear();
        this.wordCollection.displayRoundInfo();
        this.wordCollection.displayCategories();
        this.wordCollection.generateRandomWord(this.wordCollection.getChoiceCategory());
        do {
            console.clear();
            this.wordCollection.performScoreIncrement();
            this.wordCollection.displayRoundInfo();
            this.wordCollection.currentWord.displayWordInfo();
            if (this.wordCollection.checkIfEndOfRound()) {
                this.wordCollection.performEndOfRound();
                break;
            }
            let guess = Utilities.formatString(input.question(`<< Enter 0 to use a lifeline, 1 to pass, 9 to quit, guess a letter or guess the ${(this.wordCollection.currentWord.text.split(" ").length > 1) ? "phrase" : "word"} >>\n\n>> `));
            if (this.wordCollection.performInputCheck(guess)) {
                cont = false;
                break;
            }
            input.question("\nPress \"Enter\" to proceed...");
        }
        while (true);
        return cont;
    }

    // executes one round (standalone)
    opOneRoundIndependent() {
        let difficultyLevel = HangmanUtils.getDifficultyLevel();
        this.wordCollection = new WordCollection(this.sourceFileName, this.maxScore, difficultyLevel);
        this.wordCollection.displayCategories();
        this.wordCollection.generateRandomWord(this.wordCollection.getChoiceCategory());
        do {
            console.clear();
            this.wordCollection.currentWord.displayWordInfo();
            if (this.wordCollection.checkIfEndOfRound()) {
                this.wordCollection.performEndOfRound();
                break;
            }
            let guess = input.question(`<< Enter 0 to use a lifeline, 1 to pass, 9 to quit, guess a letter or guess the ${(this.wordCollection.currentWord.text.split(" ").length > 1) ? "phrase" : "word"} >>\n\n>> `);
            if (this.wordCollection.performInputCheck(guess)) {
                break;
            }
            input.question("\nPress \"Enter\" to proceed...");
        }
        while (true);
    }
}

module.exports = Game;