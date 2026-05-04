import {isValidEmail, isAtLeast18} from "../../frontend/javascript/modal.js"

QUnit.module("modal");

QUnit.test.each("isValidEmail",
  [
    ["koosjanos@gmail.com", true],
    ["Geza@Hofi", false],
    ["", false],
    ["kovacs@kati.", false],
    [".@...", true],
    ["SZENESIVÁN", false],
    ["malekmiklós", false],
    [undefined, false],
    ["VICTOR@MÁTÉ.COM", true]
  ], (assert, [email, expected]) => {
    assert.equal(isValidEmail(email), expected);
});

QUnit.test.each("isAtLeast18",
  [
    ["2007|01|02", false],
    ["2025127.", false],
    ["22/11/2001", false],
    ["2025.12.7.", false],
    ["I'm a date!", false],
    [new Date("2005-12-07"), true],
    ["2005-12-07", true],
    ["2025-12-07", false],
    [new Date(), false],
    ["Invalid Date", false],
    [undefined, false]

  ], (assert, [date, expected]) => {
    assert.equal(isAtLeast18(date), expected);
});