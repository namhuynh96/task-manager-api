const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT 

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

const multer = require('multer')

const upload = multer({
    dest: 'fileUpload',
    limits: {
        fileSize: 1000000
    },
    fileFilter (req, file, callback) {
        if (!file.originalname.match(/\.(doc|docx)$/)) {
            return callback(new Error('Please upload Word file'))
        }
        callback(undefined, true)
    }
})

app.post('/upload', upload.single('upload'), (req, res) => {
    res.send()
})