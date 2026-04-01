// public/js/detail.js
// CharacterHall.store - Detail Page with Purchase Function

(function() {
    'use strict';

    // Database URLs
    const WAIFU_DB_URL = '../../database/waifu.json';
    const USER_DB_URL = '../../database/user.json';
    const STORAGE_DB_URL = '../../database/storage.json';
    
    // State
    let currentUser = null;
    let currentCard = null;
    let allCards = [];
    let userStorage = null;

    // DOM Elements
    const userNameSpan = document.getElementById('userName');
    const userLevelSpan = document.getElementById('userLevel');
    const detailContainer = document.getElementById('detailContainer');
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalBody = document.getElementById('confirmModalBody');
    const modalClose = document.querySelector('.modal-close');
    const alertContainer = document.getElementById('alertContainer');

    // Currency Elements
    const goldCoinSpan = document.getElementById('goldCoin');
    const darkRubySpan = document.getElementById('darkRuby');
    const andesiteDustSpan = document.getElementById('andesiteDust');
    const stonecallerSpan = document.getElementById('stonecaller');
    const cardFragmentsSpan = document.getElementById('cardFragments');

    // Get card ID from URL
    function getCardId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // Inisialisasi
    async function init() {
        await loadUserData();
        await loadWaifuData();
        await loadStorageData();
        checkSession();
        await loadCurrentCard();
        updateUI();
        renderDetail();
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
            } else {
                throw new Error('Format data tidak valid');
            }
            
            console.log(`✅ Waifu data loaded: ${allCards.length} cards`);
        } catch (error) {
            console.error('Error loading waifu data:', error);
            showErrorState('Gagal memuat data karakter. Silakan refresh halaman.');
        }
    }

    // Load storage data
    async function loadStorageData() {
        try {
            const response = await fetch(STORAGE_DB_URL);
            if (!response.ok) {
                // Jika file tidak ada, buat struktur kosong
                userStorage = { users: [] };
                return;
            }
            const data = await response.json();
            userStorage = data;
        } catch (error) {
            console.error('Error loading storage data:', error);
            userStorage = { users: [] };
        }
    }

    // Save storage data
    async function saveStorageData() {
        // Simulasi penyimpanan ke localStorage karena browser tidak bisa menulis file langsung
        // Dalam implementasi nyata, ini akan dikirim ke server via API
        localStorage.setItem('characterhall_storage', JSON.stringify(userStorage));
        console.log('✅ Storage saved to localStorage');
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

    // Load current card
    async function loadCurrentCard() {
        const cardId = parseInt(getCardId());
        if (!cardId) {
            showErrorState('ID karakter tidak ditemukan');
            return;
        }
        
        currentCard = allCards.find(c => c.id === cardId);
        if (!currentCard) {
            showErrorState('Karakter tidak ditemukan');
            return;
        }
    }

    // Get user's currency
    function getUserCurrency() {
        return currentUser.currency || {
            gold_coin: 0,
            dark_ruby: 0,
            andesite_dust: 0,
            stonecaller: 0,
            card_fragments: 0
        };
    }

    // Get currency symbol
    function getCurrencySymbol(currencyType) {
        const mapping = {
            'gold_coin': { symbol: 'G', name: 'Koin Emas' },
            'dark_ruby': { symbol: 'DR', name: 'Dark Ruby' },
            'andesite_dust': { symbol: 'AD', name: 'Andesite Dust' }
        };
        return mapping[currencyType] || { symbol: 'G', name: 'Koin Emas' };
    }

    // Check if user can afford the card
    function canAfford() {
        if (!currentCard) return false;
        if (currentCard.stock <= 0) return false;
        if (currentCard.rarity === 'Limited') return false;
        
        const currency = getUserCurrency();
        const userBalance = currency[currentCard.currency_type] || 0;
        return userBalance >= currentCard.price;
    }

    // Add card to user storage
    function addCardToStorage() {
        if (!userStorage.users) {
            userStorage.users = [];
        }
        
        let userStorageData = userStorage.users.find(u => u.userId === currentUser.username);
        
        if (!userStorageData) {
            userStorageData = {
                userId: currentUser.username,
                username: currentUser.username,
                cards: []
            };
            userStorage.users.push(userStorageData);
        }
        
        // Tambahkan kartu ke storage
        userStorageData.cards.push({
            cardId: currentCard.id,
            name: currentCard.name,
            rarity: currentCard.rarity,
            serial: currentCard.serial || `#${String(currentCard.number_card).padStart(4, '0')}`,
            purchased_at: new Date().toISOString(),
            price: currentCard.price,
            currency_type: currentCard.currency_type
        });
        
        // Update jumlah card user
        currentUser.jumlah_card = (currentUser.jumlah_card || 0) + 1;
        if (!currentUser.card) currentUser.card = [];
        currentUser.card.push(currentCard.name);
        
        // Update currency user
        const currency = getUserCurrency();
        currency[currentCard.currency_type] -= currentCard.price;
        currentUser.currency = currency;
        
        // Update stock card
        currentCard.stock -= 1;
        
        // Save to localStorage (simulasi)
        saveStorageData();
        
        // Update session storage
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    // Process purchase
    function processPurchase() {
        if (!canAfford()) {
            showAlert('Saldo tidak cukup atau stok habis!', 'error');
            return false;
        }
        
        addCardToStorage();
        showAlert(`Berhasil membeli ${currentCard.name}! Kartu telah ditambahkan ke Storage.`, 'success');
        
        // Update UI
        updateUI();
        renderDetail();
        
        return true;
    }

    // Show confirmation modal
    function showConfirmationModal() {
        if (!currentCard) return;
        
        const currency = getUserCurrency();
        const userBalance = currency[currentCard.currency_type] || 0;
        const currencyInfo = getCurrencySymbol(currentCard.currency_type);
        
        confirmModalBody.innerHTML = `
            <div class="confirm-card-info">
                <p><span class="label">Nama:</span><span class="value">${currentCard.name}</span></p>
                <p><span class="label">Serial:</span><span class="value">${currentCard.serial || '#' + String(currentCard.number_card).padStart(4, '0')}</span></p>
                <p><span class="label">Harga:</span><span class="value">${formatNumber(currentCard.price)} ${currencyInfo.symbol}</span></p>
                <p><span class="label">Rarity:</span><span class="value">${currentCard.rarity}</span></p>
                <p><span class="label">Stok Tersedia:</span><span class="value">${currentCard.stock}</span></p>
            </div>
            <div class="currency-display" style="margin: 1rem 0;">
                <div class="currency-title-small">
                    <i class="fas fa-wallet"></i> Uang mu saat ini
                </div>
                <div class="currency-items">
                    <div class="currency-item-small">
                        <i class="fas fa-coins"></i>
                        <span>Koin Emas (G):</span>
                        <span>${formatNumber(currency.gold_coin || 0)}</span>
                    </div>
                    <div class="currency-item-small">
                        <i class="fas fa-gem"></i>
                        <span>Dark Ruby (DR):</span>
                        <span>${formatNumber(currency.dark_ruby || 0)}</span>
                    </div>
                    <div class="currency-item-small">
                        <i class="fas fa-mountain"></i>
                        <span>Andesite Dust (AD):</span>
                        <span>${formatNumber(currency.andesite_dust || 0)}</span>
                    </div>
                </div>
            </div>
            <div class="confirm-warning">
                <i class="fas fa-exclamation-triangle"></i> Apakah kamu yakin membeli karakter ini?
            </div>
            <div class="modal-buttons">
                <button class="modal-btn-yes" id="confirmYesBtn">
                    <i class="fas fa-check"></i> Ya, Beli
                </button>
                <button class="modal-btn-no" id="confirmNoBtn">
                    <i class="fas fa-times"></i> Tidak
                </button>
            </div>
        `;
        
        confirmModal.classList.add('show');
        
        // Event listeners untuk modal
        document.getElementById('confirmYesBtn').addEventListener('click', () => {
            processPurchase();
            closeModal();
        });
        
        document.getElementById('confirmNoBtn').addEventListener('click', closeModal);
    }

    // Close modal
    function closeModal() {
        confirmModal.classList.remove('show');
    }

    // Render detail card
    function renderDetail() {
        if (!detailContainer) return;
        
        if (!currentCard) {
            detailContainer.innerHTML = `
                <div class="error-state">
                    <img src="../../assets/image/mascot/sadness.png" alt="Sad Mascot" class="error-mascot">
                    <h3>Karakter Tidak Ditemukan</h3>
                    <p>Maaf, karakter yang Anda cari tidak tersedia.</p>
                    <a href="market.html" class="retry-btn">
                        <i class="fas fa-arrow-left"></i> Kembali ke Market
                    </a>
                </div>
            `;
            return;
        }
        
        const currency = getUserCurrency();
        const userBalance = currency[currentCard.currency_type] || 0;
        const currencyInfo = getCurrencySymbol(currentCard.currency_type);
        const canBuy = canAfford();
        
        detailContainer.innerHTML = `
            <div class="card-detail">
                <div class="card-detail-image">
                    ${currentCard.img_url ? 
                        `<img src="${currentCard.img_url}" alt="${currentCard.name}">` : 
                        `<i class="fas fa-id-card placeholder-icon"></i>`
                    }
                    <span class="rarity-badge-large ${currentCard.rarity}">${currentCard.rarity}</span>
                </div>
                <div class="card-detail-info">
                    <div class="card-name-large">${currentCard.name}</div>
                    <div class="card-detail-table">
                        <div class="card-detail-row">
                            <span class="card-detail-label">Serial Number</span>
                            <span class="card-detail-value">${currentCard.serial || '#' + String(currentCard.number_card).padStart(4, '0')}</span>
                        </div>
                        <div class="card-detail-row">
                            <span class="card-detail-label">Rarity</span>
                            <span class="card-detail-value">${currentCard.rarity}</span>
                        </div>
                        <div class="card-detail-row">
                            <span class="card-detail-label">Harga</span>
                            <span class="card-detail-value">${formatNumber(currentCard.price)} ${currencyInfo.symbol}</span>
                        </div>
                        <div class="card-detail-row">
                            <span class="card-detail-label">Stok Tersedia</span>
                            <span class="card-detail-value ${currentCard.stock > 0 ? '' : 'soldout'}">${currentCard.stock > 0 ? currentCard.stock : 'Habis'}</span>
                        </div>
                    </div>
                    <div class="currency-display">
                        <div class="currency-title-small">
                            <i class="fas fa-wallet"></i> Uang mu saat ini
                        </div>
                        <div class="currency-items">
                            <div class="currency-item-small">
                                <i class="fas fa-coins"></i>
                                <span>Koin Emas (G):</span>
                                <span>${formatNumber(currency.gold_coin || 0)}</span>
                            </div>
                            <div class="currency-item-small">
                                <i class="fas fa-gem"></i>
                                <span>Dark Ruby (DR):</span>
                                <span>${formatNumber(currency.dark_ruby || 0)}</span>
                            </div>
                            <div class="currency-item-small">
                                <i class="fas fa-mountain"></i>
                                <span>Andesite Dust (AD):</span>
                                <span>${formatNumber(currency.andesite_dust || 0)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="action-buttons">
                        ${currentCard.rarity !== 'Limited' && currentCard.stock > 0 ? 
                            `<button class="btn-buy ${!canBuy ? 'disabled' : ''}" id="buyBtn" ${!canBuy ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart"></i> ${canBuy ? 'Beli Sekarang' : 'Saldo Tidak Cukup'}
                            </button>` : 
                            `<button class="btn-buy disabled" disabled>
                                <i class="fas fa-ban"></i> ${currentCard.rarity === 'Limited' ? 'Limited - Hanya dari Gacha' : 'Stok Habis'}
                            </button>`
                        }
                        <a href="market.html" class="btn-cancel">
                            <i class="fas fa-arrow-left"></i> Kembali
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listener untuk tombol beli
        const buyBtn = document.getElementById('buyBtn');
        if (buyBtn && !buyBtn.disabled) {
            buyBtn.addEventListener('click', showConfirmationModal);
        }
        
        // Modal close event
        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }
        
        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                closeModal();
            }
        });
    }

    // Show error state
    function showErrorState(message) {
        if (!detailContainer) return;
        detailContainer.innerHTML = `
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

    // Show alert notification
    function showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert-toast ${type}`;
        
        let icon = '';
        switch(type) {
            case 'success': icon = '<i class="fas fa-check-circle"></i>'; break;
            case 'error': icon = '<i class="fas fa-exclamation-circle"></i>'; break;
            case 'warning': icon = '<i class="fas fa-exclamation-triangle"></i>'; break;
            default: icon = '<i class="fas fa-info-circle"></i>';
        }
        
        alertDiv.innerHTML = `${icon}<span>${message}</span>`;
        alertContainer.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => alertDiv.remove(), 300);
        }, 3000);
    }

    // Update UI with user data
    function updateUI() {
        if (!currentUser) return;
        
        userNameSpan.textContent = currentUser.fullname || currentUser.username;
        userLevelSpan.textContent = `Lv.${currentUser.level || 1}`;
        
        const currency = currentUser.currency || {};
        if (goldCoinSpan) goldCoinSpan.textContent = formatNumber(currency.gold_coin || 0);
        if (darkRubySpan) darkRubySpan.textContent = formatNumber(currency.dark_ruby || 0);
        if (andesiteDustSpan) andesiteDustSpan.textContent = formatNumber(currency.andesite_dust || 0);
        if (stonecallerSpan) stonecallerSpan.textContent = formatNumber(currency.stonecaller || 0);
        if (cardFragmentsSpan) cardFragmentsSpan.textContent = formatNumber(currency.card_fragments || 0);
    }

    // Format number
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    
    init();
})();.1