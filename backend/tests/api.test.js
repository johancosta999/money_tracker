// End-to-end API tests against a throwaway in-memory MongoDB.
// Run with: npm test

process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";
process.env.MONGO_URI = "mongodb://unused-in-tests";
process.env.RESEND_API_KEY = "test-key";
process.env.FRONTEND_URL = "http://app.test";
delete process.env.SENTRY_DSN;

const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");

let app;
let mongo;

// Emails are "sent" here instead of to Resend
const sentEmails = [];

beforeAll(async () => {
    global.fetch = jest.fn(async (url, options) => {
        sentEmails.push(JSON.parse(options.body));
        return { ok: true, status: 200, text: async () => "" };
    });

    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    app = require("../app");
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
});

// ---------- helpers ----------

let userCount = 0;

const registerAndLogin = async () => {
    userCount += 1;
    const email = `user${userCount}@example.com`;
    const password = "password123";

    await request(app)
        .post("/api/auth/register")
        .send({ userName: `User ${userCount}`, email, password, age: 25 })
        .expect(201);

    const { body } = await request(app)
        .post("/api/auth/login")
        .send({ email, password })
        .expect(200);

    return { token: body.token, id: body.user.id, email, password };
};

const auth = (token) => ({ Authorization: `Bearer ${token}` });

// A planner whose period includes today, so transactions dated today fit in it
const createPlanner = async (token) => {
    const start = new Date();
    start.setDate(start.getDate() - 5);

    const { body } = await request(app)
        .post("/api/plan")
        .set(auth(token))
        .send({ name: "November", startDate: start.toISOString(), totalBudget: 50000 })
        .expect(201);

    return body.planner;
};

const today = () => new Date().toISOString().split("T")[0];

const createTransaction = (token, plannerId, overrides = {}) =>
    request(app)
        .post("/api/transactions")
        .set(auth(token))
        .send({
            title: "Lunch",
            amount: 1500,
            type: "expense",
            category: "Food",
            date: today(),
            description: "Rice and curry",
            plannerId,
            ...overrides
        });

const getNotes = async (token) =>
    (await request(app).get("/api/notes").set(auth(token)).expect(200)).body;

// ---------- auth ----------

describe("auth", () => {
    test("register, login and /me work", async () => {
        const { token, email } = await registerAndLogin();

        const { body } = await request(app).get("/api/auth/me").set(auth(token)).expect(200);
        expect(body.email || body.user?.email).toBe(email);
    });

    test("wrong password is rejected", async () => {
        const { email } = await registerAndLogin();
        await request(app).post("/api/auth/login").send({ email, password: "wrong-password" }).expect(400);
    });

    test("protected routes need a token", async () => {
        await request(app).get("/api/transactions").expect(401);
    });
});

// ---------- ownership ----------

describe("ownership", () => {
    test("another user can't read, edit or delete my transaction", async () => {
        const alice = await registerAndLogin();
        const bob = await registerAndLogin();
        const planner = await createPlanner(alice.token);

        const { body } = await createTransaction(alice.token, planner._id).expect(201);
        const id = body.transaction._id;

        await request(app).get(`/api/transactions/${id}`).set(auth(bob.token)).expect(404);
        await request(app).put(`/api/transactions/${id}`).set(auth(bob.token)).send({ amount: 1 }).expect(404);
        await request(app).delete(`/api/transactions/${id}`).set(auth(bob.token)).expect(404);

        const list = await request(app).get("/api/transactions").set(auth(bob.token)).expect(200);
        expect(list.body).toHaveLength(0);
    });

    test("another user can't delete my bank transaction", async () => {
        const alice = await registerAndLogin();
        const bob = await registerAndLogin();

        const { body } = await request(app)
            .post("/api/bank/create-transaction")
            .set(auth(alice.token))
            .send({ type: "Deposit", amount: 1000, category: "Food", date: today() })
            .expect(200);

        await request(app).delete(`/api/bank/delete-transaction/${body._id}`).set(auth(bob.token)).expect(404);
    });

    test("another user can't delete my account", async () => {
        const alice = await registerAndLogin();
        const bob = await registerAndLogin();

        await request(app)
            .delete(`/api/users/${alice.id}`)
            .set(auth(bob.token))
            .send({ password: bob.password })
            .expect(403);
    });

    test("deleting my account removes my data", async () => {
        const alice = await registerAndLogin();
        const planner = await createPlanner(alice.token);
        await createTransaction(alice.token, planner._id).expect(201);

        await request(app)
            .delete(`/api/users/${alice.id}`)
            .set(auth(alice.token))
            .send({ password: alice.password })
            .expect(200);

        const Transaction = require("../model/transactionsModel");
        expect(await Transaction.countDocuments({ user: alice.id })).toBe(0);
    });
});

