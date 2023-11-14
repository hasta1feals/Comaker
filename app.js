const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const db = new sqlite3.Database('database.db');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const cors = require('cors')
app.use(cors())
app.use(express.json());


// define routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});







app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      res.status(500).send({ error: 'Error fetching users' });
    } else {
      res.send(rows);
    }
  });
});


app.get('/items', (req, res) => {
  db.all('SELECT * FROM Items', (err, rows) => {
    if (err) {
      res.status(500).send({ error: 'Error fetching items' });
    } else {
      res.json({ message: 'success', rows });
    }
  });
});

app.get('/links', (req, res) => {
  db.all('SELECT * FROM links', (err, rows) => {
    if (err) {
      res.status(500).send({ error: 'Error fetching links' });
    } else {
      res.json({ message: 'success', rows });
    }
  });
});


app.get('/items_specific', (req, res) => {
  const id = req.body.id;

  qry = "SELECT * FROM Items where id = ?"
  db.all(qry, [id],(err, rows) => {
    if (err) {
      res.status(500).send({ error: 'Error fetching items' });
    } else {
      res.json({ message: 'success', rows });
    }
  });
});


app.get('/link_specific', (req, res) => {
  const id = req.body.id;

  qry = "SELECT * FROM links where id = ?"
  db.all(qry, [id],(err, rows) => {
    if (err) {
      res.status(500).send({ error: 'Error fetching items' });
    } else {
      res.json({ message: 'success', rows });
    }
  });
});

app.delete('/links_specific', (req, res) => {
  const id = req.body.id;

  qry = "DELETE FROM links WHERE id = ? "
  db.all(qry, [id],(err, rows) => {
    if (err) {
      res.status(500).send({ error: 'Error fetching items' });
    } else {
      res.json({ message: 'success', rows });
    }
  });
});


app.delete('/items', (req, res) => {
  const id = req.body.id;

  qry = "DELETE  FROM items  "
  db.all(qry, [id],(err, rows) => {
    if (err) {
      res.status(500).send({ error: 'Error fetching items' });
    } else {
      res.json({ message: 'success', rows });
    }
  });
});

app.delete('/links', (req, res) => {

  qry = "DELETE FROM links"
  db.all(qry,(err, rows) => {
    if (err) {
      res.status(500).send({ error: 'Error fetching items' });
      console.log(err)  
    } else {
      res.json({ message: 'success', rows });
    }
  });
});




app.get('/city', (req, res) => {
  db.all('SELECT * FROM country', (err, rows) => {
    if (err) {
      res.status(500).send({ error: 'Error fetching city' });
    } else {
      res.json({ message: 'success', rows });
    }
  });
});





const secret = process.env.SECRET_KEY;



app.post('/login', (req, res) => {
  // Get data from request
  const username = req.body.username;
  const password = req.body.password;

  // Get user from database
  const qry = 'SELECT * FROM `users` WHERE `username` = ?'
  db.get(qry, [username], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Error while fetching user from the database' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid username' });
    }

    // Check if password is correct
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Create JWT
    const token = jwt.sign({ user }, secret, { expiresIn: '1h' });
    return res.status(200).json({ token: ` ${token}`, message: 'success' });
  });
});


//gets you the token where the users info is stored
app.get('/secure', (req, res) => {
  // get token from request
  let token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized, token is missing'
    });
  }

  if (!token.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Unauthorized, token is invalid'
    });
  }
  // Removing Bearer from the token
  token = token.slice(7, token.length);
  // verify token
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      res.status(401).send({ error: 'Invalid token' });
    } else {

      res.json({ message: 'success', decoded });
    }
  });
});






app.post('/register', (req, res) => {
  // get user data from request body
  const { username, password, name } = req.body;

  // Hash the password
  bcrypt.hash(password, saltRounds, function (err, hashedPassword) {
    if (err) {
      return res.status(500).json({ error: 'Error hashing the password' });
    }
    // create a new user in the database
    db.run(
      'INSERT INTO users (username, password, name) VALUES (?, ?, ?)',
      [username, hashedPassword, name],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Error creating user' });
        }
        res.json({ message: 'success' });
      }
    );
  });
});


app.post('/link', (req, res) => {
  // get user data from request body
  const { link } = req.body;
 
  
    // create a new user in the database
    db.run(
      'INSERT INTO links  (links) VALUES (?)',
      [link],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Error setting links in links' });
        }
        res.json({ message: 'success' });
      }
    );
  });


  app.patch('/city', (req, res) => {
    // get user data from request body
    const { city } = req.body;
   
    
      // create a new user in the database
      db.run(
        'UPDATE country SET city = ? WHERE id = 1',
        [city],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Error setting city in country' });
          }
          res.json({ message: 'success' });
        }
      );
    });




app.put('/users/:id', (req, res) => {
  const { name, email } = req.body;
  const { id } = req.params;
  db.run(
    'UPDATE users SET name = ?, email = ? WHERE id = ?',
    [name, email, id],
    function (err) {
      if (err) {
        res.status(500).send({ error: 'Error updating user' });
      } else {
        res.send({ changes: this.changes });
      }
    }
  );
});






app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).send({ error: 'Error deleting user' });
    } else {
      res.send({ changes: this.changes });
    }
  });
});

// start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});