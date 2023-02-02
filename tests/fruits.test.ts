import app from "../src/index";
import supertest from "supertest";

const banana: Fruit = { name: "banana", price: 3 };
const apple: Fruit = { name: "apple", price: 4 };
const papaya: Fruit = { name: "papaya", price: 5 };
const pineapple: Fruit = { name: "pineapple", price: 6 };

const api = supertest(app);

describe("GET /health", () => {
  it("Connection test", async () => {
    const res = await api.get("/health");

    expect(res.status).toBe(200);
  });
});

describe("GET /fruits", () => {
  it("It should to return 200 status code", async () => {
    const res = await api.get("/fruits");

    expect(res.status).toBe(200);
  });

  it("It should to return 200 status code and a empty array when there aren't fruits", async () => {
    const res = await api.get("/fruits");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("It should to return all fruits", async () => {
    await api.post("/fruits").send(banana);
    await api.post("/fruits").send(apple);
    await api.post("/fruits").send(papaya);
    await api.post("/fruits").send(pineapple);

    const res = await api.get("/fruits");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(4);
  });
});

describe("GET /fruits/:id", () => {
  it("It should to return 200 status code", async () => {
    const res = await api.get("/fruits/1");

    expect(res.status).toBe(200);
  });

  it("It should to return one fruit object", async () => {
    const res = await api.get("/fruits/1");

    const fruit: FruitResponse = res.body;

    expect(fruit).toEqual({
      id: expect.any(Number),
      name: expect.any(String),
      price: expect.any(Number),
    });
  });

  it("It should to return the correct fruit", async () => {
    const res = await api.get("/fruits/1");

    const fruit: FruitResponse = res.body;

    expect(fruit).toEqual({
      id: 1,
      ...banana,
    });
  });

  it("It should to return 404 status code when invalid id", async () => {
    const res = await api.get("/fruits/lorem");

    expect(res.status).toBe(404);
  });
});

describe("POST /fruits", () => {
  it("It should to return status 422 status code when the body is invalid.", async () => {
    const body1: PartialFruits = { name: "apple", price: "apple" };
    const body2: PartialFruits = { name: 1, price: "apple" };
    const body3: PartialFruits = { name: 1, price: 1 };
    const body4: PartialFruits = { name: 1 };
    const body5: PartialFruits = { price: 1 };
    const body6: PartialFruits = {};

    const status = 422;

    const response1 = await api.post("/fruits").send(body1);
    expect(response1.status).toBe(status);

    const response2 = await api.post("/fruits").send(body2);
    expect(response2.status).toBe(status);

    const response3 = await api.post("/fruits").send(body3);
    expect(response3.status).toBe(status);

    const response4 = await api.post("/fruits").send(body4);
    expect(response4.status).toBe(status);

    const response5 = await api.post("/fruits").send(body5);
    expect(response5.status).toBe(status);

    const response6 = await api.post("/fruits").send(body6);
    expect(response6.status).toBe(status);
  });

  it("It should to return status code 201 when the body is valid.", async () => {
    const response = await api
      .post("/fruits")
      .send({ name: "melon", price: 1 });

    expect(response.status).toBe(201);
  });

  it("It should to return status code 409 when the fruit is repeated.", async () => {
    await api.post("/fruits").send({ name: "watermelon", price: 1 });

    const response = await api
      .post("/fruits")
      .send({ name: "watermelon", price: 1 });

    expect(response.status).toBe(409);
  });
});

type Fruit = {
  name: string;
  price: number;
};

type FruitResponse = {
  id: number;
  name: string;
  price: number;
};

type PartialFruits = {
  name?: any;
  price?: any;
};
