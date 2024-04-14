const express = require("express"); //include express in this app
const path = require("path"); //module to help woth file paths
const axios = require('axios');
require('dotenv').config();
const { MongoClient, ObjectId } = require("mongodb");
const dbUrl = process.env.DB_URL;
const apiKeyNews = process.env.NewApi;
const client = new MongoClient(dbUrl);
const app = express(); 
const port = process.env.PORT || "8888";
const PAGE_SIZE = 9;

//SET UP TEMPLATE ENGINE
app.set("views", path.join(__dirname, "views")); //set up  "views" setting to look in the <__dirname>/views folder
app.set("view engine", "pug"); //set an app to use Pug as template engine

//SET UP A PATH FOR STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//SET UP SOME PAGE ROUTES
app.get("/", async(request, response) => {
    let links = await getLinks();
    response.render("index", { MapKey: process.env.MapApi, title: "Home" , menu: links});
});

app.get("/shop", async (request, response) => {
    let links = await getLinks();
    response.render("shop", { title: "Shop", menu: links });
});

app.get("/shop/add-product", async (request, response) => {
    let links = await getLinks();
    response.render("add-product", { title: "Add Product", menu: links });
});

app.post("/shop/add-product/submit", async (request, response) => {

    let name = request.body.name;
    let price = request.body.price;
    let imageFilename = request.body.imageUrl;
    let imagePath = `/images/${imageFilename}`;
    //console.log(wgt);
    let newLink = {
        "name": name,
        "price": price,
        "imageUrl": imagePath
    };
    await addLink(newLink);
    response.redirect("/shop");
})
app.get("/about", (request, response) => {
    response.render("about", { title: "About" });
});



//route for the news page
app.get("/news", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * PAGE_SIZE;
        const newsUrl = `https://newsapi.org/v2/everything?q=home%20decor&apiKey=${apiKeyNews}&pageSize=${PAGE_SIZE}&page=${page}`;
        
        const { data } = await axios.get(newsUrl);

        res.render("news", { 
            title: "News", 
            articles: data.articles,
            currentPage: page,
            totalPages: Math.ceil(data.totalResults / PAGE_SIZE)
        });
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).send('Error fetching news');
    }
});


//Port Listening
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});

//Mongodb functions
async function connection() {
    db = client.db("shopdb");
    return db;
}

async function getLinks() {
    db = await connection();
    let results = db.collection("shopdata").find({});
    let res = await results.toArray();
    return res;
}

async function addLink(linkData) {
    db = await connection();
    let status = await db.collection("shopdata").insertOne(linkData);
    console.log(linkData);
}
