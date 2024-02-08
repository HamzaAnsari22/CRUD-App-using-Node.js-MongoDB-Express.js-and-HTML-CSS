const mongoose = require('mongoose');
const dotenv = require('dotenv');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const flash = require('connect-flash');


const webRoutes = require('./routes/web');
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
// const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
const app = express();

app.set('view engine','ejs');
app.set('views','resource/views');

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));


app.use(cookieParser());

app.use(session({
    name: "my-session-name",
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 2 * 60 * 60 * 1000 }
//    cookie: { secure: true, httpOnly: true }
}));
app.use(flash());

app.use((req, resp, next) => {
    resp.locals.auth = req.session.auth? req.session.auth : false;
    resp.locals.username = resp.cookie.username? resp.cookie.username : '';
    resp.locals.routeName = req.originalUrl.split('/')[1];
    resp.locals.message = req.flash();
    next();
});

app.use(webRoutes);

 app.use((req,resp,next) => {
    resp.status(404).render('errors/404');
 });

 app.use((error,req,resp,next) => {
    resp.status(500).render('errors/500',{
        error: error
    });
 });
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => {console.log('DB connection successful!');
  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
  });})

// const port = process.env.PORT || 3000;
// const server = app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
