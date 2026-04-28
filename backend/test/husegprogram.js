import { flightNumbers } from "../../frontend/javascript/toolbox.js";

QUnit.module("husegprgram");

QUnit.test.each("flightNumbers",
  [
    [5, { name: "Bronze", class: "bronz" }],
    [11, { name: "Silver", class: "silver" }],
    [-11, { name: "Bronze", class: "bronz" }],
    [23, { name: "Gold", class: "gold" }],
    [36, { name: "Diamond", class: "diamond" }],
    [26, { name: "Platinum", class: "platinum" }],
    [37, { name: "Diamond", class: "diamond" }],
    ["sddsfs", undefined],
    [undefined, undefined]
  ], (assert, [n, expected]) => {
    assert.deepEqual(flightNumbers(n), expected);
    

});

