// Detail Page JavaScript
let currentCharacter = null;
let currentUser = null;
let action = 'buy'; // 'buy' or 'sell'

document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    loadCharacterData();
    
    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }
});

function loadUserData() {
    const userData = sessionStorage.getItem('currentUser');
    
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = JSON.parse(userData);
    
    const userName = document.getElementById('userName');
    const userLevelBadge = document.getElementById('userLevelBadge');
    
    if (userName) userName.textContent = currentUser.nama;
    if (userLevelBadge) userLevelBadge.textContent = `Lv.${currentUser.level || 1}`;
    
    // Update currency display
    updateCurrencyDisplay();
}

function updateCurrencyDisplay() {
    const pearlAmount = document.getElementById('pearlAmount');
    const ucAmount = document.getElementById('ucAmount');
    const crycoinsAmount = document.getElementById('crycoinsAmount');
    
    if (pearlAmount) pearlAmount.textContent = `${formatNumber(currentUser.wallet.koin_emas)}G`;
    if (ucAmount) ucAmount.textContent = `${formatNumber(currentUser.wallet.dark_crystal)}DC`;
    if (crycoinsAmount) crycoinsAmount.textContent = `${formatNumber(currentUser.wallet.ruby)}R`;
}

async function loadCharacterData() {
    // Get character ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const characterId = urlParams.get('id');
    action = urlParams.get('action') || 'buy';
    
    if (!characterId) {
        showNotification('Karakter tidak ditemukan!', 'error');
        setTimeout(() => {
            window.location.href = 'market.html';
        }, 2000);
        return;
    }
    
    try {
        const response = await fetch('/database/characters.json');
        if (response.ok) {
            const data = await response.json();
            currentCharacter = data.characters.find(c => c.id === characterId);
        }
    } catch (error) {
        console.error('Error loading character:', error);
    }
    
    if (!currentCharacter) {
        showNotification('Karakter tidak ditemukan!', 'error');
        setTimeout(() => {
            window.location.href = 'market.html';
        }, 2000);
        return;
    }
    
    renderCharacterDetail();
    updateActionTitle();
}

function renderCharacterDetail() {
    const characterDetail = document.getElementById('characterDetail');
    if (!characterDetail) return;
    
    // Determine stock status
    const stock = currentCharacter.stok || 0;
    let stockClass = '';
    let stockText = '';
    
    if (stock <= 0) {
        stockClass = 'stock-out';
        stockText = 'Stok Habis!';
    } else if (stock <= 3) {
        stockClass = 'stock-low';
        stockText = `Stok Tersedia: ${stock} (Hampir Habis!)`;
    } else {
        stockClass = '';
        stockText = `Stok Tersedia: ${stock}`;
    }
    
    characterDetail.innerHTML = `
        <div class="character-image">
            <img src="${currentCharacter.foto}" alt="${currentCharacter.nama}" 
                 onerror="this.src='https://placehold.co/300x300/6366f1/white?text=${currentCharacter.nama.charAt(0)}'">
        </div>
        <div class="character-info">
            <div class="info-row">
                <span class="info-label">Nama</span>
                <span class="info-value">${currentCharacter.nama}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Serial</span>
                <span class="info-value">${currentCharacter.serial}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Rarity</span>
                <span class="info-value">
                    <span class="rarity-badge rarity-${currentCharacter.rank}">${currentCharacter.rarity}</span>
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">Harga</span>
                <span class="info-value">
                    <div class="price-info">
                        ${currentCharacter.harga > 0 ? `
                            <span class="price-gold">
                                <i class="fas fa-coins"></i> ${formatNumber(currentCharacter.harga)} Koin Emas
                            </span>
                        ` : ''}
                        ${currentCharacter.harga_dark_crystal > 0 ? `
                            <span class="price-crystal">
                                <i class="fas fa-gem"></i> ${currentCharacter.harga_dark_crystal} Dark Crystal
                            </span>
                        ` : ''}
                    </div>
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">Stok</span>
                <span class="info-value">
                    <div class="stock-info ${stockClass}">
                        <i class="fas fa-boxes"></i> ${stockText}
                    </div>
                </span>
            </div>
            ${currentCharacter.deskripsi ? `
                <div class="info-row">
                    <span class="info-label">Deskripsi</span>
                    <span class="info-value">${currentCharacter.deskripsi}</span>
                </div>
            ` : ''}
            <div class="info-row">
                <span class="info-label">Statistik</span>
                <span class="info-value">
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        <span>⚔️ Power: ${currentCharacter.power || '-'}</span>
                        <span>🛡️ Defense: ${currentCharacter.defense || '-'}</span>
                        <span>✨ Skill: ${currentCharacter.skill || '-'}</span>
                    </div>
                </span>
            </div>
        </div>
    `;
    
    // Update confirm button based on action and stock
    const confirmBtn = document.getElementById('confirmBtn');
    if (confirmBtn) {
        if (action === 'buy') {
            if (stock <= 0) {
                confirmBtn.disabled = true;
                confirmBtn.innerHTML = '<i class="fas fa-times-circle"></i> Stok Habis';
            } else if (!hasEnoughCurrency()) {
                confirmBtn.disabled = true;
                confirmBtn.innerHTML = '<i class="fas fa-coins"></i> Saldo Tidak Cukup';
            } else {
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i> Ya, Beli Sekarang';
            }
        } else {
            // Untuk mode jual (akan diimplementasikan nanti)
            confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i> Ya, Jual Sekarang';
        }
    }
}

