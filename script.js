document.addEventListener('DOMContentLoaded', () => {

    const GITHUB_USER = 'Sainthe';
    const GITHUB_REPO = 'vips-disponibilidad-publica';
    const JSON_FILE_PATH = 'vips_disponibilidad.json';

    const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${JSON_FILE_PATH}`;
    const container = document.getElementById('main-container');
    const loadingIndicator = document.getElementById('loading');
    const lastUpdatedElem = document.getElementById('last-updated');

    async function fetchVipData() {
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.message) {
                throw new Error(`GitHub API Error: ${data.message}`);
            }

            const decodedContent = new TextDecoder().decode(Uint8Array.from(atob(data.content), c => c.charCodeAt(0)));
            const jsonData = JSON.parse(decodedContent);

            loadingIndicator.style.display = 'none';
            renderAccordion(jsonData);

        } catch (error) {
            loadingIndicator.textContent = 'Error al cargar los datos. Asegúrate de haber publicado la disponibilidad desde la aplicación.';
            console.error('Error fetching VIP data:', error);
        }
    }

    function renderAccordion(data) {
        if (data.last_updated_utc) {
            const lastUpdate = new Date(data.last_updated_utc);
            lastUpdatedElem.textContent = `Datos actualizados el: ${lastUpdate.toLocaleString()}`;
        } else {
            lastUpdatedElem.textContent = 'No se pudo determinar la fecha de actualización.';
        }

        for (const sheetName in data) {
            if (sheetName === 'last_updated_utc') continue;

            const sheetData = data[sheetName];

            const header = document.createElement('button');
            header.className = 'community-header';
            header.textContent = sheetName;
            container.appendChild(header);

            const content = document.createElement('div');
            content.className = 'community-content';

            let hasFreeSpots = false;

            for (const locationName in sheetData) {
                const locationData = sheetData[locationName];


                if (locationData.libres && locationData.libres.length > 0) {
                    hasFreeSpots = true;

                    const card = document.createElement('div');
                    card.className = 'location-card';

                    const title = document.createElement('h2');
                    title.textContent = locationName;
                    card.appendChild(title);

                    const grid = document.createElement('div');
                    grid.className = 'spots-grid';

                    locationData.libres.sort((a, b) => {
                        const numA = parseInt(a.match(/\d+/) ? a.match(/\d+/)[0] : 9999);
                        const numB = parseInt(b.match(/\d+/) ? b.match(/\d+/)[0] : 9999);
                        return numA - numB;
                    });

                    locationData.libres.forEach(spotName => {
                        const spotElement = document.createElement('div');
                        spotElement.className = 'vip-spot'; 
                        spotElement.textContent = spotName;
                        grid.appendChild(spotElement);
                    });

                    card.appendChild(grid);
                    content.appendChild(card);
                }
            }

            if (!hasFreeSpots) {
                const noSpotsMessage = document.createElement('p');
                noSpotsMessage.textContent = 'No hay espacios libres en este momento.';
                noSpotsMessage.style.padding = '20px';
                content.appendChild(noSpotsMessage);
            }

            container.appendChild(content);

            header.addEventListener('click', function() {
                this.classList.toggle('active');
                const panel = this.nextElementSibling;
                if (panel.style.maxHeight) {
                    panel.style.maxHeight = null;
                } else {
                    panel.style.maxHeight = panel.scrollHeight + "px";
                }
            });
        }
    }

    fetchVipData();
});
