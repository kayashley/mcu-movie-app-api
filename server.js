const express = require("express"); // importing express module
// logging middleware for express, morgan
const morgan = require("morgan"); // importing morgan module
const fs = require("fs"); // importing fs module
const path = require("path"); // importing path module
const bodyParser = require("body-parser"); // importing body-parser module
const uuid = require("uuid"); // importing uuid module, unique id

// integrating mongoose with REST API
const mongoose = require("mongoose"); // importing mongoose module
const Models = require("./models.js"); // importing models.js file
// importing mongoose models
const Movies = Models.Movie; // Movie model
const Users = Models.User; // User model
const Directors = Models.Director; // Director model
const Genres = Models.Genre; // Genre model

// Mongoose connects to db, "MCUmarvel-movie-api-db"
mongoose.connect("mongodb://127.0.0.1:27017/MCUmarvel-movie-api-db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// app = express functionality
const app = express(); // to config to web server
app.use(express.urlencoded({ extended: true })); // required for running express above V4.16

/*
write stream (in append mode)
log.txt file is created in root dir
 */
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

// invoke morgan middleware, logger
// 'common' logging: time, method/path, and status code
// 'combined' logging
app.use(morgan("combined", { stream: accessLogStream }));
app.use(express.static("public")); // send many static files
app.use(bodyParser.json()); // middleware that allows you to access the body of a req through 'req.body'

let MCUmovies = [
  {
    title: "Iron Man",
    directors: {
      name: "Jon Favreau",
      dob: "Oct 19, 1966",
      synopsis:
        "Actor, producer, writer and director Jon Favreau hit unlikely pay dirt when 'Swinger' (1996), his low-budget, autobiographical indie about struggling young actors, turned he and co-star/real-life best friend Vince Vaughn into hot property seemingly overnight. Favreau parlayed his rising profile into a number of supporting big-screen roles as cynical side men, but he was more anxious to get behind the camera and direct bigger features.",
    },
    genres: ["Action", "Adventure", "Sci-Fi", "Fantasy"],
  },
  {
    title: "The Incredible Hulk",
    directors: {
      name: "Louis Leterrier",
      dob: "Jun 17, 1973",
      synopsis:
        'Though Parisian director Louis Leterrier has only been making motion pictures for less than a decade, each production has been an action-packed blockbuster hit. He grew up in a film oriented family with a director father and costume designer mother. After studying film at the prestigious Tisch School of the Arts at NYU, Leterrier returned to his homeland and found himself as a production assistant for "Alien Resurrection."',
    },
    genres: ["Action", "Adventure", "Sci-Fi", "Fantasy"],
  },
  {
    title: "Iron Man 2",
    directors: {
      name: "Jon Favreau",
      dob: "Oct 19, 1966",
      synopsis:
        "Actor, producer, writer and director Jon Favreau hit unlikely pay dirt when 'Swinger' (1996), his low-budget, autobiographical indie about struggling young actors, turned he and co-star/real-life best friend Vince Vaughn into hot property seemingly overnight. Favreau parlayed his rising profile into a number of supporting big-screen roles as cynical side men, but he was more anxious to get behind the camera and direct bigger features.",
    },
    genres: ["Action", "Adventure", "Sci-Fi", "Fantasy"],
  },
];

// -- GET REQUESTS --

// Gets route for the root URL (default - home)
app.get("/", (req, res) => {
  res.send("Welcome to MCU marvel movie api!");
});

// Gets all users
app.get("/users", async (req, res) => {
  Users.find() // Users model
    .then((users) => {
      res.status(201).json(users); // responds with list of all users
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Error: " + error); // responds with error
    });
});

// Gets user by username
app.get("/users/:Username", async (req, res) => {
  Users.findOne({ Username: req.params.Username }) // finds username requested
    .then((user) => {
      res.json(user); // responds with all info of requested user
    })
    .catch((error) => {
      res.status(500).send("Error: " + error); // responds with error
    });
});

// Gets list of marvel movies
app.get("/movies", async (req, res) => {
  Movies.find() // Movies model
    .then((movies) => {
      res.status(201).json(movies); // responds with list of all movies using the movies model
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Error: " + error); // responds with error
    });
});

// Gets movie by title
app.get("/movies/:Name", async (req, res) => {
  Movies.findOne({ Name: req.params.Name }) // finds name of movie
    .then((movie) => {
      res.json(movie); // responds with info of requested movie
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Error: " + error); // responds with error
    });
});

// Gets data of director(s)
app.get("/directors/:Name", (req, res) => {
  Directors.findOne({ Name: req.params.Name }) // finds requested director
    .then((director) => {
      res.json(director); // responds with all info on requested director
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Error: " + error); // responds with error
    });
});

// Gets data of genres
app.get("/genres/:Name", (req, res) => {
  Genres.findOne({ Name: req.params.Name }) // finds requested genre
    .then((genre) => {
      res.json(genre); // responds with all info on requested genre
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Error: " + error); // responds with error
    });
});

// -- POST REQUESTS --

// Post allows users to register if not already existed
app.post("/users", async (req, res) => {
  Users.findOne({ Username: req.body.Username }) // checks to see if user already exists
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
            res.status(201).json(user); // responds with requested new user
          })
          .catch((error) => {
            console.log(error);
            res.status(500).send("Error: " + error); // responds with error
          });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Error: " + error); // responds with error
    });
});

