require("dotenv").config();
console.log("DBHOST:", process.env.DBHOST);
console.log("DBUSER:", process.env.DBUSER);
console.log("DBDATABASE:", process.env.DBDATABASE);

console.log('Happy developing ✨')
console.log('Happy developing ✨')
//npm install express --save
const express = require("express");
//npm install mysql2 --save
const mysql = require("mysql2");
//npm install cors --save
const cors = require("cors");

const app = express();

const port = 3000;

app.use(cors());

//Host, user, password database
const connection = mysql.createConnection({
    //process.env.KEYWORD
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DBDATABASE
});


//POKEMON

//* ALLE POKEMON MED DERES NAVNE OG STATS.
app.get(' /',(req, res) => {
    connection.query('SELECT* FROM pokemon',(error,results) => {
        if (error) {
            return res.status(500).send("Databasefejl");
        }

        res.json(results);
    });
});


//find en pokemon ud fra Navn
app.get('/single-safe', (req, res) => {
    const requestParameter = req.query.name;

    connection.query(
        'SELECT * FROM pokemon WHERE name = ?',
        [name],
        (error, results) => {
            if (error) {
                return res.status(500).json({
                    error: "Databasefejl"
                });
            }

            res.json(results);
        }
    );
});

//* LAV 3 FILTRE
/*
http://localhost:3000/pokemon/filter?type=Fire
http://localhost:3000/pokemon/filter?attack=80
http://localhost:3000/pokemon/filter?name=Pikachu
 */
app.get('/pokemon/filter', (req, res) => {
    const { name, type, attack } = req.query;

    let sql = 'SELECT * FROM pokemon WHERE 1=1';
    const values = [];

    if (name) {
        sql += ' AND name LIKE ?';
        values.push('%' + name + '%');
    }

    if (type) {
        sql += ' AND primary_type = ?';
        values.push(type);
    }

    if (attack !== undefined) {
        const minAttack = Number(attack);

        if (!Number.isFinite(minAttack)) {
            return res.status(400).send("Ugyldig attack-værdi");
        }

        sql += ' AND attack > ?';
        values.push(minAttack);
    }

    connection.query(sql, values, (error, results) => {
        if (error) {
            return res.status(500).send("Databasefejl");
        }

        res.json(results);
    });
});





app.listen(port, () =>{
    console.log(`Application is now running on port ${port}`);
});