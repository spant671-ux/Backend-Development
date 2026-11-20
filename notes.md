# 🛠️ Backend Development Handbook & Notes

A structured companion covering core backend concepts, networking fundamentals, HTTP protocols, Express.js implementations, and database tooling.

---

## 📌 Table of Contents

1. [What is Backend Development?](#1-what-is-backend-development)
2. [How the Web Works: DNS (Domain Name System)](#2-how-the-web-works-dns-domain-name-system)
3. [TCP & The Three-Way Handshake](#3-tcp--the-three-way-handshake)
4. [HTTP Protocol, Methods & Idempotence](#4-http-protocol-methods--idempotence)
5. [Express.js Fundamentals](#5-expressjs-fundamentals)
6. [Code Implementation (`01/server.js`)](#6-code-implementation-01serverjs)
7. [Testing POST Requests with Postman](#7-testing-post-requests-with-postman)
8. [Setup & Running Commands](#8-setup--running-commands)
9. [Introduction to MongoDB & Database Tools (mongosh & Compass)](#9-introduction-to-mongodb--database-tools-mongosh--compass)
10. [MongoDB CRUD Operations (Create, Read, Update, Delete)](#10-mongodb-crud-operations-create-read-update-delete)
11. [Module 02 — MVC Architecture & TODO API (Create Endpoint)](#11-module-02--mvc-architecture--todo-api-create-endpoint)

---

## 1. What is Backend Development?

In web applications, software is divided into two main environments:

- **Frontend (Client-side)**: What the user interacts with in the browser (HTML, CSS, React, UI elements). It runs on untrusted user hardware.
- **Backend (Server-side)**: The hidden engine running on remote servers. It is a secure, authoritative environment responsible for:
  - **Business Logic**: Processing rules, validating data, performing calculations.
  - **Data Persistence**: Storing, updating, and querying databases (MongoDB, PostgreSQL, MySQL).
  - **Authentication & Authorization**: Verifying user identity (passwords, JWTs, sessions) and access permissions.
  - **Security**: Guarding sensitive secrets (API keys, DB credentials), sanitizing inputs, and enforcing rate limiting.
  - **External Integrations**: Communicating with third-party services (payment gateways, email services, cloud storage).

---

## 2. How the Web Works: DNS (Domain Name System)

When you type a URL like `https://api.example.com` in your browser or make a request from a client, computers do not understand domain names directly — they communicate using numerical **IP addresses**.

**DNS** acts as the internet's phonebook, translating human-friendly domain names into machine-routable IP addresses.

### DNS Resolution Flow:

```text
Client (Browser / Postman)
      │
      ├─► 1. Check local cache (Browser cache ──► OS cache ──► Router cache)
      │      (If not found...)
      │
      ├─► 2. Query Recursive Resolver (ISP / 8.8.8.8)
      │      │
      │      ├─► 3. Root Name Server (".")
      │      │      └─► Points to TLD Server
      │      │
      │      ├─► 4. Top-Level Domain (TLD) Server (".com")
      │      │      └─► Points to Authoritative Name Server
      │      │
      │      └─► 5. Authoritative Name Server ("example.com")
      │             └─► Returns final IP (e.g., 93.184.216.34)
      │
      ▼
Client receives IP and establishes connection to the target server
```

### IP Address vs. Port
- **IP Address (e.g., `127.0.0.1` or `192.168.1.1`)**: Locates the specific machine on a network.
- **Port (e.g., `3000`, `80`, `443`)**: Identifies the specific application or process running on that machine.
- **Socket**: The combination of `IP:Port` (e.g., `127.0.0.1:3000`).

---

## 3. TCP & The Three-Way Handshake

Before any HTTP request can be transmitted, a reliable connection must be established between client and server using the **Transmission Control Protocol (TCP)**.

TCP ensures that data packets are delivered reliably, in order, and without loss. It establishes a connection using the **Three-Way Handshake**:

```text
   CLIENT                                              SERVER
 (e.g. Browser)                                   (e.g. Express on :3000)
       │                                                    │
       │                 1. SYN (Synchronize)               │
       ├───────────────────────────────────────────────────►│
       │ "Hey, I want to connect. Here is my sequence num." │
       │                                                    │
       │            2. SYN-ACK (Synchronize-Acknowledge)    │
       │◄───────────────────────────────────────────────────┤
       │ "Got your SYN. I acknowledge it, and here is mine."│
       │                                                    │
       │                 3. ACK (Acknowledge)               │
       ├───────────────────────────────────────────────────►│
       │ "Got your SYN-ACK. Connection is now ESTABLISHED!" │
       │                                                    │
       │════════════════════════════════════════════════════│
       │           Connection Established (Ready for HTTP)  │
       │════════════════════════════════════════════════════│
       │                                                    │
       │              HTTP GET / POST Request               │
       ├───────────────────────────────────────────────────►│
       │                                                    │
       │                  HTTP Response                     │
       │◄───────────────────────────────────────────────────┤
```

### The 3 Steps:
1. **SYN (Synchronize)**: The client generates an initial sequence number `X` and sends a packet with the SYN flag set to request a connection.
2. **SYN-ACK (Synchronize-Acknowledge)**: The server acknowledges receiving `X` (`ACK = X + 1`), generates its own sequence number `Y`, and sends back a packet with both SYN and ACK flags set.
3. **ACK (Acknowledge)**: The client acknowledges receiving `Y` (`ACK = Y + 1`). The TCP socket is now in the `ESTABLISHED` state, and HTTP data transfer can begin.

---

## 4. HTTP Protocol, Methods & Idempotence

**HTTP (HyperText Transfer Protocol)** is an application-layer protocol running on top of TCP that governs communication between clients and servers.

### Anatomy of an HTTP Transaction:
1. **Request**:
   - **Method / Verb**: What action to perform (`GET`, `POST`, etc.).
   - **URL / Path**: The targeted endpoint (`/api/cars`).
   - **Headers**: Metadata (e.g., `Content-Type: application/json`, auth tokens).
   - **Body (Payload)**: Data sent to the server (primarily in `POST`, `PUT`, `PATCH`).
2. **Response**:
   - **Status Code**: Indicates outcome (e.g., `200 OK`, `201 Created`, `404 Not Found`).
   - **Headers**: Metadata (e.g., `Content-Type`, caching policies).
   - **Body**: The returned data (usually JSON or HTML).

### Primary HTTP Methods:

| Method | Purpose | CRUD Equivalent | Has Request Body? | Idempotent? |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | Retrieve data from server | **R**ead | ❌ No | ✅ Yes |
| **`POST`** | Submit data to create a new resource | **C**reate | ✅ Yes | ❌ No |
| **`PUT`** | Completely replace an existing resource | **U**pdate (Full) | ✅ Yes | ✅ Yes |
| **`PATCH`** | Partially update specific fields | **U**pdate (Partial) | ✅ Yes | ❌ No |
| **`DELETE`** | Remove a resource | **D**elete | Optional / Rare | ✅ Yes |

### What is Idempotence?
An HTTP method is **idempotent** if making the same request multiple times produces the **exact same result on the server** as making it once.

- **`GET /api/cars` (Idempotent)**: Requesting cars 1 time or 10 times doesn't change anything on the server.
- **`POST /api/cars` (Not Idempotent)**: Sending 5 requests creates 5 separate cars in the database.
- **`PUT /api/cars/5` (Idempotent)**: Updating car 5 to "Tesla" 1 time or 10 times leaves car 5 as "Tesla".
- **`DELETE /api/cars/5` (Idempotent)**: Deleting car 5 once deletes it. Deleting it again doesn't change the database (it's already gone).

### Common HTTP Status Code Categories:
- **`2xx` (Success)**: `200 OK` (standard success), `201 Created` (resource created via POST), `204 No Content`.
- **`3xx` (Redirection)**: `301 Moved Permanently`, `304 Not Modified`.
- **`4xx` (Client Errors)**: `400 Bad Request` (invalid input), `401 Unauthorized` (unauthenticated), `403 Forbidden` (no permission), `404 Not Found`.
- **`5xx` (Server Errors)**: `500 Internal Server Error`, `502 Bad Gateway`.

---

## 5. Express.js Fundamentals

### What is Express?
**Express** is a minimalist, fast web framework built for Node.js. It acts as an abstraction over Node's native `http` module.

### Why Express over raw Node.js `http`?
- **Routing**: Clean, expressive syntax (`app.get()`, `app.post()`) instead of manual `if (req.url === ... && req.method === ...)` chains.
- **Middleware Architecture**: Pipeline structure allowing request logging, authentication, and body parsing to be chained modularly.
- **Response Utilities**: Helpers like `res.json()`, `res.status()`, and `res.send()` eliminate manual header and stringification setup.

---

## 6. Code Implementation (`01/server.js`)

Located in [`01/server.js`](file:///c:/Personal/Code/Backend%20Development/01/server.js):

```javascript
//step 1: create a folder
//step 2: move into that folder
//step 3: npm init -y
//step 4: open folder using VS Code
//step 5: npm i express
//step 6: create server.js

//Server Instantiate
const express = require('express');
const app = express();

//Used to parse req.body in express -> PUT or POST
const bodyParser = require('body-parser');

//Specifically parse json data and add it to req.body object
app.use(bodyParser.json());

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

const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/Cars')
  .then(() => {console.log("Connection successful!");})
  .catch((error) => {console.log("Received an error:", error);});
```

### Key Concepts Summary:

- **Server Setup**: `express()` creates the app; `app.listen(3000)` binds the server to port 3000.
- **Body Parsing**: `bodyParser.json()` parses raw incoming JSON request streams and attaches data to `req.body`.
- **Routes**:
  - `GET /`: Returns a simple text response via `res.send()`.
  - `POST /api/cars`: Extracts `{ name, brand }` from `req.body` and returns a confirmation message.
- **Database Connection**: `mongoose.connect('mongodb://127.0.0.1:27017/Cars')` connects to the local MongoDB database. *(Using `127.0.0.1` avoids IPv6 `::1` resolution issues on Node 18+).*

> **Rule of Thumb**: Always define middleware (`app.use`) and routes before `app.listen()`.

---

## 7. Testing POST Requests with Postman

Since browsers can only trigger `GET` requests directly from the address bar, tools like **Postman** (or curl) are used to test `POST`, `PUT`, and `DELETE` endpoints.

### Step-by-Step Testing Guide:

1. **Start your server**:
   ```bash
   cd 01
   node server.js
   ```
2. **Open Postman & Create a New Request**:
   - **Method**: Select **`POST`** from the HTTP method dropdown.
   - **URL**: Enter `http://localhost:3000/api/cars`.
3. **Configure Request Body**:
   - Navigate to the **`Body`** tab under the URL bar.
   - Select the **`raw`** radio button.
   - On the right-hand dropdown, change format from `Text` to **`JSON`** *(this automatically sets the `Content-Type: application/json` header)*.
4. **Enter JSON Payload**:
   ```json
   {
     "name": "Thar",
     "brand": "Mahindra"
   }
   ```
5. **Click `Send`**:
   - **Server Terminal Output**:
     ```text
     Thar
     Mahindra
     ```
   - **Postman Response Pane**:
     ```text
     Car submitted successfully.
     ```
   - **Status**: `200 OK`

---

## 8. Setup & Running Commands

### Project Setup Workflow:
1. **Create a folder**: `mkdir 01`
2. **Move into that folder**: `cd 01`
3. **Initialize package**: `npm init -y`
4. **Open in code editor**: `code .`
5. **Install Express, Body-Parser & Mongoose**:
   ```bash
   npm i express body-parser mongoose
   ```
6. **Create server file**: Create `server.js` and start it:
   ```bash
   node server.js
   # or with auto-reload:
   node --watch server.js
   ```

---

## 9. Introduction to MongoDB & Database Tools (mongosh & Compass)

### What is MongoDB?
**MongoDB** is an open-source, NoSQL, document-oriented database. Instead of storing data in rigid rows and columns like traditional relational SQL databases, MongoDB stores records as flexible, JSON-like documents called **BSON** (Binary JSON).

### SQL vs. MongoDB Terminology:

| SQL (Relational) | MongoDB (NoSQL) | Description |
| :--- | :--- | :--- |
| **Database** | **Database** | Container for all collections / tables |
| **Table** | **Collection** | Group of related documents |
| **Row / Record** | **Document** | Individual data object (JSON/BSON) |
| **Column** | **Field** | Key-value attribute within a document |
| **Primary Key (`id`)** | **`_id` (ObjectId)** | Unique 12-byte hexadecimal identifier |

---

### Networking & Connection Defaults:
- **Default Port**: `27017`
- **Local Connection String (URI)**: `mongodb://127.0.0.1:27017` or `mongodb://localhost:27017`

---

### 1. `mongosh` (MongoDB Shell)
`mongosh` is the modern, interactive **CLI (Command Line Interface)** to query, manage, and configure your MongoDB database directly from the terminal.

#### Essential `mongosh` Commands:
```bash
# 1. Connect to local MongoDB instance
mongosh

# 2. View all databases
show dbs

# 3. Switch to (or create) a database
use carsDatabase

# 4. View collections in the current database
show collections

# 5. Insert a document into a collection
db.cars.insertOne({ name: "Scorpio", brand: "Mahindra" })

# 6. Read / find all documents in a collection
db.cars.find()

# 7. Exit the shell
exit
```

---

### 2. MongoDB Compass (GUI)
**MongoDB Compass** is the official **Graphical User Interface (GUI)** for MongoDB. It lets you visually explore your databases without typing shell commands.

#### How to Connect & Use Compass:
1. Open **MongoDB Compass**.
2. In the **New Connection** screen, use the default URI:
   ```text
   mongodb://localhost:27017
   ```
3. Click **Connect**.
4. You can visually:
   - Create new databases and collections.
   - Insert, edit, clone, or delete JSON documents.
   - Filter documents with visual queries (e.g., `{ brand: "Mahindra" }`).
   - View document structure, field types, and collection storage size.

---

### Summary: `mongosh` vs. `Compass`

| Feature | `mongosh` (CLI) | MongoDB Compass (GUI) |
| :--- | :--- | :--- |
| **Interface** | Terminal / Command Line | Visual Desktop Application |
| **Speed** | Ultra-fast, lightweight | Interactive, point-and-click |
| **Best For** | Quick queries, debugging, automation | Visual inspection, schema analysis, data browsing |

---

## 10. MongoDB CRUD Operations (Create, Read, Update, Delete)

CRUD is the foundation of all database interactions:

| Operation | MongoDB Methods | Description |
| :--- | :--- | :--- |
| **C — Create** | `insertOne()`, `insertMany()` | Add new documents into a collection |
| **R — Read** | `find()`, `findOne()` | Query and retrieve documents |
| **U — Update** | `updateOne()`, `updateMany()` | Modify existing documents |
| **D — Delete** | `deleteOne()`, `deleteMany()` | Remove documents from a collection |

---

### 1. Create (Insert)

#### Insert a Single Document:
```javascript
db.cars.insertOne({
  name: "Thar",
  brand: "Mahindra",
  price: 1500000
});
```

#### Insert Multiple Documents:
```javascript
db.cars.insertMany([
  { name: "Scorpio", brand: "Mahindra", price: 1800000 },
  { name: "City", brand: "Honda", price: 1200000 },
  { name: "Civic", brand: "Honda", price: 2200000 }
]);
```

---

### 2. Read (Query)

#### Find All Documents:
```javascript
db.cars.find()
```

#### Find with Filter:
```javascript
// Find all cars made by Mahindra
db.cars.find({ brand: "Mahindra" })
```

#### Find One Specific Document:
```javascript
// Returns the first document that matches
db.cars.findOne({ name: "Thar" })
```

#### Pretty Print Formatting:
```javascript
db.cars.find().pretty()
```

---

### 3. Update (Modify)

> ⚠️ **Critical Rule**: Always use the **`$set`** update operator when modifying fields! If you omit `$set`, MongoDB will overwrite and replace the entire document with the new object.

#### Update a Single Document:
```javascript
// Updates the first car named "Thar" with new price
db.cars.updateOne(
  { name: "Thar" },
  { $set: { price: 1600000 } }
);
```

#### Update Multiple Documents:
```javascript
// Adds inStock: true to all cars made by Mahindra
db.cars.updateMany(
  { brand: "Mahindra" },
  { $set: { inStock: true } }
);
```

---

### 4. Delete (Remove)

#### Delete a Single Document:
```javascript
// Deletes the first matching document
db.cars.deleteOne({ name: "City" })
```

#### Delete Multiple Documents:
```javascript
// Deletes all cars made by Honda
db.cars.deleteMany({ brand: "Honda" })
```

#### Delete All Documents in a Collection:
```javascript
// Warning: Clears all documents inside the collection
db.cars.deleteMany({})
```

---

## 11. Module 02 — MVC Architecture & TODO API (Create Endpoint)

### 1. What is MVC Architecture?
In production backend engineering, putting all code (routes, database queries, and configuration) inside a single file quickly becomes unmaintainable. 

**MVC (Model-View-Controller)** is an industry-standard architectural pattern that separates software into three distinct concerns:

```text
Client (Postman / Browser)
         │
         │ 1. HTTP Request (POST /api/v1/createTodo)
         ▼
┌──────────────────────────────────────────────┐
│                  ROUTES                      │  Matches endpoint URL & HTTP method,
│            (02/routes/todos.js)              │  forwards request to the appropriate controller.
└──────────────────────┬───────────────────────┘
                       │
                       │ 2. Dispatches to
                       ▼
┌──────────────────────────────────────────────┐
│                CONTROLLERS                   │  Handles business logic, extracts body data,
│        (02/controllers/createTodo.js)        │  coordinates database operations via Model.
└──────────────────────┬───────────────────────┘
                       │
                       │ 3. Queries / Inserts
                       ▼
┌──────────────────────────────────────────────┐
│                  MODELS                      │  Defines data schema, validation rules,
│           (02/models/Todo.js)                │  and communicates directly with MongoDB.
└──────────────────────┬───────────────────────┘
                       │
                       ▼
                MongoDB Database
```

---

### 2. Project Folder Structure (`02/`)

```text
02/
├── config/
│   └── database.js       # Database connection with Mongoose & dotenv
├── controllers/
│   └── createTodo.js     # Business logic for creating a new Todo item
├── models/
│   └── Todo.js           # Mongoose Schema & Model definition
├── routes/
│   └── todos.js          # Express Router mapping paths to controllers
├── .env                  # Environment variables (PORT, DATABASE_URL)
├── index.js              # Server entry point & middleware mounting
├── package.json
└── package-lock.json
```

---

### 3. Step-by-Step Implementation

#### Step 1: Mongoose Schema & Model (`02/models/Todo.js`)
Defines the structure, validation constraints, and default values of a document:

```javascript
const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxLength: 50
    },
    description: {
        type: String,
        required: true,
        maxLength: 50
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now()
    }
});

module.exports = mongoose.model("Todo", todoSchema);
```

#### Step 2: Controller Logic (`02/controllers/createTodo.js`)
Extracts request body parameters, calls `Todo.create()`, and returns standard REST JSON:

```javascript
const Todo = require("../models/Todo");

exports.createTodo = async (req, res) => {
    try {
        // 1. Extract data from request body
        const { title, description } = req.body;

        // 2. Insert new record into MongoDB
        const response = await Todo.create({ title, description });

        // 3. Send successful JSON response
        res.status(200).json({
            success: true,
            data: response,
            message: "Entry created successfully!"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            data: "Internal server error!",
            message: err.message
        });
    }
};
```

#### Step 3: Express Router (`02/routes/todos.js`)
Uses `express.Router()` to modularize endpoints:

```javascript
const express = require("express");
const router = express.Router();

const { createTodo } = require("../controllers/createTodo");

// Map POST /createTodo to createTodo controller
router.post("/createTodo", createTodo);

module.exports = router;
```

#### Step 4: Environment Config & Database Connection (`02/config/database.js`)
Keeps sensitive connection strings safe in `.env` and connects cleanly:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

const dbConnect = () => {
    mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log("DB connection successful!"))
    .catch((error) => {
        console.log("Issue in DB Connection!");
        console.error(error.message);
        process.exit(1);
    });
};

module.exports = dbConnect;
```

#### Step 5: Mounting Everything in `02/index.js`
Connects middleware, routes, database, and listener:

```javascript
const express = require('express');
const app = express();

require("dotenv").config();
const PORT = process.env.PORT || 4000;

// Body-parsing middleware
app.use(express.json());

// Mount Todo routes under /api/v1 prefix
const todoRoutes = require('./routes/todos');
app.use("/api/v1", todoRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server started at ${PORT}`);
});

// Connect to MongoDB
const dbConnect = require("./config/database");
dbConnect();

// Default home route
app.get("/", (req, res) => {
    res.send(`<h1>This is your homepage.</h1>`);
});
```

---

### 4. Testing with Postman

1. **Method**: `POST`
2. **URL**: `http://localhost:3000/api/v1/createTodo`
3. **Headers**: `Content-Type: application/json`
4. **Body (`raw` -> `JSON`)**:
   ```json
   {
     "title": "Abir Pal",
     "description": "Hello Abir Pal"
   }
   ```
5. **Expected Response (Status `200 OK`)**:
   ```json
   {
     "success": true,
     "data": {
       "title": "Abir Pal",
       "description": "Hello Abir Pal",
       "createdAt": "2026-11-20T11:53:32.611Z",
       "updatedAt": "2026-11-20T11:53:32.611Z",
       "_id": "6b0034f87a975d12852b2e71",
       "__v": 0
     },
     "message": "Entry created successfully!"
   }
   ```