// ---------- edit / delete ----------

describe("editing transactions", () => {
    test("I can edit and delete my own transaction", async () => {
        const { token } = await registerAndLogin();
        const planner = await createPlanner(token);
        const { body } = await createTransaction(token, planner._id).expect(201);
        const id = body.transaction._id;

        const updated = await request(app)
            .put(`/api/transactions/${id}`)
            .set(auth(token))
            .send({ title: "Dinner", amount: 2000 })
            .expect(200);
        expect(updated.body.transaction).toMatchObject({ title: "Dinner", amount: 2000 });

        await request(app).delete(`/api/transactions/${id}`).set(auth(token)).expect(200);
        await request(app).get(`/api/transactions/${id}`).set(auth(token)).expect(404);
    });
});

// ---------- debt notes ----------

describe("debt notes", () => {
    test("income in the Debt category creates a note with the description", async () => {
        const { token } = await registerAndLogin();
        const planner = await createPlanner(token);

        const { body } = await createTransaction(token, planner._id, {
            type: "income",
            category: "Debt",
            description: "Borrowed from Kamal"
        }).expect(201);

        expect(body.noteCreated).toBe(true);
        expect((await getNotes(token)).map((note) => note.text)).toEqual(["Borrowed from Kamal"]);
    });

    test("expenses in Debt and income in other categories don't create notes", async () => {
        const { token } = await registerAndLogin();
        const planner = await createPlanner(token);

        await createTransaction(token, planner._id, { type: "expense", category: "Debt" }).expect(201);
        await createTransaction(token, planner._id, { type: "income", category: "Food" }).expect(201);

        expect(await getNotes(token)).toHaveLength(0);
    });

    test("a Debt bank deposit creates a note, falling back to the amount", async () => {
        const { token } = await registerAndLogin();

        const { body } = await request(app)
            .post("/api/bank/create-transaction")
            .set(auth(token))
            .send({ type: "Deposit", amount: 5000, category: "Debt", external: true, date: today() })
            .expect(200);

        expect(body.noteCreated).toBe(true);
        expect((await getNotes(token))[0].text).toMatch(/Debt deposit: Rs\. 5,000/);
    });

    test("a Debt withdrawal doesn't create a note", async () => {
        const { token } = await registerAndLogin();

        await request(app)
            .post("/api/bank/create-transaction")
            .set(auth(token))
            .send({ type: "Withdraw", amount: 500, category: "Debt", date: today() })
            .expect(200);

        expect(await getNotes(token)).toHaveLength(0);
    });
});

// ---------- bank category ----------

describe("bank category", () => {
    test("a bank transaction without a category is rejected", async () => {
        const { token } = await registerAndLogin();

        await request(app)
            .post("/api/bank/create-transaction")
            .set(auth(token))
            .send({ type: "Deposit", amount: 1000, date: today() })
            .expect(400);
    });

    test("an edit can't clear the category", async () => {
        const { token } = await registerAndLogin();

        const { body } = await request(app)
            .post("/api/bank/create-transaction")
            .set(auth(token))
            .send({ type: "Deposit", amount: 1000, category: "Food", date: today() })
            .expect(200);

        await request(app)
            .put(`/api/bank/update-transaction/${body._id}`)
            .set(auth(token))
            .send({ category: "" })
            .expect(400);
    });
});

