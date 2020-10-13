require('dotenv').config();
const express = require('express');
const session = require('express-session');
const massive = require('massive');
const bcrypt = require('bcryptjs');

const PORT = 4000

const {SESSION_SECRET, CONNECTION_STRING} = process.env;

const app = express();
const authCtrl = require('./controllers/authController');
const treasureCtrl = require('./controllers/treasureController');
const auth = require('./middleware/authMiddleware');

app.use(express.json());

massive({
    connectionString: CONNECTION_STRING,
    ssl: {rejectUnauthorized: false}
}).then(db => {
    app.set('db', db);
    console.log('db connected')
});

app.use(
    session({
        resave: true,
        saveUninitialized: false,
        secret: SESSION_SECRET,
    })
);

module.exports = {
    register: async(req, res) => {
        const {username, password , isAdmin} =req.body,
        db= req.app.get('db');

        const existingUser = await db.get_user({username});
        if(existingUser[0]){
            return res.status(404).send('Username taken');
        }

        let salt = bcrypt.genSaltSync(10),
            hash = bcrypt.hashSync(password,salt);

        const registeredUser = await db.register_user({isAdmin, username, hash});

        req.session.user = registeredUser[]
            isAdmin= user.isAdmin,
            id = user.id,
            username = user.username
        ;
        res.status(201).send(req.session.user);
    },
}

app.post('/auth/register', authCtrl.register);
app.post('/auth/login',authCtrl.login);
app.get('/auth/logout', authCtrl.logout);

app.get('/api/treasure/dragon', treasureCtrl.dragonTreasure);
app.get('/api/treasure/user', auth.usersOnly, treasureCtrl.getUserTreasure);
app.post('/api/treasure/user',auth.usersOnly, treasureCtrl.addUserTreasure);
app.get('/api/treasure/all', auth.usersOnly, auth.adminsOnly, treasureCtrl.getAllTreasure);


app.listen(PORT, () => console.log(`Listening on port ${PORT}`))