console.log('Happy developing ✨')
console.log('Happy developing ✨')
//npm install express --save
const express = require("express");
//npm install mysql2 --save
const mysql = require("mysql2");
//npm install cors --save
const cors = require("cors");

require("dotenv").config();
console.log("DBHOST:", process.env.DBHOST);
console.log("DBUSER:", process.env.DBUSER);
console.log("DBDATABASE:", process.env.DBDATABASE);

const app = express();
app.use(express.json());

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


//* ALLE POKEMON MED DERES NAVNE OG STATS.
app.get('/',(req, res) => {
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
            return res.status(500).send("Error");
        }

        res.json(results);
    });
});
// Trainer - Get og POST


// Hent en træners Pokémon

// Hent en træners Pokémon
app.get('/trainers/:id/pokemon', (req, res) => {
    const trainerId = req.params.id;

    const sql = `
        SELECT pokemon.*
        FROM pokemon
        JOIN trainer_pokemon
            ON pokemon.pokedex_number = trainer_pokemon.pokedex_number
        WHERE trainer_pokemon.trainer_id = ?
    `;

    connection.query(sql, [trainerId], (err, results) => {
        if (err) {
            console.error("SQL-fejl:", err);

            return res.status(500).json({
                error: "Kunne ikke hente trænerens Pokémon"
            });
        }

        res.json(results);
    });
});





















//*Trainers

app.get('pokemon/',(req, res) => {
    connection.query('SELECT* FROM Trainers',(error,results) => {
        if (error) {
            return res.status(500).send("Databasefejl");
        }

        res.json(results);
    });
});

//* Trainers
// Hent alle trainers
app.get('/trainers',(req,res)=> {
    connection.query(
        'SELECT* FROM trainer',
        (error, results)=> {
               if (error) {
                   return res.status(500).json({
                       error: "Databasefejl"
                   });
               }

                   res.json(results);
            }
    );
        });


// Hent en trainers Pokemon
app.get('/trainers/:id/pokemon', (req, res) => {
    const trainerId = req.params.id;
    const sql = `
    SELECT p.*
    FROM pokemon.pokemon p
    JOIN pokemon.trainer_pokemon tp
        ON p.pokedex_number = tp.pokedex_number
    WHERE tp.trainer_id = ?
`;


    connection.query(sql, [trainerId], (error, results) => {
        if (error) {
            console.error("SQL-fejl:", error);
            return res.status(500).json({
                error: "Error"
            });
        }

        res.json(results);
    });
});









// Dashboard Get - Post


//Hvilken pokemon-type har den højeste gennemsnitlige attack?
// 1. Gennemsnitlig attack pr. type


app.get('/dashboard/average-attack', (req, res) => {
    const sql = `SELECT primary_type AS type,AVG(attack) AS average_attack FROM pokemon
        GROUP BY primary_type
        ORDER BY average_attack DESC`;

    connection.query(sql, (error, results) => {
        if (error) {
            console.error("SQL-fejl:", error);
            return res.status(500).send("Error");
        }

        res.json(results);
    });
});

// Hvor mange Pokemons findes der af hver type?

app.get('/dashboard/type-distribution', (req, res) => {
    const sql = `SELECT primary_type AS type,COUNT(*) AS pokemon_count FROM pokemon
        GROUP BY primary_type
        ORDER BY pokemon_count DESC`;

    connection.query(sql, (error, results) => {
        if (error) {
            console.error("SQL-fejl:", error);
            return res.status(500).send("Kend din pokemons bedre");
        }

        res.json(results);
    });
});


// Hvilke trainers har flest Pokémon?


app.get('/dashboard/most-trainers', (req, res) => {
    const sql = `SELECT trainer.trainer_id,trainer.trainer_name, COUNT(trainer_pokemon.pokedex_number) AS pokemon_count
        FROM trainer
            JOIN trainer_pokemon
        ON trainer.trainer_id = trainer_pokemon.trainer_id
        GROUP BY trainer.trainer_id, trainer.trainer_name
        ORDER BY pokemon_count DESC
        LIMIT 5`;

    connection.query(sql, (error, results) => {
        if (error) {
            console.error("SQL-fejl:", error);
            return res.status(500).send("Du har fanget 0 pokemon");
        }

        res.json(results);
    });
});



/* Antal moves pr. Pokemon */

app.get('/dashboard/moves-per-pokemon', (req, res) => {
    const sql = `SELECT pokemon.pokedex_number,pokemon.name AS pokemon_name,COUNT(pokemon_has_moves.move_id) AS move_count
        FROM pokemon
            JOIN pokemon_has_moves
            ON pokemon.pokedex_number = pokemon_has_moves.pokedex_number
        GROUP BY pokemon.pokedex_number, pokemon.name
        HAVING COUNT(pokemon_has_moves.move_id) > 0
        ORDER BY move_count DESC, pokemon.name ASC
    `;

    connection.query(sql, (error, results) => {
        if (error) {
            console.error("SQL-fejl i moves-per-pokemon:", error);
            return res.status(500).json({
                error: "Kunne ikke hente antal moves per Pokémon"
            });
        }

        res.json(results);
    });
});


    app.listen(port, () =>{
    console.log(`Application is now running on port ${port}`);
});