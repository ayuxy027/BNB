// server.js
import app from './src/app.js';

const PORT = process.env.PORT || 3000;

// Start the server and listen for incoming requests on the specified port.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:3000`);
});
