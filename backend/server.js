const express = require("express");
const app = express();
app.use(express.json());

let records = []; // temporary until database

app.post("/daily", (req, res) => {
    records.push({
        date: Date.now(),
        value: req.body.value
    });
    res.json({status: "ok"});
});

app.get("/daily", (req, res) => {
  res.json(records);
});

app.listen(3000);