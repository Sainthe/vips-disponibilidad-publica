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

            for (const sheetName in data) {
                const sheetData = data[sheetName];
                
                const sheetSection = document.createElement('section');
                sheetSection.className = 'sheet-section';
                sheetSection.innerHTML = `<h2 class="sheet-title">${sheetName}</h2>`;
                
                const grid = document.createElement('div');
                grid.className = 'locations-grid';

                for (const locationName in sheetData) {
                    const locationData = sheetData[locationName];
                    
                    const card = document.createElement('div');
                    card.className = 'location-card';

                    let cardHTML = `<h3>${locationName}</h3>`;

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
                    grid.appendChild(card);
                }
                
                sheetSection.appendChild(grid);
                mainContainer.appendChild(sheetSection);
            }

            if (lastUpdated) {
                lastUpdatedSpan.textContent = formatLocalDate(lastUpdated);
            }
        })
        .catch(error => {
            console.error('Error al cargar los datos de disponibilidad:', error);
            mainContainer.innerHTML = `<p style="text-align: center; color: var(--occupied-color);">No se pudo cargar la información de disponibilidad. Inténtalo de nuevo más tarde.</p>`;
        });
});
