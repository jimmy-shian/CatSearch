document.addEventListener('DOMContentLoaded', async () => {
    const specifiedCats = [
        { rarity: '稀有', name: '跳跳貓' }, { rarity: '稀有', name: '車輪貓' }, { rarity: '稀有', name: '美容貓' },
        { rarity: '稀有', name: '侏羅貓' }, { rarity: '稀有', name: '鬥士貓' }, { rarity: '稀有', name: '搖滾貓' },
        { rarity: '稀有', name: '人魚貓' }, { rarity: '稀有', name: '貓咪探測器' }, { rarity: '稀有', name: '鬥牛士貓' },
        { rarity: '稀有', name: '貓咪格鬥家' }, { rarity: '稀有', name: '遠古的蛋:N101' },
        { rarity: '激稀有', name: '放浪貓弟' }, { rarity: '激稀有', name: '壽司貓' }, { rarity: '激稀有', name: '御宅貓' },
        { rarity: '激稀有', name: '暖桌貓' }, { rarity: '激稀有', name: '快泳貓' }, { rarity: '激稀有', name: '舉重貓' },
        { rarity: '激稀有', name: '冰刀二人組' }, { rarity: '激稀有', name: '衝浪貓' }, { rarity: '激稀有', name: '業餘撐竿跳貓' },
        { rarity: '激稀有', name: '擊劍貓' }, { rarity: '激稀有', name: '土豪弟' }
    ];

    const mainTitle = document.getElementById('main-title');
    const catGallery = document.getElementById('catGallery');
    const resultDisplay = document.getElementById('resultDisplay');
    const searchResultsDiv = document.getElementById('searchResults'); // 加這一行以避免錯誤

    let isGalleryLoaded = false;
    let nameToIdMap = {};
    let catStatsMap = {};
    let statHeaders = [];

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

    mainTitle.addEventListener('click', () => {
        const isHidden = catGallery.style.display === 'none';
        catGallery.style.display = isHidden ? 'grid' : 'none';

        if (isHidden && !isGalleryLoaded) {
            loadSpecifiedCatGallery();
            isGalleryLoaded = true;
        }
    });

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

    function displayCatStats(id, form) {
        const key = `${id}-${form}`;
        const stats = catStatsMap[key];
        if (!stats) {
            resultDisplay.innerHTML = '<p>找不到該角色的詳細資料。</p>';
            resultDisplay.style.backgroundImage = 'none';
            return;
        }

        resultDisplay.style.backgroundImage = `url('https://battlecatsinfo.github.io/img/u/${id}/${form}.png')`;

        let html = '<ul>';
        const fieldsToShow = ['name_tw', 'description', 'health_point', 'attack_power_1', 'speed', 'range', 'cd'];
        fieldsToShow.forEach(field => {
            const index = statHeaders.indexOf(field);
            if (index !== -1 && stats[index]) {
                html += `<li><strong>${translateHeader(field)}:</strong> ${stats[index]}</li>`;
            }
        });
        html += '</ul>';

        resultDisplay.innerHTML = html;
    }

    function translateHeader(header) {
        const translations = {
            'name_tw': '名稱',
            'description': '描述',
            'health_point': '體力',
            'attack_power_1': '攻擊力',
            'speed': '跑速',
            'range': '射程',
            'cd': '再生產(秒)'
        };
        return translations[header] || header;
    }

    // 初始化
    catGallery.style.display = 'none';
    preloadData();

    // 點擊頁面其他地方時，隱藏搜尋結果列表
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.search-section')) {
            searchResultsDiv.classList.add('hidden');
        }
    });
});
