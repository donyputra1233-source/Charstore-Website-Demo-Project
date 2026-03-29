// Storage Card Page JavaScript
let currentUser = null;
let allCharacters = [];

document.addEventListener('DOMContentLoaded', function () {
    loadUserData();
    loadCharactersData();

    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            sessionStorage.removeItem('currentUser');
            window.location.href = '/public/page/login.html';
        });
    }
});

function loadUserData() {
    const userData = sessionStorage.getItem('currentUser');

    if (!userData) {
        window.location.href = '/public/page/login.html';
        return;
    }

    currentUser = JSON.parse(userData);

    // Update navbar
    const userName = document.getElementById('userName');
    const userLevelBadge = document.getElementById('userLevelBadge');

    if (userName) userName.textContent = currentUser.nama;
    if (userLevelBadge) userLevelBadge.textContent = `Lv.${currentUser.level || 1}`;

    // Update profile info
    updateProfileInfo();
    updateCurrencyDisplay();
    updateCharacterCollection();
}

async function loadCharactersData() {
    try {
        const response = await fetch('/database/characters.json');
        if (response.ok) {
            const data = await response.json();
            allCharacters = data.characters;
        }
    } catch (error) {
        console.error('Error loading characters:', error);
    }
}

function updateProfileInfo() {
    const profileNama = document.getElementById('profileNama');
    const profileUsername = document.getElementById('profileUsername');
    const profileLevel = document.getElementById('profileLevel');
    const totalCards = document.getElementById('totalCards');

    const characterCount = currentUser.inventory?.characters?.length || 0;

    if (profileNama) profileNama.textContent = currentUser.nama || '-';
    if (profileUsername) profileUsername.textContent = currentUser.username || '-';
    if (profileLevel) profileLevel.textContent = `Lv.${currentUser.level || 1}`;
    if (totalCards) totalCards.textContent = characterCount;
}

function updateCurrencyDisplay() {
    const wallet = currentUser.wallet || { koin_emas: 0, dark_crystal: 0, ruby: 0 };

    const pearlAmount = document.getElementById('pearlAmount');
    const ucAmount = document.getElementById('ucAmount');
    const crycoinsAmount = document.getElementById('crycoinsAmount');

    if (pearlAmount) pearlAmount.textContent = `${formatNumber(wallet.koin_emas)} Pearl`;
    if (ucAmount) ucAmount.textContent = `${formatNumber(wallet.dark_crystal)} UC`;
    if (crycoinsAmount) crycoinsAmount.textContent = `${formatNumber(wallet.ruby)} C`;

    // Update collection count in header
    const collectionCount = document.getElementById('collectionCount');
    if (collectionCount) {
        collectionCount.textContent = currentUser.inventory?.characters?.length || 0;
    }
}

function updateCharacterCollection() {
    const characterGrid = document.getElementById('characterGrid');
    if (!characterGrid) return;

    const characters = currentUser.inventory?.characters || [];

    if (characters.length === 0) {
        characterGrid.innerHTML = `
            <div class="empty-collection">
                <i class="fas fa-box-open"></i>
                <p>Belum ada karakter yang dimiliki</p>
                <a href="/root/page/market.html" class="btn-buy-now">
                    <i class="fas fa-store"></i> Beli Karakter Sekarang
                </a>
            </div>
        `;
        return;
    }

    // Get full character details from allCharacters if available
    const enrichedCharacters = characters.map(char => {
        const fullChar = allCharacters.find(c => c.id === char.id);
        return {
            ...char,
            foto: fullChar?.foto || `https://placehold.co/200x200/6366f1/white?text=${char.name.charAt(0)}`,
            harga: char.value || fullChar?.harga || 0,
            serial: char.serial || fullChar?.serial || `CH-${char.id}`,
            rank: fullChar?.rank || getRankFromRarity(char.rarity)
        };
    });

    characterGrid.innerHTML = enrichedCharacters.map(char => `
        <div class="character-card" onclick="goToDetail('${char.id}')">
            <div class="character-image">
                <img src="${char.foto}" alt="${char.name}" 
                     onerror="this.src='https://placehold.co/200x200/6366f1/white?text=${char.name.charAt(0)}'">
                <span class="rarity-badge rarity-${char.rarity?.toLowerCase() || 'common'}">${char.rarity || 'Common'}</span>
            </div>
            <div class="character-info">
                <h3 class="character-name">${char.name}</h3>
                <p class="character-serial">Serial: ${char.serial}</p>
                <div class="character-price">
                    ${char.harga > 0 ? `
                        <span class="price-value gold">
                            <i class="fas fa-coins"></i> ${formatNumber(char.harga)} Pearl
                        </span>
                    ` : ''}
                </div>
                <div class="character-actions">
                    <button class="btn-sell" onclick="event.stopPropagation(); sellCharacter('${char.id}')">
                        <i class="fas fa-tag"></i> Jual
                    </button>
                    <a href="/root/page/detail.html?id=${char.id}" class="btn-detail" onclick="event.stopPropagation()">
                        <i class="fas fa-info-circle"></i> Detail
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

function getRankFromRarity(rarity) {
    const rarityMap = {
        'Mythic': 'myth',
        'Legendary': 'epic',
        'Epic': 'epic',
        'Rare': 'rare',
        'Uncommon': 'uncommon',
        'Common': 'common',
        'Limited': 'limited'
    };
    return rarityMap[rarity] || 'common';
}

function formatNumber(num) {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function goToDetail(characterId) {
    window.location.href = `detail.html?id=${characterId}`;
}

function sellCharacter(characterId) {
    const character = currentUser.inventory?.characters?.find(c => c.id === characterId);

    if (!character) {
        showNotification('Karakter tidak ditemukan!', 'error');
        return;
    }

    // Simpan karakter yang akan dijual ke sessionStorage
    sessionStorage.setItem('sellCharacter', JSON.stringify(character));
    sessionStorage.setItem('sellAction', 'true');

    // Redirect ke halaman detail dengan mode jual
    window.location.href = `detail.html?id=${characterId}&action=sell`;
}

function showNotification(message, type = 'info') {
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.style.background = type === 'error' ? '#ef4444' : '#10b981';
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}