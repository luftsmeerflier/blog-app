const uuid = require('uuid');

// this module provides volatile storage, using a `Blog`
// and `Recipes` model. We haven't learned about databases yet,
// so for now we're using in-memory storage. This means each time
// the app stops, our storage gets erased.

// don't worry to much about how `Blog` and `Recipes`
// are implemented. Our concern in this example is with how
// the API layer is implemented, and getting it to use an
// existing model.


function StorageException(message) {
   this.message = message;
   this.name = "StorageException";
}

const Blog = {
  create: function(title, content) {
    console.log('Creating new blog post');
    const post = {
      title: title,
      id: uuid.v4(),
      content: content
    };
    this.posts[post.id] = post;
    return post;
  },
  get: function() {
    console.log('Retrieving shopping list posts');
    return Object.keys(this.posts).map(key => this.posts[key]);
  },
  delete: function(id) {
    console.log(`Deleting shopping list post \`${id}\``);
    delete this.posts[id];
  },
  update: function(updatedItem) {
    console.log(`Updating from models blog post with id:\`${updatedItem.id}\``);
    const {id} = updatedItem;
    if (!(id in this.posts)) {
      throw StorageException(
        `Can't update item \`${id}\` because doesn't exist.`)
    }
    this.posts[updatedItem.id] = updatedItem;
    return updatedItem;
  }
};

function createBlog() {
  const storage = Object.create(Blog);
  storage.posts = {};
  return storage;
}


module.exports = {
  Blog: createBlog(),
}
