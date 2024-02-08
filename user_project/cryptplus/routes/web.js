const express = require('express');
const { body } = require('express-validator');
const fileUpload = require('express-fileupload');


//Middlewares
const isAuth = require('../app/Http/Middleware/authMiddleware');
const isLoggedIn = require('../app/Http/Middleware/isUserLoggedIn');
const role = require('../app/Http/Middleware/validateRoleMiddleware');

//Controllers
const homeController = require('../app/Http/Controllers/HomeController');
const loginController = require('../app/Http/Controllers/Auth/LoginController');
const registerController = require('../app/Http/Controllers/Auth/RegisterController');




const route = express.Router();

//Auth routes
route.get('/', isLoggedIn, loginController.index);
route.get('/forgetPassword', loginController.forgetPassword);
route.post('/forgetPassword', loginController.sendCode);
route.post('/recovery', loginController.recovery);
route.get('/recovery', loginController.recoveryP);


route.post('/', 
 body('email')
.not()
.isEmpty()
.withMessage('Email is required!')
.bail()
.isEmail()
.withMessage('Enter Valid Email!')
.bail(),
 body('password')
.not()
.isEmpty()
.withMessage('Password is required!')
.bail() , isLoggedIn, loginController.login);

route.post('/logout', loginController.logout);
route.get('/register', isLoggedIn,registerController.index);


route.post('/register',
        body('name')
        .not()
        .isEmpty()
        .withMessage('Name is required!')
        .bail()
        .isLength({min: 5})
        .withMessage('Name must 5 charcters long!')
        .bail(),
        body('email')
        .not()
        .isEmpty()
        .withMessage('Email is required!')
        .bail()
        .isEmail()
        .withMessage('Enter Valid Email!')
        .bail(),
        body('password')
        .not()
        .isEmpty()
        .withMessage('Password is required!')
        .bail() 
        .isLength({min: 5})
        .withMessage('Password is minimum 5 charcters long!')
        .bail()    
    ,registerController.register);

// //Auth Routes
route.get('/home', isAuth ,homeController.home);
route.get('/deposit', isAuth,homeController.deposit);

route.post('/deposit', fileUpload() ,homeController.depositFunds);

route.get('/withdraw', isAuth ,homeController.withdraw);
route.post('/withdraw', isAuth,homeController.withdrawFunds);

route.get('/depositTransaction', isAuth ,homeController.depositTransaction);
route.get('/withdrawTransaction', isAuth ,homeController.withdrawTransaction);
route.get('/settings', isAuth ,homeController.getSettings);
route.post('/settings', isAuth,homeController.setSettings);




module.exports = route;