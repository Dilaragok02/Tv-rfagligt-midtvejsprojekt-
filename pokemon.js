
const pokemonList = document.querySelector("#pokemonList");
const filterButton = document.querySelector("#filterButton");
const resetButton = document.querySelector("#resetButton");
const pokemonCount = document.querySelector("#pokemonCount");
const paginationButtons = document.querySelector("#paginationButtons");

let allPokemon = [];
let currentPage = 1;
const pokemonPerPage = 8;

// Hent Pokémon fra backend
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

    try {
        const response = await fetch(
            "http://localhost:3000/pokemon/filter?" + params.toString()
        );

        if (!response.ok) {
            throw new Error("Could not fetch Pokémon");
        }

        allPokemon = await response.json();

        // Sortering
        const sort = document.querySelector("#sort").value;

        if (sort === "nameAZ") {
            allPokemon.sort((a, b) =>
                a.name.localeCompare(b.name));
        }

        if (sort === "nameZA") {
            allPokemon.sort((a, b) =>
                b.name.localeCompare(a.name));
        }

        if (sort === "hp") {
            allPokemon.sort((a, b) => b.hp - a.hp);
        }

        if (sort === "attack") {
            allPokemon.sort((a, b) => b.attack - a.attack);
        }

        if (sort === "speed") {
            allPokemon.sort((a, b) => b.speed - a.speed);
        }

        if (sort === "") {
            allPokemon.sort((a, b) =>
                a.pokedex_number - b.pokedex_number);
        }

        currentPage = 1;
        displayPokemon();

    } catch (error) {
        console.error(error);
        pokemonList.replaceChildren();
        pokemonCount.textContent = "";
        paginationButtons.replaceChildren();
        showTableMessage("Could not load Pokémon.");
    }
}

// Vis Pokémon i tabel
function displayPokemon() {
    pokemonList.replaceChildren();

    if (allPokemon.length === 0) {
        pokemonCount.textContent = "Viser 0 Pokémon";
        paginationButtons.replaceChildren();
        showTableMessage("No Pokémon found.");
        return;
    }

    const start = (currentPage - 1) * pokemonPerPage;
    const end = start + pokemonPerPage;

    const visiblePokemon = allPokemon.slice(start, end);

    visiblePokemon.forEach((pokemon) => {
        const row = document.createElement("tr");

        // Pokédex nummer
        const number = document.createElement("td");
        number.textContent = "#" +
            String(pokemon.pokedex_number).padStart(3, "0");


        // Navn og Pokémon-billede
        const name = document.createElement("td");
        name.classList.add("pokemon-name");

        const nameContainer = document.createElement("div");
        nameContainer.classList.add("pokemon-name-container");

        const image = document.createElement("img");

        image.src =
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/"
            + pokemon.pokedex_number + ".png";

        image.alt = pokemon.name;
        image.classList.add("pokemon-image");
        image.loading = "lazy";

        const nameText = document.createElement("span");
        nameText.textContent = pokemon.name;

        nameContainer.append(image, nameText);
        name.appendChild(nameContainer);


        // Type
        const type = document.createElement("td");

        const primaryType = document.createElement("span");
        primaryType.textContent = pokemon.primary_type;
        primaryType.classList.add(
            "type-badge",
            pokemon.primary_type.toLowerCase()
        );

        type.appendChild(primaryType);

        if (pokemon.secondary_type) {
            const secondaryType = document.createElement("span");
            secondaryType.textContent = pokemon.secondary_type;
            secondaryType.classList.add(
                "type-badge",
                pokemon.secondary_type.toLowerCase()
            );
            type.appendChild(secondaryType);
        }

        // Stats
        const hp = document.createElement("td");
        hp.textContent = pokemon.hp;

        const attack = document.createElement("td");
        attack.textContent = pokemon.attack;

        const defence = document.createElement("td");
        defence.textContent = pokemon.defence;

        const specialAttack = document.createElement("td");
        specialAttack.textContent = pokemon.special_attack;

        const specialDefence = document.createElement("td");
        specialDefence.textContent = pokemon.special_defence;

        const speed = document.createElement("td");
        speed.textContent = pokemon.speed;

        // Se detaljer
        const detailsCell = document.createElement("td");
        const detailsButton = document.createElement("button");

        detailsButton.textContent = "Se detaljer";
        detailsButton.classList.add("details-button");

        detailsButton.addEventListener("click", () => {
            showPokemonDetails(pokemon, row);
        });

        detailsCell.appendChild(detailsButton);

        row.append(
            number,
            name,
            type,
            hp,
            attack,
            defence,
            specialAttack,
            specialDefence,
            speed,
            detailsCell
        );

        pokemonList.appendChild(row);
    });

    pokemonCount.textContent =
        "Viser " + visiblePokemon.length +
        " af " + allPokemon.length + " Pokémon";

    displayPagination();
}

