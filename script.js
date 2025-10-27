document.addEventListener('DOMContentLoaded', () => {
    // --- IMPORTANTE: CAMBIA ESTOS VALORES ---
    const GITHUB_USER = 'Sainthe';
    const GITHUB_REPO = 'vips-disponibilidad-publica';
    const JSON_FILE_PATH = 'vips_disponibilidad.json';
    // -----------------------------------------

    const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${JSON_FILE_PATH}`;
    const container = document.getElementById('vip-container');
    const loadingIndicator = document.getElementById('loading');
    const lastUpdatedElem = document.getElementById('last-updated');

    async function fetchVipData() {
        try {
            // Primero, obtenemos la fecha de la última modificación
            const metaResponse = await fetch(apiUrl);
            const metaData = await metaResponse.json();
            
            const lastCommitResponse = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/commits?path=${JSON_FILE_PATH}&page=1&per_page=1`);
            const lastCommitData = await lastCommitResponse.json();
            if (lastCommitData.length > 0) {
                const lastUpdate = new Date(lastCommitData[0].commit.committer.date);
                lastUpdatedElem.textContent = `Última actualización: ${lastUpdate.toLocaleString()}`;
            }

            // Luego, obtenemos el contenido del archivo
            const content = atob(metaData.content);
            const data = JSON.parse(content);

            loadingIndicator.style.display = 'none';
            renderVipSpots(data);

        } catch (error) {
            loadingIndicator.textContent = 'Error al cargar los datos. Por favor, intenta de nuevo más tarde.';
            console.error('Error fetching VIP data:', error);
        }
    }

    function renderVipSpots(data) {
        for (const locationName in data) {
            const locationData = data[locationName];
            
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

            // Ordenar numéricamente
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

    fetchVipData();
});