
const pg = require('pg');//to connect with postgresql
const express = require('express');//to set HTTP SERVER  & set up route
const bcrypt = require('bcrypt'); //for encrypt password
const JWT = require('jsonwebtoken')//for token generation
const dotenv = require('dotenv')//to load variables from this file
const { promisify } = require('util')//built in function to use promises
const cors = require('cors');
//create a pool instance from pg library

// Loading variables from the .env file
dotenv.config()

//pass database connection values
//test connection with fetch data
/*const pool = new Pool({
  user: 'khyati',
  database: 'expressdb',
  password: 'inter123net',
  port: 5432,
  host: 'localhost',
});*/

const server = express();
//test connection with postgres heroku
server.use(cors());
const { Client } = require('pg');
//const { default: App } = require('./App');

const pool = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
try {
  pool.connect();

  console.log("Database connected")

}
catch {
  console.log("Error")
}




//test for connection check
/*server.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM login');  //try to fetch data with connection
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});*/


// Promisify the JWT helpers
// => transform callback into Promise based function (async)
const sign = promisify(JWT.sign) //to check if token was not changed in way
const verify = promisify(JWT.verify) //to verify token = token string+ secret key for matching token




// Use the json middleware to parse the request body
server.use(express.json())
//To create a new User & insert into  database 
server.post('/api/signup', async (req, res) => {
  console.log("API is connected in backend")
  const { nickname, password, email } = req.body
  const values = [req.body.name, req.body.email, req.body.password]
  if (!req.body.name || !req.body.password || !req.body.email)
    return res.status(400).send({ error: 'Invalid request' })

  try {
    const encryptedPassword = await bcrypt.hash(password, 10)
    console.log(encryptedPassword);
    await pool.query(

      'INSERT INTO login(email, password, nickname) VALUES ($1, $2 ,$3)',
      [values]

    )
    return res.send({ info: 'User succesfully created' })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ error: 'Internal server error' })
  }
})


//set up login with Token
server.post('/api/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).send({ error: 'Invalid request' })

  const q = await pool.query(
    'SELECT password, id, nickname from login WHERE email=$1',
    [email]
  )

  if (q.rowCount === 0) {
    return res.status(404).send({ error: 'This user does not exist' })
  }

  const result = q.rows[0]

  const match = await bcrypt.compare(password, result.password)
  //console.log("password is" +password+"compare"+result.password)

  if (!match) {
    return res.status(403).send({ error: 'Wrong password' })
  }

  try {
    const token = await sign(
      { id: result.id, nickname: result.nickname, email },
      //token stored in .env file generated with command node=>require('crypto').randomBytes(64).toString('hex')
      process.env.TOKEN_SECRET,
      {
        algorithm: 'HS512',
        expiresIn: '1d',
      }
    )

    return res.send({ token })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ error: 'Cannot generate token' })
  }
})

// This middleware will ensure that all subsequent routes include a valid token in the authorization header
// The 'user' variable will be added to the request object, to be used in the following request listeners
server.use(async (req, res, next) => {
  if (!req.headers.authorization) return res.status(401).send('Unauthorized')

  try {
    const decoded = await verify(
      req.headers.authorization.split(' ')[1],
      process.env.TOKEN_SECRET
    )

    if (decoded !== undefined) {
      req.user = decoded
      return next()
    }
  } catch (err) {
    console.log(err)
  }

  return res.status(403).send('Invalid token')
})

server.get('/api/hello', (req, res) => {
  res.send({ info: 'Hello ' + req.user.nickname })
})

server.get('/api/user', async (req, res) => {
  const q = await pool.query('SELECT nickname from login')
  return res.send(q.rows)
})

// get all messsges from lobbyid

