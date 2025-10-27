document.addEventListener('DOMContentLoaded', () => {
    const GITHUB_USER = 'Sainthe';
    const GITHUB_REPO = 'vips-disponibilidad-publica';
    const JSON_FILE_PATH = 'vips_disponibilidad.json';
    const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${JSON_FILE_PATH}`;
    const container = document.getElementById('vip-container');
    const loadingIndicator = document.getElementById('loading');
    const lastUpdatedElem = document.getElementById('last-updated');
    async function fetchVipData() {
        try {
            const metaResponse = await fetch(apiUrl);
            const metaData = await metaResponse.json();
            
            if (metaData.message) {
                throw new Error(metaData.message);
            }

            const content = new TextDecoder().decode(Uint8Array.from(atob(metaData.content), c => c.charCodeAt(0)));
            const data = JSON.parse(content);

            loadingIndicator.style.display = 'none';
            renderVipSpots(data);

        } catch (error) {
            loadingIndicator.textContent = 'Error al cargar los datos. Asegúrate de haber publicado la disponibilidad desde la aplicación.';
            console.error('Error fetching VIP data:', error);
        }
    }

    function renderVipSpots(data) {
        if (data.last_updated_utc) {
            const lastUpdate = new Date(data.last_updated_utc);
            lastUpdatedElem.textContent = `Datos actualizados el: ${lastUpdate.toLocaleString()}`;
        } else {
            lastUpdatedElem.textContent = 'No se pudo determinar la fecha de actualización.';
        }

        for (const sheetName in data) {
            if (sheetName === 'last_updated_utc') continue;

            const sheetData = data[sheetName];

            const sheetTitle = document.createElement('h1');
            sheetTitle.className = 'sheet-title';
            sheetTitle.textContent = sheetName;
            container.appendChild(sheetTitle);

            for (const locationName in sheetData) {
                const locationData = sheetData[locationName];
                
                const card = document.createElement('div');
                card.className = 'location-card';

                const title = document.createElement('h2');
                title.textContent = locationName;
                card.appendChild(title);

                const grid = document.createElement('div');
                grid.className = 'spots-grid';

                const allSpots = [
                    ...locationData.libres.map(spot => ({ name: spot, status: 'libre' })),
                    ...locationData.ocupados.map(spot => ({ name: spot, status: 'ocupado' }))
                ];

                allSpots.sort((a, b) => {
                    const numA = parseInt(a.name.match(/\d+/) ? a.name.match(/\d+/)[0] : 9999);
                    const numB = parseInt(b.name.match(/\d+/) ? b.name.match(/\d+/)[0] : 9999);
                    return numA - numB;
                });

                allSpots.forEach(spotInfo => {
                    const spotElement = document.createElement('div');
                    spotElement.className = `vip-spot ${spotInfo.status}`;
                    spotElement.textContent = spotInfo.name;
                    grid.appendChild(spotElement);
                });

                card.appendChild(grid);
                container.appendChild(card);
            }
        }
    }

    fetchVipData();
});
