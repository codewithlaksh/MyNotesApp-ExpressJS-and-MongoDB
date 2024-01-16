# MyNotesApp

Features
    - Authentication
    - User wise notes app
    - Google recaptcha

### Installation
```bash
npm install
```

### Run in dev mode
```bash
nodemon index.js
```

### Changes
Please add your site key for google recaptcha in ```views/auth/login.hbs``` and ```views/auth/signup.hbs```

### Structure of .env file
```js
AUTH_SECRET=""
MONGODB_URI="mongodb://localhost:27017/MyNotesApp"
GOOGLE_SERVER_RECAPTCHA_KEY=""
```