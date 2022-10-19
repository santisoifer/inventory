const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/inventarioDB");

const articleSchema = {
    name: String,
    actualQ: Number,
    wihsedQ: Number
}

const userSchema = {
    name: String,
    password: String,
    articles: [articleSchema]
}

const Article = mongoose.model("Article", articleSchema);

const User = mongoose.model("User", userSchema);

let newUserCreated;
let currentSession;

app.get("/", function(req, res){
    // Creado con exito
    if(newUserCreated === 0) {
        res.render("signup.ejs", {userCreated: 0, newUser: 0});
    } 
    // Error
    else if(newUserCreated === 1){
        res.render("signup.ejs", {userCreated: 0, newUser: 1});
    } 
    // No mostrar ningún mensaje
    else {
        res.render("signup.ejs", {userCreated: 0, newUser: 2});
    }
});

app.post("/signin", function(req, res){
    const username = _.toLower(req.body.username);
    const password = _.toLower(req.body.password.toString());    
    
    currentSession = undefined;
    
    // Buscar usuario, en base a los datos
    User.findOne({name: username, password:password}, function(err, userFounded){
        if (!err) {
            if (!userFounded) {
                // Si no se econtro, mostrar mensaje de error
                res.render("signup.ejs", {userCreated: 1, newUser: 2});
            } else{
                // Si se econtro, redireccionar al inventario, y establecer la seción activa
                res.redirect("/inventory");
                currentSession = userFounded;
            }
            
        }else{
            console.log(err);
        }
    });
});

app.post("/register", function(req, res){
    const username = _.toLower(req.body.username);
    const password = _.toLower(req.body.password.toString());
    
    // Chequear si no hay un usuario con el mismo nombre
    User.findOne({name: username}, function(err, userFounded){
        if (!err) {
            
            if (!userFounded) {
                const newUser = new User({
                    name: username,
                    password: password
                })
                newUser.save();
                res.redirect("/");
                newUserCreated = 0;
            }
            else {
                res.redirect("/");
                newUserCreated = 1;
            }


        }
    });

});

app.post("/logout", function(req, res){
    currentSession = undefined;
    res.redirect("/");
});

app.get("/inventory", function(req, res){
    if(currentSession === undefined) {
        res.redirect("/");
    } else {
        res.render("home.ejs", {articles: currentSession.articles, needToBuy: 0});
    }
});

app.get("/shop-list", function(req, res){
    if(currentSession === undefined) {
        res.redirect("/");
    } else {
        res.render("shop.ejs");
    }
});

app.get("/add-article", function(req, res){
    if(currentSession === undefined) {
        res.redirect("/");
    } else {
        res.render("addArticle.ejs");
    }
});

app.post("/add-article", function(req, res){
    const articleName = _.capitalize(req.body.articleName);
    const articleQuantity = req.body.articleQuantity;
    const articleWQ = req.body.articleWishedQuantity;

    const newArticle = new Article({
        name: articleName,
        actualQ: articleQuantity,
        wihsedQ: articleWQ
    });

    newArticle.save();
    currentSession.articles.push(newArticle);
    currentSession.save();
    res.redirect("/inventory");
});

app.listen(3000, function(){
    console.log("Server listening on port 3000");
});