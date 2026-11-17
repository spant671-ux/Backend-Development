# Backend Development Notes

A structured log and reference guide for backend development concepts, implementations, and key learnings.

---

## 📚 Table of Contents

- [Overview & Roadmap](#overview--roadmap)
- [01 - Getting Started with Express.js](#01---getting-started-with-expressjs)
  - [Project Setup](#project-setup)
  - [Basic Server Implementation](#basic-server-implementation)
  - [Key Takeaways](#key-takeaways)
- [Topic Backlog & Future Modules](#topic-backlog--future-modules)

---

## 🗺️ Overview & Roadmap

| Module | Topic | Status |
| :--- | :--- | :--- |
| `01` | Express.js Initialization & Server Setup | 🟡 In Progress |
| `02` | Routing & HTTP Request Methods (GET, POST, PUT, DELETE) | ⚪ Upcoming |
| `03` | Middleware & Request Parsing (`express.json`, custom middleware) | ⚪ Upcoming |
| `04` | Database Connectivity (MongoDB / PostgreSQL) | ⚪ Upcoming |
| `05` | Authentication & Authorization (JWT, Cookies, Sessions) | ⚪ Upcoming |
| `06` | Error Handling & Production Best Practices | ⚪ Upcoming |

---

## 01 - Getting Started with Express.js

### Project Setup
1. Initialize package metadata:
   ```bash
   npm init -y
   ```
2. Install Express:
   ```bash
   npm install express
   ```

### Basic Server Implementation
Located in [`01/server.js`](file:///c:/Personal/Code/Backend%20Development/01/server.js):

```javascript
const express = require('express');
const app = express();

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server started at port:${PORT}`);
});
```

### Key Takeaways
- **`express()`**: Instantiates an Express application object.
- **`app.listen(port, [callback])`**: Binds and listens for incoming connections on the specified network port.

---

## 📝 User Notes & Quick Reference

*(Add your custom thoughts, snippets, or questions here. Share any concepts or code, and this document will be updated continuously.)*
