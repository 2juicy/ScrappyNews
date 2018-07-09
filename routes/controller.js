module.exports = function (app) {
    // Our scraping tools
    // Axios is a promised-based http library, similar to jQuery's Ajax method
    // It works on the client and on the server
    const axios = require("axios");
    const cheerio = require("cheerio");

    // A GET route for scraping the echoJS website
    app.get("/scrape", function (req, res) {
        // First, we grab the body of the html with request
        axios.get("http://www.mmorpg.com/news").then(function (response) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            const $ = cheerio.load(response.data);

            // Now, we grab every h2 within an article tag, and do the following:
            $(".news_newspost").each(function (i, element) {
                // Save an empty result object
                const result = {};

                // Add the text and href of every link, and save them as properties of the result object
                result.title = $(this)
                    .children("h1 a")
                    .text();
                result.info = $(this)
                    .children("p")
                    .text();
                result.link = $(this)
                    .children("a")
                    .attr("href");

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

// working scrape section
// var cheerio = require("cheerio");
// var request = require("request");

// // Make a request call to grab the HTML body from the site of your choice
// request("http://www.mmorpg.com/news", function(error, response, html) {

//   // Load the HTML into cheerio and save it to a variable
//   // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
//   var $ = cheerio.load(html);
// $(".news_newspost").each(function (i, element) {
//   const result = {};

//                 // Add the text and href of every link, and save them as properties of the result object
//                 result.title = $(this)
//                     .children("h1 a")
//                     .text();
//                 result.info = $(this)
//                     .children("p")
//                     .text();
//                 result.link = $(this)
//                     .children("a")
//                     .attr("href");

//   // Select each element in the HTML body from which you want information.
//   // NOTE: Cheerio selectors function similarly to jQuery's selectors,
//   // but be sure to visit the package's npm page to see how it works


//   // Log the results once you've looped through each of the elements found with cheerio
//   console.log(result);
// });
// });