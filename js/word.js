"use strict";
// import statements
const Utilities = require("./utilities");
const HangmanUtils = require("./hangmanUtils");

// represents each word in the game
class Word {
    constructor(text = "", category = "No Category", definition = "No Definition", lives = 0) {
        this.text = text;           // the word itself
        this.category = (category.trim() === "") ? "No Category" : category;            // the word's category
        this.definition = (definition.trim() === "") ? "No Definition" : definition;    // the word's definition
        this.lives = lives;         // number of lives accorded for current word
        this.guessedLetters = [];   // letters/symbols the player has already guessed
        this.lettersToGuess = this.getLettersToBeGuessed();     // unique letters in the current word
    }

    //* "display" methods
    // logs the hangman setup based on the player's lives for the current word (max. 15)
    displayHangman() {
        let hangmanArr = ["             ", "             ", "             ", "             ", "             ", "             ", " ___________ ", "|           |", "|___________| "];
        let hangmanStr = "";
        switch (this.lives) {
            case 0: hangmanArr[5] = Utilities.strReplaceByIndex(hangmanArr[5], "\\", 9);
            case 1: hangmanArr[5] = Utilities.strReplaceByIndex(hangmanArr[5], "/", 7);
            case 2: hangmanArr[4] = Utilities.strReplaceByIndex(hangmanArr[4], "|", 8);
            case 3: hangmanArr[3] = Utilities.strReplaceByIndex(hangmanArr[3], "\\", 9);
            case 4: hangmanArr[3] = Utilities.strReplaceByIndex(hangmanArr[3], "/", 7);
            case 5: hangmanArr[3] = Utilities.strReplaceByIndex(hangmanArr[3], "|", 8);
            case 6: hangmanArr[2] = Utilities.strReplaceByIndex(hangmanArr[2], "O", 8);
            case 7: hangmanArr[1] = Utilities.strReplaceByIndex(hangmanArr[1], "|", 8);
            case 8:
                for (let i = 3; i < 8; i++) {
                    hangmanArr[0] = Utilities.strReplaceByIndex(hangmanArr[0], "_", i);
                }
            case 9: hangmanArr[1] = Utilities.strReplaceByIndex(hangmanArr[1], "|", 2);
            case 10: hangmanArr[2] = Utilities.strReplaceByIndex(hangmanArr[2], "|", 2);
            case 11: hangmanArr[3] = Utilities.strReplaceByIndex(hangmanArr[3], "|", 2);
            case 12: hangmanArr[4] = Utilities.strReplaceByIndex(hangmanArr[4], "|", 2);
            case 13: hangmanArr[5] = Utilities.strReplaceByIndex(hangmanArr[5], "|", 2);
            case 14:
                hangmanArr[5] = Utilities.strReplaceByIndex(hangmanArr[5], "_", 1);
                hangmanArr[5] = Utilities.strReplaceByIndex(hangmanArr[5], "_", 3);
                hangmanArr[6] = "|   |_______ ";
            case 15:
            default:
                hangmanStr = hangmanArr.join("\n");
        }
        console.log(hangmanStr);
    }

    // logs the word/phrase-to-guess, with encryption, to the console
    displayLetters() {
        let wordHidden = "\n";
        for (let i = 0; i < this.text.length; i++) {
            if (this.lettersToGuess.includes(this.text.charAt(i))) {
                wordHidden += HangmanUtils.symbol;
            }
            else {
                wordHidden += this.text.charAt(i);
            }
            wordHidden += " ";
        }
        console.log(wordHidden);
    }

    // logs the letters the player has yet to guess to the console
    displayLettersToGuess() {
        let lettersNotGuessed = "\n";
        for (let letter of Utilities.alphabet) {
            if (!this.guessedLetters.includes(letter.toLowerCase())) {
                lettersNotGuessed += letter.toUpperCase() + "  ";
            }
            else {
                lettersNotGuessed += "   ";
            }
        }
        lettersNotGuessed += "\n";
        console.log(Utilities.strReplaceByIndex(lettersNotGuessed, "\n", 39));
    }

    // logs the number of lives the player has for the current word
    displayLives() {
        console.log(`\nLives left: ${this.lives}`);
    }

