//step 1: create a folder
//step 2: move into that folder
//step 3: npm init -y
//step 4: open folder using VS Code
//step 5: npm i express
//step 6: create server.js

//Server Instantiate
const express = require('express');
const app = express();

//Activate the server on 3000 port
app.listen(3000, () => {
    console.log("Server started at port:3000");  
})

//Routes
app.get('/', (req, res) => {
    res.send("Hii, How are you?");
})

app.post('/api/cars', (req, res) => {
    const {name, brand} = req.body;
    console.log(name);
    console.log(brand);
    res.send("Car submitted successfully.");
})