# Backend Development Notes

## 01 — Server Setup

### Code: `01/server.js`

```javascript
const express = require('express');
const app = express();

app.listen(3000, () => {
    console.log("Server started at port:3000");
});
```

### Explanation

- **`require('express')`**: Imports the Express module.
- **`express()`**: Creates an Express application instance (`app`).
- **`app.listen(3000, callback)`**: Binds and listens for incoming connections on port `3000`. The callback runs once the server is successfully running.

### Setup & Commands

1. Initialize project:
   ```bash
   npm init -y
   ```
2. Install Express:
   ```bash
   npm i express
   ```
3. Run the server:
   ```bash
   node server.js
   ```

### Dependencies (`01/package.json`)
- `express`: `^5.3.0`
