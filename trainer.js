
const API_URL = "http://localhost:3000";

function getTrainerImage(name) {
    const trainerImages = {
        Ash: "Ash_OS_1.png",
        Misty: "Misty_OS_2.png",
        Brock: "Brock_OS_anime.png",
        Gary: "Gary_OS_anime.png",
        Jessie: "Jessie_OS_anime.png",
        James: "James_OS.png"
    };

    const filename = trainerImages[name];

    if (!filename) {
        return null;
    }
    return "image/misty.png";
}

let selectedTrainerId = null;
let allTrainersData = [];

// ======================================
// 1. HENT ALLE TRAINERS
// ======================================

function getTrainerImage(name) {
    const trainerImages = {
        Ash: "Ash_Ketchum",
        Misty: "Misty",
        Brock: "Brock",
        Gary: "Gary_Oak",
        Jessie: "Jessie",
        James: "James"
    };

    const page = trainerImages[name];

    if (!page) {
        return null;
    }

    return `https://en.wikipedia.org/wiki/Special:Redirect/file/${page}.png`;
}





async function loadTrainersSystem() {
    try {
        const response = await fetch(`${API_URL}/trainers`);

        if (!response.ok) {
            throw new Error("Kunne ikke hente trainers");
        }

        allTrainersData = await response.json();

        const listContainer = document.getElementById("trainerListContainer");
        const trainerDropdown = document.getElementById("selectTrainerDropdown");

        listContainer.replaceChildren();
        trainerDropdown.replaceChildren();

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Vælg trainer";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        trainerDropdown.appendChild(defaultOption);

        let totalPokemonCollected = 0;
        let largestCollectionCount = 0;
        let topTrainerName = "";

        for (const trainer of allTrainersData) {

            // Hent Pokémon for denne trainer
            const pokemonResponse = await fetch(
                `${API_URL}/trainers/${trainer.trainer_id}/pokemon`
            );

            if (!pokemonResponse.ok) {
                throw new Error(
                    `Kunne ikke hente Pokémon for ${trainer.trainer_name}`
                );
            }

            const pokemonData = await pokemonResponse.json();
            const count = pokemonData.length;

            totalPokemonCollected += count;

            if (count > largestCollectionCount) {
                largestCollectionCount = count;
                topTrainerName = trainer.trainer_name;
            }

            // Opret trainer-række
            const row = document.createElement("div");
            row.className = "trainer-row";

            if (selectedTrainerId === trainer.trainer_id) {
                row.classList.add("selected");
            }

            const trainerInfo = document.createElement("div");
            trainerInfo.className = "trainer-info";

            const avatar = document.createElement("img");
            avatar.className = "trainer-avatar";
            if (trainer.trainer_name === "Ash") {
                avatar.src = "image/ash.jpeg";
            } else if (trainer.trainer_name === "Brock") {
                avatar.src = "image/brock.jpeg";
            } else if (trainer.trainer_name === "Gary") {
                avatar.src = "image/gary.jpeg";
            }  else if (trainer.trainer_name === "Jessie") {
                avatar.src = "image/jessie.jpg";
            }else if (trainer.trainer_name === "James") {
                avatar.src = "image/james.png";
            } else {
                avatar.src = `image/${trainer.trainer_name.toLowerCase()}.png`;
            }
            avatar.alt = trainer.trainer_name;

            const trainerName = document.createElement("div");
            trainerName.className = "trainer-name";
            trainerName.textContent = trainer.trainer_name;

            trainerInfo.append(avatar, trainerName);

            const pokemonBadge = document.createElement("div");
            pokemonBadge.className = "pokemon-badge";
            pokemonBadge.textContent = `${count} Pokémon`;

            row.append(trainerInfo, pokemonBadge);

            row.addEventListener("click", () => {
                selectTrainer(
                    trainer.trainer_id,
                    trainer.trainer_name
                );
            });

            listContainer.appendChild(row);

            // Tilføj trainer til dropdown
            const option = document.createElement("option");
            option.value = trainer.trainer_id;
            option.textContent = trainer.trainer_name;

            trainerDropdown.appendChild(option);
        }

        // Opdater statistikker
        document.getElementById("statTrainersCount").textContent =
            allTrainersData.length;

        document.getElementById("statPokemonCount").textContent =
            totalPokemonCollected;

        document.getElementById("statTopTrainer").textContent =
            largestCollectionCount > 0
                ? `${topTrainerName} (${largestCollectionCount})`
                : "--";

        // Behold søgningen efter genindlæsning
        filterTrainers();

    } catch (error) {
        console.error("Fejl ved hentning af trainers:", error);
    }
}

// ======================================
// 2. VIS EN TRAINERS POKÉMON
// ======================================

