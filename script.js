document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const numberInput = document.getElementById('numberInput');
    const searchBtn = document.getElementById('searchBtn');
    const validationMessage = document.getElementById('validationMessage');
    const loader = document.getElementById('loader');
    const resultContainer = document.getElementById('resultContainer');
    const resultContent = document.getElementById('resultContent');
    const networkLogo = document.getElementById('networkLogo');
    const clearBtn = document.getElementById('clearBtn');
    const shareBtn = document.getElementById('shareBtn');
    const searchSound = document.getElementById('searchSound');
    const resultSound = document.getElementById('resultSound');
    
    // Network prefixes
    const networkPrefixes = {
        'jazz': ['300', '301', '302', '303', '304', '305', '306', '307', '308', '309'],
        'zong': ['310', '311', '312', '313', '314', '315', '316'],
        'warid': ['320', '321', '322', '323'],
        'ufone': ['331', '332', '333', '334', '335', '336', '337', '338', '339'],
        'telenor': ['340', '341', '342', '343', '344', '345', '346']
    };
    
    // Network logo colors
    const networkColors = {
        'jazz': '#FF5722',
        'zong': '#4CAF50',
        'warid': '#9C27B0',
        'ufone': '#FFC107',
        'telenor': '#2196F3'
    };
    
    // Network logo text
    const networkText = {
        'jazz': 'J',
        'zong': 'Z',
        'warid': 'W',
        'ufone': 'U',
        'telenor': 'T'
    };
    
    // Event Listeners
    searchBtn.addEventListener('click', searchNumber);
    clearBtn.addEventListener('click', clearResults);
    shareBtn.addEventListener('click', shareResults);
    numberInput.addEventListener('input', validateNumber);
    numberInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchNumber();
        }
    });
    
    // Validate Pakistani number
    function validateNumber() {
        const number = numberInput.value.trim();
        validationMessage.textContent = '';
        
        if (number === '') {
            return false;
        }
        
        // Check if input contains only digits
        if (!/^\d+$/.test(number)) {
            validationMessage.textContent = 'Please enter only numbers';
            numberInput.classList.add('error-shake');
            setTimeout(() => numberInput.classList.remove('error-shake'), 500);
            return false;
        }
        
        // Check length (11 digits for Pakistani numbers)
        if (number.length !== 11) {
            validationMessage.textContent = 'Pakistani numbers must be 11 digits';
            numberInput.classList.add('error-shake');
            setTimeout(() => numberInput.classList.remove('error-shake'), 500);
            return false;
        }
        
        // Check if starts with valid prefix (03)
        if (!number.startsWith('03')) {
            validationMessage.textContent = 'Pakistani numbers start with 03';
            numberInput.classList.add('error-shake');
            setTimeout(() => numberInput.classList.remove('error-shake'), 500);
            return false;
        }
        
        return true;
    }
    
    // Search number information
    function searchNumber() {
        // Play search sound
        searchSound.currentTime = 0;
        searchSound.play();
        
        if (!validateNumber()) {
            return;
        }
        
        const number = numberInput.value.trim();
        
        // Show loader and disable button
        loader.style.display = 'flex';
        resultContainer.style.display = 'none';
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SCANNING...';
        
        // Detect network
        const prefix = number.substring(0, 4);
        let network = 'Unknown';
        
        for (const [net, prefixes] of Object.entries(networkPrefixes)) {
            if (prefixes.some(p => number.startsWith(p))) {
                network = net;
                break;
            }
        }
        
        // Set network logo
        networkLogo.textContent = networkText[network] || '?';
        networkLogo.style.backgroundColor = networkColors[network] || '#9e9e9e';
        networkLogo.style.boxShadow = `0 0 15px ${networkColors[network] || '#9e9e9e'}`;
        networkLogo.style.display = 'flex';
        
        // API URL
        const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://fam-official.serv00.net/sim/api.php?num=${number}`)}`;
        
        // Fetch data from API
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Parse the JSON content from the API
                let apiResponse;
                try {
                    apiResponse = JSON.parse(data.contents);
                } catch (e) {
                    throw new Error('Invalid API response format');
                }
                
                // Check if the API returned an error
                if (apiResponse.status && apiResponse.status !== 'success') {
                    throw new Error(apiResponse.message || 'API returned an error');
                }
                
                // Hide loader and enable button
                loader.style.display = 'none';
                searchBtn.disabled = false;
                searchBtn.innerHTML = '<i class="fas fa-bolt"></i> TRACE NOW';
                
                // Play result sound
                resultSound.currentTime = 0;
                resultSound.play();
                
                // Display results
                displayResults(apiResponse, network);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                loader.style.display = 'none';
                searchBtn.disabled = false;
                searchBtn.innerHTML = '<i class="fas fa-bolt"></i> TRACE NOW';
                
                // Display error message
                resultContent.innerHTML = `
                    <div class="result-item" style="grid-column: 1 / -1;">
                        <div class="result-label">ERROR</div>
                        <div class="result-value">${error.message || 'Failed to fetch data. Please try again later.'}</div>
                    </div>
                `;
                resultContainer.style.display = 'block';
                resultContainer.classList.add('fade-in');
            });
    }
    
    // Display results
    function displayResults(data, network) {
        resultContent.innerHTML = '';
        
        // Check if data is nested in a 'data' property
        if (data.data && typeof data.data === 'object') {
            data = data.data;
        }
        
        // Add network information
        if (network !== 'Unknown') {
            resultContent.innerHTML += `
                <div class="result-item">
                    <div class="result-label">NETWORK</div>
                    <div class="result-value">${network.toUpperCase()}</div>
                </div>
            `;
        }
        
        // Add searched number
        resultContent.innerHTML += `
            <div class="result-item">
                <div class="result-label">NUMBER</div>
                <div class="result-value">${numberInput.value.trim()}</div>
            </div>
        `;
        
        // Handle array response
        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                resultContent.innerHTML += `
                    <div class="result-item" style="grid-column: 1 / -1;">
                        <div class="result-label">RESULT ${index + 1}</div>
                        <div class="result-value">${formatData(item)}</div>
                    </div>
                `;
            });
        } 
        // Handle object response
        else if (typeof data === 'object' && data !== null) {
            for (const [key, value] of Object.entries(data)) {
                // Skip empty values
                if (!value || value === 'N/A') continue;
                
                const label = key.replace(/_/g, ' ').toUpperCase();
                
                resultContent.innerHTML += `
                    <div class="result-item">
                        <div class="result-label">${label}</div>
                        <div class="result-value">${formatData(value)}</div>
                    </div>
                `;
            }
        } 
        // Handle other response types
        else {
            resultContent.innerHTML += `
                <div class="result-item" style="grid-column: 1 / -1;">
                    <div class="result-label">INFORMATION</div>
                    <div class="result-value">${formatData(data)}</div>
                </div>
            `;
        }
        
        // If no additional data was found
        if (resultContent.children.length <= 2) {
            resultContent.innerHTML += `
                <div class="result-item" style="grid-column: 1 / -1;">
                    <div class="result-label">STATUS</div>
                    <div class="result-value">NO ADDITIONAL INFORMATION FOUND FOR THIS NUMBER</div>
                </div>
            `;
        }
        
        // Show result container
        resultContainer.style.display = 'block';
        resultContainer.classList.add('fade-in');
        
        // Scroll to results
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Format data for display
    function formatData(data) {
        if (typeof data === 'object' && data !== null) {
            return JSON.stringify(data, null, 2);
        }
        return data;
    }
    
    // Clear results
    function clearResults() {
        resultContainer.style.display = 'none';
        numberInput.value = '';
        validationMessage.textContent = '';
        networkLogo.style.display = 'none';
        resultContent.innerHTML = '';
        searchBtn.disabled = false;
        searchBtn.innerHTML = '<i class="fas fa-bolt"></i> TRACE NOW';
    }
    
    // Share results via WhatsApp
    function shareResults() {
        const number = numberInput.value.trim();
        if (!number) return;
        
        let shareText = `*KING HACKER - SIM INFORMATION*\n\n`;
        shareText += `*Number:* ${number}\n\n`;
        
        // Get all result items
        const resultItems = resultContent.querySelectorAll('.result-item');
        resultItems.forEach(item => {
            const label = item.querySelector('.result-label').textContent;
            const value = item.querySelector('.result-value').textContent;
            shareText += `*${label}:* ${value}\n`;
        });
        
        shareText += `\n_Generated by King Hacker SIM Information System_`;
        
        // Create WhatsApp share link
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        
        // Open in new tab
        window.open(whatsappUrl, '_blank');
    }
    
    // Initialize
    clearResults();
});
