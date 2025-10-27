document.addEventListener('DOMContentLoaded', () => {
    // --- VALORES CONFIGURADOS PARA TU PROYECTO ---
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
            // Hacemos una única petición para obtener el contenido del archivo
            const metaResponse = await fetch(apiUrl);
            const metaData = await metaResponse.json();
            
            // Si la respuesta de la API contiene un mensaje de error (como "Not Found")
            // esto significa que el archivo aún no existe.
            if (metaData.message) {
                throw new Error(metaData.message);
            }

            // Obtenemos y decodificamos el contenido del archivo
            const content = atob(metaData.content);
            const data = JSON.parse(content);

            // Ocultamos el indicador de carga y renderizamos los datos
            loadingIndicator.style.display = 'none';
            renderVipSpots(data);

        } catch (error) {
            // Si ocurre cualquier error, mostramos un mensaje útil al usuario
            loadingIndicator.textContent = 'Error al cargar los datos. Asegúrate de haber publicado la disponibilidad desde la aplicación.';
            console.error('Error fetching VIP data:', error);
        }
    }

    function renderVipSpots(data) {
        // Actualizamos la fecha usando el timestamp que viene dentro del archivo JSON
        if (data.last_updated_utc) {
            const lastUpdate = new Date(data.last_updated_utc);
            lastUpdatedElem.textContent = `Datos actualizados el: ${lastUpdate.toLocaleString()}`;
        } else {
            lastUpdatedElem.textContent = 'No se pudo determinar la fecha de actualización.';
        }

        // Iteramos sobre cada HOJA en los datos (ej. "LasCariñosas", "Furrys Spanish")
        for (const sheetName in data) {
            // Ignoramos la clave de la marca de tiempo para no tratarla como una hoja
            if (sheetName === 'last_updated_utc') continue; 

            const sheetData = data[sheetName];

            // Creamos un título principal para la hoja
            const sheetTitle = document.createElement('h1');
            sheetTitle.className = 'sheet-title';
            sheetTitle.textContent = sheetName;
            container.appendChild(sheetTitle);

            // Ahora, iteramos sobre cada UBICACIÓN dentro de esa hoja
            for (const locationName in sheetData) {
                const locationData = sheetData[locationName];
                
                const card = document.createElement('div');
                card.className = 'location-card';

                const title = document.createElement('h2');
                title.textContent = locationName;
                card.appendChild(title);

                const grid = document.createElement('div');
                grid.className = 'spots-grid';

                // Combinamos los espacios libres y ocupados en una sola lista para ordenarlos
                const allSpots = [
                    ...locationData.libres.map(spot => ({ name: spot, status: 'libre' })),
                    ...locationData.ocupados.map(spot => ({ name: spot, status: 'ocupado' }))
                ];

                // Ordenamos los espacios por su número para un orden lógico (ej: 2 antes de 10)
                allSpots.sort((a, b) => {
                    const numA = parseInt(a.name.match(/\d+/) ? a.name.match(/\d+/)[0] : 9999);
                    const numB = parseInt(b.name.match(/\d+/) ? b.name.match(/\d+/)[0] : 9999);
                    return numA - numB;
                });

                // Creamos el elemento visual para cada espacio
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

    // Iniciamos el proceso al cargar la página
    fetchVipData();
});
