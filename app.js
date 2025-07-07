document.addEventListener('DOMContentLoaded', async () => {
    // --- 資料定義 ---
    const specifiedCats = [
        { rarity: '稀有', name: '跳跳貓' }, 
        { rarity: '稀有', name: '車輪貓' }, 
        { rarity: '稀有', name: '美容貓' },
        { rarity: '稀有', name: '侏羅貓' }, 
        { rarity: '稀有', name: '鬥士貓' }, 
        { rarity: '稀有', name: '搖滾貓' },
        { rarity: '稀有', name: '人魚貓' }, 
        { rarity: '稀有', name: '貓咪探測器' }, 
        { rarity: '稀有', name: '鬥牛士貓' },
        { rarity: '稀有', name: '貓咪格鬥家' }, 
        { rarity: '稀有', name: '遠古的蛋:N101' },
        { rarity: '激稀有', name: '放浪貓弟' }, 
        { rarity: '激稀有', name: '壽司貓' }, 
        { rarity: '激稀有', name: '御宅貓' },
        { rarity: '激稀有', name: '暖桌貓' }, 
        { rarity: '激稀有', name: '快泳貓' }, 
        { rarity: '激稀有', name: '舉重貓' },
        { rarity: '激稀有', name: '冰刀二人組' }, 
        { rarity: '激稀有', name: '衝浪貓' }, 
        { rarity: '激稀有', name: '業餘撐杆跳貓' },
        { rarity: '激稀有', name: '擊劍貓' }, 
        { rarity: '激稀有', name: '土豪弟' }
    ];

    // --- DOM 元素獲取 ---
    const mainTitle = document.getElementById('main-title');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const searchResultsDiv = document.getElementById('searchResults');
    const resultDisplay = document.getElementById('resultDisplay');
    const catGallery = document.getElementById('catGallery');

    // --- 狀態與資料儲存 ---
    let isGalleryLoaded = false;
    let nameToIdMap = {};
    let catStatsMap = {};
    let statHeaders = [];
    let selectedIndex = -1; // 用於鍵盤選擇

    // --- 核心功能函式 ---

    // 預載入 tsv 資料
    async function preloadData() {
        try {
            const [tcatResponse, catstatResponse] = await Promise.all([
                fetch('data/tcat.tsv'),
                fetch('data/catstat.tsv')
            ]);

            if (!tcatResponse.ok || !catstatResponse.ok) {
                throw new Error('無法獲取資料檔案');
            }

            const tcatText = await tcatResponse.text();
            const catstatText = await catstatResponse.text();

            // 解析 tcat.tsv 建立名稱到 ID 的映射
            const tcatRows = tcatText.trim().split(/\r?\n/).slice(1);
            tcatRows.forEach((row, index) => {
                const columns = row.split('\t');
                if (columns.length > 1) {
                    const twNames = columns[1].split('|');
                    twNames.forEach((name, formIndex) => {
                        const cleanName = name.trim().replace(/\(.+\)/, '');
                        if (cleanName) {
                            nameToIdMap[cleanName] = { id: index, form: formIndex };
                        }
                    });
                }
            });

            // 解析 catstat.tsv 儲存貓咪詳細數據
            const catstatRows = catstatText.trim().split(/\r?\n/);
            statHeaders = catstatRows[0].split('\t');
            catstatRows.slice(1).forEach(row => {
                const stats = row.split('\t');
                if (stats.length < 2) return;
                const id = stats[0];
                const name = stats[1].trim().replace(/\(.+\)/, '');
                const mapping = nameToIdMap[name];
                if (mapping) {
                    const key = `${id}-${mapping.form}`;
                    catStatsMap[key] = stats;
                }
            });

        } catch (error) {
            console.error('預載入資料時發生錯誤:', error);
            catGallery.innerHTML = '<p>資料載入失敗，請重新整理頁面。</p>';
        }
    }

    // 顯示貓咪詳細資料
    function displayCatStats(id, form) {
        const key = `${id}-${form}`;
        const stats = catStatsMap[key];
        if (!stats) {
            resultDisplay.innerHTML = '<p>找不到該角色的詳細資料。</p>';
            resultDisplay.className = 'np';
            resultDisplay.style.removeProperty('--cat-bg');
            return;
        }
    
        // 將背景圖片設為 CSS 變數供 ::before 使用
        resultDisplay.style.setProperty('--cat-bg', `url('https://battlecatsinfo.github.io/img/u/${id}/${form}.png')`);
        resultDisplay.className = 'use';
    
        let html = '<ul>';
        const fieldsToShow = ['name_tw', 'description'];
        const gridFields = ['health_point','attack_power_1', 'speed', 'range', 'cd'];

        fieldsToShow.forEach(field => {
            const index = statHeaders.indexOf(field);
            if (index !== -1 && stats[index]) {
                if (field === 'description') {
                    // 處理描述欄位，將 | 分隔的內容轉換為多行列表
                    const descriptions = stats[index].split('|');
                    html += `<li><strong>${translateHeader(field)}:</strong>`;
                    html += '<ul class="description-list">';
                    descriptions.forEach(desc => {
                        if (desc.trim()) {
                            html += `<li>${desc.trim()}</li>`;
                        }
                    });
                    html += '</ul></li>';
                } else {
                    // 其他欄位保持原樣
                    html += `<li><strong>${translateHeader(field)}:</strong> ${stats[index]}</li>`;
                }
            }
        });

        // 處理網格佈局的欄位
        html += '<li class="stats-grid-container"><ul class="stats-grid">';
        gridFields.forEach(field => {
            const index = statHeaders.indexOf(field);
            if (index !== -1 && stats[index]) {
                html += `<li><strong>${translateHeader(field)}</strong><span>${stats[index]}</span></li>`;
            }
        });
        html += '</ul></li>';

        html += '</ul>';

        resultDisplay.innerHTML = html;
        catGallery.style.display = 'none';
    }
    

    // 翻譯欄位標頭
    function translateHeader(header) {
        const translations = {
            'name_tw': '名稱', 'description': '描述', 'health_point': '體力',
            'attack_power_1': '攻擊力', 'speed': '跑速', 'range': '射程', 'cd': '再生產(秒)'
        };
        return translations[header] || header;
    }

    // 載入貓咪畫廊
    function loadSpecifiedCatGallery() {
        catGallery.innerHTML = '';
        specifiedCats.forEach(cat => {
            const cleanName = cat.name.replace(/\(.+\)/, '');
            const catInfo = nameToIdMap[cleanName];
            if (catInfo) {
                const { id, form } = catInfo;
                const catElement = document.createElement('div');
                catElement.classList.add('cat-item');
                catElement.dataset.catId = id;
                catElement.dataset.catForm = form;

                const img = document.createElement('img');
                img.src = `https://battlecatsinfo.github.io/img/u/${id}/${form}.png`;
                img.alt = cat.name;
                img.loading = 'lazy';
                img.onerror = function () { this.parentElement.style.display = 'none'; };

                const nameElement = document.createElement('p');
                nameElement.textContent = cat.name;

                catElement.appendChild(img);
                catElement.appendChild(nameElement);
                catGallery.appendChild(catElement);

                catElement.addEventListener('click', () => {
                    displayCatStats(id, form);
                });
            } else {
                console.warn(`找不到貓咪 '${cat.name}' 的 ID。`);
            }
        });
    }

    // 處理搜尋邏輯
    const handleSearch = () => {
        const searchTerm = searchInput.value.trim();
        const lowerCaseTerm = searchTerm.toLowerCase();

        clearSearchBtn.classList.toggle('hidden', searchTerm === '');
        searchResultsDiv.innerHTML = '';

        if (searchTerm === '') {
            searchResultsDiv.classList.add('hidden');
            selectedIndex = -1; // 重置選擇
            // 清空時，不改變 resultDisplay 的內容，除非使用者手動重置
            return;
        }

        const matchedCharacters = specifiedCats.filter(char => 
            char.name.toLowerCase().includes(lowerCaseTerm)
        );

        if (matchedCharacters.length === 1 && matchedCharacters[0].name.toLowerCase() === lowerCaseTerm) {
            // 如果完全匹配且只有一個結果，直接顯示詳細資料
            const cat = matchedCharacters[0];
            const cleanName = cat.name.replace(/\(.+\)/, '');
            const catInfo = nameToIdMap[cleanName];
            if (catInfo) {
                displayCatStats(catInfo.id, catInfo.form);
                searchResultsDiv.classList.add('hidden');
            }
        } else if (matchedCharacters.length > 0) {
            // 顯示「使用」和建議列表
            resultDisplay.innerHTML = '<h1>使用</h1>';
            resultDisplay.className = 'use';
            resultDisplay.style.removeProperty('--cat-bg');

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
            selectedIndex = -1; // 重置選擇
        } else {
            // 顯示「NP」
            resultDisplay.innerHTML = '<h1>NP</h1>';
            resultDisplay.className = 'np';
            resultDisplay.style.removeProperty('--cat-bg');
            searchResultsDiv.classList.add('hidden');
        }
    };

    // 重置UI到初始狀態
    const resetUI = () => {
        searchInput.value = '';
        clearSearchBtn.classList.add('hidden');
        searchResultsDiv.classList.add('hidden');
        resultDisplay.innerHTML = '';
        resultDisplay.className = '';
        resultDisplay.style.backgroundImage = 'none';
        catGallery.style.display = 'none';
    };

    // 更新鍵盤選擇高亮及預覽背景
    function updateSelection() {
        const items = searchResultsDiv.querySelectorAll('.search-item');
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === selectedIndex);
        });

        if (selectedIndex > -1 && items[selectedIndex]) {
            const selectedItem = items[selectedIndex];
            selectedItem.scrollIntoView({ block: 'nearest' });

            const catName = selectedItem.dataset.name;
            const cleanName = catName.replace(/\(.+\)/, '');
            const catInfo = nameToIdMap[cleanName];
            if (catInfo) {
                resultDisplay.style.setProperty('--cat-bg', `url('https://battlecatsinfo.github.io/img/u/${catInfo.id}/${catInfo.form}.png')`);
                resultDisplay.className = 'use'; // 保持 use 樣式以顯示背景
            } else {
                resultDisplay.style.removeProperty('--cat-bg');
            }
        } else {
            // 沒有選擇時，清除背景
            resultDisplay.style.removeProperty('--cat-bg');
            // 如果搜尋結果不為空，則顯示'use'，否則顯示'np'
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                const matched = specifiedCats.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
                resultDisplay.className = matched ? 'use' : 'np';
                resultDisplay.innerHTML = matched ? '<h1>使用</h1>' : '<h1>NP</h1>';
            }
        }
    }

    // --- 事件監聽器 ---

    // 主標題點擊：切換畫廊顯示
    mainTitle.addEventListener('click', () => {
        const isHidden = catGallery.style.display === 'none';
        if (isHidden) {
            resetUI(); // 重置UI確保乾淨的狀態
            catGallery.style.display = 'grid';
            if (!isGalleryLoaded) {
                loadSpecifiedCatGallery();
                isGalleryLoaded = true;
            }
        } else {
            catGallery.style.display = 'none';
        }
    });

    // 搜尋框輸入與鍵盤操作
    searchInput.addEventListener('input', handleSearch);

    searchInput.addEventListener('keydown', (e) => {
        const items = searchResultsDiv.querySelectorAll('.search-item');
        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % items.length;
            updateSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            updateSelection();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex > -1) {
                items[selectedIndex].click();
            }
        }
    });

    // 清除按鈕點擊
    clearSearchBtn.addEventListener('click', () => {
        resetUI();
        searchInput.focus();
    });

    // 搜尋結果列表互動(點擊與滑鼠懸停)
    searchResultsDiv.addEventListener('mouseover', e => {
        const item = e.target.closest('.search-item');
        if (item) {
            const items = Array.from(searchResultsDiv.querySelectorAll('.search-item'));
            const newIndex = items.indexOf(item);
            if (newIndex !== selectedIndex) {
                selectedIndex = newIndex;
                updateSelection();
            }
        }
    });
    searchResultsDiv.addEventListener('click', (event) => {
        const clickedItem = event.target.closest('.search-item');
        if (clickedItem) {
            const catName = clickedItem.dataset.name;
            searchInput.value = catName;
            const cleanName = catName.replace(/\(.+\)/, '');
            const catInfo = nameToIdMap[cleanName];
            if (catInfo) {
                displayCatStats(catInfo.id, catInfo.form);
            }
            searchResultsDiv.classList.add('hidden');
        }
    });

    // 點擊頁面其他地方，隱藏搜尋結果列表
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.search-section')) {
            searchResultsDiv.classList.add('hidden');
        }
    });

    // --- 初始化 ---
    resetUI(); // 初始加載時重置UI
    preloadData(); // 開始預載入資料
});
