const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });

  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({"username" : username, "password" : password});
      return res.status(200).json({message : "Customer successfully registered. Now you can login"});
      
    } else {
      return res.status(404).json({message : "Customer already exists!"})
    }
  }
  return res.status(404).json({message: "Unable to register customer."})
});

// Get the book list available in the shop
// public_users.get('/',function (req, res) {
//   //Write your code here
//   res.send(JSON.stringify(books,null,4));
// });

public_users.get('/', async function (req, res) {
  try{
    let bookList = await new Promise((resolve, reject) => {
      resolve(books);
    });
    res.status(200).send(JSON.stringify({books: bookList},null,4));

  } catch (error) {
    res.status(500).json({ message: "error fetching books"});
  }
  
});



// Get book details based on ISBN
// public_users.get('/isbn/:isbn',function (req, res) {
//  const isbn = req.params.isbn;
//  res.send(books[isbn]);
//  });

public_users.get('/isbn/:isbn', async function (req, res) {
  try {
      const isbn = req.params.isbn;
      let bookDetails = await new Promise((resolve, reject) => {
          if (books[isbn]) {
              resolve(books[isbn]);
          } else {
              reject("Book not found");
          }
      });
      res.status(200).json(bookDetails);
  } catch (error) {
      res.status(404).json({ message: error });
  }
});
  
// Get book details based on author
// public_users.get('/author/:author',function (req, res) {
//  const authorName = req.params.author.toLowerCase();
//  const filteredBooks = [];

//  // Iterate trough books object to find books by the requested author
//  Object.keys(books).forEach(bookId => {
//   if (books[bookId].author.toLowerCase() === authorName) {
//       filteredBooks.push({
//           isbn: bookId,
//           title: books[bookId].title,
//           reviews: books[bookId].reviews
//       });
//   }
//   if (filteredBooks.length > 0) {
//     res.status(200).json({ booksbyauthor: filteredBooks });
//   } else {
//     res.status(404).json({ message: "Author not found" });
//   }
//   });
// });

public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author;
    let result = await new Promise((resolve, reject) => {
      let filteredBooks = [];
      for (let bookId in books) {
        if (books[bookId].author === author) {
          filteredBooks.push({
            isbn: bookId,
            title: books[bookId].title,
            reviews: books[bookId].reviews
          });
        }
      }
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject("No books found by this author");
      }
    });
    res.status(200).json({ booksByAuthor: result }); 
  } catch (error) {
    res.status(404).json({ message: error });
  }
});


// Get all books based on title
// public_users.get('/title/:title',function (req, res) {
//   const titleInput = req.params.title.toLowerCase();
//   const filteredBooks = [];

//   Object.keys(books).forEach(bookId=> {
//     if (books[bookId].title.toLowerCase() === titleInput){
//       filteredBooks.push({
//         isbn: bookId,
//         author: books[bookId].author,
//         reviews: books[bookId].reviews
//       });
//     }
//   })
//  if (filteredBooks.length > 0) {
//   res.status(200).json({ booksbytitle: filteredBooks});

//  } else {
//   res.status(404).json({message: "Title not found"});
//  }
// });


public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    let result = await new Promise((resolve, reject) => {
      let filteredBooks = [];
      for (let bookId in books) {
        if (books[bookId].title === title) {
          filteredBooks.push({
            isbn: bookId,
            author: books[bookId].author,
            reviews: books[bookId].reviews
          });
        }
      }
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject("No books found by this title");
      }
    });
    res.status(200).json({ booksByTittle: result }); 
  } catch (error) {
    res.status(404).json({ message: error }); 
  }
});



//  Get book review
public_users.get('/review/:isbn',function (req, res) {
 const isbn = req.params.isbn;
 res.status(200).send(books[isbn].reviews)
});

module.exports.general = public_users;
