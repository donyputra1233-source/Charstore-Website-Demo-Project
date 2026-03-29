// Home Page JavaScript - Terintegrasi dengan user.json
document.addEventListener('DOMContentLoaded', function() {
    // Load user data from session
    loadUserData();
    
    // Update wallet display
    updateWalletDisplay();
    
    // Update storage count
    updateStorageCount();
    
    // Update stats
    updatePlayerStats();
    
    // Load popular characters
    loadPopularCharacters();
    
    // Load inventory characters
    loadInventoryCharacters();
});

// Global variable untuk menyimpan data user
let currentUser = null;

function loadUserData() {
    const userData = sessionStorage.getItem('currentUser');
    
    if (!userData) {
        // Redirect to login if not logged in
        window.location.href = '/public/page/login.html';
        return;
    }
    
    currentUser = JSON.parse(userData);
    
    // Update user name
    const userName = document.getElementById('userName');
    if (userName) {
        userName.textContent = currentUser.nama;
    }
    
    // Update level badge
    const userLevelBadge = document.getElementById('userLevelBadge');
    if (userLevelBadge) {
        userLevelBadge.textContent = `Lv.${currentUser.level || 1}`;
    }
    
    return currentUser;
}

function updateWalletDisplay() {
    if (!currentUser) return;
    
    const wallet = currentUser.wallet || { koin_emas: 0, dark_crystal: 0, ruby: 0 };
    
    const koinEmas = document.getElementById('koinEmas');
    const darkCrystal = document.getElementById('darkCrystal');
    const ruby = document.getElementById('ruby');
    
    if (koinEmas) koinEmas.textContent = formatNumber(wallet.koin_emas);
    if (darkCrystal) darkCrystal.textContent = formatNumber(wallet.dark_crystal);
    if (ruby) ruby.textContent = formatNumber(wallet.ruby);
}

function updatePlayerStats() {
    if (!currentUser) return;
    
    const level = currentUser.level || 1;
    const xp = currentUser.xp || 0;
    const xpNeeded = level * 100;
    const totalCharacters = currentUser.inventory?.characters?.length || 0;
    
    // Calculate total asset value
    const wallet = currentUser.wallet || { koin_emas: 0, dark_crystal: 0, ruby: 0 };
    const characters = currentUser.inventory?.characters || [];
    
    // Konversi nilai: 1 Dark Crystal = 50 Koin, 1 Ruby = 200 Koin
    const walletValue = wallet.koin_emas + (wallet.dark_crystal * 50) + (wallet.ruby * 200);
    const characterValue = characters.reduce((sum, char) => sum + (char.value || 0), 0);
    const totalAsset = walletValue + characterValue;
    
    const playerLevel = document.getElementById('playerLevel');
    const playerXp = document.getElementById('playerXp');
    const totalCharactersEl = document.getElementById('totalCharacters');
    const totalAssetEl = document.getElementById('totalAsset');
    
    if (playerLevel) playerLevel.textContent = level;
    if (playerXp) playerXp.textContent = `${xp} / ${xpNeeded}`;
    if (totalCharactersEl) totalCharactersEl.textContent = totalCharacters;
    if (totalAssetEl) totalAssetEl.textContent = formatNumber(totalAsset);
}

function updateStorageCount() {
    if (!currentUser) return;
    
    const totalCharacters = currentUser.inventory?.characters?.length || 0;
    
    const storageCount = document.getElementById('storageCount');
    if (storageCount) {
        storageCount.textContent = `${totalCharacters} Item`;
    }
}

function loadInventoryCharacters() {
    if (!currentUser) return;
    
    const characters = currentUser.inventory?.characters || [];
    
    // Update karakter di storage jika ada elemen
    const inventoryGrid = document.getElementById('inventoryGrid');
    if (inventoryGrid && characters.length > 0) {
        inventoryGrid.innerHTML = characters.map(char => `
            <div class="character-card">
                <div class="character-rarity rarity-${char.rarity.toLowerCase()}">${char.rarity}</div>
                <div class="character-name">${char.name}</div>
                <div class="character-value">💰 ${formatNumber(char.value)} Koin</div>
                <button class="btn-sell" onclick="sellCharacter('${char.id}')">Jual</button>
            </div>
        `).join('');
    }
}

function loadPopularCharacters() {
    const popularGrid = document.getElementById('popularGrid');
    if (!popularGrid) return;
    
    // Data karakter populer berdasarkan user.json
    const popularCharacters = [
        { name: '🐉 Knight Lumina', rarity: 'Legendary', price: 2500, trend: '+12%' },
        { name: '⚔️ Shadow Assassin', rarity: 'Epic', price: 1200, trend: '+5%' },
        { name: '🔥 Phoenix Mage', rarity: 'Legendary', price: 3000, trend: '+8%' },
        { name: '❄️ Frost Archer', rarity: 'Epic', price: 1500, trend: '-2%' }
    ];
    
    popularGrid.innerHTML = popularCharacters.map(char => `
        <a href="/root/page/market.html" class="popular-card">
            <div class="character-rarity rarity-${char.rarity.toLowerCase()}">${char.rarity}</div>
            <div class="character-name">${char.name}</div>
            <div class="character-price">💰 ${formatNumber(char.price)} Koin</div>
            <div style="font-size: 0.7rem; margin-top: 0.5rem; color: ${char.trend.includes('+') ? '#10b981' : '#ef4444'}">
                ${char.trend}
            </div>
        </a>
    `).join('');
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Fungsi untuk menjual karakter (akan diimplementasikan di halaman storage)
function sellCharacter(characterId) {
    console.log('Selling character:', characterId);
    // Implementasi akan ditambahkan di halaman storage-card.html
}

// Fungsi untuk menambah koin (demo)
function addCoins(amount) {
    if (!currentUser) return;
    
    currentUser.wallet.koin_emas += amount;
    
    // Update session storage
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update display
    updateWalletDisplay();
    updatePlayerStats();
    
    showNotification(`+${formatNumber(amount)} Koin Emas!`, 'success');
}

// Fungsi untuk menampilkan notifikasi
function showNotification(message, type = 'info') {
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 12px;
            background: ${type === 'success' ? '#10b981' : '#6366f1'};
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(notification);
        
        // Tambahkan animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    notification.textContent = message;
    notification.style.background = type === 'success' ? '#10b981' : '#6366f1';
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Logout function
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.removeItem('currentUser');
        window.location.href = '/public/page/login.html';
    });
}