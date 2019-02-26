module.exports = function(app) {
  // Our scraping tools and DB
  const db = require("../models");
  const cheerio = require("cheerio");
  const request = require("request");
  // Landing page displaying all scrapped news saved in DB
  app.get("/", function(req, res) {
    db.Article.find({})
      .sort({ _id: -1 })
      .then(function(results) {
        res.render("index", { articles: results });
      });
  });
  // Comment page
  app.get("/note/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
      .populate("notes")
      .then(function(results) {
        res.render("note", { articles: results });
      });
  });
  // Post to leave a comment
  app.post("/note/:id", function(req, res) {
    db.Note.create(req.body)
      .then(function(dbNote) {
        return db.Article.findOneAndUpdate(
          { _id: req.params.id },
          { $push: { notes: dbNote._id } },
          { new: true }
        );
      })
      .then(function(dbArticle) {
        res.redirect("back");
      })
      .catch(function(err) {
        res.redirect("/note/" + req.params.id);
      });
  });
  // A GET route for scraping the MMORPG website
  app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    request("http://www.mmorpg.com/news", function(error, response, html) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      const $ = cheerio.load(html);

      // Now, we grab every new_newspost class within an div tag, and do the following:
      $(".news_newspost").each(function(i, element) {
        // Save an empty result object
        const result = {};

        // Add the text and href of every title, info, link, img and save them as properties of the result object
        result.title = $(this)
          .children("a")
          .children("img")
          .attr("alt");
        result.info = $(this)
          .children("p")
          .text();
        result.link = $(this)
          .children("a")
          .attr("href");
        result.img = $(this)
          .children("a")
          .children("img")
          .attr("src");
        // Create a new Article using the `result` object built from scraping
        db.Article.update(
          { title: result.title },
          {
            $set: {
              title: result.title,
              info: result.info,
              img: result.img,
              link: result.link
            }
          },
          { upsert: true }
        )
          .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, send it to the client
            return res.json(err);
          });
      });
      res.redirect("/");
    });
  });
  app.get("/clear", function(req, res) {
    db.Article.remove().then(function(dbArticle) {
      res.redirect("/");
    });
  });
}; //end of export
