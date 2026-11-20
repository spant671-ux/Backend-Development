const express = require("express");
const app = express();

app.listen(3000, () => {
    console.log("App is running successfully at PORT:3000")
})

app.get("/", (req, res) => {
    res.send(`<h1>This is Homepage!</h1>`)
})