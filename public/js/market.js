// public/js/market.js
// CharacterHall.store - Market Page

(function() {
    'use strict';

    // Database URLs
    const WAIFU_DB_URL = '../../database/waifu.json';
    const USER_DB_URL = '../../database/user.json';
    
    // State
    let currentUser = null;
    let allCards = [];
    let filteredCards = [];
    let currentRarityFilter = 'all';
    let currentSearchQuery = '';

    // DOM Elements
    const userNameSpan = document.getElementById('userName');
    const userLevelSpan = document.getElementById('userLevel');
    const cardsGrid = document.getElementById('cardsGrid');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Currency Elements
    const goldCoinSpan = document.getElementById('goldCoin');
    const darkRubySpan = document.getElementById('darkRuby');
    const andesiteDustSpan = document.getElementById('andesiteDust');
    const stonecallerSpan = document.getElementById('stonecaller');
    const cardFragmentsSpan = document.getElementById('cardFragments');

    // Inisialisasi
    async function init() {
        await loadUserData();
        await loadWaifuData();
        checkSession();
        attachEventListeners();
        updateUI();
        renderCards();
    }

    // Load user data
    async function loadUserData() {
        try {
            const response = await fetch(USER_DB_URL);
            if (!response.ok) throw new Error('Gagal memuat database user');
            const data = await response.json();
            
            if (data.users && Array.isArray(data.users)) {
                window.allUsers = data.users;
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            window.allUsers = [];
        }
    }

    // Load waifu data
    async function loadWaifuData() {
        try {
            const response = await fetch(WAIFU_DB_URL);
            if (!response.ok) throw new Error('Gagal memuat database waifu');
            const data = await response.json();
            
            if (data.cards && Array.isArray(data.cards)) {
                allCards = data.cards;
                filteredCards = [...allCards];
            } else {
                throw new Error('Format data tidak valid');
            }
            
            console.log(`✅ Waifu data loaded: ${allCards.length} cards`);
        } catch (error) {
            console.error('Error loading waifu data:', error);
            showErrorState('Gagal memuat data karakter. Silakan refresh halaman.');
        }
    }

    // Show error state with mascot sadness
    function showErrorState(message) {
        if (!cardsGrid) return;
        cardsGrid.innerHTML = `
            <div class="error-state">
                <img src="../../assets/image/mascot/sadness.png" alt="Sad Mascot" class="error-mascot">
                <h3>Oops! Ada Masalah</h3>
                <p>${message}</p>
                <button class="retry-btn" onclick="location.reload()">
                    <i class="fas fa-sync-alt"></i> Muat Ulang
                </button>
            </div>
        `;
    }

    // Check session login
    function checkSession() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        const userData = sessionStorage.getItem('currentUser');
        
        if (!isLoggedIn || !userData) {
            window.location.href = '../page/login.html';
            return;
        }
        
        currentUser = JSON.parse(userData);
        
        // Cari data lengkap dari database
        if (window.allUsers) {
            const fullUserData = window.allUsers.find(u => u.username === currentUser.username);
            if (fullUserData) {
                currentUser = { ...currentUser, ...fullUserData };
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
        }
    }

    // Attach event listeners
    function attachEventListeners() {
        // Search input
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearchQuery = e.target.value.toLowerCase();
                filterCards();
            });
        }
        
        // Filter buttons
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentRarityFilter = btn.getAttribute('data-rarity');
                filterCards();
            });
        });
    }

    // Filter cards berdasarkan rarity dan search
    function filterCards() {
        filteredCards = allCards.filter(card => {
            // Filter by rarity
            if (currentRarityFilter !== 'all' && card.rarity !== currentRarityFilter) {
                return false;
            }
            // Filter by search query
            if (currentSearchQuery && !card.name.toLowerCase().includes(currentSearchQuery)) {
                return false;
            }
            return true;
        });
        
        renderCards();
    }

    // Render empty state with mascot sadness
    function renderEmptyState() {
        return `
            <div class="empty-state">
                <img src="../../assets/image/mascot/sadness.png" alt="Sad Mascot" class="empty-mascot">
                <h3>Maaf, Karakter Tidak Ditemukan</h3>
                <p>Tidak ada karakter dengan nama "${currentSearchQuery || 'yang dicari'}"</p>
                <p class="empty-hint">Coba gunakan kata kunci lain atau reset filter</p>
                <button class="reset-btn" onclick="window.resetFilters()">
                    <i class="fas fa-sync-alt"></i> Reset Filter
                </button>
            </div>
        `;
    }

    // Render cards grid
    function renderCards() {
        if (!cardsGrid) return;
        
        if (!allCards.length) {
            cardsGrid.innerHTML = `
                <div class="empty-state">
                    <img src="../../assets/image/mascot/sadness.png" alt="Sad Mascot" class="empty-mascot">
                    <h3>Belum Ada Data Karakter</h3>
                    <p>Database karakter belum tersedia</p>
                </div>
            `;
            return;
        }
        
        if (filteredCards.length === 0) {
            cardsGrid.innerHTML = renderEmptyState();
            return;
        }
        
        cardsGrid.innerHTML = filteredCards.map(card => `
            <a href="detail.html?id=${card.id}" class="card-item-link">
                <div class="card-item" data-id="${card.id}">
                    <div class="card-image">
                        ${card.img_url ? 
                            `<img src="${card.img_url}" alt="${card.name}">` : 
                            `<i class="fas fa-id-card placeholder-icon"></i>`
                        }
                        <span class="rarity-badge ${card.rarity}">${card.rarity}</span>
                    </div>
                    <div class="card-info">
                        <div class="card-name">${card.name}</div>
                        <div class="card-details">
                            <p><span>Serial:</span> <span>${card.serial || '#' + String(card.number_card).padStart(4, '0')}</span></p>
                            <p><span>Rarity:</span> <span>${card.rarity}</span></p>
                        </div>
                        <div class="card-price">
                            <span class="price-value">${formatNumber(card.price)}</span>
                            <span class="price-currency">${getCurrencySymbol(card.currency_type)}</span>
                            <span class="stock-status ${card.stock > 0 ? 'available' : 'soldout'}">
                                ${card.stock > 0 ? `Stock: ${card.stock}` : 'Habis'}
                            </span>
                        </div>
                    </div>
                </div>
            </a>
        `).join('');
    }

    // Reset filters function
    window.resetFilters = function() {
        currentSearchQuery = '';
        currentRarityFilter = 'all';
        if (searchInput) searchInput.value = '';
        filterBtns.forEach(btn => {
            if (btn.getAttribute('data-rarity') === 'all') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        filterCards();
    };

    // Get currency symbol
    function getCurrencySymbol(currencyType) {
        const mapping = {
            'gold_coin': 'G',
            'dark_ruby': 'DR',
            'andesite_dust': 'AD'
        };
        return mapping[currencyType] || 'G';
    }

    // Update UI with user data
    function updateUI() {
        if (!currentUser) return;
        
        userNameSpan.textContent = currentUser.fullname || currentUser.username;
        userLevelSpan.textContent = `Lv.${currentUser.level || 1}`;
        
        const currency = currentUser.currency || {};
        goldCoinSpan.textContent = formatNumber(currency.gold_coin || 0);
        darkRubySpan.textContent = formatNumber(currency.dark_ruby || 0);
        andesiteDustSpan.textContent = formatNumber(currency.andesite_dust || 0);
        stonecallerSpan.textContent = formatNumber(currency.stonecaller || 0);
        cardFragmentsSpan.textContent = formatNumber(currency.card_fragments || 0);
    }

    // Format number
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    
    init();
})();