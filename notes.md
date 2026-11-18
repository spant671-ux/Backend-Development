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

### Breakdown of the Code:

1. **`const express = require('express');`**
   - Imports the Express factory function from `node_modules`.
2. **`const app = express();`**
   - Instantiates the Express application object that manages routes, middleware, and settings.
3. **`const bodyParser = require('body-parser');`**
   - Imports the `body-parser` middleware library.
4. **`app.use(bodyParser.json());`**
   - Mounts the JSON parsing middleware into the Express request pipeline.
   - **Why this is essential**: When a client sends a `POST` or `PUT` request with a JSON payload, raw HTTP sends it as a binary data stream. By default, Express leaves `req.body` as `undefined`. `bodyParser.json()` intercepts incoming requests, buffers the stream, parses the JSON string into a JavaScript object, and attaches it to **`req.body`**.
5. **`app.listen(3000, callback)`**
   - Binds to TCP port `3000` and starts listening for incoming client connections.
6. **`app.get('/', (req, res) => { ... })`**
   - Registers a route handler for `GET` requests hitting the root (`/`) path.
   - `res.send("Hii, How are you?")` sends a text response back to the client.
7. **`app.post('/api/cars', (req, res) => { ... })`**
   - Defines a `POST` endpoint to accept car data submitted in the request body.
   - `const {name, brand} = req.body;`: Object destructuring to extract `name` and `brand`.
   - `console.log(...)`: Outputs values to the server terminal.
   - `res.send("Car submitted successfully.")`: Sends an acknowledgement response back to the client.
8. **`const mongoose = require('mongoose');`**
   - Imports the Mongoose ODM library to connect Node.js to MongoDB.
9. **`mongoose.connect('mongodb://127.0.0.1:27017/Cars')`**
   - Connects asynchronously to the local MongoDB database named `Cars`.
   - `.then()` executes on successful connection.
   - `.catch(error)` catches and logs any connection errors.
   - 💡 **Why `127.0.0.1` over `localhost`**: In Node.js 18+, `localhost` resolves to IPv6 `::1` first. Since MongoDB defaults to listening on IPv4, using `127.0.0.1` prevents `ECONNREFUSED` connection errors.

> **Best Practice Notice**:
> In Express applications, it is standard convention to define all middleware (`app.use`) and routes (`app.get`, `app.post`, etc.) **before** invoking `app.listen()`.

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
