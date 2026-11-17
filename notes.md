# 🛠️ Backend Development Handbook & Notes

A structured companion covering core backend concepts, networking fundamentals, HTTP protocols, and Express.js implementations.

---

## 📌 Table of Contents

1. [What is Backend Development?](#1-what-is-backend-development)
2. [How the Web Works: DNS (Domain Name System)](#2-how-the-web-works-dns-domain-name-system)
3. [TCP & The Three-Way Handshake](#3-tcp--the-three-way-handshake)
4. [HTTP Protocol & HTTP Methods](#4-http-protocol--http-methods)
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

| Method | Purpose | CRUD Equivalent | Has Request Body? | Idempotent? |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | Retrieve data from server | **R**ead | ❌ No | ✅ Yes |
| **`POST`** | Submit data to create a new resource | **C**reate | ✅ Yes | ❌ No |
| **`PUT`** | Completely replace an existing resource | **U**pdate (Full) | ✅ Yes | ✅ Yes |
| **`PATCH`** | Partially update specific fields | **U**pdate (Partial) | ✅ Yes | ❌ No |
| **`DELETE`** | Remove a resource | **D**elete | Optional / Rare | ✅ Yes |

> **Idempotency**: An operation is **idempotent** if executing it once produces the exact same outcome as executing it 100 times.
> - `GET /api/cars` always returns the list without changing state (Idempotent).
> - `POST /api/cars` creates a new car every time it runs (Non-idempotent).
> - `DELETE /api/cars/5` removes car #5. If called again, it's already gone (Idempotent).

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
const express = require('express');
const app = express();

app.listen(3000, () => {
    console.log("Server started at port:3000");  
})

app.get('/', (req, res) => {
    res.send("Hii, How are you?");
})

app.post('/api/cars', (req, res) => {
    
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
   - Defines an endpoint that accepts incoming `POST` requests to create car data.
   - Typically used in combination with body parsing middleware (`express.json()`) to extract data submitted in `req.body`.

> **Best Practice Notice**:
> In Express applications, it is standard convention to define all routes (`app.get`, `app.post`, etc.) **before** invoking `app.listen()`.

---

## 7. Setup & Running Commands

1. **Initialize Project**:
   ```bash
   npm init -y
   ```
2. **Install Express**:
   ```bash
   npm install express
   ```
3. **Run the Server**:
   ```bash
   cd 01
   node server.js
   ```
   *(Or run `node --watch server.js` to automatically reload the server on file edits).*
