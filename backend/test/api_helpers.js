import { ToSqlDateTime, isValidEmail, isAtLeast18, LoggedInCheck, EnsureAdminSession } from "../api/api.js";

//BACKEND TESZTEK!!!!

QUnit.module("api_helpers");

// ToSqlDateTime

QUnit.test.each("ToSqlDateTime",
  [
    [new Date(2025, 0, 5, 9, 7, 3), "2025-01-05 09:07:03"],
    [new Date(2025, 11, 31, 23, 59, 59), "2025-12-31 23:59:59"],
    [new Date(2024, 5, 15, 0, 0, 0), "2024-06-15 00:00:00"],
    [new Date(2030, 2, 1, 12, 30, 45), "2030-03-01 12:30:45"]
  ], (assert, [date, expected]) => {
    assert.equal(ToSqlDateTime(date), expected);
});

// isValidEmail

QUnit.test.each("isValidEmail",
  [
    ["valaki@example.com", true],
    ["VICTOR@MÁTÉ.COM", true],
    ["a@b.c", true],
    ["", false],
    ["nincs-kukac.com", false],
    ["nincs@pont", false],
    ["szóköz@em ail.com", false],
    [undefined, false],
    [null, false]
  ], (assert, [email, expected]) => {
    assert.equal(isValidEmail(email), expected);
});

// isAtLeast18

QUnit.test("isAtLeast18 - 18 évnél idősebb (Date)", assert => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 25);
    assert.equal(isAtLeast18(d), true);
});

QUnit.test("isAtLeast18 - pont 18 éves ma", assert => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    assert.equal(isAtLeast18(d), true);
});

QUnit.test("isAtLeast18 - 17 éves", assert => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 17);
    assert.equal(isAtLeast18(d), false);
});

QUnit.test("isAtLeast18 - jövőbeli dátum", assert => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    assert.equal(isAtLeast18(d), false);
});

QUnit.test("isAtLeast18 - érvénytelen string", assert => {
    assert.equal(isAtLeast18("nem-datum"), false);
});

// LoggedInCheck

function makeRequest(user) {
    let destroyed = false;
    let session = null;
    if (user !== null) {
        session = {
            user,
            destroy() { destroyed = true; }
        };
    }
    const request = { session };
    Object.defineProperty(request, "_destroyed", { get: () => destroyed });
    return request;
}

QUnit.test("LoggedInCheck - nincs session", assert => {
    assert.equal(LoggedInCheck({ session: null }), false);
});

QUnit.test("LoggedInCheck - üres user", assert => {
    assert.equal(LoggedInCheck({ session: {} }), false);
});

QUnit.test("LoggedInCheck - hiányzó id", assert => {
    const req = makeRequest({ role: 1, timestamp: Date.now() });
    assert.equal(LoggedInCheck(req), false);
});

QUnit.test("LoggedInCheck - hiányzó timestamp", assert => {
    const req = makeRequest({ id: 1, role: 1 });
    assert.equal(LoggedInCheck(req), false);
});

QUnit.test("LoggedInCheck - hiányzó role", assert => {
    const req = makeRequest({ id: 1, timestamp: Date.now() });
    assert.equal(LoggedInCheck(req), false);
});

QUnit.test("LoggedInCheck - friss session, true és timestamp frissül", assert => {
    const oldTimestamp = Date.now() - 60000;
    const req = makeRequest({ id: 1, role: 0, timestamp: oldTimestamp });
    const result = LoggedInCheck(req);
    assert.equal(result, true);
    assert.ok(req.session.user.timestamp >= oldTimestamp + 60000, "timestamp frissült");
    assert.equal(req._destroyed, false);
});

QUnit.test("LoggedInCheck - lejárt session (>10 perc) destroy és false", assert => {
    const expiredTimestamp = Date.now() - 11 * 60 * 1000;
    const req = makeRequest({ id: 1, role: 1, timestamp: expiredTimestamp });
    const result = LoggedInCheck(req);
    assert.equal(result, false);
    assert.equal(req._destroyed, true);
});

QUnit.test("LoggedInCheck - role 0 (sima user) is elfogadott", assert => {
    const req = makeRequest({ id: 5, role: 0, timestamp: Date.now() });
    assert.equal(LoggedInCheck(req), true);
});

// EnsureAdminSession

QUnit.test("EnsureAdminSession - admin (role 1) friss session", assert => {
    const req = makeRequest({ id: 1, role: 1, timestamp: Date.now() });
    assert.equal(EnsureAdminSession(req), true);
});

QUnit.test("EnsureAdminSession - sima user (role 0)", assert => {
    const req = makeRequest({ id: 2, role: 0, timestamp: Date.now() });
    assert.equal(EnsureAdminSession(req), false);
});

QUnit.test("EnsureAdminSession - admin de lejárt", assert => {
    const req = makeRequest({ id: 1, role: 1, timestamp: Date.now() - 11 * 60 * 1000 });
    assert.equal(EnsureAdminSession(req), false);
});

QUnit.test("EnsureAdminSession - nincs login", assert => {
    assert.equal(EnsureAdminSession({ session: null }), false);
});
