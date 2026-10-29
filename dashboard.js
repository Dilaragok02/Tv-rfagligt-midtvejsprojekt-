
const API_URL = "http://localhost:3000";

// Data hentes fra api herunder
async function hentData(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`);

    if (!response.ok) {
        throw new Error(`Kunne ikke hente ${endpoint}`);
    }

    return await response.json();
}

// 1 Diagram - Antal Pokémon fordelt på type
async function visTypeDiagram() {
    const data = await hentData("/dashboard/type-distribution");

    new Chart(document.getElementById("typeChart"), {
        type: "bar",
        data: {
            labels: data.map(pokemon => pokemon.type),
            datasets: [{
                label: "Antal Pokémon",
                data: data.map(pokemon => Number(pokemon.pokemon_count)),
                backgroundColor: [
                    "#ADD8E6",
                    "#F4B8B8",
                    "#A8E6B0",
                    "#F9E79F",
                    "#C9B6F2",
                    "#FFC999"
                ]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// 2 Diagram - Gennemsnitlig attack pr. type
async function visAttackDiagram() {
    const data = await hentData("/dashboard/average-attack");

    new Chart(document.getElementById("attackChart"), {
        type: "bar",
        data: {
            labels: data.map(pokemon => pokemon.type),
            datasets: [{
                label: "Gennemsnitlig attack",
                data: data.map(pokemon => Number(pokemon.average_attack)),
                backgroundColor: "#ADD8E6"
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 3 statistisk - Trainers med flest Pokémon
async function visTrainerListe() {
    const data = await hentData("/dashboard/most-trainers");
    const liste = document.getElementById("trainerList");

    liste.innerHTML = "";

    if (data.length === 0) {
        liste.textContent = "Der er ingen trainers at vise.";
        return;
    }

    data.forEach(trainer => {
        const li = document.createElement("li");

        li.textContent =
            `${trainer.trainer_name} – ${trainer.pokemon_count} Pokémon`;

        liste.appendChild(li);
    });
}

// 4 statistik - moves pr. pokemon

async function visMovesPokemonDiagram() {
    const data = await hentData("/dashboard/moves-per-pokemon");

    new Chart(document.getElementById("movesPokemonChart"), {
        type: "bar",
        data: {
            labels: data.map(pokemon => pokemon.pokemon_name),
            datasets: [{
                label: "Antal moves",
                data: data.map(pokemon => Number(pokemon.move_count)),
                backgroundColor: "#F4B8B8"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Alle 3 statistikker
async function indlaesDashboard() {
    const status = document.getElementById("status");

    try {
        status.textContent = "";

        await Promise.all([
            visTypeDiagram(),
            visAttackDiagram(),
            visTrainerListe(),
            visMovesPokemonDiagram()
        ]);
    } catch (error) {
        console.error("Fejl", error);

        status.textContent =
            "Kunne ikke hente statistikker. Tjek om at API-serveren køre. ";
    }
}

indlaesDashboard();
