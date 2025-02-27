const { Router } = require('express')
const adminRouter = Router();
const { adminModel, courseModel } = require('../db')
const bcrypt = require('bcrypt')
const { z } = require('zod')
const jwt = require('jsonwebtoken');
const { JWT_SECRET_ADMIN } = require('../config');
const { adminMiddleware } = require('../middleware/admin')

adminRouter.post('/signup', async(req, res) => {
    const { email, password, firstName, lastName } = req.body;
    const schema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
        firstName: z.string(),
        lastName: z.string()
    })

    const isValid = schema.safeParse({
        email, 
        password,
        firstName,
        lastName
    })

    if(isValid.success) {
        //password hashing
        const hashedPassword = await bcrypt.hash(password, 5);
        
        try{
            const admin = await adminModel.create({
                email,
                password: hashedPassword,
                firstName,
                lastName
            })
            
            res.json({
                msg: "admin Registered"
            })
        } catch(e) {
            console.log(e);
            res.status(403).json({
                msg: "admin already exists"
            })
        }
    } else {
        res.status(403).json({
            msg: "Invalid entry"
        })
    }
})

adminRouter.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    const findAdmin = await adminModel.findOne({
        email
    })

    if(!findAdmin) {
        res.status(403).json({
            msg: "email not found"
        })
    }else {
        const isAdmin = await bcrypt.compare(password, findAdmin.password)
        if(isAdmin) {
            //token generation
            const token = jwt.sign({
                id: findAdmin._id
            }, JWT_SECRET_ADMIN);
            // localStorage.setItem("token", token);
            res.json({
                token: token
            })
        } else {
            res.status(403).json({
                msg: "Invalid Credentials"
            })
        }
    }
})

adminRouter.post('/course', adminMiddleware, async(req, res) => {
    const adminId = req.userId;

    const { title, description, imageUrl, price } = req.body;

    const course = await courseModel.create({
        title, 
        description,
        imageUrl,
        price,
        creatorId: adminId
    })

    res.json({
        msg: "Course created",
        courseId: course._id
    })
})

adminRouter.put('/course', adminMiddleware, async(req, res) => {
    const adminId = req.userId;
    const { title, description, imageUrl, price, courseId } = req.body;

    const course = await courseModel.findOne({
        creatorId: adminId 
    })
    
    if(course) {
        const updatedCourse = await courseModel.updateOne({
            _id: courseId,
            creatorId: adminId
        }, {
            title, 
            description,
            imageUrl,
            price
        })

        res.json({
            msg: "Course updated successfully",
            courseId: updatedCourse._id
        })
    } else {
        res.status(500).json({
            msg: "course not found"
        })
    }
})

adminRouter.get('/course/bulk', adminMiddleware, async(req, res) => {
    const adminId = req.userId;

    const courses = await find({
        creatorId: adminId
    })

    if(courses) {
        res.json({
            courses
        })
    } else {
        res.json({
            msg: "no courses found"
        })
    }
})

module.exports = {
    adminRouter: adminRouter
}
