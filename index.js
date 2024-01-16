const express = require('express');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');
const { datetime, truncate, capitalize } = require('./helpers/hbs');
const connectDB = require('./middleware/db');
const session = require('express-session');
const app = express();
const port = 8080 || process.env.PORT;

connectDB();

// Middlewares
app.use(cookieParser()) // Cookie parser middleware to fetch cookies
app.use(express.urlencoded({
    extended: false
}))
app.use(express.json())

app.use(
    session({
        secret: process.env.AUTH_SECRET,
        saveUninitialized: true,
        resave: false
    })
)

// Middleware to check if the auth token cookie exists
app.use((req, res, next) => {
    if (req.cookies['authToken']) {
        res.locals.session = true;
    } else {
        res.locals.session = false;
    }
    next();
})

// Middleware for flashing messages
app.use((req, res, next) => {
    if (req.session.message) {
        res.locals.message = req.session.message;
        delete req.session.message;
    }
    next();
})

// Templating engine
app.set('view engine', 'hbs')
app.engine('hbs', exphbs.engine({
    defaultLayout: 'basic.hbs',
    extname: 'hbs',
    helpers: {
        datetime, truncate, capitalize
    }
}))

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))

// Custom 404 error
app.use((req, res, next) => {
    res.status(404).render('404', {
        title: 'Page Not Found'
    })
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
