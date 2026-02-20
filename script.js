document.addEventListener('DOMContentLoaded', () => {
    // 1. SELECT UI ELEMENTS
    const uploadArea = document.querySelector('main .grid div:first-child');
    const statusText = uploadArea.querySelector('p');
    const searchInput = document.querySelector('input[type="text"]');
    const searchBtn = document.querySelector('input[type="text"] + button');
    
    // Select the feature cards for dynamic updates
    const featureCards = document.querySelectorAll('main .grid.grid-cols-2 > div');
    const cards = {
        ingredients: featureCards[0].querySelector('p'),
        class: featureCards[1].querySelector('p'),
        sideEffects: featureCards[2].querySelector('p'),
        safety: featureCards[3].querySelector('p')
    };

    // 2. SHARED UI UPDATE FUNCTION
    const updateUI = (data) => {
        statusText.innerText = `Identified: ${data.medicine_name}`;
        statusText.style.color = "#059669"; // Success Green

        cards.ingredients.innerText = data.active_compounds.join(', ');
        cards.class.innerText = `Class: ${data.therapeutic_class}`;
        cards.sideEffects.innerText = data.common_side_effects.slice(0, 2).join(', ') + '...';
        cards.safety.innerText = data.critical_warning;
    };

    // 3. LOGIC FOR SEARCH BY NAME
    const handleSearch = async () => {
        const query = searchInput.value.trim();
        if (!query) return;

        statusText.innerText = `Searching for ${query}...`;

        try {
            const response = await fetch('http://127.0.0.1:5000/search-by-name', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });
            const result = await response.json();
            if (result.status === "success") {
                updateUI(JSON.parse(result.data));
            }
        } catch (err) {
            statusText.innerText = "Check app.py server";
        }
    };

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });

    // 4. LOGIC FOR IMAGE SCAN
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            statusText.innerText = "Decoding strip... please wait.";
            const formData = new FormData();
            formData.append('image', e.target.files[0]);

            try {
                const response = await fetch('http://127.0.0.1:5000/decode-strip', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.status === "success") {
                    updateUI(JSON.parse(result.data));
                }
            } catch (err) {
                statusText.innerText = "Connection Failed";
            }
        }
    });
});
