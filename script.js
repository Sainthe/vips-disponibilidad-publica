document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('main-container');
    const lastUpdatedSpan = document.getElementById('last-updated');

    function formatLocalDate(isoString) {
        if (!isoString) return 'No disponible';
        const date = new Date(isoString);
        return date.toLocaleString(undefined, { 
            year: 'numeric', month: 'long', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    }

    fetch('availability.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error de red: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            mainContainer.innerHTML = '';

            const lastUpdated = data.last_updated_utc;
            delete data.last_updated_utc;

            // --- INICIO DE LA LÓGICA CORREGIDA ---
            for (const sheetName in data) {
                const sheetData = data[sheetName];
                
                const accordionItem = document.createElement('div');
                accordionItem.className = 'accordion-item';

                const button = document.createElement('button');
                button.className = 'accordion-button';
                button.textContent = sheetName;

                const panel = document.createElement('div');
                panel.className = 'accordion-panel';
                
                // 1. Crear el contenedor de la grilla para las tarjetas
                const grid = document.createElement('div');
                grid.className = 'locations-grid';

                // 2. Iterar sobre cada ubicación para crear una TARJETA, no una lista
                for (const locationName in sheetData) {
                    const locationData = sheetData[locationName];
                    
                    const card = document.createElement('div');
                    card.className = 'location-card';

                    let cardHTML = `<h3>${locationName}</h3>`;

                    // Sección de espacios libres (con el estilo de "píldoras")
                    if (locationData.libres && locationData.libres.length > 0) {
                        cardHTML += `
                            <div class="status-section">
                                <h4 class="free">✅ Libres (${locationData.libres.length})</h4>
                                <ul class="slots-list">
                                    ${locationData.libres.map(slot => `<li class="slot free">${slot}</li>`).join('')}
                                </ul>
                            </div>
                        `;
                    }

                    // Sección de espacios ocupados (con el estilo de "píldoras")
                    if (locationData.ocupados && locationData.ocupados.length > 0) {
                        cardHTML += `
                            <div class="status-section">
                                <h4 class="occupied">❌ Ocupados (${locationData.ocupados.length})</h4>
                                <ul class="slots-list">
                                    ${locationData.ocupados.map(slot => `<li class="slot occupied">${slot}</li>`).join('')}
                                </ul>
                            </div>
                        `;
                    }
                    
                    card.innerHTML = cardHTML;
                    grid.appendChild(card); // Añadir la tarjeta a la grilla
                }
                
                panel.appendChild(grid); // Añadir la grilla completa al panel

                button.addEventListener('click', function() {
                    this.classList.toggle('active');
                    if (panel.style.maxHeight) {
                        panel.style.maxHeight = null;
                        panel.style.padding = "0 20px";
                    } else {
                        // Añadimos 40px para el padding vertical del panel
                        panel.style.maxHeight = panel.scrollHeight + 40 + "px";
                        panel.style.padding = "20px";
                    }
                });

                accordionItem.appendChild(button);
                accordionItem.appendChild(panel);
                mainContainer.appendChild(accordionItem);
            }
            // --- FIN DE LA LÓGICA CORREGIDA ---

            if (lastUpdated) {
                lastUpdatedSpan.textContent = formatLocalDate(lastUpdated);
            }
        })
        .catch(error => {
            console.error('Error al cargar los datos de disponibilidad:', error);
            mainContainer.innerHTML = `<p style="text-align: center; color: var(--occupied-color);">No se pudo cargar la información de disponibilidad. Inténtalo de nuevo más tarde.</p>`;
        });
});
