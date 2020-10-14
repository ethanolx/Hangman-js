"use strict";
// import statements
const HangmanUtils = require("./hangmanUtils.js");
const Statistics = require("./statistics");
const Game = require("./game");
const input = require("readline-sync");

// consolidates all the classes to form a fully functional Hangman system
class Hangman {
    constructor(sourceFileName, recordsFileName, maxScore) {
        //* Constant Properties (for the lifetime of the program)
        this.sourceFileName = sourceFileName;   // file where the words ae stored
        this.recordsFileName = recordsFileName; // file where the records are stored
        this.maxScore = maxScore;               // number of rounds for each gameplay
    }

    //* "run" methods
    // executes all code
    run() {
        let runOption = 0;
        do {
            console.clear();
            HangmanUtils.displayIntroduction();
            runOption = input.questionInt(">> ");
            switch (runOption) {
                case 1:
                    console.clear();
                    HangmanUtils.displayRules();
                    this.runGame();
                    break;
                case 2:
                    this.runStatistics();
                    break;
                case 3:
                    console.log("Good Bye! :)");
                    break;
                default:
                    console.log("\nPlease enter 1, 2 or 3 only!");
                    input.question("\nPress \"Enter\" to proceed...");
            }
        }
        while (runOption !== 3);
    }

    // executes only the game portion
    runGame() {
        HangmanUtils.displayGameOptions();
        let gameOption = input.questionInt(">> ");
        let game = new Game(this.sourceFileName, this.recordsFileName, this.maxScore);
        switch (gameOption) {
            case 1:
                game.opOneRoundIndependent();
                break;
            case 2:
                game.opOneGameplay();
                break;
            case 3:
                game.opContinuousGameplays();
                break;
            case 4:
                break;
            default:
                console.log("\nPlease only enter 1, 2, 3 or 4!");
                input.question("\nPress \"Enter\" to proceed...");
        }
    }

    // executes only the statistics portion
    runStatistics() {
        console.clear();
        HangmanUtils.displayStatsOptions();
        let statsOption = input.questionInt(">> ");
        let stats = new Statistics(this.recordsFileName);
        if (statsOption >= 1 && statsOption <= 6) {
            console.clear();
        }
        switch (statsOption) {
            case 1:
                stats.displayLeaderBoard();
                break;
            case 2:
                stats.displayAllRecords();
                break;
            case 3:
                stats.displayStatistics();
                break;
            case 4:
                stats.displayPlayerHighscores();
                break;
            case 5:
                stats.displayPlayerRecords();
                break;
            case 6:
                stats.displayPlayerStatistics();
                break;
            case 7:
                break;
            default:
                console.log("Please only enter 1, 2, 3, 4, 5, 6 or 7!");
        }
        input.question("\nPress \"Enter\" to proceed...");
    }
}

module.exports = Hangman;