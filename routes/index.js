const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const Users = require('../models/Users');
const router = express.Router();

router.get('/', fetchuser, async (req, res) => {
    if (!req.cookies['authToken']) {
        res.redirect('/auth/login')
    } else {
        const notes = await Notes.find({ user: req.user }).lean();
        res.render('index', { title: 'Home', notes: notes })
    }
})

router.get('/add', async (req, res) => {
    if (!req.cookies['authToken']) {
        res.redirect('/auth/login')
    } else {
        const note = new Notes();
        res.render('add', { title: 'Add Note', note: note })
    }
})

router.get('/edit/:id', fetchuser, async (req, res) => {
    if (!req.cookies['authToken']) {
        res.redirect('/auth/login')
    } else {
        const { id } = req.params;
        const note = await Notes.findById(id).lean();
        const user = await Users.findById(req.user);

        if (user._id.toString() == note.user._id.toString()) {
            res.render('edit', { title: 'Edit Note', note: note })
        } else {
            req.session.message = {
                type: 'error',
                class: 'danger',
                message: 'You cannot modify this note!'
            }
            res.redirect('/')
        }
    }
})

router.get('/delete/:id', fetchuser, async (req, res) => {
    if (!req.cookies['authToken']) {

    } else {
        const { id } = req.params;
        const note = await Notes.findById(id).lean();
        const user = await Users.findById(req.user);

        if (user._id.toString() == note.user._id.toString()) {
            res.render('confirm', { title: 'Confirm Delete Note', note: note })
        } else {
            req.session.message = {
                type: 'error',
                class: 'danger',
                message: 'You cannot delete this note!'
            }
            res.redirect('/')
        }
    }
})

router.post('/api/add', fetchuser, async (req, res) => {
    const note = new Notes({
        title: req.body.title,
        description: req.body.description,
        user: req.user
    });
    await note.save();
    req.session.message = {
        type: 'success',
        class: 'success',
        message: 'Your note has been added!'
    }
    res.redirect('/')
})

router.post('/api/edit/:id', fetchuser, async (req, res) => {
    const user = await Users.findById(req.user);

    if (req.user.toString() == user._id.toString()) {
        await Notes.findByIdAndUpdate(req.params.id, {
            $set: req.body
        })
        req.session.message = {
            type: 'success',
            class: 'success',
            message: 'Your note has been updated!'
        }
        res.redirect('/')
    } else {
        req.session.message = {
            type: 'error',
            class: 'danger',
            message: 'You cannot modify this note!'
        }
        res.redirect('/')
    }
})

router.post('/api/delete/:id', fetchuser, async (req, res) => {
    const user = await Users.findById(req.user);

    if (req.user.toString() == user._id.toString()) {
        await Notes.findByIdAndDelete(req.params.id)
        req.session.message = {
            type: 'success',
            class: 'success',
            message: 'Your note has been delete!'
        }
        res.redirect('/')
    } else {
        req.session.message = {
            type: 'error',
            class: 'danger',
            message: 'You cannot delete this note!'
        }
        res.redirect('/')
    }
})

module.exports = router;