// Puts updated information to users account: username, password, email, birthday
app.put("/users/:Username", async (req, res) => {
  // validate all params exist
  if (
    req.body &&
    req.body.Username &&
    req.body.Password &&
    req.body.Email &&
    req.body.Birthday
  ) {
    // define user object toi update
    const updatedUser = {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday,
    };
    // call findOneAndUpdate to pass the updatedUser object
    Users.findOneAndUpdate({ Username: req.params.Username }, updatedUser, {
      new: true,
    })
      .then((user) => {
        res.json(user); // user data returned from mongodb
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send("Error: " + error); // respond with error
      });
  } else {
    res.status(400).send("Invalid paramaters");
  }
});

// Posts movies to users favorites list
app.post("/users/:Username/movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate(
    // finds requested MovieID
    { Username: req.params.Username }, // finds requested username
    { $addToSet: { FavoriteMovies: req.params.MovieID } }, // adds MovieID to array
    { new: true }
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        // if user does not match requested
        return res.status(404).send("Error: User doesn't exist.");
      } else {
        res.json(updatedUser); // if user does match, sends back the updated user
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err); // responds with error
    });
});

// -- DELETE REQUESTS --

// Deletes movies from users favorites list
app.delete("/users/:Username/movies/:MovieID", async (req, res) => {
  Users.findOneAndUpdate(
    //finds requested user
    { Username: req.params.Username },
    { $pull: { FavoriteMovies: req.params.MovieID } }, // pulls the MovieID param from array
    { new: true }
  )
    .then((updatedUser) => {
      // if not requested user
      if (!updatedUser) {
        res.status(404).send("Error: User doesn't exist");
      } else {
        // if requested user matches respond with updated users json
        res.json(updatedUser);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err); // respond with error
    });
});

// Deletes users account permanently
app.delete("/users/:Username", async (req, res) => {
  await Users.findOneAndDelete({ Username: req.params.Username }) // finds requested user
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + " was not found"); // if user is not found
      } else {
        res.status(200).send(req.params.Username + " was deleted."); // if user is found then delete
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err); // responds with error
    });
});

// error-handling middleware, handles any errors
app.use((err, req, res, next) => {
  console.log(err.stack); // logs error in terminal through err.stack
  res.status(500).send("There was an error, please try again later.");
});

// listen for requests
app.listen(8080, () => {
  console.log("Listening on Port 8080");
});
