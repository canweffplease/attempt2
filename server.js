const express = require('express');
const app = express();
require('dotenv').config(); //loads variables from env file
const port = process.env.PORT || 3000;
const path = require('path');


const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

const { Client } = require('pg');

const client = new Client({
	user: 'postgres',
	password: process.env.DBPASSWORD,
	host: 'localhost',
	port: 5432,
	database: 'postgres',
});
client.connect()
	.then(() => console.log('connected to db'))
	.catch(error => console.error('error connecting to postgres', error.stack));

const authenticateToken = (req, res, next) => {
	const token = req.header('Authorization')?.split(' ')[1]; // bearer token
	console.log(token);
	if (!token) {
		return res.status(403).json({ error: 'Access Denied' });
	}

	jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
		if (error) {
			return res.status(403).json({ error: 'invalid token'});
		}
		req.user = decoded;
		next();
	});
};

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

app.post('/signup', async (req, res) => {
	const { email, user, pass } = req.body;
	var accountExists = false;
	try{
		const res = await client.query(`
			SELECT * FROM accounts
			WHERE email = $1 OR username = $2 OR passcode = $3
		`, [email, user, pass]);
		if (res.rows[0]) {
			accountExists = true;
		}
		else {
			const res = await client.query(`
				INSERT INTO accounts (email, username, passcode)
				VALUES ($1, $2, $3)
			`, [email, user, pass]);
		}
	}
	catch (error) {
		console.error('error signing up', error.stack);
	}
	if (accountExists) {
		res.sendFile(path.join(__dirname, 'views', 'signup.html'));
	}
	else {
		res.sendFile(path.join(__dirname, 'views', 'login.html'));
	}
});

app.get('/login', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', async (req, res) => {
	const { email, user, pass } = req.body;
	var connected = false;
	try {
		const res = await client.query(`
			SELECT * FROM accounts
			WHERE email = $1 AND username = $2 AND passcode = $3
		`, [email, user, pass]);
		if (res.rows[0]) {
			connected = true;
		}
	}
	catch (error) {
		console.error("error fetching users", error.stack);
	}
	if (connected) {
		const token = jwt.sign({ username: user }, process.env.SECRET_KEY, { expiresIn: '1h'});
		return res.json({ token });
	}
	return res.status(401).json({ error: 'invalid credentials' });

});

app.get('/protected', authenticateToken, (req, res) => {
	console.log(req);
	res.json({ message: 'success' });
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
