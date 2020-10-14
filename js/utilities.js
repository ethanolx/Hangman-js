"use strict";
// import statements
const csvtojson = require("convert-csv-to-json");

// helper class for generic utilities
class Utilities {
    //* Global Constants
    static alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    static vowels = ["a", "e", "i", "o", "u"];

    //* "convert" methods
    static convertCSVtoJSON(csv) {
        return csvtojson.getJsonFromCsv(csv);
    }

    static convertDayNumToDay(dayNo) {
        switch (dayNo) {
            case 0: return "Sunday";
            case 1: return "Monday";
            case 2: return "Tuesday";
            case 3: return "Wednesday";
            case 4: return "Thursday";
            case 5: return "Friday";
            case 6: return "Saturday";
        }
    }

    static convert_ms_ToTimeString(timeInMillisecs) {
        let hours = Math.floor(timeInMillisecs / 3600000);
        timeInMillisecs %= 3600000;
        let minutes = Math.floor(timeInMillisecs / 60000);
        timeInMillisecs %= 60000;
        let seconds = Math.floor(timeInMillisecs / 1000);
        timeInMillisecs %= 1000;
        let milliseconds = timeInMillisecs;
        return `${hours}:${minutes}:${seconds}:${milliseconds}`;
    }

    static convertTimeStringTo_ms(timeStr = " ") {
        let timeArr = timeStr.split(":").reverse();
        let millisecs = 0;
        millisecs += parseInt(timeArr[0]);
        for (let i = 1; i < timeArr.length; i++) {
            millisecs += 1000 * (60 ** (i - 1)) * parseInt(timeArr[i]);
        }
        return millisecs;
    }

    //* "format" methods
    // takes a <string> and changes all letters to lowercase
    // capitalises the first letter of each word (optional)
    static formatCapitalisation(str, capitalise = false) {
        let oldStrArr = str.split(" ");
        let newStringArr = new Array();
        for (let i = 0; i < oldStrArr.length; i++) {
            if (capitalise) {
                newStringArr.push(oldStrArr[i].charAt(0).toUpperCase() + oldStrArr[i].substring(1).toLowerCase());
            }
            else {
                newStringArr.push(oldStrArr[i].toLowerCase());
            }
        }
        return newStringArr.join(" ");
    }

    // combines formatCapitalisation and formatWithoutExtraSpaces to provide complete formatting
    static formatString(str, capitalise = false) {
        let strWithoutSpaces = Utilities.formatWithoutExtraSpaces(str);
        return Utilities.formatCapitalisation(strWithoutSpaces, capitalise);
    }

    // takes a <string> and removes all leading, trailing and duplicate internal whitespaces
    static formatWithoutExtraSpaces(str) {
        let oldStringArr = str.split(" ");
        let newStringArr = new Array();
        for (let i = 0; i < oldStringArr.length; i++) {
            if (oldStringArr[i].trim() !== "") {
                newStringArr.push(oldStringArr[i].trim());
            }
        }
        return newStringArr.join(" ");
    }

    //* Custom String Operator (str)
    static strReplaceByIndex(str, replacementStr, index) {
        return str.substring(0, index) + replacementStr + str.substring(index + 1);
    }

    //* "check" method
    // checks if value 1 is greater than value 2
    // if values 1 and 2 are tied, proceeds to compare values 3 and 4 in the same way
    // ...
    // returns true if the tie is broken in favour of new input
    // is basically a tiebreaker method
    static checkIfNewIsGreater(new_x, old_x, new_y = null, old_y = null, new_z = null, old_z = null) {
        if (new_z !== null) {
            return (new_x > old_x || (new_x === old_x && new_y > old_y) || (new_x === old_x && new_y === old_y && new_z > old_z));
        }
        else if (new_y !== null) {
            return (new_x > old_x || (new_x === old_x && new_y > old_y));
        }
        else {
            return new_x > old_x;
        }
    }
}

module.exports = Utilities;