/* eslint-disable @typescript-eslint/no-var-requires */
const request = require("supertest");
const app = require("../src/server");

describe("Test the root path", () => {
    test("It should response the GET method", () => {
        return request(app)
            .get("/")
            .expect(200);
    });
});