server.get('/api/lobbyid', async (req, res) => {
  const { lobbyid } = req.body

  if (!lobbyid)
    return res.status(400).send({ error: 'Invalid request' })
  //check auntentication for lobbyid
  const q_admin = await pool.query(`select * from login  where email= '${req.user.email}'`)
  const q1 = await pool.query(`select * from lobby_details where uid =(${q_admin.rows[0].id})`)

  //if(q_admin.rows[0].admin!='y')//if user is not admin
  // {
  if (q1.rowCount == 0)
    return res.status(400).send({ error: 'Invalid request' })

  let search = ""
  for (i = 0; i < q1.rowCount; i++) {

    if (q1.rows[i].lobby_id == lobbyid) {
      search = 'success'
    }
  }
  if (search != 'success')//no match found for lobbyid
  {
    return res.send("User is not authorised for this lobby.Please enter valid lobbyid")
  }

  //}
  //if its admin
  const q3 = await pool.query('SELECT messagetext from message where lobbyid=$1', [lobbyid])
  if (q3.rowCount === 0) {
    return res.status(404).send({ error: 'Can not find messages.Check input' })
  }
  return res.send(q3.rows)
})

// get specific messsges by message id ??????????????????????????????
server.get('/api/lobbyid/msgid', async (req, res) => {
  const { lobbyid, messageid } = req.body


  if (!lobbyid || !messageid)
    return res.status(400).send({ error: 'Invalid request' })

  const q = await pool.query('SELECT messagetext from message where lobbyid=$1 and mid=$2', [lobbyid, messageid])
  if (q.rowCount === 0) {
    return res.status(404).send({ error: 'Can not find messages.Check input' })
  }
  return res.send(q.rows)
})



// post a message 
server.post('/api/lobby/lobbyid', async (req, res) => {
  const { messagetext, post_by_id, lobbyid } = req.body
  try {
    const q = await pool.query('insert into message(messagetext,post_by_id,lobbyid) values ($1,$2,$3)', [messagetext, post_by_id, lobbyid])

    return res.send("Message posted")
  }
  catch (err) {
    console.log(err)
    return res.status(500).send({ error: 'Internal server error' })
  }
})

//edit a messge para new msg & messageid
server.post('/api/lobby/editmsg', async (req, res) => {
  const { mid, newmsg } = req.body
  //check if person is admin for that lobby

  try {
    //admin
    const q = await pool.query(`Select mid From message where lobbyid in(
    SELECT lobbyid FROM lobby_master WHERE uid IN (
      SELECT id FROM login WHERE email = $1))`, [req.user.email])
    let found = false
    //console.log("I am here")
    for (i = 0; i < q.rows.length; i++) {
      //console.log("loop")
      if (q.rows[i].mid == mid) {
        found = true
      }
    }
    if (found == true)// user is admin then insert into lobby
    {
      console.log("Found admin")
      //check if user is already added to lobby or not
      const q_check = await pool.query(`update message set messagetext='${newmsg}' where mid=${mid}`);

      if (q_check.rowCount == 0) {
        return res.send("Error.Please enter Valid input!")
      }
      else {
        return res.send("Message updated successfully!")
      }
    }
    else { //found!=true
      return res.send("User is not admin for this lobby.Please enter authorised lobby")
    }
  }
  catch (err) {
    console.log(err)
    return res.status(500).send({ error: 'Internal server error' })
  }
})

//delete a messge para new msg & messageid
server.post('/api/lobby/deletemsg', async (req, res) => {
  const { mid } = req.body
  //check if person is admin for that lobby

  try {
    //admin
    const q = await pool.query(`Select mid From message where lobbyid in(
    SELECT lobbyid FROM lobby_master WHERE uid IN (
      SELECT id FROM login WHERE email = $1))`, [req.user.email])
    let found = false

    for (i = 0; i < q.rows.length; i++) {
      //console.log("loop")
      if (q.rows[i].mid == mid) {
        found = true
      }
    }
    if (found == true)// user is admin then insert into lobby
    {
      // console.log("Found ")

      const q_check = await pool.query(`delete from message where mid=${mid}`);

      if (q_check.rowCount == 0) {
        return res.send("Error.Please enter Valid input!")
      }
      else {
        return res.send("Message deleted successfully!")
      }
    }
    else { //found!=true
      return res.send("Wrong Input.Enter valid messageid")
    }
  }
  catch (err) {
    console.log(err)
    return res.status(500).send({ error: 'Internal server error' })
  }
})



