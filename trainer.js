let selectedTrainerId = null;
let allTrainersData = [];

// /1. GET & UPDATE: Indlæs og opdater dashboardet samt dropdowns
async function loadTrainersSystem() {
    try {
        // Hent alle trænere
        const tResponse = await fetch('/api/trainers');
        if (!tResponse.ok) throw new Error('Fejl under hentning af trænere');
        allTrainersData = await tResponse.json();

        let totalPokemonCollected = 0;
        let largestCollectionCount = -1;
        let topTrainerName = "Ingen";

        const listContainer = document.getElementById('trainerListContainer');
        const trainerDropdown = document.getElementById('selectTrainerDropdown');

        listContainer.innerHTML = '';
        trainerDropdown.innerHTML = '<option value="" disabled selected>Vælg trainer</option>';

        // Gennemgå trænere og hent deres holdstørrelse asynkront til statistikkerne
        for (const trainer of allTrainersData) {
            const pResponse = await fetch(`/api/trainers/${trainer.id}/pokemon`);
            const pData = pResponse.ok ? await pResponse.json() : [];
            const count = pData.length;

            totalPokemonCollected += count;
            if (count > largestCollectionCount) {
                largestCollectionCount = count;
                topTrainerName = trainer.name;
            }

            // Byg rækkerne i listen
            const row = document.createElement('div');
            row.className = `trainer-row ${selectedTrainerId === trainer.id ? 'selected' : ''}`;

            row.innerHTML = `
                <div class="trainer-info">
                    <div style="font-size: 24px;">👤</div>
                    <div class="trainer-name">${trainer.name}</div>
                </div>
                <div class="pokemon-badge">${count} Pokémon</div>
            `;

            row.addEventListener('click', () => selectTrainer(trainer.id, trainer.name));
            listContainer.appendChild(row);

            // Fyld drop-down menuen i formen
            const option = document.createElement('option');
            option.value = trainer.id;
            option.innerText = trainer.name;
            trainerDropdown.appendChild(option);
        }

        // Opdater Top-dashboard værdier
        document.getElementById('statTrainersCount').innerText = allTrainersData.length;
        document.getElementById('statPokemonCount').innerText = totalPokemonCollected;
        document.getElementById('statTopTrainer').innerText = largestCollectionCount > 0 ? `${topTrainerName} (${largestCollectionCount})` : '--';

    } catch (err) {
        console.error("Systemfejl:", err);
    }
}

// 2. GET: Hent og vis Pokémon som billed-kort
async function selectTrainer(id, name) {
    selectedTrainerId = id;
    document.getElementById('selectedTrainerTitle').innerText = name;

    // Fjern rekursivt kald til loadTrainersSystem for at undgå evighedsløkker
    const rows = document.querySelectorAll('.trainer-row');
    rows.forEach(row => {
        const trainerNameElement = row.querySelector('.trainer-name');
        if (trainerNameElement && trainerNameElement.innerText === name) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }
    });

    try {
        const response = await fetch(`/api/trainers/${id}/pokemon`);
        if (!response.ok) throw new Error('Kunne ikke hente hold.');
        const pokemons = await response.json();

        const cardsContainer = document.getElementById('pokemonCardsContainer');
        cardsContainer.innerHTML = '';

        if (pokemons.length === 0) {
            cardsContainer.innerHTML = '<p class="empty-state">Denne træner ejer ikke nogen Pokémon i øjeblikket.</p>';
            return;
        }

        pokemons.forEach(p => {
            const card = document.createElement('div');
            card.className = 'pokemon-display-card';

            // Formatér id'et til tre cifre (fx. #001) til displayet
            const formattedId = String(p.id).padStart(3, '0');

            // RETTET: Korrekt URL til det officielle PokéAPI Pokémon artwork
            const imageUrl = `https://githubusercontent.com{p.id}.png`;

            card.innerHTML = `
                <img src="${imageUrl}" onerror="this.src='https://githubusercontent.com{p.id}.png'" alt="${p.name}">
                <div class="pokemon-display-name">${p.name}</div>
                <div class="pokemon-display-number">#${formattedId}</div>
            `;
            cardsContainer.appendChild(card);
        });
    } catch (err) {
        console.error(err);
    }
}

// Fyld eksempelliste i Pokémon-dropdownen til formular
function setupPokemonDropdown() {
    const dropdown = document.getElementById('selectPokemonDropdown');
    const samplePokemon = [
        { id: 1, name: "Bulbasaur" }, { id: 4, name: "Charmander" },
        { id: 7, name: "Squirtle" }, { id: 25, name: "Pikachu" },
        { id: 133, name: "Eevee" }, { id: 16, name: "Pidgey" }
    ];
    samplePokemon.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.innerText = `${p.name} (#${String(p.id).padStart(3, '0')})`;
        dropdown.appendChild(opt);
    });
}

// 3. POST: Håndter ny trainer
document.getElementById('createTrainerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('newTrainerName');

    try {
        const response = await fetch('/api/trainers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: input.value })
        });
        if (response.ok) {
            input.value = '';
            await loadTrainersSystem();
        }
    } catch (err) {
        console.error(err);
    }
});

// 4. POST: Håndter tilføj Pokémon til trainer
document.getElementById('addPokemonForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const trainerSelect = document.getElementById('selectTrainerDropdown');
    const pokemonSelect = document.getElementById('selectPokemonDropdown');

    try {
        const response = await fetch('/api/trainer-pokemon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                trainerId: parseInt(trainerSelect.value),
                pokedexNumber: parseInt(pokemonSelect.value)
            })
        });

        if (response.ok) {
            const chosenId = parseInt(trainerSelect.value);
            await loadTrainersSystem(); // Opdater tælleren på listen med det samme
            if (chosenId === selectedTrainerId) {
                const currentName = document.getElementById('selectedTrainerTitle').innerText;
                selectTrainer(chosenId, currentName); // Genindlæs holdvisningen
            }
        }
    } catch (err) {
        console.error(err);
    }
});

// Søge-filtreringsfunktion til listen
document.getElementById('trainerSearch').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('.trainer-row');
    rows.forEach(row => {
        const nameElement = row.querySelector('.trainer-name');
        if (nameElement) {
            const name = nameElement.innerText.toLowerCase();
            row.style.display = name.includes(searchTerm) ? 'flex' : 'none';
        }
    });
});

// Kør opsætning ved start
window.addEventListener('DOMContentLoaded', () => {
    loadTrainersSystem();
    setupPokemonDropdown();
});
