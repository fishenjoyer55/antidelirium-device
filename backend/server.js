const express = require("express");
const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json());

let records = [];

app.post("/daily", (req, res) => {
  console.log("POST:", req.body);
  records.push({
    date: Date.now(),
    value: req.body.value
  });
  res.json({ ok: true });
});

app.get("/daily", (req, res) => {
  res.json(records);
});

app.listen(3000, () => {
  console.log("Server running on 3000");
});