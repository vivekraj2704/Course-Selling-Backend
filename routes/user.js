const { Router } = require('express')
const userRouter = Router()
const { userModel, purchaseModel } = require('../db')
const { z } = require('zod')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { JWT_SECRET_USER } = require('../config')
const { userMiddleware } = require('../middleware/user')

userRouter.post('/signup', async (req, res) => {
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
            const user = await userModel.create({
                email,
                password: hashedPassword,
                firstName,
                lastName
            })
            
            res.json({
                msg: "User Registered"
            })
        } catch(e) {
            console.log(e);
            res.status(403).json({
                msg: "User already exists"
            })
        }
    } else {
        res.status(403).json({
            msg: "Invalid entry"
        })
    }
})

userRouter.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    const findUser = await userModel.findOne({
        email
    })

    if(!findUser) {
        res.status(403).json({
            msg: "email not found"
        })
    }else {
        const isUser = await bcrypt.compare(password, findUser.password)
        if(isUser) {
            //token generation
            const token = jwt.sign({
                id: findUser._id
            }, JWT_SECRET_USER);
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

userRouter.get('/purchases', userMiddleware, async(req, res) => {
    const userId = req.userId;
    const coursesPurchased = await purchaseModel.find({
        userId
    })
    res.json({
        coursesPurchased
    })
})

module.exports = {
    userRouter: userRouter
}

