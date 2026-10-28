
const pokemonList = document.querySelector("#pokemonList");
const filterButton = document.querySelector("#filterButton");
const resetButton = document.querySelector("#resetButton");
const pokkemonDetails = document.querySelector("#pokemonDetails");


async function getPokemon() {
    const name = document.querySelector("#search").value;
    const type = document.querySelector("#type").value;
    const attack = document.querySelector("#attack").value;

    const params = new URLSearchParams();

    if (name) {
        params.append("name", name);
    }

    if (type) {
        params.append("type", type);
    }

    if (attack !== "") {
        params.append("attack", attack);
    }
    console.log("Name:", name);
    console.log("Type:", type);
    console.log("Attack:", attack);
    console.log("API URL:", "http://localhost:3000/pokemon/filter?" + params.toString());

    const response = await fetch(
        "http://localhost:3000/pokemon/filter?" + params.toString()
    );

    if (!response.ok) {
        console.error("Kunne ikke hente Pokémon");
        return;
    }

    const pokemons = await response.json();

    const sort = document.querySelector("#sort").value;

    if (sort === "nameAZ") {
        pokemons.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sort === "nameZA") {
        pokemons.sort((a, b) => b.name.localeCompare(a.name));
    }

    if (sort === "hp") {
        pokemons.sort((a, b) => b.hp - a.hp);
    }

    if (sort === "attack") {
        pokemons.sort((a, b) => b.attack - a.attack);
    }

    if (sort === "speed") {
        pokemons.sort((a, b) => b.speed - a.speed);
    }

    pokemonList.replaceChildren();

    if (pokemons.length === 0) {
        pokemonList.textContent = "No Pokémon found.";
        return;
    }

    pokemons.forEach((pokemon) => {
        const card = document.createElement("div");

        card.addEventListener("click", () => {
            showPokemonDetails(pokemon);
        });

        const name = document.createElement("h2");
        name.textContent = pokemon.name;

        const type = document.createElement("p");
        type.textContent = "Type: " + pokemon.primary_type;

        const hp = document.createElement("p");
        hp.textContent = "HP: " + pokemon.hp;

        const attack = document.createElement("p");
        attack.textContent = "Attack: " + pokemon.attack;

        const defence = document.createElement("p");
        defence.textContent = "Defence: " + pokemon.defence;

        const specialAttack = document.createElement("p");
        specialAttack.textContent = "Special Attack: " + pokemon.special_attack;

        const specialDefence = document.createElement("p");
        specialDefence.textContent = "Special Defence: " + pokemon.special_defence;

        const speed = document.createElement("p");
        speed.textContent = "Speed: " + pokemon.speed;

        card.append(
            name,
            type,
            hp,
            attack,
            defence,
            specialAttack,
            specialDefence,
            speed
        );
        pokemonList.appendChild(card);
    });
}

function showPokemonDetails(pokemon) {
    pokemonDetails.replaceChildren();

    const title = document.createElement("h2");
    title.textContent = pokemon.name;

    const type = document.createElement("p");
    type.textContent = "Type: " + pokemon.primary_type;

    const hp = document.createElement("p");
    hp.textContent = "HP: " + pokemon.hp;

    const attack = document.createElement("p");
    attack.textContent = "Attack: " + pokemon.attack;

    const defence = document.createElement("p");
    defence.textContent = "Defence: " + pokemon.defence;

    const speed = document.createElement("p");
    speed.textContent = "Speed: " + pokemon.speed;

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";

    closeButton.addEventListener("click", () => {
        pokemonDetails.replaceChildren();
    });

    pokemonDetails.append(
        title,
        type,
        hp,
        attack,
        defence,
        speed,
        closeButton
    );
}

function resetFilters() {
    document.querySelector("#search").value = "";
    document.querySelector("#type").value = "";
    document.querySelector("#attack").value = "";
    document.querySelector("#sort").value = "";

    getPokemon();
}

filterButton.addEventListener("click", getPokemon);
resetButton.addEventListener("click", resetFilters);
document.querySelector("#sort").addEventListener("change", getPokemon);


getPokemon();

//*