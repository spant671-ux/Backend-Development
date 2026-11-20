# 📓 Backend Development — Student Handbook & Revision Notes
> **Designed for your physical paper notebook.**  
> High-yield, concise, conceptual mental models, diagrams, 1-line syntax formulas, and interview gotchas.

---

## 📑 Quick Navigation (Notebook Chapters)
1. [Chapter 1: Web Fundamentals & Networking](#chapter-1-web-fundamentals--networking)
2. [Chapter 2: Express.js Core Architecture](#chapter-2-expressjs-core-architecture)
3. [Chapter 3: Database & Mongoose Fundamentals](#chapter-3-database--mongoose-fundamentals)
4. [Chapter 4: MVC Architecture & The Request Lifecycle](#chapter-4-mvc-architecture--the-request-lifecycle)
5. [Chapter 5: Full CRUD Masterclass (Todo API)](#chapter-5-full-crud-masterclass-todo-api)
6. [Chapter 6: Relationships in MongoDB (Blog App Intro)](#chapter-6-relationships-in-mongodb-blog-app-intro)
7. [Chapter 7: Top 10 Backend Interview Traps & Gotchas](#chapter-7-top-10-backend-interview-traps--gotchas)

---

## Chapter 1: Web Fundamentals & Networking

### 1.1 What is Backend?
- **Frontend (Client)**: Runs in browser/mobile. Untrusted. Handles UI/UX.
- **Backend (Server)**: Authoritative secure server. Handles **Business Logic**, **Data Persistence (DB)**, **Authentication**, and **Security**.

### 1.2 DNS Flow (Domain Name ➔ IP)
```text
Browser / Postman 
    │
    ├─► 1. Check Caches (Browser ➔ OS ➔ Router)
    ├─► 2. Recursive Resolver (ISP / 8.8.8.8)
    ├─► 3. Root Server (".")
    ├─► 4. TLD Server (".com")
    └─► 5. Authoritative Server ("example.com") ──► Returns IP: 93.184.216.34
```
- **IP Address**: Machine location (e.g., `127.0.0.1`).
- **Port**: Specific running app on that machine (e.g., `:3000`, `:27017`).
- **Socket**: Combination of `IP:Port`.

### 1.3 TCP 3-Way Handshake
Establishes a reliable connection before any HTTP data is sent:
```text
Client                         Server
  │      1. SYN (Sequence #)      │  "Can we talk?"
  ├──────────────────────────────►│
  │    2. SYN-ACK (Seq + Ack)     │  "Yes, I hear you. Can you hear me?"
  │◄──────────────────────────────┤
  │         3. ACK (Ack)          │  "Yes! Connection Established."
  ├──────────────────────────────►│
  │═══════════════════════════════│  Ready for HTTP Requests!
```

### 1.4 HTTP Methods & Idempotence
| Method | Purpose | Has Body? | Idempotent? | Meaning |
| :--- | :--- | :---: | :---: | :--- |
| **GET** | Read / Fetch data | ❌ No | ✅ Yes | Calling 10 times gives the same result, no side-effects |
| **POST** | Create new resource | ✅ Yes | ❌ No | Calling 10 times creates 10 separate entries |
| **PUT** | Replace / Update resource | ✅ Yes | ✅ Yes | Repeated calls overwrite with identical state |
| **DELETE** | Remove resource | ❌ No | ✅ Yes | 1st deletes, subsequent calls keep it deleted |

### 1.5 Common HTTP Status Codes
- **`200 OK`**: Success / Data fetched.
- **`201 Created`**: New resource successfully inserted into DB.
- **`400 Bad Request`**: Client sent invalid data (e.g., missing required field).
- **`404 Not Found`**: Target record or route does not exist.
- **`500 Internal Server Error`**: Server or DB crashed/threw an unhandled exception.

---

## Chapter 2: Express.js Core Architecture

### 2.1 Minimal Server Blueprint (5 Lines)
```javascript
const express = require('express');
const app = express();

app.use(express.json()); // Essential body-parser middleware

app.get("/", (req, res) => res.send("Server is live!"));
app.listen(3000, () => console.log("Server running on port 3000"));
```

### 2.2 Why `express.json()`?
- HTTP request bodies travel over the network as a raw stream of bytes/text.
- `express.json()` intercepts the incoming request stream, parses the JSON string, and places the resulting JavaScript object into **`req.body`**.
- Without it, `req.body` is `undefined`.

---

## Chapter 3: Database & Mongoose Fundamentals

### 3.1 SQL vs MongoDB Mental Model
| SQL (Relational) | MongoDB (NoSQL) |
| :--- | :--- |
| Database | Database |
| Table | **Collection** |
| Row / Record | **Document** (BSON / JSON-like) |
| Column | **Field** |

### 3.2 Connecting Mongoose Cleanly
```javascript
const mongoose = require('mongoose');

const dbConnect = () => {
    mongoose.connect(process.env.DATABASE_URL)
        .then(() => console.log("DB Connected Successfully"))
        .catch((err) => {
            console.error("DB Connection Failed!", err.message);
            process.exit(1); // Stop server immediately on DB failure
        });
};
module.exports = dbConnect;
```

> ⚠️ **Notebook Rule**: In modern Mongoose (v6+ / v7+ / v8+), **never** pass `{ useNewUrlParser: true, useUnifiedTopology: true }`. They are deprecated and will crash Mongoose 9.

---

## Chapter 4: MVC Architecture & The Request Lifecycle

### 4.1 What is MVC?
**Separation of Concerns** — Each folder has one job:
- **Model (`/models`)**: The Blueprint. Defines data types and validation rules.
- **View**: Frontend (React / HTML) or JSON responses.
- **Controller (`/controllers`)**: The Brain. Business logic, DB operations, try-catch.
- **Routes (`/routes`)**: The Traffic Cop. Maps URLs and HTTP methods to controllers.
- **Config (`/config`)**: Database connection setup.

### 4.2 The Request Lifecycle (Trace the Flow!)
```text
Client (Postman / Browser)
       │  Sends HTTP Request (e.g., POST /api/v1/createTodo)
       ▼
 [1] index.js
       │  1. app.use(express.json()) parses body -> req.body
       │  2. app.use("/api/v1", router) passes to routes
       ▼
 [2] routes/todos.js
       │  Matches URL path & HTTP Method (POST /createTodo)
       │  Invokes createTodo controller
       ▼
 [3] controllers/createTodo.js
       │  1. Extracts data from req.body
       │  2. Calls await Todo.create(...)
       ▼
 [4] models/Todo.js & MongoDB
       │  Validates schema rules & inserts document into DB
       │  Returns created document with _id to controller
       ▼
 [5] Response back to Client
       └─► res.status(200).json({ success: true, data: ... })
```

---

## Chapter 5: Full CRUD Masterclass (Todo API)

### 5.1 The Model Blueprint (`models/Todo.js`)
```javascript
const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    title: { type: String, required: true, maxLength: 50 },
    description: { type: String, required: true, maxLength: 50 },
    createdAt: { type: Date, required: true, default: Date.now() },
    updatedAt: { type: Date, required: true, default: Date.now() }
});

module.exports = mongoose.model("Todo", todoSchema);
```

---

### 5.2 Mongoose 1-Line CRUD Formula Sheet
Write this in a box in your notebook:

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                       MONGOOSE CRUD FORMULA SHEET                          │
├─────────┬──────────────────────────────────────────────────────────────────┤
│ CREATE  │ await Model.create({ field1, field2 })                           │
├─────────┼──────────────────────────────────────────────────────────────────┤
│ READ    │ await Model.find({})            // All documents                 │
│         │ await Model.findById(id)        // Single document by _id        │
├─────────┼──────────────────────────────────────────────────────────────────┤
│ UPDATE  │ await Model.findByIdAndUpdate(                                   │
│         │   id,                                                            │
│         │   { field1, field2, updatedAt: Date.now() },                     │
│         │   { new: true }                 // RETURN UPDATED DOCUMENT!      │
│         │ )                                                                │
├─────────┼──────────────────────────────────────────────────────────────────┤
│ DELETE  │ await Model.findByIdAndDelete(id)                                │
└─────────┴──────────────────────────────────────────────────────────────────┘
```

---

### 5.3 Universal 4-Step Controller Skeleton
Every controller follows this exact 4-step structure:

```javascript
exports.myController = async (req, res) => {
    try {
        // Step 1: Extract data (from req.body or req.params)
        const { ... } = req.body;
        // const { id } = req.params;

        // Step 2: Perform DB operation with await
        const result = await Model.someMethod(...);

        // Step 3: Handle 404 (if searching by ID) and return 200 Success
        if (!result) return res.status(404).json({ success: false, message: "Not found" });
        res.status(200).json({ success: true, data: result });

    } catch (err) {
        // Step 4: Graceful Error Handling (Prevent server crash)
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};
```

---

### 5.4 Route Mapping (`routes/todos.js`)
```javascript
const express = require("express");
const router = express.Router();

const { createTodo } = require("../controllers/createTodo");
const { getTodo, getTodoById } = require("../controllers/getTodo");
const { updateTodo } = require("../controllers/updateTodo");
const { deleteTodo } = require("../controllers/deleteTodo");

router.post("/createTodo", createTodo);         // C
router.get("/getTodos", getTodo);               // R (All)
router.get("/getTodos/:id", getTodoById);       // R (By ID)
router.put("/updateTodo/:id", updateTodo);      // U (By ID)
router.delete("/deleteTodo/:id", deleteTodo);   // D (By ID)

module.exports = router;
```

---

### 5.5 Postman Verification Table
| HTTP Method | Endpoint URL | Input | Expected Output |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/createTodo` | Body JSON: `{ "title": "...", "description": "..." }` | `200 OK` + saved object with `_id` |
| `GET` | `/api/v1/getTodos` | None | `200 OK` + array `[ { ... }, { ... } ]` |
| `GET` | `/api/v1/getTodos/:id` | URL param `id` | `200 OK` + single object (or `404`) |
| `PUT` | `/api/v1/updateTodo/:id` | URL param + Body JSON | `200 OK` + updated fields |
| `DELETE` | `/api/v1/deleteTodo/:id` | URL param `id` | `200 OK` + `{ message: "Todo deleted" }` |

---

## Chapter 6: Relationships in MongoDB (Blog App Intro)

### 6.1 Referencing via `ObjectId`
In MongoDB, we link collections together using `mongoose.Schema.Types.ObjectId` and the `ref` attribute:

```javascript
// Example: Post Model with Likes & Comments arrays
const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like"    // Refers to the Like Model
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment" // Refers to the Comment Model
    }]
});
```

### 6.2 Route Mounting Rule
In `index.js`, always prefix route paths with a leading slash:
```javascript
// ✅ CORRECT:
app.use("/api/v1", blogRoutes);

// ❌ WRONG (Route will not match):
app.use("api/v1", blogRoutes);
```

---

## Chapter 7: Top 10 Backend Interview Traps & Gotchas

Write these in red ink in your notebook:

1. **The `{ new: true }` Trap in `findByIdAndUpdate`**:
   - *Problem*: Mongoose defaults to returning the document **before** it was updated!
   - *Fix*: Always pass `{ new: true }` as the 3rd argument to receive the newly modified document.

2. **`127.0.0.1` vs `localhost` (Node 18+ bug)**:
   - *Problem*: Node 18+ resolves `localhost` to IPv6 `::1`. MongoDB defaults to IPv4 `127.0.0.1`. Result: `ECONNREFUSED`.
   - *Fix*: Always use `mongodb://127.0.0.1:27017/dbname` in `.env`.

3. **`req.params` vs `req.body`**:
   - `req.params`: Values inside the URL path (e.g., `/getTodos/:id` ➔ `req.params.id`).
   - `req.body`: Payload data sent in the request body (e.g., JSON in POST/PUT).

4. **Missing Leading Slash in Router**:
   - `app.use("api/v1", router)` will fail to match `/api/v1/route`. Must be `app.use("/api/v1", router)`.

5. **`404 Not Found` vs `500 Server Error`**:
   - If an ID does not exist in the DB, query returns `null`. This is a client error (`404`), not a server failure (`500`).

6. **Why `process.exit(1)` on DB Fail?**:
   - A backend without a working database cannot fulfill business requests. Exiting immediately prevents phantom requests from hanging.

7. **Why use `async / await`?**:
   - Network calls to MongoDB are asynchronous. Without `await`, JS continues executing before the query finishes, returning empty/unresolved promises.

8. **Why `try / catch` in Controllers?**:
   - An unhandled rejection crashes the entire Node process. `try/catch` catches the error, logs it, and sends a clean `500` response.

9. **Why `.env`?**:
   - Hides confidential keys/passwords from GitHub and allows different configurations per environment (Development vs Production).

10. **Case Sensitivity in Imports**:
    - On Windows, file paths are case-insensitive, but on Linux (production/Docker), `require("../controllers/LikeController")` will crash if the file is `likeController.js`. Always match exact file name casing!
