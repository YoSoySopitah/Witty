document.addEventListener('DOMContentLoaded', () => {
    const materiaSearch = document.getElementById('materia-search');
    const searchResults = document.getElementById('search-results');
    const asesoresContainer = document.getElementById('asesores-container');

    materiaSearch.addEventListener('input', async () => {
        const query = materiaSearch.value;
        
        if (query.length > 0) {
            const response = await fetch(`/buscar-materias?q=${query}`);
            const materias = await response.json();
            
            // Eliminar duplicados en materias
            const materiasUnicas = removeDuplicates(materias, 'id_materia');
            
            searchResults.innerHTML = materiasUnicas.map(materia => `
                <a href="#" data-materia-id="${materia.id_materia}">${materia.nombre_materia}</a>
            `).join('');
            
            // Manejar el clic en una materia
            searchResults.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const materiaId = e.target.getAttribute('data-materia-id');
                    const asesoresResponse = await fetch(`/asesores-por-materia/${materiaId}`);
                    const asesores = await asesoresResponse.json();
                    
                    // Eliminar duplicados
                    const asesoresUnicos = removeDuplicates(asesores, 'id_asesor');

                    // Mostrar los asesores
                    asesoresContainer.innerHTML = asesoresUnicos.map(asesor => `
                        <div class="asesor-card">
                            <h3>${asesor.nombre_asesor}</h3>
                            <p>${asesor.descripcion}</p>
                            <p>Disponibilidad: ${asesor.disponibilidad}</p>
                            <p>Correo: ${asesor.correoA}</p>
                            <a href="/ver-perfil-asesor/${asesor.id_asesores}"><h2>Ver perfil</h2></a>
                        </div>
                    `).join('');

                    // Ocultar la lista de resultados
                    searchResults.innerHTML = '';
                });
            });
        } else {
            searchResults.innerHTML = '';
            asesoresContainer.innerHTML = '';
        }
    });

    // Opcional: Ocultar la lista de resultados si el usuario hace clic fuera de la lista
    document.addEventListener('click', (event) => {
        if (!event.target.matches('#materia-search') && !event.target.closest('#search-results')) {
            searchResults.innerHTML = '';
        }
    });
});

function removeDuplicates(array, key) {
    return array.filter((value, index, self) => 
        index === self.findIndex((t) => (
            t[key] === value[key]
        ))
    );
}
