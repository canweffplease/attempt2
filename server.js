const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');

//for testing
var accounts = new Map();

app.use(express.static('public')); // middleware to serve static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/api/greet', (req, res) => {
	res.json({ message: 'Hello from the backend!' });
	console.log("server sent message to frontend");
});

app.get('/', (req, res) =>{
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/signup', (req, res) =>{
	res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.post('/signup', (req, res) => {
	const { user, pass } = req.body;
	for (var [k, v] of accounts) {
		if (k === user && v === pass) {
			res.send('Error');
		}
	}
	accounts.set(user, pass);
	res.send('signed up');
});

app.get('/login', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', (req, res) => {
	const { user, pass } = req.body;

	//check db for authentication
	for (var [k, v] of accounts) {
		if (k === user && v === pass) {
			res.send('logged in!');
			return;
		}
	}
	res.send('error');

});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