// ---------- dashboard ----------

describe("dashboard", () => {
    test("summary adds up income, expenses and external bank money", async () => {
        const { token } = await registerAndLogin();
        const planner = await createPlanner(token);

        await createTransaction(token, planner._id, { type: "income", amount: 10000, category: "Food" }).expect(201);
        await createTransaction(token, planner._id, { type: "expense", amount: 3000 }).expect(201);

        const bank = (data) =>
            request(app).post("/api/bank/create-transaction").set(auth(token))
                .send({ category: "Others", date: today(), ...data }).expect(200);

        await bank({ type: "Deposit", amount: 2000, external: true });   // counts: +2000
        await bank({ type: "Deposit", amount: 700, external: false });   // own money: no balance change
        await bank({ type: "Transfer", amount: 500, external: true });   // counts: -500
        await bank({ type: "Withdraw", amount: 100, external: true });   // never counts

        const { body } = await request(app).get("/api/dashboard/summary").set(auth(token)).expect(200);

        expect(body).toMatchObject({
            totalIncome: 10000,
            totalExpense: 3000,
            bankIn: 2000,
            bankOut: 500,
            bankNet: 2000 + 700 - 500 - 100,
            balance: 10000 - 3000 + 2000 - 500
        });
    });

    test("category breakdown sums expenses per category, biggest first", async () => {
        const { token } = await registerAndLogin();
        const planner = await createPlanner(token);

        await createTransaction(token, planner._id, { amount: 1000, category: "Food" }).expect(201);
        await createTransaction(token, planner._id, { amount: 500, category: "Food" }).expect(201);
        await createTransaction(token, planner._id, { amount: 4000, category: "Bills" }).expect(201);
        await createTransaction(token, planner._id, { type: "income", amount: 9999, category: "Food" }).expect(201);

        const { body } = await request(app)
            .get("/api/dashboard/categories")
            .query({ plannerId: planner._id })
            .set(auth(token))
            .expect(200);

        expect(body).toEqual([
            { category: "Bills", total: 4000, count: 1 },
            { category: "Food", total: 1500, count: 2 }
        ]);
    });
});

// ---------- forgot password ----------

describe("forgot password", () => {
    test("unknown emails get the same reply and no email is sent", async () => {
        const before = sentEmails.length;

        const { body } = await request(app)
            .post("/api/auth/forgot-password")
            .send({ email: "nobody@example.com" })
            .expect(200);

        expect(body.message).toMatch(/If an account exists/);
        expect(sentEmails.length).toBe(before);
    });

    test("the emailed link resets the password once", async () => {
        const user = await registerAndLogin();

        await request(app).post("/api/auth/forgot-password").send({ email: user.email }).expect(200);

        const email = sentEmails[sentEmails.length - 1];
        expect(email.to).toEqual([user.email]);

        const token = email.text.match(/reset-password\?token=([a-f0-9]{64})/)[1];

        await request(app)
            .post("/api/auth/reset-password")
            .send({ token, password: "brand-new-password" })
            .expect(200);

        // Old password stops working, new one works
        await request(app).post("/api/auth/login").send({ email: user.email, password: user.password }).expect(400);
        await request(app).post("/api/auth/login").send({ email: user.email, password: "brand-new-password" }).expect(200);

        // The link can't be used twice
        await request(app)
            .post("/api/auth/reset-password")
            .send({ token, password: "another-password" })
            .expect(400);
    });

    test("a made-up token is rejected", async () => {
        await request(app)
            .post("/api/auth/reset-password")
            .send({ token: "a".repeat(64), password: "whatever123" })
            .expect(400);
    });
});
