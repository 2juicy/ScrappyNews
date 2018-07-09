module.exports = function (app) {
    // Our scraping tools and DB
    const db = require("../models");
    const cheerio = require("cheerio");
    const request = require("request");
    // Landing page displaying all scrapped news saved in DB
    app.get("/", function (req, res) {
        db.Article.find({}).sort({_id: -1}).then(function (results) {
            res.render('index', { articles: results });
        });
    });
    // A GET route for scraping the MMORPG website
    app.get("/scrape", function (req, res) {
        // First, we grab the body of the html with request
        request("http://www.mmorpg.com/news", function (error, response, html) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            const $ = cheerio.load(html);

            // Now, we grab every new_newspost class within an div tag, and do the following:
            $(".news_newspost").each(function (i, element) {
                // Save an empty result object
                const result = {};

                // Add the text and href of every title, info, link, img and save them as properties of the result object
                result.title = $(this)
                    .children("a").children('img')
                    .attr("alt");
                result.info = $(this)
                    .children("p")
                    .text();
                result.link = $(this)
                    .children("a")
                    .attr("href");
                result.img = $(this)
                    .children('a').children('img')
                    .attr('src');

                // Create a new Article using the `result` object built from scraping
                db.Article.create(result)
                    .then(function (dbArticle) {
                        // View the added result in the console
                        console.log(dbArticle);
                    })
                    .catch(function (err) {
                        // If an error occurred, send it to the client
                        return res.json(err);
                    });
            });

            // If we were able to successfully scrape and save an Article, send a message to the client
            res.send("Scrape Complete");
        });
        // Sends user back to homepage after scrape is complete
        res.redirect("/");
    });

} //end of export