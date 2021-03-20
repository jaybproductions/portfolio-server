const express = require("express");
const serverless = require("serverless-http");
const app = express();
const cors = require("cors");
const http = require("http");
const bodyparser = require("body-parser");
app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
//firebase stuff
const admin = require("firebase-admin");
const serviceAccount = require("./portfolio-f88db-firebase-adminsdk-lqvwd-dc8ff0c5d5.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

var array = [];

app.get("/", (req, res) => {
  return res.send("Server is running");
});

app.get("/contactforms/email", (req, res) => {
  return res.send(array);
});

app.post("/contactforms/email", (req, res) => {
  var email = req.body;
  array.unshift(email);

  return res.send("dog added!");
});

app.get("/posts", (req, res) => {
  (async () => {
    try {
      let query = db.collection("blogposts");
      let response = [];
      await query.get().then((querySnapshot) => {
        let docs = querySnapshot.docs;
        for (let doc of docs) {
          const selectedItem = {
            title: doc.id,
            body: doc.data().data.data,
          };
          response.push(selectedItem);
        }
      });
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

app.get("/post/:postid", (req, res) => {
  console.log(req.params.postid);
  const document = db.collection("blogposts").doc(req.params.postid);
  document.get().then((doc) => {
    if (doc.exists) {
      const data = doc.data();
      return res.status(200).send(data);

      console.log("got doc");
    } else {
      console.log("doc not found");
    }
  });
});

app.post("/add/blog", (req, res) => {
  const post = req.body;
  const document = db.collection("blogposts");
  document.doc(req.body.data.title).set(req.body);
});

module.exports.handler = serverless(app);
