"use strict";
// Import Statement
const Hangman = require("./js/hangman");

// Settings
const sourceFileName = "./csv/words.csv";
const recordsFileName = "./csv/scores.csv";
const maxScore = 10;

// Main Program
let hangman = new Hangman(sourceFileName, recordsFileName, maxScore);
hangman.run();