// Besked i tabellen
function showTableMessage(message) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 10;
    cell.textContent = message;

    row.appendChild(cell);
    pokemonList.appendChild(row);
}

// Sidetal

function displayPagination() {
    paginationButtons.replaceChildren();

    const totalPages = Math.ceil(allPokemon.length / pokemonPerPage);

    function addButton(text, page, disabled = false) {
        const button = document.createElement("button");

        button.textContent = text;
        button.disabled = disabled;

        if (page === currentPage && !disabled) {
            button.classList.add("active-page");
        }

        button.addEventListener("click", () => {
            currentPage = page;
            displayPokemon();
        });

        paginationButtons.appendChild(button);
    }

    // Forrige side
    addButton("‹", currentPage - 1, currentPage === 1);

    const visiblePages = new Set([
        1,
        totalPages,
        currentPage - 1,
        currentPage,
        currentPage + 1
    ]);

    if (currentPage <= 4) {
        for (let i = 1; i <= Math.min(5, totalPages); i++) {
            visiblePages.add(i);
        }
    }

    const pages = [...visiblePages]
        .filter(page => page >= 1 && page <= totalPages)
        .sort((a, b) => a - b);

    pages.forEach((page, index) => {
        if (index > 0 && page - pages[index - 1] > 1) {
            const dots = document.createElement("span");
            dots.textContent = "...";
            dots.classList.add("pagination-dots");
            paginationButtons.appendChild(dots);
        }

        addButton(String(page), page);
    });

    // Næste side
    addButton("›", currentPage + 1, currentPage === totalPages);
}


// Detaljevisning

function showPokemonDetails(pokemon, row) {

    // Find en detaljevisning, der allerede er åben
    const existingDetails = document.querySelector(".pokemon-detail-row");

    if (existingDetails) {
        const samePokemon = existingDetails.previousElementSibling === row;

        existingDetails.remove();

        // Hvis man klikker på samme Pokémon igen, lukkes den
        if (samePokemon) {
            return;
        }
    }

    // Opret en ny tabelrække
    const detailRow = document.createElement("tr");
    detailRow.classList.add("pokemon-detail-row");

    const detailCell = document.createElement("td");
    detailCell.colSpan = 10;

    const detailBox = document.createElement("div");
    detailBox.classList.add("pokemon-detail-box");


    // Pokémon-navn og nummer
    const title = document.createElement("h2");

    title.textContent = "#" +
        String(pokemon.pokedex_number).padStart(3, "0") +
        " " + pokemon.name;

    // Pokémon-typer
    const types = document.createElement("div");
    types.classList.add("pokemon-detail-types");

    [pokemon.primary_type, pokemon.secondary_type]
        .filter(Boolean)
        .forEach(type => {
            const badge = document.createElement("span");

            badge.textContent = type;
            badge.classList.add("type-badge", type.toLowerCase());

            types.appendChild(badge);
        });

    // Pokémon-stats
    const statsContainer = document.createElement("div");
    statsContainer.classList.add("pokemon-detail-stats");

    const stats = [
        ["HP", pokemon.hp],
        ["Attack", pokemon.attack],
        ["Defense", pokemon.defence],
        ["Sp. Atk", pokemon.special_attack],
        ["Sp. Def", pokemon.special_defence],
        ["Speed", pokemon.speed]
    ];

    stats.forEach(([label, value]) => {
        const statBox = document.createElement("div");
        statBox.classList.add("pokemon-stat-box");

        const statLabel = document.createElement("span");
        statLabel.textContent = label;

        const statValue = document.createElement("strong");
        statValue.textContent = value;

        statBox.append(statLabel, statValue);
        statsContainer.appendChild(statBox);
    });

    // Luk-knap
    const closeButton = document.createElement("button");

    closeButton.textContent = "Luk";
    closeButton.classList.add("pokemon-detail-close");

    closeButton.addEventListener("click", () => {
        detailRow.remove();
    });

    // Saml alle elementerne
    detailBox.append(
        title,
        types,
        statsContainer,
        closeButton
    );

    detailCell.appendChild(detailBox);
    detailRow.appendChild(detailCell);

    // Vis detaljerne direkte under den valgte Pokémon
    row.after(detailRow);
}


// Nulstil filtre
function resetFilters() {
    document.querySelector("#search").value = "";
    document.querySelector("#type").value = "";
    document.querySelector("#attack").value = "";
    document.querySelector("#sort").value = "";

    getPokemon();
}

// Event listeners
filterButton.addEventListener("click", getPokemon);
resetButton.addEventListener("click", resetFilters);

document.querySelector("#sort").addEventListener(
    "change",
    getPokemon
);

getPokemon();
