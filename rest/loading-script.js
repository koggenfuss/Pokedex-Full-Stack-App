const express = require('express')
const axios = require('axios');
const cors = require("cors")
var Pokedex = require('pokedex-promise-v2');
let mysql = require("mysql");
const { response } = require('express');
var P = new Pokedex();

const app = express();
const port = 3000;

app.set('view engine', 'pug');
app.use(cors());

let pokemon;

class Pokemon {
  constructor(name, id, img, type) {
    this.name = name;
    this.id = id;
    this.img = img;
    this.type = type;
  }
}

let pokedex = [];
let pokeman;

let db = "Pokedex";
let con = mysql.createConnection({
  host:"localhost",
  user: "root",
  password: "",
  database: "Pokedex"
});

// If connection doesn't exist, connect to database, else already connected
 if (!con) {
   con.connect (function(err) {
  if (err) throw err;
  console.log("-------------------------------------------------------------Connected to MySQL Database");
  });
  } else {
  console.log("----------------------------------------------------------Already Connected to MySQL Database");
  }

  // Drop database if it exists
  let sql1 = "DROP DATABASE IF EXISTS Pokedex";
  con.query(sql1, function (err, result) {
    if (err) throw err;
    console.log("DROP DATABASE=  " + result);
  });

  // Create database if it doesn't exist
  let sql2 = "CREATE DATABASE IF NOT EXISTS Pokedex";
  con.query(sql2, function (err, result) {
    if (err) throw err;
    console.log("CREATE DATABASE=  " + result);
  });

  // Create table in database referencing the database
  let sql3 = "CREATE TABLE IF NOT EXISTS pokemon (id INT NOT NULL PRIMARY KEY, pokeName VARCHAR(128), img TEXT(65535), pokeType VARCHAR(32))";
  // Reference the database to create table in
  con.query('CREATE DATABASE IF NOT EXISTS ??', db, function(err, results) {
    if (err) {
      console.log('error in creating database', err);
      return;
    }
    console.log('created a new database');
    con.changeUser({
      database : db
    }, function(err) {
      if (err) {
        console.log('error in changing database', err);
        return;
      }
      con.query(sql3, function(err) {
        if (err) {
          console.log('error in creating tables', err);
          return;
        }
        console.log('created a new table');
      });
    });
  });




app.get('/', async (req, res) => {

    var interval = {
      limit: 151,
      offset: 0
    }

  //select list of 5 pokemon, with their names and urls
  //loop through each one's url to 
  //then access the rest of its data
  //create an instance of the pokemon class
  //fill it with the data from second API call
  //push that instance object to an array
  //loop restarts

  P.getPokemonsList(interval) // with Promise
  .then(function(response) {
    for ( let i = 0 ; i < response.results.length ; i++ ) {

      P.resource([response.results[i].url]) // with Promise
      .then(function(response) {
        pokeman = response.map(data => (
          {
            name: data.name,
            id: data.id,
            img: data.sprites["front_default"],
            type: data.types[0].type.name
          }
        ))
        // Add pokemon to database one by one. Use IGNORE to avoid adding duplicates
        let sql4 = `INSERT IGNORE INTO pokemon (id, pokeName, img, pokeType) VALUES ("${pokeman[0].id}", "${pokeman[0].name}", "${pokeman[0].img}", "${pokeman[0].type}")`;
        con.query(sql4, function (err, result) {
          if (err) throw err;
          console.log("INSERT INTO pokemon = " + result);
        });
        pokedex.push(pokeman); 
        return;
      
      }).catch(function(error) {
        console.log('There was an ERROR: ', error);
      })
    } 
    res.send( pokedex );

  }).catch(function(error) {
    console.log('There was an ERROR: ', error);
  });
});

app.listen(port, () => {
  console.log(`Example app listening at https://localhost:${port}`)
});