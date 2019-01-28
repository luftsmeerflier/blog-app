
const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const {Blog} = require('./models');

const jsonParser = bodyParser.json();
const app = express();

// log the http layer
app.use(morgan('common'));

// we're going to add some posts to Blog
// so there's some data to look at
Blog.create('First Post', 'FPBP');

// when the root of this router is called with GET, return
// all current Blog posts
app.get('/', (req, res) => {
  res.json(Blog.get());
});

app.post('/', jsonParser, (req, res) => {
  // ensure `title` and `content` are in request body
  const requiredFields = ['title', 'content'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  const post = Blog.create(req.body.title, req.body.content);
  res.status(201).json(post);
});

app.put('/:id', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'id'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  if (req.params.id !== req.body.id) {
    const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating from server blog post with id:\`${req.params.id}\``);
  let result = Blog.update({
    id: req.params.id,
    title: req.body.title,
    content: req.body.content
  });
  console.log("res body", res.body);
  res.json(result);
  res.status(200).end();
});

app.delete('/:id', (req, res) => {
  Blog.delete(req.params.id);
  console.log(`Deleted blog post id \`${req.params.id}\``);
  res.status(204).end();
});

let server;
// this function starts our server and returns a Promise.
// In our test code, we need a way of asynchronously starting
// our server, since we'll be dealing with promises there.
function runServer() {
  const port = process.env.PORT || 8080;
  return new Promise((resolve, reject) => {
    server = app
      .listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve(server);
      })
      .on("error", err => {
        reject(err);
      });
  });
}

// like `runServer`, this function also needs to return a promise.
// `server.close` does not return a promise on its own, so we manually
// create one.
function closeServer() {
  return new Promise((resolve, reject) => {
    console.log("Closing server");
    server.close(err => {
      if (err) {
        reject(err);
        // so we don't also call `resolve()`
        return;
      }
      resolve();
    });
  });
}
// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
