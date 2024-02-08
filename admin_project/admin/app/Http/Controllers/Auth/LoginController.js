const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require("../../../../models/userModel");
const catchAsync = require("../../../../utils/catchAsync");
const nodemailer = require('nodemailer');

exports.index = (req, resp, next) =>{
    return resp.render('front-end/auth/login',{
        errorMessage: ''
    });
}

exports.forgetPassword = (req, resp, next) =>{
    return resp.render('front-end/auth/forgetPassword',{
        errorMessage: ''
    });
}

exports.sendCode = async (req, resp, next) =>{
    const result =  await User.findOne({
        email: req.body.email
   });
   if (!result)
   {
       return resp.status(422).render('front-end/auth/recovery',{
           errorMessage: 'No Account Found with this Email!'
       });
   }
   else{
    const min = 100000;
    const max = 999999;
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
        await User.findOneAndUpdate({
            email: result.email
        },
        {   $set:{
                code:randomNum
            }
        },
        {new: true})


        //email send code
        var transporter = nodemailer.createTransport({
            host: 'smtp.elasticemail.com',
            port: 2525,
            secure: false,
            auth: {
              user: 'muhammad.bilal.68686@gmail.com',
              pass: 'BACEF6A26F3E24634220DEFB2CA4B9DF31F2'
            }
          });
          
          var mailOptions = {
            from: 'muhammad.bilal.68686@gmail.com',
            to: 'muhammad.rizwan.76712@gmail.com',
            subject: 'Reset Password',
            text: `Your Recovery Code is: ${randomNum}`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
          transporter.close();
    }
    return resp.render('front-end/auth/recovery',{
        errorMessage: ''
    });
}

exports.recovery = async (req, resp, next) =>{
   const result =  await User.findOne({
        code: req.body.code
   });
    if (result)
    {
        req.body.newPassword = await bcrypt.hash(req.body.newPassword,12)
        await User.findOneAndUpdate({
            email:result.email
        },
        {   $set:{
                password:req.body.newPassword
            }
        },
        {new: true})

    }
    return resp.redirect('/');
}
exports.recoveryP = (req, resp, next) =>{
    return resp.redirect('/');
} 

exports.login =  catchAsync(async (req, res, next) => {
    await User.findOne({
            email: req.body?.email, role:'admin'
       
    })
    .then(user =>{         
        if(!user){
            return res.status(422).render('front-end/auth/login',{
                errorMessage:  'User not found!'
            });
        }
        bcrypt.compare(req.body.password, user.password)
        .then(result =>{
          
            if(!result){
                return res.status(422).render('front-end/auth/login',{
                    errorMessage: 'Incorrect Credentials'
                });
            }
            req.session.username = user.name;
            req.session.email = user.email;
            req.session.auth = true;
            // req.session.roles = roles;

            let payload = {
                auth: true,
                name: user.name,
                email: user.email

            };
           
            let accessToken = jwt.sign(payload, 'longest secreate key node admin', {
                algorithm: "HS256",
                expiresIn: '1h'
            });
            // console.log("accessToken",accessToken);
            
            res.cookie("jwt", accessToken, {secure: true, httpOnly: true/*, samesite:"lax"*/});
            res.cookie("email",user.email, {secure: true, httpOnly: true/*, samesite:"lax"*/});
            res.cookie("username",user.name, {secure: true, httpOnly: true/*, samesite:"lax"*/});
            // res.cookie("email", user.email, {secure: true, httpOnly: true/*, samesite:"lax"*/});

            return res.redirect('/home');
        })
    })
    .catch(error => {
        throw new Error(error);
    });    
});

exports.logout = async (req,resp,next) => { 
    await req.session.destroy();
    await resp.clearCookie("jwt");
    await resp.clearCookie("email");
    await resp.clearCookie("my-session-name");
    await resp.clearCookie("connect.sid");
    return resp.redirect("/");
}
