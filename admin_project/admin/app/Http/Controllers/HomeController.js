const { v4: uuidv4 } = require('uuid');
const Deposit = require("../../../models/depositModel");
const Withdraw = require("../../../models/withdrawModel");

const catchAsync = require("../../../utils/catchAsync");
const User = require('../../../models/userModel');
exports.home = (req, resp, next) =>{
    return resp.render('dashboard/layout/index');
}

exports.deposit = (req, resp, next) =>{
    return resp.render('dashboard/layout/deposit');
}
exports.depositFunds =catchAsync(async (req, res, next) => {
    let val='Pending';
    let result1;
    let result2;
    if(req.body.approve == '')
    {
        val = 'Approved'
        result1 = await User.find({email: req.body.email})
        result2 = await User.find({referralCode:result1[0].referredBy})
        if(result2.length > 0)
        {
            const data = {
                id : uuidv4(),
                email: result2[0].email,
                amount: 2,
                profit: 0,
                totalAmt: 2,
                status:'Approved'
            }
            await Deposit.create(data)

        }

    }
    else if(req.body.cancel == ''){

        val = 'Cancelled'
    }
    else{}
     await Deposit.findOneAndUpdate( {
        id:req.body.id
    },
    {   $set:{
            status:val
        }
    },
    {new: true})
    const result = await Deposit.find({status:'Pending'}).sort({createdAt:1})
    let imageData;
    let dataUrl=[];
    if(result.length>0)
    {
        result.forEach(function (item){
            imageData = item.screenshot?.toString('base64');
            // console.log(imageData)
            dataUrl.push( `data:image/jpeg;base64,${imageData}`);

        })
    }
    return res.render('dashboard/layout/depositTransaction',{result,dataUrl});
  
});

exports.allTransaction =catchAsync(async (req, res, next) => {
    const result = await Deposit.find().sort({createdAt:-1})
    return res.render('dashboard/layout/allTransactions',{result});
});
exports.allWithdrawTransaction =catchAsync(async (req, res, next) => {
    const result = await Withdraw.find().sort({createdAt:-1})
    return res.render('dashboard/layout/allWithdrawTransactions',{result});
});
exports.getSettings =  catchAsync(async (req, res, next) => {
    const result = await User.findOne({email:req.session.email})
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
            email:req.session.email
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
    let val='Pending';
    if(req.body.approve=='')
    {
        val = 'Completed'
    }
    else if(req.body.cancel==''){
        val = 'Cancelled'
    }
    else{}
     await Withdraw.findOneAndUpdate( {
        id:req.body.id
    },
    {   $set:{
            status:val
        }
    },
    {new: true})
    const result = await Withdraw.find({status:'Pending'}).sort({createdAt:1})
    return res.render('dashboard/layout/withdrawTransaction',{result});
  
});

exports.withdraw = catchAsync(async (req, res, next) => {
    const result =await Deposit.aggregate([
        { $match: { email:req.session.email, status:"Approved"}  },
        { $group: {_id: null, amount: { $sum: "$amount" } } }
    ]);
    const result1 = await Deposit.find({email:req.session.email,status:"Approved"})
    let ids=[];

    let btnState = true;
    let walletAmount = 0;
    if(result.length > 0)
    {
        btnState = false;
        walletAmount = result[0].amount;
        result1.forEach(function(item){
            ids.push(item.id)
        });
    
    }
    return res.render('dashboard/layout/withdraw', {
        btnState,
        walletAmount, ids
        });
});

exports.depositTransaction = catchAsync(async (req, res, next) => {
    let result = await Deposit.find({status:'Pending'}).sort({createdAt:-1})
    // console.log(result)
    let imageData;
    let dataUrl=[];
    if(result.length>0)
    {
        result.forEach(function (item){
            imageData = item.screenshot?.toString('base64');
            // console.log(imageData)
            dataUrl.push( `data:image/jpeg;base64,${imageData}`);

        })
    }
 

    return res.render('dashboard/layout/depositTransaction',{result,dataUrl});
});

exports.withdrawTransaction =  catchAsync(async (req, res, next) => {
    const result = await Withdraw.find({status:'Pending'}).sort({createdAt:-1})
    // console.log(result)
    return res.render('dashboard/layout/withdrawTransaction',{result});
});
exports.welcome = (req, resp, next) => {
   return resp.render('front-end/layout/index')
}