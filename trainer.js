fetch(`/trainers/${trainerId}/pokemon`)
    .then(response => response.json())
    .then(pokemon => {
        // Vis Pokémon på siden
    });