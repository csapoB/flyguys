import { nameDeFormatter } from "../../frontend/javascript/toolbox.js"; 

QUnit.module("famulus");

QUnit.test.each("nameDeFormatter",
  [
    ["Koós&János", "hu", { "first_name": "Koós", "last_name": "János" }],
    ["Géza&Hofi", "en", { "first_name": "Hofi", "last_name": "Géza" }],
    ["&", "en", { "first_name": "", "last_name": "" }],
    ["KovácsKati", "hu", { "first_name": "KovácsKati", "last_name": undefined }],
    ["NeppJózsef", "en", { "first_name": undefined, "last_name": "NeppJózsef" }],
    ["Szenes&Iván", undefined, { "first_name": "Iván", "last_name": "Szenes" }]
    // [undefined, "en", { "first_name": undefined, "last_name": "NeppJózsef" }]
  ], (assert, [name, language, expected]) => {
    assert.deepEqual(nameDeFormatter(name, language), expected);
});

