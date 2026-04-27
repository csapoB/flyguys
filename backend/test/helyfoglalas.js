import { szamolOsszar, lefoglalgombAllapot } from "../../frontend/javascript/toolbox.js";

QUnit.module("helyfoglalas");

QUnit.test.each("szamolOsszar",
  [
    [[{ ar: 10000 }, { ar: 20000 }], [], 30000],
    [[{ ar: 15000 }], [{ ar: 15000 }], 30000],
    [[], [], 0],
    [[{ ar: 5000 }, { ar: 8000 }], [{ ar: 12000 }], 25000],
    [[{ ar: 0 }], [{ ar: 0 }], 0],
    [[{ ar: 99999 }], [], 99999],
    [[], [{ ar: 50000 }], 50000],
    [[{ ar: 0.5 }], [{ ar: 0.3 }], 0.8],
    [[{ ar: -5000 }], [], -5000],
    [[{ ar: 1000000 }], [{ ar: 1000000 }], 2000000],
  ], (assert, [ulesekOda, ulesekVissza, expected]) => {
    assert.equal(szamolOsszar(ulesekOda, ulesekVissza), expected);
});

QUnit.test.each("lefoglalgombAllapot - egyirányú út",
  [
    [[{ ar: 10000 }], [], 1, false, true],
    [[], [], 1, false, false],
    [[{ ar: 10000 }, { ar: 20000 }], [], 2, false, true],
    [[{ ar: 10000 }], [], 2, false, false],
    [[{ ar: 10000 }, { ar: 20000 }, { ar: 30000 }], [], 3, false, true],
    [[{ ar: 10000 }, { ar: 20000 }, { ar: 30000 }], [], 2, false, false],
    [[], [], 0, false, true],
  ], (assert, [ulesekOda, ulesekVissza, maxPassengers, isRoundTrip, expected]) => {
    assert.equal(lefoglalgombAllapot(ulesekOda, ulesekVissza, maxPassengers, isRoundTrip), expected);
});

QUnit.test.each("lefoglalgombAllapot - retúr út",
  [
    [[{ ar: 10000 }], [{ ar: 20000 }], 1, true, true],
    [[{ ar: 10000 }], [], 1, true, false],
    [[], [{ ar: 20000 }], 1, true, false],
    [[], [], 1, true, false],
    [[{ ar: 10000 }, { ar: 15000 }], [{ ar: 20000 }, { ar: 25000 }], 2, true, true],
    [[{ ar: 10000 }], [{ ar: 20000 }, { ar: 25000 }], 2, true, false],
  ], (assert, [ulesekOda, ulesekVissza, maxPassengers, isRoundTrip, expected]) => {
    assert.equal(lefoglalgombAllapot(ulesekOda, ulesekVissza, maxPassengers, isRoundTrip), expected);
});
