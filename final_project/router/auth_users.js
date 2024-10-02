const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const { use } = require('../../../../../practice project/Friends List Application Using Express Server with JWT/nodejs_PracticeProject_AuthUserMgmt/router/friends.js');
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username, password) => {
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
      return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
      return true;
  } else {
      return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: " Error logging in"});

  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'acces', {expiresIn: 60*60});

    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("Costumer succesfully logged in")
  } else {
    return res.status(404).json ({ message: "Invalid login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review; // Review is passed as a query parameter
  const username = req.session.authorization.username; // The logged-in user's username
  
  if (!review) {
    return res.status(400).json({ message: "Review cannot be empty" });
  }
  
  // Check if the book exists
  if (books[isbn]) {
    // Check if the book already has reviews
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
    
    // Add or modify the review by the username
    books[isbn].reviews[username] = review;
    
    return res.status(200).json({ message: `Review for book with ISBN ${isbn} added/updated successfully` });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if(books[isbn]) {
    let book = books[isbn];

    if (book.reviews[username]) {
      delete book.reviews[username];

      return res.status(200).json({ message: `Review for book with ISBN ${isbn} by user ${username} deleted. `});

    } else {
      return res.status(404).json({ message : `No review found for user ${username} on book with ISBN ${isbn}`});

    }
  } else {
    return res.status(404).json({message: `Book with ISBN ${isbn} not found.`})
  }

})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
