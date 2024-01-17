const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const Users = require('../models/Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios').default;
const router = express.Router();
require('dotenv').config();

router.get('/signup', (req, res) => {
    if (!req.cookies['authToken']) {
        const user = new Users()
        res.render('auth/signup', { title: 'Register for a new account', user: user })
    } else {
        res.redirect('/');
    }
})

router.get('/login', (req, res) => {
    if (!req.cookies['authToken']) {
        res.render('auth/login', { title: 'Login to your account' })
    } else {
        res.redirect('/');
    }
})

router.post('/api/adduser', async (req, res) => {
    const { name, email, password1, password2 } = req.body;
    const captchaResponse = req.body["g-recaptcha-response"];
    const captchaData = {
        secret: process.env.GOOGLE_SERVER_RECAPTCHA_KEY,
        reponse: captchaResponse
    }

    axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${captchaData.secret}&response=${captchaData.reponse}`)
        .then(async (response) => {
            const success = response.data['success'];

            if (success) {
                if (name === '' || email === '' || password1 === '' || password2 === '') {
                    req.session.message = {
                        type: 'error',
                        class: 'danger',
                        message: 'Credentials cannot be empty'
                    }
                    res.redirect('/auth/signup')
                } else {
                    let user = await Users.findOne({ email: email })

                    if (!user) {
                        const salt = await bcrypt.genSalt(10);
                        const hash = await bcrypt.hash(password1, salt);

                        user = new Users({
                            name: name,
                            email: email,
                            password: hash
                        })
                        await user.save();

                        req.session.message = {
                            type: 'success',
                            class: 'success',
                            message: 'Account created successfully!'
                        }
                        res.redirect('/auth/login')
                    }
                }
            } else {
                req.session.message = {
                    type: 'error',
                    class: 'danger',
                    message: 'Invalid captcha!'
                }
                res.redirect('/auth/signup')
            }
        })
})
router.post('/api/loginuser', async (req, res) => {
    const { email, password } = req.body;
    const captchaResponse = req.body["g-recaptcha-response"];
    const captchaData = {
        secret: process.env.GOOGLE_SERVER_RECAPTCHA_KEY,
        reponse: captchaResponse
    }

    axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${captchaData.secret}&response=${captchaData.reponse}`)
        .then(async (response) => {
            const success = response.data['success'];

            if (success) {
                if (email === '' || password === '') {
                    req.session.message = {
                        type: 'error',
                        class: 'danger',
                        message: 'Credentials cannot be empty'
                    }
                    res.redirect('/auth/login')
                } else {
                    let user = await Users.findOne({ email: email })

                    if (user) {
                        const compare = await bcrypt.compare(password, user.password)

                        if (compare) {
                            const payload = {
                                '_id': user._id
                            }
                            const token = jwt.sign(payload, process.env.AUTH_SECRET, {
                                expiresIn: '24h'
                            });
                            res.cookie('authToken', token, {
                                maxAge: 24*60*60*1000,
                                path: '/'
                            })

                            req.session.message = {
                                type: 'success',
                                class: 'success',
                                message: 'Logged in successfully!'
                            }
                            res.redirect('/')
                        }
                    }
                }
            } else {
                req.session.message = {
                    type: 'error',
                    class: 'danger',
                    message: 'Invalid captcha!'
                }
                res.redirect('/auth/login')
            }
        })
})

module.exports = router;