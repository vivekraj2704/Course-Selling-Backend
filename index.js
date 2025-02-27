const express = require('express')
const { userRouter } = require('./routes/user')
const { courseRouter } = require('./routes/course')
const { adminRouter } = require('./routes/admin')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express();
app.use(express.json())

//routing
app.use('/api/v1/user', userRouter);
app.use('/api/v1/course', courseRouter);
app.use('/api/v1/admin', adminRouter)

async function connection() {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('DB connected')
    app.listen(3000, () => {
        console.log('port running on port 3000')
    })
}
connection();
