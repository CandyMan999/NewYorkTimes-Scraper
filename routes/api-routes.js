const db = require('../models');
const axios = require("axios");
const cheerio = require("cheerio");


module.exports = function (app) {
    //this renders the homePage 
    app.get("/", function (req, res) {
        res.render("index");
    })

    app.get("/saved", function (req, res) {
        res.render("saved");
    })

    app.get("/scrape", function (req, res) {
        // Make a request for the news section of `ycombinator`
        axios.get("https://nytimes.com").then(function (response) {
            let $ = cheerio.load(response.data);

            let results = [];

            $('.css-ki19g7').each(function (i, element) {
                console.log("this is the number of elements: ", i);

                let label = $(element).children().find('h3').text();
                let link = `https://www.nytimes.com` + $(element).children().find('a').attr('href') + `?action=click&module=Top%20Stories&amp;pgtype=Homepage`;
                let summary = $(element).children().find('a').text()
                console.log(label)
                if (link && label && summary) {
                    results.push({
                        label,
                        link,
                        summary
                    })
                }

            })
            //console.log("this is my results: ", results)
            db.Article.create(results)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log("######## ", err)

                });
            //console.log("this is the results: ", results)
            res.render("index")

        });

    });


    app.get("/articles", function (req, res) {
        db.Article.find({}).then(function (articles) {
            res.json(articles)
        }).catch(function (err) {
            console.log(err);
        })
    })

    app.delete("/clearall", function (req, res) {
        db.Article.remove({}, function (err, response) {
            if (err) {
                console.log(err)
            }
            else {
                console.log(response)
                res.json(response)
            }
        })
    })

    app.put('/articles/:id', function (req, res) {
        db.Article.findByIdAndUpdate(req.params.id, {
            $set: {
                favorited: true
            }
        }).catch(function (err) {
            console.log(err)
        })
    })

    app.get("/favorites", function (req, res) {
        db.Article.find({
            favorited: true
        }).then(function (articles) {
            res.render("saved", { favorites: articles });
        })

    })

    app.get("/articles/:id", function (req, res) {
        // TODO
        db.Article.findOne({
            _id: req.params.id
        }).populate("notes").then(function (dbNote) {
            res.json(dbNote);
            console.log(dbNote)
        }).catch(function (err) {
            res.json(err);
        })
        // Finish the route so it finds one article using the req.params.id,
        // and run the populate method with "note",
        // then responds with the article with the note included
    });
    //route to get a note by id
    app.get("/notes/:id", function (req, res) {
        // TODO
        db.Note.findOne({
            _id: req.params.id
        }).then(function (note) {
            res.json(note);
        }).catch(function (err) {
            res.json(err);
        })
    })

    // Route for saving/updating an Article's associated Note
    app.post("/articles/:id", function (req, res) {

        db.Note.create(req.body)
            .then(function (dbNote) {
                return db.Article.findOneAndUpdate({
                    _id: req.params.id
                }, { $push: { notes: dbNote._id } },
                    {
                        new: true
                    }
                ).then(function (dbNote) {
                    res.json(dbNote);

                }).catch(function (err) {
                    res.json(err);
                })

            })

        // save the new note that gets posted to the Notes collection
        // then find an article from the req.params.id
        // and update it's "note" property with the _id of the new note
    });

    app.delete("/articles/:id", function (req, res) {
        db.Article.remove({
            _id: req.params.id
        }, function (err, response) {
            if (err) {
                console.log(err)
            }
            else {
                console.log(response)
                res.json(response)
            }
        })
    })


    app.put("/favorites/:id", function (req, res) {
        db.Article.findByIdAndUpdate(req.params.id, {
            $set: {
                favorited: false
            }
        }, function (err, response) {
            if (err) {
                console.log(err)
            }
            else {
                console.log(response)
                res.json(response)
            }
        }).catch(function (err) {
            console.log(err)
        })
    })

    app.delete("/notes/:id", function (req, res) {
        db.Note.remove({
            _id: req.params.id
        }, function (err, response) {
            if (err) {
                console.log(err)
            }
            else {
                console.log(response)
                res.json(response)
            }
        })
    })



}