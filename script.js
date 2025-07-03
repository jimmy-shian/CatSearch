document.addEventListener('DOMContentLoaded', () => {

    const characters = [
        { rarity: '稀有', name: '跳跳貓' }, { rarity: '稀有', name: '車輪貓' }, { rarity: '稀有', name: '美容貓' }, 
        { rarity: '稀有', name: '侏羅貓' }, { rarity: '稀有', name: '鬥士貓' }, { rarity: '稀有', name: '搖滾貓' }, 
        { rarity: '稀有', name: '人魚貓' }, { rarity: '稀有', name: '貓咪探測器(機器人)' }, { rarity: '稀有', name: '鬥牛士貓' }, 
        { rarity: '稀有', name: '貓咪格鬥家' }, { rarity: '稀有', name: '遠古的蛋:N101' },
        { rarity: '激稀有', name: '放浪貓弟(康康)' }, { rarity: '激稀有', name: '壽司貓' }, { rarity: '激稀有', name: '御宅貓' }, 
        { rarity: '激稀有', name: '暖桌貓(章魚壺)' }, { rarity: '激稀有', name: '快泳貓' }, { rarity: '激稀有', name: '舉重貓' }, 
        { rarity: '激稀有', name: '冰刀二人組' }, { rarity: '激稀有', name: '衝浪貓' }, { rarity: '激稀有', name: '業餘撐竿跳貓' }, 
        { rarity: '激稀有', name: '擊劍貓' }, { rarity: '激稀有', name: '土豪弟' }
    ];

    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const searchResultsDiv = document.getElementById('searchResults');
    const resultDisplay = document.getElementById('resultDisplay');

    const resetUI = () => {
        searchInput.value = '';
        clearSearchBtn.classList.add('hidden');
        searchResultsDiv.classList.add('hidden');
        resultDisplay.innerHTML = '';
        resultDisplay.className = '';
    };

    const handleSearch = () => {
        const searchTerm = searchInput.value.trim();
        const lowerCaseTerm = searchTerm.toLowerCase();

        // 控制清空按鈕的顯示
        clearSearchBtn.classList.toggle('hidden', searchTerm === '');

        // 清空舊結果
        searchResultsDiv.innerHTML = '';
        resultDisplay.innerHTML = '';
        resultDisplay.className = '';

        if (searchTerm === '') {
            searchResultsDiv.classList.add('hidden');
            return;
        }

        const matchedCharacters = characters.filter(char => char.name.toLowerCase().includes(lowerCaseTerm));

        // 更新中間的大字結果
        if (matchedCharacters.length > 0) {
            resultDisplay.textContent = '使用';
            resultDisplay.className = 'use';
        } else {
            resultDisplay.textContent = 'NP';
            resultDisplay.className = 'np';
        }

        // 更新搜尋提示列表
        if (matchedCharacters.length > 0) {
            matchedCharacters.forEach(char => {
                const item = document.createElement('div');
                item.className = 'search-item';
                item.dataset.name = char.name;
                item.innerHTML = `
                    <span class="char-rarity rarity-${char.rarity}">${char.rarity}</span>
                    <span class="char-name">${char.name}</span>
                `;
                searchResultsDiv.appendChild(item);
            });
            searchResultsDiv.classList.remove('hidden');
        } else {
            searchResultsDiv.classList.add('hidden');
        }
    };

    searchInput.addEventListener('input', handleSearch);

    clearSearchBtn.addEventListener('click', () => {
        resetUI();
        searchInput.focus();
    });

    searchResultsDiv.addEventListener('click', (event) => {
        const clickedItem = event.target.closest('.search-item');
        if (clickedItem) {
            searchInput.value = clickedItem.dataset.name;
            handleSearch(); // 更新UI
            searchResultsDiv.classList.add('hidden'); // 點選後隱藏列表
        }
    });

    // 點擊頁面其他地方時，隱藏搜尋結果列表
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.search-section')) {
            searchResultsDiv.classList.add('hidden');
        }
    });
});
