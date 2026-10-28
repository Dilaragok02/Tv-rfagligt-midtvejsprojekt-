
const pokemonList = document.querySelector("#pokemonList");
const filterButton = document.querySelector("#filterButton");

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

    pokemonList.replaceChildren();

    pokemons.forEach((pokemon) => {
        const card = document.createElement("div");

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

filterButton.addEventListener("click", getPokemon);

getPokemon();

