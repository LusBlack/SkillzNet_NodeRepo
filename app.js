//we import the express framework 
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport')
const flash = require('connect-flash');
const session = require('express-session');

//const MongoStore = require('connect-mongo')( session);//test


const app = express();


//passport config 
require('./config/passport')(passport);


//DB config. We use the mongo key stored with the vaiable MongoURI
//in the keys.js file under the config folder
const db = require('./config/keys').MongoURI;

//connect to Mongo
mongoose.connect(db, { useNewUrlParser: true,
                       useUnifiedTopology: true,})
   .then(() => console.log('MongoDB connected...'))
   .catch(err => console.log(err));



   //EJS middleware
//to handle layouts
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Bodyparser 
//to handle and process data sent from client-side forms 
app.use(express.urlencoded({ extended: false }));


//express session
app.use(
   session({
   secret: 'secret',
   resave: true,
   saveUninitialized: true,
   //store: new MongoStore({ mongooseConnection: mongoose.connection })
 }));

 // passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());
 

//global vars
app.use((req, res, next) => {
   res.locals.success_msg = req.flash('success_msg');
   res.locals.error = req.flash('error_msg');
   res.locals.error = req.flash('error');
   next();
});

app.get('/api/admins', (req, res) => {
   res.json(adminData);
});

// Get a specific admin by ID
app.get('/api/admins/:id', (req, res) => {
   const adminId = parseInt(req.params.id);
   const admin = adminData.find(admin => admin.id === adminId);

   if (admin) {
       res.json(admin);
   } else {
       res.status(404).json({ error: 'Admin not found' });
   }
});

// Create a new admin
app.post('/api/admins', (req, res) => {
   const { username, password } = req.body;

   if (!username || !password) {
       return res.status(400).json({ error: 'Username and password are required' });
   }

   const newAdmin = {
       id: adminData.length + 1,
       username,
       password,
   };

   adminData.push(newAdmin);
   res.status(201).json(newAdmin);
});


app.put('/api/admins/:id', (req, res) => {
   const adminId = parseInt(req.params.id);
   const admin = adminData.find(admin => admin.id === adminId);

   if (!admin) {
       return res.status(404).json({ error: 'Admin not found' });
   }

   const { username, password } = req.body;

   if (username) {
       admin.username = username;
   }

   if (password) {
       admin.password = password;
   }

   res.json(admin);
});

// Delete an admin
app.delete('/api/admins/:id', (req, res) => {
   const adminId = parseInt(req.params.id);
   adminData = adminData.filter(admin => admin.id !== adminId);
   res.json({ message: 'Admin deleted successfully' });
});

//Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'))


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));