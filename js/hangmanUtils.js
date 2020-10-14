"use strict";
// import statements
const Utilities = require("./utilities");
const colours = require("colors");
const input = require("readline-sync");

// helper class for hangman-related utilities
class HangmanUtils {
    //* Global Constants
    static symbol = "_";
    static difficulties = ["Easy(15)", "Intermediate(12)", "Advanced(10)", "Expert(7)", "Master(5)", "Legendary(3)", "Perfect(1)"];

    //* "display" methods
    // logs the different difficulty options to the console
    static displayDifficulties() {
        console.log("\nDifficulty level:");
        console.log("1) Easy (15 lives)");
        console.log("2) Intermediate (12 lives)");
        console.log("3) Advanced (10 lives)");
        console.log("4) Expert (7 lives)");
        console.log("5) Master (5 lives)");
        console.log("6) Legendary (3 lives)");
        console.log("7) Perfect (1 life)\n");
    }

    // logs the game options to the console
    static displayGameOptions() {
        console.log("Game Options:");
        console.log("1) Play one round (1 word only)");
        console.log("2) Play one full game");
        console.log("3) Play multiple games continuously");
        console.log("4) Go back to home screen");
    }

    // logs the home page to the console
    static displayIntroduction() {
        console.log("-= Welcome to HANGMAN =-\n");
        console.log(colours.grey("Please select one of the following options:\n"));
        console.log(colours.cyan("1) Play Game"));
        console.log(colours.green("2) Show Statistics"));
        console.log(colours.yellow("3) Quit"));
    }

    // logs the different lifeline options to the console
    static displayLifelineOptions(difficultyLevel) {
        console.log("\nLifelines:");
        console.log("1) Show all vowels in the word");
        console.log("2) Show word's description");
        console.log("3) Skip and score word");
        console.log(`4) Add ${(difficultyLevel === 7) ? "1 life" : `${5 - Math.ceil(difficultyLevel / 2)} lives`}`);
        console.log("<< Enter any other number to return without using a lifeline >>");
    }

    // logs an Array<Object> to the console, formatted as a simple table
    static displayRecordsAsFormattedTable(records) {
        let recordsObj = {};
        for (let i = 0; i < records.length; i++) {
            let recordCopy = { ...records[i] };
            recordsObj[`${i + 1}`] = recordCopy;
        }
        console.table(recordsObj);
    }

    // logs an Array<Object> to the console, formatted as a leaderboard
    static displayRecordsAsLeaderboard(records) {
        let recordsObj = {};
        for (let i = 0; i < records.length; i++) {
            let recordCopy = { ...records[i] };
            let difficulty = recordCopy.difficulty;
            delete recordCopy.difficulty;
            recordsObj[`${difficulty}`] = recordCopy;
        }
        console.table(recordsObj);
    }

    // logs an Array<Object> to the console, formatted as a table of statistics
    static displayRecordsAsStatisticsTable(records) {
        let statsObj = {};
        let difficultyInstances = new Array(7);
        statsObj["Best Percentage"] = {};
        statsObj["Mean Percentage"] = {};
        statsObj["Worst Percentage"] = {};
        statsObj["Best Score"] = {};
        statsObj["Worst Score"] = {};
        statsObj["Frequency"] = {};
        statsObj["Most Frequent"] = {};
        statsObj["Least Frequent"] = {};
        statsObj["Mean Timing"] = {};
        statsObj["Best Timing*"] = {};
        statsObj["Worst Timing*"] = {};
        for (let i = 1; i <= 7; i++) {
            let recs = records.filter((rec) => HangmanUtils.convertDiffToDiffLevel(rec.difficulty) === i);
            let stats = HangmanUtils.getStatistics(recs);
            let difficulty = HangmanUtils.convertDiffLevelToDiff(i);
            difficultyInstances[i - 1] = stats["frequencyOfDifficulty"];
            statsObj["Best Percentage"][`${difficulty}`] = stats["bestPercentage"];
            statsObj["Mean Percentage"][`${difficulty}`] = stats["meanPercentage"];
            statsObj["Worst Percentage"][`${difficulty}`] = stats["worstPercentage"];
            statsObj["Best Score"][`${difficulty}`] = `${stats["bestScore"][0]}/${stats["bestScore"][1]}`;
            statsObj["Worst Score"][`${difficulty}`] = `${stats["worstScore"][0]}/${stats["worstScore"][1]}`;
            statsObj["Frequency"][`${difficulty}`] = stats["frequencyOfDifficulty"];
            statsObj["Mean Timing"][`${difficulty}`] = stats["meanTiming"];
            statsObj["Best Timing*"][`${difficulty}`] = stats["bestTiming"];
            statsObj["Worst Timing*"][`${difficulty}`] = stats["worstTiming"];
        }
        for (let i = 1; i <= 7; i++) {
            let difficulty = HangmanUtils.convertDiffLevelToDiff(i);
            statsObj["Most Frequent"][`${difficulty}`] = (HangmanUtils.getFavDifficulties(difficultyInstances).includes(difficulty));
            statsObj["Least Frequent"][`${difficulty}`] = (HangmanUtils.getLeastFavDifficulties(difficultyInstances).includes(difficulty));
        }
        console.table(statsObj);
    }

