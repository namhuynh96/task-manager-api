const express = require('express')
const sharp = require('sharp')
const multer = require('multer')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send()
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(new Error('Please upload image'))
        }
        callback(undefined, true)
    }
})

router.post('/tasks/:id/image', auth, upload.single('image'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    try {
        const task = await Task.findById(req.params.id)
        task.image = buffer
        await task.save()
        res.status(201).send()
    } catch (e) {
        res.status(404).send()
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/tasks/:id/image', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        if (!task || !task.image) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(task.image)
    } catch (e) {
        res.status(404).send()
    }
})

// GET /task?completed=true
// GET /task?limit=2&skip=4
// GET /task?sortBy=createdAt:asc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const sortQueryParts = req.query.sortBy.split(':')
        sort[sortQueryParts[0]] = sortQueryParts[1] === 'desc' ? -1 : 1
    }

    try {
        //Alternative: const tasks = await Task.find({ owner: req.user._id, ...match })
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
        res.send(tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, 'owner': req.user._id })
        if (!task) {
            res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every(u => allowedUpdates.includes(u))

    if (!isValidOperation) {
        return res.status(404).send({ error: 'Unvalid Updates' })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        updates.forEach(update => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router