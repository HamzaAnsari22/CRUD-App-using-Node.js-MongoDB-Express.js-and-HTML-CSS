const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require("../../../../models/userModel");
const catchAsync = require("../../../../utils/catchAsync");
const AppError = require("../../../../utils/appError");

exports.index = (req, resp, next) =>{
    return resp.render('front-end/auth/register',{
        errorMessage : ''
    });
}

exports.register = catchAsync(async (req, res, next) => {
    if (!req.body.name || !req.body.email || !req.body.password ) next(new AppError("Kindly Enter All Fields", 404));
    const result =  await User.findOne({email: req.body.email});
    if(result)
    {
        return res.status(422).render('front-end/auth/register',{
            errorMessage: 'User Already Exists!!!'
        });

    }

    const min = 100000;
    const max = 999999;
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    req.body.referralCode = randomNum
    req.body.password = await bcrypt.hash(req.body.password,12)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('front-end/auth/register',{
            errorMessage: ''
        });
    }
    req.body.id = uuidv4();
    await User.create(req.body);
    return res.status(200).render('front-end/auth/register',{
        errorMessage: 'Signup successful!'
    });
 
    return res.redirect('/');
});