async function selectTrainer(id, name) {
    selectedTrainerId = id;

    document.getElementById("selectedTrainerTitle").textContent = name;

    const rows = document.querySelectorAll(".trainer-row");

    rows.forEach(row => {
        const nameElement = row.querySelector(".trainer-name");

        if (nameElement && nameElement.textContent === name) {
            row.classList.add("selected");
        } else {
            row.classList.remove("selected");
        }
    });

    const cardsContainer = document.getElementById("pokemonCardsContainer");
    cardsContainer.replaceChildren();

    try {
        const response = await fetch(
            `${API_URL}/trainers/${id}/pokemon`
        );

        if (!response.ok) {
            throw new Error("Kunne ikke hente trainerens Pokémon");
        }

        const pokemons = await response.json();

        if (pokemons.length === 0) {
            const message = document.createElement("p");
            message.className = "empty-state";
            message.textContent =
                "Denne trainer ejer ikke nogen Pokémon endnu.";

            cardsContainer.appendChild(message);
            return;
        }

        pokemons.forEach(pokemon => {

            const card = document.createElement("div");
            card.className = "pokemon-display-card";

            const image = document.createElement("img");
            image.src =
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.pokedex_number}.png`;
            image.alt = pokemon.name;
            image.loading = "lazy";

            const pokemonName = document.createElement("div");
            pokemonName.className = "pokemon-display-name";
            pokemonName.textContent = pokemon.name;

            const pokemonNumber = document.createElement("div");
            pokemonNumber.className = "pokemon-display-number";
            pokemonNumber.textContent =
                `#${String(pokemon.pokedex_number).padStart(3, "0")}`;

            card.append(image, pokemonName, pokemonNumber);
            cardsContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Fejl ved hentning af Pokémon:", error);

        const message = document.createElement("p");
        message.className = "empty-state";
        message.textContent = "Kunne ikke hente Pokémon.";

        cardsContainer.appendChild(message);
    }
}

// ======================================
// 3. HENT ALLE POKÉMON TIL DROPDOWN
// ======================================

async function setupPokemonDropdown() {
    const dropdown = document.getElementById("selectPokemonDropdown");

    dropdown.replaceChildren();

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Vælg Pokémon";
    defaultOption.disabled = true;
    defaultOption.selected = true;

    dropdown.appendChild(defaultOption);

    try {
        const response = await fetch(`${API_URL}/pokemon/filter`);

        if (!response.ok) {
            throw new Error("Kunne ikke hente Pokémon");
        }

        const pokemons = await response.json();

        pokemons.sort((first, second) =>
            first.pokedex_number - second.pokedex_number
        );

        pokemons.forEach(pokemon => {
            const option = document.createElement("option");

            option.value = pokemon.pokedex_number;
            option.textContent =
                `${pokemon.name} (#${String(pokemon.pokedex_number).padStart(3, "0")})`;

            dropdown.appendChild(option);
        });

    } catch (error) {
        console.error("Fejl ved hentning af Pokémon-listen:", error);
    }
}

// ======================================
// 4. OPRET NY TRAINER
// ======================================

document.getElementById("createTrainerForm").addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const input = document.getElementById("newTrainerName");
        const name = input.value.trim();

        if (!name) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/trainer/new/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    hometown: null,
                    age: null
                })
            });

            if (!response.ok) {
                throw new Error("Kunne ikke oprette trainer");
            }

            input.value = "";

            await loadTrainersSystem();

            alert("Trainer er oprettet!");

        } catch (error) {
            console.error("Fejl ved oprettelse:", error);
            alert("Kunne ikke oprette trainer.");
        }
    }
);

// ======================================
// 5. TILFØJ POKÉMON TIL TRAINER
// ======================================

document.getElementById("addPokemonForm").addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const trainerSelect =
            document.getElementById("selectTrainerDropdown");

        const pokemonSelect =
            document.getElementById("selectPokemonDropdown");

        const trainerId = Number(trainerSelect.value);
        const pokedexNumber = Number(pokemonSelect.value);

        if (!trainerId || !pokedexNumber) {
            alert("Vælg både en trainer og en Pokémon.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/trainer/catch/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    trainer_id: trainerId,
                    pokedex_number: pokedexNumber
                })
            });

            if (!response.ok) {
                throw new Error("Kunne ikke tilføje Pokémon");
            }

            await loadTrainersSystem();

            // Opdater Pokémon-visningen
            const trainer = allTrainersData.find(
                trainer => trainer.trainer_id === trainerId
            );

            if (trainer) {
                await selectTrainer(
                    trainer.trainer_id,
                    trainer.trainer_name
                );
            }

            alert("Pokémon er tilføjet!");

        } catch (error) {
            console.error("Fejl ved tilføjelse:", error);
            alert("Kunne ikke tilføje Pokémon.");
        }
    }
);

// ======================================
// 6. SØG EFTER TRAINERS
// ======================================

function filterTrainers() {
    const searchTerm = document
        .getElementById("trainerSearch")
        .value
        .toLowerCase();

    const rows = document.querySelectorAll(".trainer-row");

    rows.forEach(row => {
        const trainerName = row
            .querySelector(".trainer-name")
            .textContent
            .toLowerCase();

        row.style.display =
            trainerName.includes(searchTerm) ? "flex" : "none";
    });
}

document.getElementById("trainerSearch").addEventListener(
    "input",
    filterTrainers
);

// ======================================
// 7. START SIDEN
// ======================================

document.addEventListener("DOMContentLoaded", async () => {
    await loadTrainersSystem();
    await setupPokemonDropdown();
});