function updateActionTitle() {
    const actionTitle = document.getElementById('actionTitle');
    if (actionTitle) {
        if (action === 'buy') {
            actionTitle.textContent = 'Apakah kamu yakin membeli ini?';
        } else {
            actionTitle.textContent = 'Apakah kamu yakin menjual ini?';
        }
    }
}

function hasEnoughCurrency() {
    if (!currentUser || !currentCharacter) return false;
    
    let hasGold = true;
    let hasCrystal = true;
    
    if (currentCharacter.harga > 0 && currentUser.wallet.koin_emas < currentCharacter.harga) {
        hasGold = false;
    }
    
    if (currentCharacter.harga_dark_crystal > 0 && 
        currentUser.wallet.dark_crystal < currentCharacter.harga_dark_crystal) {
        hasCrystal = false;
    }
    
    return hasGold && hasCrystal;
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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

async function confirmPurchase() {
    if (action === 'buy') {
        await processPurchase();
    } else {
        await processSell();
    }
}

async function processPurchase() {
    if (!hasEnoughCurrency()) {
        showNotification('Saldo tidak cukup!', 'error');
        return;
    }
    
    // Kurangi saldo user
    if (currentCharacter.harga > 0) {
        currentUser.wallet.koin_emas -= currentCharacter.harga;
    }
    if (currentCharacter.harga_dark_crystal > 0) {
        currentUser.wallet.dark_crystal -= currentCharacter.harga_dark_crystal;
    }
    
    // Tambah karakter ke inventory user
    if (!currentUser.inventory) {
        currentUser.inventory = { characters: [] };
    }
    
    const newCharacter = {
        id: currentCharacter.id,
        name: currentCharacter.nama,
        rarity: currentCharacter.rarity,
        value: currentCharacter.harga,
        serial: currentCharacter.serial,
        purchased_at: new Date().toISOString()
    };
    
    currentUser.inventory.characters.push(newCharacter);
    
    // Kurangi stok karakter
    currentCharacter.stok--;
    
    // Update session storage
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update display
    updateCurrencyDisplay();
    renderCharacterDetail();
    
    showNotification(`Berhasil membeli ${currentCharacter.nama}! 🎉`, 'success');
    
    // Redirect setelah 2 detik
    setTimeout(() => {
        window.location.href = 'market.html';
    }, 2000);
}

async function processSell() {
    // Untuk fitur jual (akan diimplementasikan di halaman storage)
    showNotification('Fitur jual akan segera hadir!', 'info');
}

// Event listener untuk tombol konfirmasi
document.addEventListener('DOMContentLoaded', function() {
    const confirmBtn = document.getElementById('confirmBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmPurchase);
    }
});