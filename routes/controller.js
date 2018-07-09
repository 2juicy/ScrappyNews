module.exports = function (app) {
    // Our scraping tools
    const cheerio = require("cheerio");
    const request = require("request");
    // A GET route for scraping the MMORPG website
    app.get("/scrape", function (req, res) {
        // First, we grab the body of the html with request
        request("http://www.mmorpg.com/news", function(error, response, html) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            const $ = cheerio.load(response.data);

            // Now, we grab every h2 within an article tag, and do the following:
            $(".news_newspost").each(function (i, element) {
                // Save an empty result object
                const result = {};

                // Add the text and href of every link, and save them as properties of the result object
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
    });

}