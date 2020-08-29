const express = require('express');
const bodyParser = require('body-parser');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');
const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) //preflight request
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .populate('user campsites')
    .then(favorite => {
        console.log("User", req.user._id, "Favorite", favorite);
        if (favorite) {  // check to see if favorite returned
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        } else {
            err = new Error(`Favorites for user: ${req.user._id} have not been assigned.`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .then(favorite => {
        if (favorite) {  // check to see if favorite returned
            console.log("Favorites found", favorite);
            console.log("req.body", req.body);
            req.body.forEach((item) => {
                console.log("item", item);
                console.log("item._id", item._id);
                console.log("favorite campsites", favorite[0].campsites);
                if (!favorite[0].campsites.includes(item._id)){
                    favorite[0].campsites.push(item._id);
                    console.log("pushed item");
                }
            });
            favorite[0].save()  // saves to MongoDB
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
            console.log("Favorite saved", favorite);   
        } else { // if favorite not returned then create one
            Favorite.create([{ 
                user: req.user._id,
                campsites: req.body
            }])
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
});



favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}.`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}.`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
});