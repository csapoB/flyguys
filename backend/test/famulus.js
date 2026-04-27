import { nameDeFormatter, dateFormatter, dateDeFormatter, progression } from "../../frontend/javascript/toolbox.js";

QUnit.module("famulus");

QUnit.test.each("nameDeFormatter",
  [
    ["Koós&János", "hu", { "first_name": "Koós", "last_name": "János" }],
    ["Géza&Hofi", "en", { "first_name": "Hofi", "last_name": "Géza" }],
    ["&", "en", { "first_name": "", "last_name": "" }],
    ["KovácsKati", "hu", { "first_name": "KovácsKati", "last_name": undefined }],
    ["NeppJózsef", "en", { "first_name": undefined, "last_name": "NeppJózsef" }],
    ["Szenes&Iván", undefined, { "first_name": "Iván", "last_name": "Szenes" }],
    ["Malek&Miklós", "ru", { "first_name": "Miklós", "last_name": "Malek" }],
    [undefined, "en", { "first_name": "", "last_name": "" }]
  ], (assert, [name, language, expected]) => {
    assert.deepEqual(nameDeFormatter(name, language), expected);
    //console.log(`name: ${name}, language: ${language} => { "first_name": ${expected.first_name}, "last_name": ${expected.last_name} }`);
});

QUnit.test.each("dateDeFormatter",
  [
    ["2025-12-02", "hu", "2025.12.02."],
    ["2001-11-11", "en", "11/11/2001"],
    ["", "en", ""],
    ["20041201", "hu", "20041201."],
    ["20031205", "en", "20031205"],
    ["2007-03-01", undefined, "01/03/2007"],
    ["2002-09-02", "ru", "02/09/2002"],
    [undefined, "en", ""],
    [undefined, "hu", "."],
    [undefined, undefined, ""]
  ], (assert, [date, language, expected]) => {
    assert.equal(dateDeFormatter(date, language), expected);
    //console.log(`date: ${date}, language: ${language} => ${expected}`);
});

QUnit.test.each("dateFormatter",
  [
    ["2025.12.02.", "hu", "2025-12-02"],
    ["11/11/2001", "en", "2001-11-11"],
    ["", "en", ""],
    ["20041201", "hu", ""],
    ["20031205", "en", "20031205"],
    ["2007-03-01", undefined, "2007-03-01"],
    ["2002-09-02", "ru", "2002-09-02"],
    [undefined, "en", ""],
    [undefined, "hu", ""],
    [undefined, undefined, ""]
  ], (assert, [date, language, expected]) => {
    assert.equal(dateFormatter(date, language), expected);
    //console.log(`date: ${date}, language: ${language} => ${expected}`);
});

QUnit.test.each("progression",
  [
    [0, { nofIncurrentLvl: 0, toNextRank: 6, percent: 0, capped: false }],
    [5, { nofIncurrentLvl: 5, toNextRank: 1, percent: 100, capped: false }],
    [6, { nofIncurrentLvl: 6, toNextRank: 10, percent: 0, capped: false }],
    [15, { nofIncurrentLvl: 15, toNextRank: 1, percent: 100, capped: false }],
    [16, { nofIncurrentLvl: 16, toNextRank: 10, percent: 0, capped: false }],
    [25, { nofIncurrentLvl: 25, toNextRank: 1, percent: 100, capped: false }],
    [26, { nofIncurrentLvl: 26, toNextRank: 10, percent: 0, capped: false }],
    [35, { nofIncurrentLvl: 35, toNextRank: 1, percent: 100, capped: false }],
    [36, { nofIncurrentLvl: 0, toNextRank: 0, percent: 100, capped: true }],
    [100, { nofIncurrentLvl: 0, toNextRank: 0, percent: 100, capped: true }]
  ], (assert, [nof, expected]) => {
    assert.deepEqual(progression(nof), expected);
});