    // logs the game rules of Hangman and this variant to the console
    static displayRules() {
        console.log("-= Welcome to HANGMAN =-\n");
        let showRules = Utilities.formatString(input.question("Show Rules [y/n]?\n>> "));
        if (showRules === "y" || showRules === "yes") {
            console.log(colours.brightBlue("\n\nOVERVIEW"));
            console.log(colours.rainbow("-----------------------"));
            console.log("Hangman is a traditional guessing game, where one player attempts to guess all the letters of a pre-defined mystery word.");
            console.log("Each time a wrong guess is made, one segment of a stick-figure hangman setup (stage or man) will be drawn.");
            console.log("The game ends when the hangman is fully drawn or if the player rightly guesses the word before that happens.");
            console.log("If the player managed to guess the word in time, they win the game. Otherwise, they lose.");
            // this variant
            console.log(colours.brightBlue("\n\nTHIS VARIANT"));
            console.log(colours.rainbow("-----------------------"));
            console.log("This variation of Hangman is mostly similar to the original game, with the following exceptions...");
            console.log("\n1) The word to guess may be a word or short phrase");
            console.log("\n2) The words/phrases may contain other symbols (like \') [these would be revealed to you]");
            console.log("\n3) There are lifelines to aid you along the way");
            console.log("\n4) You may decide on the difficulty of your games");
            // lifelines
            console.log(colours.brightBlue("\n\nLIFELINES"));
            console.log(colours.rainbow("-----------------------"));
            console.log("> Enter \"0\" to access the lifelines");
            console.log("\n> Each lifeline may only be used once in an entire game");
            console.log("\n> Lifeline 1: Reveal all vowels in the current word");
            console.log("\t\t\b\b(This lifeline will not be expended if all vowels are already revealed)");
            console.log("\n> Lifeline 2: Show the word's description");
            console.log("\n> Lifeline 3: Skip and score the current word");
            console.log("\t\t\b\b(Your score will be incremented; instant success)");
            console.log("\n> Lifeline 4: Add lives (the number of lives added are as follows...)\n");
            console.log("\t\t\b\bEasy, Intermediate:\t4");
            console.log("\t\t\b\bAdvanced, Expert:\t\t3");
            console.log("\t\t\b\bMaster, Legendary:\t2");
            console.log("\t\t\b\bPerfect\t\t\t1");
            // input
            console.log(colours.brightBlue("\n\nACCEPTED INPUT"));
            console.log(colours.rainbow("-----------------------"));
            console.log("You may enter:");
            console.log("\t> \"0\" to use a lifeline");
            console.log("\t> \"1\" to pass (give up)");
            console.log("\t> \"9\" to quit the game");
            console.log("\t> Any letter to guess");
            console.log("\t> A word or phrase to guess");
            // penalties
            console.log(colours.brightBlue("\n\nPENALTIES"));
            console.log(colours.rainbow("-----------------------"));
            console.log("One life will be deducted each time you:");
            console.log("\t1) Enter non-alphabetical characters");
            console.log("\t2) Enter a number excluding 0, 1 and 9");
            console.log("\t3) Make a wrong guess (letter/word/phrase)");
            console.log("\t4) Repeat a guess you have already made");
            // records
            console.log(colours.brightBlue("\n\nRECORDS"));
            console.log(colours.rainbow("-----------------------"));
            console.log("Only full games may be recorded");
            console.log("\nIf you so choose to record your score:")
            console.log("\t* You will be requested to provide a username");
            console.log("\t  (it's case- and whitespace-sensitive)");
            console.log("\n\t* Your timing will be noted down\n");
        }
        console.log();
    }

    // logs the different statistics options to the console
    static displayStatsOptions() {
        console.log("Statistics options:");
        console.log("1) Show leaderboard");
        console.log("2) Show all records");
        console.log("3) Show statistics");
        console.log("4) Find a player's highscores");
        console.log("5) Find a player's records");
        console.log("6) Find a player's statistics");
        console.log("7) Exit");
    }

    //* "get" methods
    // returns <number> of the player's chosen difficulty level
    static getDifficultyLevel() {
        let difficultyLevel = 0;
        HangmanUtils.displayDifficulties();
        do {
            difficultyLevel = input.questionInt("Select your difficulty level: ");
            if (difficultyLevel < 1 || difficultyLevel > 7) {
                console.log("Please only enter an integer between 1 and 7 inclusive!");
            }
        }
        while (difficultyLevel < 1 || difficultyLevel > 7);
        return difficultyLevel;
    }

