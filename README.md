# 🌐 Backend Development Journey

Welcome to my centralized Backend Development repository! This repository documents my complete hands-on journey mastering modern backend engineering with **Node.js, Express.js, MongoDB, RESTful APIs, and Production Architecture** — from initial server instantiation and networking fundamentals to database integrations, authentication pipelines, and scalable APIs.

---

## 📚 Table of Contents
- [🗺️ Architecture & Repository Overview](#️-architecture--repository-overview)
- [📖 Study Notes & Handbooks](#-study-notes--handbooks)
- [📂 Projects & Modules Directory](#-projects--modules-directory)
- [🚀 Getting Started & How to Run](#-getting-started--how-to-run)
- [🛠️ Tech Stack & Ecosystem](#️-tech-stack--ecosystem)

---

## 🗺️ Architecture & Repository Overview

The repository is organized progressively into numbered module folders, each focusing on a core backend concept, architectural pattern, or hands-on implementation:

```text
Backend Development/
├── .gitignore                   # Global ignore file (node_modules, .env)
├── README.md                    # Repository documentation and module matrix
├── notes.md                     # Centralized comprehensive study handbook
└── 01/                          # Module 01: Server setup, Express instance, body-parser & routing
    ├── package.json
    ├── package-lock.json
    └── server.js
```

---

## 📖 Study Notes & Handbooks

All theoretical foundations, networking mechanisms, protocol lifecycle rules, code walkthroughs, and interview cheat sheets are documented in the centralized handbook:

- 👉 **[📘 Centralized Handbook: notes.md](./notes.md)** — The complete reference guide covering backend architectures, DNS resolution, TCP three-way handshake, HTTP methods, idempotence, Express internals, and Postman testing.

### Key Conceptual Topics Covered:
1. **What is Backend Development?** – Client-Server model, business logic execution, data persistence, and authorization boundaries.
2. **DNS (Domain Name System)** – Domain translation hierarchy (Browser/OS cache ➔ Recursive Resolver ➔ Root ➔ TLD ➔ Authoritative Name Server).
3. **TCP Three-Way Handshake** – Reliable connection setup (`SYN` ➔ `SYN-ACK` ➔ `ACK`) before HTTP data transmission.
4. **HTTP Protocol & Methods** – Request/Response cycle anatomy, `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and status code ranges (2xx, 3xx, 4xx, 5xx).
5. **Idempotence in APIs** – Safe vs. Idempotent methods and real-world importance for network retries and payment reliability.
6. **Express.js Architecture** – Express factory, routing pipeline, and abstraction over Node's native `http` module.
7. **Middleware & Body Parsing** – Why `req.body` is `undefined` by default and how `body-parser` / `express.json()` parse incoming request streams.
8. **API Testing with Postman** – Constructing `POST` requests, setting headers, transmitting JSON bodies, and inspecting server logs.

---

## 📂 Projects & Modules Directory

| # | Folder | Tech Stack | Description | Key Learnings |
|---|---|---|---|---|
| **01** | [`01`](./01) | Node.js, Express 5, Body-Parser | First Express server & API endpoints | `express()`, `app.listen()`, `GET /`, `POST /api/cars`, `bodyParser.json()`, `req.body`, Postman testing |

---

## 🚀 Getting Started & How to Run

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [Postman](https://www.postman.com/) (or curl / Thunder Client) for API testing

### Running a Specific Module

1. Clone the repository:
   ```bash
   git clone https://github.com/spant671-ux/Backend-Development.git
   cd Backend-Development
   ```

2. Navigate into the desired module folder (e.g., `01`):
   ```bash
   cd 01
   ```

3. Install project dependencies:
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   node server.js
   ```
   *(Or run with automatic reload on changes)*:
   ```bash
   node --watch server.js
   ```

5. Test the server:
   - **GET Route**: Open `http://localhost:3000` in your browser.
   - **POST Route**: Send a `POST` request to `http://localhost:3000/api/cars` via Postman with JSON body:
     ```json
     {
       "name": "Thar",
       "brand": "Mahindra"
     }
     ```

---

## 🛠️ Tech Stack & Ecosystem

- **Runtime**: Node.js (V8 Engine & libuv)
- **Framework**: Express.js
- **Middleware**: `body-parser`
- **Testing & Tooling**: Postman, Git & GitHub
- **Package Manager**: npm
