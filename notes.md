# 🛠️ Backend Development Handbook & Notes

A structured companion covering core backend concepts, networking fundamentals, HTTP protocols, and Express.js implementations.

---

## 📌 Table of Contents

1. [What is Backend Development?](#1-what-is-backend-development)
2. [How the Web Works: DNS (Domain Name System)](#2-how-the-web-works-dns-domain-name-system)
3. [TCP & The Three-Way Handshake](#3-tcp--the-three-way-handshake)
4. [HTTP Protocol & HTTP Methods](#4-http-protocol--http-methods)
   - [Deep Dive: Idempotency in HTTP](#deep-dive-idempotency-in-http)
5. [Express.js Fundamentals](#5-expressjs-fundamentals)
6. [Code Implementation (`01/server.js`)](#6-code-implementation-01serverjs)
7. [Setup & Running Commands](#7-setup--running-commands)

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

## 4. HTTP Protocol & HTTP Methods

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

| Method | Purpose | CRUD Equivalent | Has Request Body? | Safe? | Idempotent? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`GET`** | Retrieve data from server | **R**ead | ❌ No | ✅ Yes | ✅ Yes |
| **`POST`** | Submit data to create a new resource | **C**reate | ✅ Yes | ❌ No | ❌ No |
| **`PUT`** | Completely replace an existing resource | **U**pdate (Full) | ✅ Yes | ❌ No | ✅ Yes |
| **`PATCH`** | Partially update specific fields | **U**pdate (Partial) | ✅ Yes | ❌ No | ⚠️ Context-dependent |
| **`DELETE`** | Remove a resource | **D**elete | Optional / Rare | ❌ No | ✅ Yes |

---

### Deep Dive: Idempotency in HTTP

#### 1. What is Idempotence?
In mathematics and computer science, an operation is **idempotent** if applying it multiple times produces the **exact same end result on the system** as applying it just once:

$$\text{Result}(f(x)) = \text{Result}(f(f(x))) = \text{Result}(f(f(f(x))))$$

In the context of REST APIs:
> An HTTP method is **idempotent** if making identical requests 1 time or 100 times leaves the server database in the **exact same final state**.

#### 2. Safe vs. Idempotent Methods
- **Safe Methods (`GET`, `HEAD`, `OPTIONS`)**:
  - Read-only operations. They do not alter server state at all.
  - All safe methods are inherently idempotent.
- **Idempotent Methods (`PUT`, `DELETE`, `GET`)**:
  - May modify server state (`PUT`, `DELETE`), but repeating the request leaves the server in the identical state as after the first execution.
- **Non-Idempotent Methods (`POST`)**:
  - Every execution causes cumulative side-effects on the server.

#### 3. Method-by-Method Breakdown with Concrete Examples:

| Request | 1st Execution | 2nd Execution | 100th Execution | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **`GET /api/cars`** | Returns all cars | Returns all cars | Returns all cars | ✅ **Idempotent & Safe** (Server state unchanged) |
| **`POST /api/cars`** `{"name": "Civic"}` | Creates Car #1 | Creates Car #2 | Creates Car #100 | ❌ **Non-Idempotent** (100 cars created in DB) |
| **`PUT /api/cars/5`** `{"name": "City"}` | Updates Car #5 to "City" | Overwrites Car #5 to "City" | Overwrites Car #5 to "City" | ✅ **Idempotent** (Car #5 remains "City") |
| **`DELETE /api/cars/5`** | Car #5 is deleted (200/204) | Car #5 already gone (404/204) | Car #5 already gone (404/204) | ✅ **Idempotent** (Car #5 remains deleted) |
| **`PATCH /api/cars/5`** `{"$inc": {"views": 1}}` | Views = 1 | Views = 2 | Views = 100 | ❌ **Non-Idempotent** (Counter keeps incrementing) |

> 💡 **Notice about `DELETE` and HTTP Status Codes**:
> The 1st `DELETE /api/cars/5` might return `200 OK` (or `204 No Content`), while subsequent calls might return `404 Not Found`. **It is still idempotent** because idempotency is measured by the **state of the server/database**, not the HTTP status code. The database state is identical after call #1 as it is after call #100 (Car #5 does not exist).

#### 4. Why Does Idempotency Matter in Real-World Backend?
1. **Network Retries & Dropped Packets**:
   - If a mobile client sends a request and the internet drops before the client receives the response, the client does not know if the request succeeded.
   - For an **idempotent** request (`PUT`, `DELETE`), the client can safely retry without fear of creating duplicate records or corrupted state.
2. **Preventing Duplicate Payments (Idempotency Keys)**:
   - Since `POST` is non-idempotent, retrying a payment request like `POST /api/checkout` could charge a customer twice!
   - Payment gateways (Stripe, Razorpay) solve this by using an **`Idempotency-Key`** header:
     ```http
     POST /api/payments
     Idempotency-Key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
     ```
     The server records the key. If a duplicate request arrives with the same key, the server returns the cached initial response instead of charging the card again.

---

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
```

### Breakdown of the Code:

1. **`const express = require('express');`**
   - Imports the Express factory function from `node_modules`.
2. **`const app = express();`**
   - Instantiates the Express application object that manages routes, middleware, and settings.
3. **`app.listen(3000, callback)`**
   - Binds to TCP port `3000` and starts listening for incoming client connections.
4. **`app.get('/', (req, res) => { ... })`**
   - Registers a route handler for `GET` requests hitting the root (`/`) path.
   - `res.send("Hii, How are you?")` sends a text response back to the client.
5. **`app.post('/api/cars', (req, res) => { ... })`**
   - Defines an endpoint that accepts incoming `POST` requests.
   - `req.body`: Contains key-value pairs of data submitted in the request payload.
   - `const {name, brand} = req.body;`: Destructures the expected properties.
   - ⚠️ **Important Gotcha with `req.body`**: In Express, `req.body` is `undefined` by default for incoming requests. To parse JSON bodies, you must add body-parsing middleware:
     ```javascript
     // Built into Express (or via body-parser package):
     app.use(express.json());
     ```
     Without this middleware, reading `req.body` throws a `TypeError: Cannot destructure property 'name' of 'req.body' as it is undefined.`

> **Best Practice Notice**:
> In Express applications, it is standard convention to define all middleware (`app.use`) and routes (`app.get`, `app.post`, etc.) **before** invoking `app.listen()`.

---

## 7. Setup & Running Commands

### 6-Step Project Creation Workflow:
1. **Create a folder**: `mkdir 01`
2. **Move into that folder**: `cd 01`
3. **Initialize package**: `npm init -y`
4. **Open in code editor**: `code .`
5. **Install Express**: `npm i express`
6. **Create server file**: Create `server.js` and start it with `node server.js` (or `node --watch server.js`).