    // returns an Array<string> of the most frequent difficulties played
    static getFavDifficulties(difficultyInstances) {
        let favDifficulties = new Array();
        for (let i = 0; i < difficultyInstances.length; i++) {
            if (difficultyInstances[i] === Math.max(...difficultyInstances)) {
                favDifficulties.push(HangmanUtils.convertDiffLevelToDiff(i + 1));
            }
        }
        return favDifficulties;
    }

    // returns an Array<string> of the least frequent difficulties played
    static getLeastFavDifficulties(difficultyInstances) {
        let leastFavDifficulties = new Array();
        for (let i = 0; i < difficultyInstances.length; i++) {
            if (difficultyInstances[i] === Math.min(...difficultyInstances)) {
                leastFavDifficulties.push(HangmanUtils.convertDiffLevelToDiff(i + 1));
            }
        }
        return leastFavDifficulties;
    }

    // returns <Object> of statistics
    static getStatistics(records) {
        let stats = {
            bestPercentage: null,
            meanPercentage: null,
            worstPercentage: null,
            bestScore: [null, null],
            worstScore: [null, null],
            frequencyOfDifficulty: 0,
            bestTiming: null,
            meanTiming: null,
            worstTiming: null
        };
        if (records.length > 0) {
            // initial values
            let sumOfTimings = 0;
            let sumOfPercentages = 0;
            stats.bestPercentage = 0;
            stats.bestScore = [parseInt(records[0].score), parseInt(records[0].maxScore)];
            stats.worstPercentage = 100;
            stats.worstScore = [parseInt(records[0].score), parseInt(records[0].maxScore)];
            for (let record of records) {
                let timing = Utilities.convertTimeStringTo_ms(record.timing);
                let percentage = parseFloat(((parseInt(record.score) / parseInt(record.maxScore) * 100).toFixed(2)));
                sumOfPercentages += percentage;
                sumOfTimings += timing;
                if (Utilities.checkIfNewIsGreater(percentage, stats.bestPercentage, parseInt(record.score), stats.bestScore[0])) {
                    stats.bestPercentage = percentage;
                    stats.bestScore = [parseInt(record.score), parseInt(record.maxScore)];
                }
                if (Utilities.checkIfNewIsGreater(stats.worstPercentage, percentage, stats.worstScore[0], parseInt(record.score))) {
                    stats.worstPercentage = percentage;
                    stats.worstScore = [parseInt(record.score), parseInt(record.maxScore)];
                }
                stats.frequencyOfDifficulty++;
            }
            // initial timing values
            let bestTiming = Utilities.convertTimeStringTo_ms(records.filter((rec) => parseFloat((parseInt(rec.score) / parseInt(rec.maxScore) * 100).toFixed(2)) === stats.bestPercentage)[0].timing);
            let worstTiming = Utilities.convertTimeStringTo_ms(records.filter((rec) => parseFloat((parseInt(rec.score) / parseInt(rec.maxScore) * 100).toFixed(2)) === stats.bestPercentage)[0].timing);
            for (let record of records) {
                let timing = Utilities.convertTimeStringTo_ms(record.timing);
                let percentage = parseFloat((parseInt(record.score) / parseInt(record.maxScore) * 100).toFixed(2));
                if (Utilities.checkIfNewIsGreater(percentage, stats.bestPercentage, parseInt(record.score), stats.bestScore[0], bestTiming, timing)) {
                    bestTiming = timing;
                }
                if (Utilities.checkIfNewIsGreater(percentage, stats.bestPercentage, parseInt(record.score), stats.bestScore[0], timing, worstTiming)) {
                    worstTiming = timing;
                }
            }
            stats.meanPercentage = parseFloat((sumOfPercentages / records.length).toFixed(2));
            stats.meanTiming = Utilities.convert_ms_ToTimeString(parseInt(sumOfTimings / records.length));
            stats.bestTiming = Utilities.convert_ms_ToTimeString(bestTiming);
            stats.worstTiming = Utilities.convert_ms_ToTimeString(worstTiming);
        }
        return stats;
    }

    // returns <string> of the player's chosen username (non-formatted)
    static getUsername() {
        let playerName = "";
        do {
            playerName = input.question("Enter your username: ").trim();
            if (playerName.length === 0) {
                console.log("Username cannot be empty!");
            }
        }
        while (playerName.length === 0);
        return playerName;
    }

    //* "convert" methods
    static convertDiffLevelToDiff(difficultyLevel) {
        return HangmanUtils.difficulties[difficultyLevel - 1];
    }

    static convertDiffLevelToLives(difficultyLevel) {
        switch (difficultyLevel) {
            case 1: return 15;
            case 2: return 12;
            case 3: return 10;
            case 4: return 7;
            case 5: return 5;
            case 6: return 3;
            case 7: return 1;
        }
    }

    static convertDiffToDiffLevel(difficulty) {
        return HangmanUtils.difficulties.indexOf(difficulty) + 1;
    }
}

module.exports = HangmanUtils;