// display all the user from same lobby
server.get('/api/users', async (req, res) => {

  try {
    //get userdetails
    const q = await pool.query(`SELECT * FROM login WHERE email = $1`, [req.user.email]);

    if (q.rowCount === 0) {
      return res.status(404).send({ error: 'Can not find messages.Check input' })
    }

    if (q.rows[0].admin == 'y') {
      //user is admin get lobbyid from master table
      const q2 = await pool.query(`select nickname from login where id in(select uid from lobby_details where lobby_id in(
    select lobbyid from lobby_master where uid=${q.rows[0].id}))`)
      if (q2.rowCount === 0) {
        return res.status(404).send({ error: 'Can not find messages.Check input' })
      }
      return res.send(q2.rows)
    }
    else {
      //if not admin get lobby id from details table
      const q2 = await pool.query(`select nickname from login where id in(Select uid from lobby_details where lobby_id in(
    SELECT lobby_id from lobby_details where uid=${q.rows[0].id}))`)
      if (q2.rowCount === 0) {
        return res.status(404).send({ error: 'Can not find messages.Check input' })
      }
      return res.send(q2.rows)
    }
  }
  catch (err) {
    console.error("Error:", err);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
})
// display userdetails by passing user id
server.get('/api/users/uid', async (req, res) => {
  const { user } = req.body
  try {
    //get userdetails
    const q = await pool.query(`SELECT * FROM login WHERE email = $1`, [req.user.email]);
    console.log(req.user.email)
    if (q.rowCount === 0) {
      return res.status(404).send({ error: 'Can not find User.Check input' })
    }

    let found = "" // to chk if match found &display
    if (q.rows[0].admin == 'y') {
      //user is admin get lobbyid from master table
      const q_login = await pool.query(`select uid from lobby_details where lobby_id in(
    select lobbyid from lobby_master where uid=${q.rows[0].id})`)

      if (q_login.rowCount === 0) {
        return res.status(404).send({ error: 'Can not find messages.Check input' })
      }
      for (i = 0; i < q_login.rowCount; i++) {
        if (req.body.uid == q_login.rows[i].uid) //if user in same lobby
        {
          const q3 = await pool.query(`select nickname from login where id=${req.body.uid}`)
          found = "true"
          return res.send(q3.rows)
        }
      }
      if (found != true) {
        return res.send("User is not authorised to check this userlobby.Enter valid id")
      }
    }
    else {
      //if not admin get lobby id from details table
      const q_login = await pool.query(`Select uid from lobby_details where lobby_id in(
    SELECT lobby_id from lobby_details where uid=${q.rows[0].id})`)
      if (q_login.rowCount === 0) {
        return res.status(404).send({ error: 'Can not find User.Check input' })
      }
      for (i = 0; i < q_login; i++) {
        if (req.body.uid == q_login.rows[0].uid) //if user in same lobby
        {
          const q3 = await pool.query(`select nickname from login where id=${req.body.uid}`)
          found = "true"
          return res.send(q3.rows)
        }
      }
      if (found != true) {
        return res.send("User is not authorised to check this userlobby.Enter valid id")
      }
    }
  }
  catch (err) {
    console.error("Error:", err);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
})






// admin can remove the user from same lobby
server.post('/api/lobbyid/removeuser', async (req, res) => {
  //check if admin is yes

  const q = await pool.query('SELECT admin from login where email=$1', [req.user.email])
  if (q.rows[0].admin != 'y') {
    return res.status(404).send({ error: 'Can not find messages.Check input' })
  }

  //if admin is yes then select message for same lobyy
  try {
    const q_uid = await pool.query(`select id from login where nickname='${req.body.nickname}'`)
    if (q_uid.rowCount == 0) { res.send("Invalid Username") }
    const q2 = await pool.query(`delete from lobby_details where lobby_id=${req.body.lobbyid} and uid=${q_uid.rows[0].id}`)
    if (q2.rowCount == 0) {
      res.send("User not found!Invalid Input")
    }
    else {
      res.send(`User removed from lobby ${req.body.lobbyid}`)
    }
  }
  catch (err) {
    console.log(err)
  }
})



server.listen(3005, () => console.log('http://localhost: server running'))



//admin can have one lobby or more than one? how to check for multiple
//all the users from same lobby based on currey login lobby?i
//add user to lobby by admin role - first check if login is admin if so add user to current loby or new user signup
//api/users/[user-id]s

//GRANT ALL PREVILEGDES ON ALL TABLES IN SCHEMA public T