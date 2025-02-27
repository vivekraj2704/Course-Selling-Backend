const { Router } = require('express')
const courseRouter = Router(); 
const { userMiddleware } = require('../middleware/user')
const { courseModel, purchaseModel } = require('../db')

courseRouter.post('/purchase', userMiddleware, async(req, res) => {
    const userId = req.userId;
    const courseId = req.body.courseId;

    //payment check should be done here
    const purchasedCourse = await purchaseModel.create({
        userId,
        courseId
    })

    res.json({
        msg: "You have successfully purchased a course"
    })
})

courseRouter.get('/preview', async(req, res) => {
    const courses = await courseModel.find({})
    res.json({
        courses
    })
})

module.exports = {
    courseRouter: courseRouter
}