    // logs all information related to the current word to the console
    displayWordInfo() {
        this.displayHangman();
        this.displayLives();
        this.displayLetters();
        this.displayLettersToGuess();
    }

    //* "perform" methods
    // evaulates the player's guess
    performGuessCheck(guess) {
        if (guess.length === 0) {
            console.log("\nInvalid input! Please enter a letter, word or phrase!");
        }
        else if (guess.length > 1) {
            if (Utilities.formatString(this.text) === guess) {
                this.lettersToGuess = [];
            }
            else {
                this.lives--;
                console.log(`\nSorry, the ${(this.text.split(" ").length > 1) ? "phrase" : "word"} is not \"${guess}\"!`);
            }
        }
        else if (this.checkIfLetterHasbeenGuessed(guess) && Utilities.alphabet.includes(guess)) {
            this.lives--;
            console.log(`\nYou have already guessed "${guess}"!`);
        }
        else if (!this.checkIfWordHasLetter(guess)) {
            this.lives--;
            this.guessedLetters.push(guess);
            console.log(`\nSorry, the ${(this.text.split(" ").length > 1) ? "phrase" : "word"} does not contain \"${guess}\".`);
        }
        else if (this.checkIfWordHasLetter(guess) && !this.checkIfLetterHasbeenGuessed(guess)) {
            console.log(`\nGreat! The ${(this.text.split(" ").length > 1) ? "phrase" : "word"} contains \"${guess}\"!`);
            this.performGuessSuccess(guess);
        }
    }

    // action after the player makes a right guess
    performGuessSuccess(guess) {
        this.guessedLetters.push(guess);
        this.lettersToGuess = this.lettersToGuess.filter((a) => a !== guess);
    }

    //* "get" method
    // returns an Array<string> of the unique letters in the current word (which the player has to guess)
    getLettersToBeGuessed() {
        let uniqueLetters = new Array();
        for (let i = 0; i < this.text.length; i++) {
            if (!uniqueLetters.includes(this.text.charAt(i)) && Utilities.alphabet.includes(this.text.charAt(i).toLowerCase())) {
                uniqueLetters.push(this.text.charAt(i));
            }
        }
        uniqueLetters.sort();
        return uniqueLetters;
    }

    //* "check" methods
    // checks if the player is repeating a guess (any)
    checkIfLetterHasbeenGuessed(letter) {
        return this.guessedLetters.includes(letter);
    }

    // checks if the current word/phrase contains the player's guess (letter)
    checkIfWordHasLetter(letter) {
        return this.text.includes(letter);
    }

    // helper method for lifeline 1 - checks if all the vowels of the current word have already been revealed
    checkIfVowelsAllRevealed() {
        let allVowelsRevealed = true;
        for (let letterToGuess of this.lettersToGuess) {
            if (Utilities.vowels.includes(letterToGuess)) {
                allVowelsRevealed = false;
                break;
            }
        }
        return allVowelsRevealed;
    }

    //* "lifeline" methods
    // lifeline 1 - Show all vowels in the current word (is only expended if at least one new vowel is revealed)
    lldisplayAllVowels() {
        if (this.checkIfVowelsAllRevealed()) {
            console.log("\nAll vowels have been revealed already!");
        }
        else {
            for (let i = 0; i < this.text.length; i++) {
                if (this.lettersToGuess.includes(this.text.charAt(i)) && Utilities.vowels.includes(this.text.charAt(i))) {
                    this.performGuessSuccess(this.text.charAt(i));
                }
            }
            this.displayLetters();
        }
    }

    // lifeline 2 - Show definition of the word/phrase
    lldisplayWordDefinition() {
        console.log(`\nDefinition: ${this.definition}`);
    }

    // lifeline 3 - Skip and score word/phrase (instant success)
    llskipAndScoreWord() {
        this.lettersToGuess = [];
        this.displayLetters();
    }

    // lifeline 4 - Add lives to the current round based on the game's difficulty level
    lladdLives(difficultyLevel) {
        let livesToBeAdded = 5 - Math.ceil(difficultyLevel / 2);
        this.lives += livesToBeAdded;
        console.log(`\n${livesToBeAdded} ${(livesToBeAdded > 1) ? "lives were" : "life was"} added!`);
    }
}

module.exports = Word;