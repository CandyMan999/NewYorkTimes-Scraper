const db = require('../models');
const axios = require("axios");
const cheerio = require("cheerio");

//this will wrap and export all my routes so they have access by my server
module.exports = function (app) {
    //this renders the homePage 
    app.get("/", function (req, res) {
        res.render("index");
    })

    //this route will run our scraper functionality
    app.get("/scrape", function (req, res) {
        // Make a request for the news section of `nytimes`
        axios.get("https://nytimes.com").then(function (response) {
            let $ = cheerio.load(response.data); //setting the variable of our scaper so it can be utilized with the same syntax as jquery

            let results = [];

            $('.css-ki19g7').each(function (i, element) {
                console.log("this is the number of elements: ", i);

                let label = $(element).children().find('h3').text();
                let link = `https://www.nytimes.com` + $(element).children().find('a').attr('href') + `?action=click&module=Top%20Stories&amp;pgtype=Homepage`;
                let summary = $(element).children().find('a').text()
                //console.log(label)
                if (link && label && summary) {
                    results.push({
                        label,
                        link,
                        summary
                    })
                }

            })
            //console.log("this is my results: ", results)
            //this will create our articles in the database by passing through our object array stored in the results variable
            db.Article.create(results)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log("######## ", err)

                });
            //this renders our index.handlebars
            //console.log("this is the results: ", results)
            res.render("index")

        });

    });

    //this will grab all of our articles from our database
    app.get("/articles", function (req, res) {
        db.Article.find({}).then(function (articles) {
            res.json(articles)
        }).catch(function (err) {
            console.log(err);
        })
    })

    //this will delete all articles from the database
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

    // this will find an article by its ID and update its default favorited value from false to true
    app.put('/articles/:id', function (req, res) {
        db.Article.findByIdAndUpdate(req.params.id, {
            $set: {
                favorited: true
            }
        }).catch(function (err) {
            console.log(err)
        })
    })

    //this route will return all articles in the database with a favorited value of true and then render our saved.handlebars with the articles data with a key of favorites
    app.get("/favorites", function (req, res) {
        db.Article.find({
            favorited: true
        }).then(function (articles) {
            res.render("saved", { favorites: articles });
        })
    })

    //this route finds an article by its particular id and also populates its notes ref if one exsits
    app.get("/articles/:id", function (req, res) {
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

    //this route grabs a particular note by its ID
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

    //Route deletes specific article from the database based off its ID
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

    //This route finds a favorited article by id and resets its favorited value to false
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

    //this route deletes a note by its specific ID
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