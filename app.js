require('dotenv').config()
const express = require('express');
const ejs = require('ejs')
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose')


const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//mongoose connection
mongoose.connect(process.env.MONGO_URI, function(err){
    if(err){
        console.log(err);
    }else{
        console.log('connected to mongodb')
    }
})

//mongoose schemas

const statementSchema = new mongoose.Schema({ 
    statement: String,
    upvotes: Number,
    downvotes: Number
})

//mongoose models
const Statment = new mongoose.model('Statement', statementSchema);




const port = process.env.PORT || 3000;



app.get('/', function(req,res){
    res.render('index');
})

app.get('/feed', function(req,res){
    Statment.find({},function(err,statements){
        if(err){
            console.log(err);
        }else{
            res.render('feed', {statement: statements});
        }
    })
})

app.get('/create', function(req,res){
    res.render('creation');
})
app.get('/feed/:id', function(req,res){
    const requestedId = req.params.id;
    Statment.findOne({_id: requestedId}, function(err, foundStatement){
        if(err){
            console.log(err);
        }else{
            res.render('poll', {statement: foundStatement});
        }
    })
})



app.post('/create', function(req,res){
    const statement_txt = req.body.statement;

    const statement = new Statment({
        statement: statement_txt,
        upvotes: 0,
        downvotes: 0
    })
    statement.save(function(err){
        if(err){
            console.log(err);
        }else{
            console.log('Data registered to db succesfully.')
        }
    });

    res.redirect('/feed')
})


app.get('/feed/:id/upvote', function(req,res){
    const requestedId = req.params.id;
    Statment.findOneAndUpdate({_id: requestedId},{$inc: {upvotes: +1}}, function(err, foundStatement){
        if(err){
            console.log(err);
        }else{
            res.redirect('/feed/' + requestedId);
        }
    })
})
app.get('/feed/:id/downvote', function(req,res){
    const requestedId = req.params.id;
    Statment.findOneAndUpdate({_id: requestedId},{$inc: {downvotes: +1}}, function(err, foundStatement){
        if(err){
            console.log(err);
        }else{
            res.redirect('/feed/' + requestedId);
        }
    })
})

app.listen(port, function(){
    console.log('Server started on Port ' + port);
})
