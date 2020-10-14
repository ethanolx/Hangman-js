"use strict";
// import statements
const Utilities = require("./utilities");
const HangmanUtils = require("./hangmanUtils");
const fs = require("fs");

// oversees the records and statistics
class Statistics {
    constructor(recordsFileName) {
        this.records = Utilities.convertCSVtoJSON(recordsFileName); // Array<JSON> containing all the records
    }

    //* static methods
    // records the player's score to records file
    static performRecordScore(recordsFileName, playerName, score, maxScore, difficultyLevel, timing) {
        let now = new Date();
        let date = `${Utilities.convertDayNumToDay(now.getDay())} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
        let record = `\n${playerName};${score};${maxScore};${HangmanUtils.convertDiffLevelToDiff(difficultyLevel)};${date};${timing}`;
        fs.writeFileSync(recordsFileName, record, { flag: "a" });
    }

    // returns Array<Array<number>> of best scores (using percentage, absolute score and timings as tiebreakers)
    static getTopScores(records) {
        let highScores = [0, 0, 0, 0, 0, 0, 0];
        let maxScores = [1, 1, 1, 1, 1, 1, 1];
        let bestTimings = [null, null, null, null, null, null, null];
        for (let i = 0; i < bestTimings.length; i++) {
            bestTimings[i] = (records.filter((rec) => HangmanUtils.convertDiffToDiffLevel(rec.difficulty) === (i + 1))[0] === undefined) ? null : records.filter((rec) => HangmanUtils.convertDiffToDiffLevel(rec.difficulty) === (i + 1))[0].timing;
        }
        for (let i = 0; i < highScores.length; i++) {
            let recs = records.filter((rec) => HangmanUtils.convertDiffToDiffLevel(rec.difficulty) === (i + 1));
            for (let record of recs) {
                if (Utilities.checkIfNewIsGreater(parseInt(record.score) / parseInt(record.maxScore), highScores[i] / maxScores[i], parseInt(record.score), highScores[i], Utilities.convertTimeStringTo_ms(bestTimings[i]), Utilities.convertTimeStringTo_ms(record.timing))) {
                    highScores[i] = parseInt(record.score);
                    maxScores[i] = parseInt(record.maxScore);
                    bestTimings[i] = record.timing;
                }
            }
        }
        return [highScores, maxScores, bestTimings];
    }

    //* "get" method
    // helper method for Options 4 - 6
    getPlayerRecords() {
        let username = HangmanUtils.getUsername();
        let playerRecords = this.records.filter((rec) => rec.player_name === username);
        if (playerRecords.length === 0) {
            console.log(`\nSorry, there are no existing records for the player \'${username}\'.\nThe entry is case- and whitespace-sensitive.`);
        }
        return [playerRecords, username];
    }

    //* "display" methods
    //* Option 1 - Show leaderboard/highscores
    displayLeaderBoard(records = this.records, general = true) {
        if (general) {
            console.log("\nCurrent Leaderboard:");
        }
        let leaderBoard = new Array();
        let highScores = Statistics.getTopScores(records);
        for (let i = 6; i >= 0; i--) {
            for (let record of records.filter((rec) => HangmanUtils.convertDiffToDiffLevel(rec.difficulty) === i + 1)) {
                if (parseInt(record.score) === highScores[0][i] && parseInt(record.maxScore) === highScores[1][i] && record.timing === highScores[2][i]) {
                    leaderBoard.push(record);
                }
            }
        }
        HangmanUtils.displayRecordsAsLeaderboard(leaderBoard);
    }

    //* Option 2 - Show all records
    displayAllRecords() {
        if (this.records.length === 0) {
            console.log("\nThere are no existing records currently.");
        }
        else {
            console.log("\nCurrent Records:");
            HangmanUtils.displayRecordsAsFormattedTable(this.records);
        }
    }

    //* Option 3 - Show statistics
    displayStatistics(records = this.records, general = true) {
        if (general) {
            console.log("\nCurrent Statistics:");
        }
        HangmanUtils.displayRecordsAsStatisticsTable(records);
        console.log(" * - among the best scores (highest percentage scores)");
    }

    //* Option 4 - Show player's highscores
    displayPlayerHighscores() {
        let playerRecords = this.getPlayerRecords();
        if (playerRecords[0].length > 0) {
            console.log(`\n${playerRecords[1]}'s Highscores:`);
            this.displayLeaderBoard(playerRecords[0], false);
        }
    }

    //* Option 5 - Show all player records
    displayPlayerRecords() {
        let playerRecords = this.getPlayerRecords();
        if (playerRecords[0].length > 0) {
            console.log(`\n${playerRecords[1]}'s Records:`);
            HangmanUtils.displayRecordsAsFormattedTable(playerRecords[0]);
        }
    }

    //* Option 6 - Show a player's statistics
    displayPlayerStatistics() {
        let playerRecords = this.getPlayerRecords();
        if (playerRecords[0].length > 0) {
            console.log(`\n${playerRecords[1]}'s Statistics:`);
            this.displayStatistics(playerRecords[0]);
        }
    }
}

module.exports = Statistics;