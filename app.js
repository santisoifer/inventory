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
    quantity: Number,
    wantedQuantity: Number
}

const userSchema = {
    name: String,
    password: Number,
    articles: [articleSchema]
}

const Article = mongoose.model("Article", articleSchema);

const User = mongoose.model("User", userSchema);

// 0: creado con exito
// 1: error
// 2: defecto

let newUserCreated;

app.get("/", function(req, res){
// Creado con exito
    if(newUserCreated === 0) {
        res.render("signup.ejs", {userCreated: 0, newUser: 0});
    } 
    // Error
    else if(newUserCreated === 1){
        res.render("signup.ejs", {userCreated: 0, newUser: 1});
    }
});

app.post("/signin", function(req, res){
    const username = req.body.username;
    const password = req.body.password;    
    
    User.findOne({name: username, password:password}, function(err, userFounded){
        if (!err) {
            if (!userFounded) {
                res.render("signup.ejs", {userCreated: 1, newUser: 2});
            } else{
                res.redirect("/inventory");
                let currentSession = userFounded;
            }
            
        }else{
            console.log(err);
        }
    });
});

app.post("/register", function(req, res){
    const username = req.body.username;
    const password = req.body.password;
    
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
                // TODO: reenviar a iniciar sesión y mostrar modal que diga que existe un usuario con ese nombre
            }


        }
    });

});

app.get("/inventory", function(req, res){
    res.render("home.ejs");
});

app.get("/shop-list", function(req, res){
    res.render("shop.ejs");
});

app.get("/add-article", function(req, res){
    res.render("addArticle.ejs");
});

app.listen(3000, function(){
    console.log("Server listening on port 3000");
});