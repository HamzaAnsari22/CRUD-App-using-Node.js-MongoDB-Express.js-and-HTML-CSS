const path = require('path')
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Deposit = require("../../../models/depositModel");
const Withdraw = require("../../../models/withdrawModel");
const nodemailer = require('nodemailer');

const catchAsync = require("../../../utils/catchAsync");
const User = require('../../../models/userModel');
exports.home = (req, resp, next) =>{
    return resp.render('dashboard/layout/index');
}

exports.deposit = (req, resp, next) =>{
    return resp.render('dashboard/layout/deposit');
}
exports.depositFunds =catchAsync(async (req, res, next) => {
    const { screenshot } = req.files;
    const amount = parseInt(req.body.amount);

    // If no image submitted, exit
    if (!screenshot) return res.sendStatus(400);
    
    const filePath = path.join(`public/${req.cookies.email}/${uuidv4()}${screenshot.name}`);
    // Move the uploaded image to our upload folder
    // screenshot.mv(filePath);
    // console.log(screenshot)
    let amt= 0;
    // console.log(parseInt(amount))
    if(amount<=5000)
    { 
        amt = parseFloat(amount/100);
    }
    else if(amount>=5001 && amount<=15000)
    { 
        amt = parseInt(amount/100) * 1.5;
    }
    else if(amount>=15001 && amount<=30000)
    { 
        amt = 800;
    }
    else if(amount>=30001 && amount<=60000)
    { 
        amt = 1600;
    }
    else{
        amt = 2000;
    }
    // console.log(amt)
    const data ={
        email:req.cookies.email,
        amount: amount,
        screenshotPath: filePath,
        profit: amt,
        id: uuidv4(),
        screenshot: new Buffer.from(screenshot.data, 'binary')
    }
    await Deposit.create(data);
    var transporter = nodemailer.createTransport({
        host: 'smtp.elasticemail.com',
        port: 2525,
        secure: false,
        auth: {
          user: 'cryptplus.co@gmail.com',
          pass: 'B2FD9E06F18D0712DD4340440B0C9D46D526'
        }
      });
      
      var mailOptions = {
        from: 'cryptplus.co@gmail.com',
        to: 'cryptplus.co@gmail.com',
        subject: 'Deposit',
        text: `Email: ${data.email}, Amount: ${data.amount}`
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      transporter.close();
    return res.render('dashboard/layout/deposit');
});

exports.getSettings =  catchAsync(async (req, res, next) => {
    const result = await User.findOne({email:req.cookies.email})
    // console.log(result)
    return res.render('dashboard/layout/settings',{
        name: result.name,
        email: result.email,
        referralCode: result.referralCode,
        walletAddress: result.walletAddress
    });
});
exports.setSettings = catchAsync(async (req, res, next) => {
    const result = await User.findOneAndUpdate(
        {
            email:req.cookies.email
        },
        {   $set:{
                walletAddress:req.body.walletAddress
            }
        },
        {new: true})
    return res.render('dashboard/layout/settings', {
        name: result.name,
        email: result.email,
        referralCode: result.referralCode,
        walletAddress: result.walletAddress
    });
});
exports.withdrawFunds = catchAsync(async (req, res, next) => {
    let { ids } = req.body;
    let result1;
    if(ids.length > 0)
    {
        ids = ids.split(',').map(num => String(num));
        ids.forEach(async function(item){   
            // result = await Deposit.findOneAndUpdate({id:item},{$set:{status:'Completed'}})
            result1 =await Deposit.findOneAndUpdate(
                {
                    id:item
                },
                {   $set:{
                        status:'Completed'
                    }
                },
                {new: true})
                // console.log(result1,'111')
            const data = {
                id: uuidv4(),
                email: req.cookies.email,
                amount: result1.amount,
                profit: result1.profit,
                totalAmt: result1.amount + result1.profit
            }
            // console.log(data)
            await Withdraw.create(data);
            await User.findOneAndUpdate( {
                email:req.cookies.email
            },
            {   $set:{
                    lastWithdraw:new Date()
                }
            },
            {new: true})
            var transporter = nodemailer.createTransport({
                host: 'smtp.elasticemail.com',
                port: 2525,
                secure: false,
                auth: {
                    user: 'cryptplus.co@gmail.com',
                    pass: 'B2FD9E06F18D0712DD4340440B0C9D46D526'
                  }
              });
              
              var mailOptions = {
                from: 'cryptplus.co@gmail.com',
                to: 'cryptplus.co@gmail.com',
                subject: 'Withdraw',
                text: `Email: ${data.email}, Amount: ${data.amount}`
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
              transporter.close();
        });
    }

    return res.render('dashboard/layout/withdraw', {
        btnState: true,
        walletAmount: 0,
        ids: []
    });
});

exports.withdraw = catchAsync(async (req, res, next) => {
    let flag =false;
    const result =await Deposit.aggregate([
        { $match: { email:req.cookies.email, status:"Approved"}  },
        { $group: {_id: null, amount: { $sum: "$amount" } } }
    ]);
    const profit =await Deposit.aggregate([
        { $match: { email:req.cookies.email, status:"Approved"}  },
        { $group: {_id: null, profit: { $sum: "$profit" } } }
    ]);
    const result1 = await Deposit.find({email:req.cookies.email,status:"Approved"})
    let ids=[];

    let btnState = true;
    let walletAmount = 0;
   
    if(result.length > 0)
    {
        // console.log(result[0].amount)
        // console.log(profit[0].profit)
        btnState = false;
        flag =true;
        walletAmount = result[0].amount + profit[0].profit;
        result1.forEach(function(item){
            ids.push(item.id)
        });
    
    }
    const result2= await User.findOne({email: req.cookies.email})
    if(result2.lastWithdraw)
    {
        const diffInMs = Math.abs(new Date() - result2.lastWithdraw);

        // Convert milliseconds to days
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        // console.log(btnState)
        // console.log(diffInDays)
        if (diffInDays>0 && flag){
            btnState= false
        }
        else{
            btnState= true
        }


    }

    return res.render('dashboard/layout/withdraw', {
        btnState,
        walletAmount, ids
        });
});

exports.depositTransaction = catchAsync(async (req, res, next) => {
    const result = await Deposit.find({email:req.cookies.email}).sort({createdAt:-1})
    return res.render('dashboard/layout/depositTransaction',{result});
});

exports.withdrawTransaction =  catchAsync(async (req, res, next) => {
    const result = await Withdraw.find({email:req.cookies.email}).sort({createdAt:-1})
    return res.render('dashboard/layout/withdrawTransaction',{result});
});
exports.welcome = (req, resp, next) => {
   return resp.render('front-end/layout/index')
}