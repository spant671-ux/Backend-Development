# Backend Development Notes

## 01 — Server Setup & First Route

### Code: `01/server.js`

```javascript
const express = require('express');
const app = express();

app.listen(3000, () => {
    console.log("Server started at port:3000");  
});

app.get('/', (req, res) => {
    res.send("Hii, How are you?");
});
```

### Explanation

- **`require('express')`**: Imports the Express module.
- **`express()`**: Creates an Express application instance (`app`).
- **`app.listen(3000, callback)`**: Binds and listens for incoming connections on port `3000`. The callback runs once the server is successfully running.
- **`app.get(path, handler)`**: Listens for HTTP `GET` requests on the specified path (`'/'` is the root / home route).
- **`req` (Request)**: Represents the incoming HTTP request from the client (contains headers, query parameters, URL, etc.).
- **`res` (Response)**: Represents the HTTP response sent back to the client.
- **`res.send()`**: Sends an HTTP response (strings, HTML, buffers, or objects).

> **Important Notes & Best Practices:**
> 1. **Route Placement**: Put routes *before* `app.listen()` so the routes are registered before the server starts accepting requests.
> 2. **Restarting Server**: Node does not auto-reload on code changes. Stop the server with `Ctrl + C` and re-run `node server.js` to see updates (or run `node --watch server.js` to auto-restart on save).

### Setup & Commands

1. Initialize project:
   ```bash
   npm init -y
   ```
2. Install Express:
   ```bash
   npm i express
   ```
3. Run the server (from inside `01/` directory):
   ```bash
   cd 01
   node server.js
   # or with auto-restart on changes:
   node --watch server.js
   ```

### Dependencies (`01/package.json`)
- `express`: `^5.3.0`
