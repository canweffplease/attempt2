const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public')); // middleware to serve static files

app.get('/api/greet', (req, res) => {
	res.json({ message: 'Hello from the backend!' });
	console.log("server sent message to frontend");
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
