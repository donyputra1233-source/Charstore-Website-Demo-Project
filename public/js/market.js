// Market Page JavaScript
let allCharacters = [];
let currentFilter = 'all';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', function() {
    // Load user data
    loadUserData();
    
    // Load characters
    loadCharacters();
    
    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
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
    
    const user = JSON.parse(userData);
    
    const userName = document.getElementById('userName');
    const userLevelBadge = document.getElementById('userLevelBadge');
    
    if (userName) userName.textContent = user.nama;
    if (userLevelBadge) userLevelBadge.textContent = `Lv.${user.level || 1}`;
    
    return user;
}

async function loadCharacters() {
    try {
        const response = await fetch('/database/characters.json');
        if (response.ok) {
            const data = await response.json();
            allCharacters = data.characters;
            renderCharacters();
        } else {
            // Fallback data jika fetch gagal
            allCharacters = getFallbackCharacters();
            renderCharacters();
        }
    } catch (error) {
        console.error('Error loading characters:', error);
        allCharacters = getFallbackCharacters();
        renderCharacters();
    }
}

function getFallbackCharacters() {
    return [
        { id: "char_001", nama: "Knight Lumina", serial: "KL-001", rarity: "Legendary", rank: "epic", harga: 25000, harga_dark_crystal: 12, foto: "https://placehold.co/200x200/6366f1/white?text=Knight" },
        { id: "char_002", nama: "Shadow Assassin", serial: "SA-002", rarity: "Epic", rank: "epic", harga: 25000, harga_dark_crystal: 12, foto: "https://placehold.co/200x200/a855f7/white?text=Assassin" },
        { id: "char_003", nama: "Frost Archer", serial: "FA-003", rarity: "Rare", rank: "rare", harga: 10000, harga_dark_crystal: 0, foto: "https://placehold.co/200x200/3b82f6/white?text=Archer" }
    ];
}

function renderCharacters() {
    const grid = document.getElementById('characterGrid');
    const resultCount = document.getElementById('resultCount');
    
    if (!grid) return;
    
    // Filter characters
    let filtered = allCharacters;
    
    // Filter by rank
    if (currentFilter !== 'all') {
        filtered = filtered.filter(char => char.rank === currentFilter);
    }
    
    // Filter by search
    if (currentSearch) {
        filtered = filtered.filter(char => 
            char.nama.toLowerCase().includes(currentSearch.toLowerCase())
        );
    }
    
    // Update result count
    if (resultCount) {
        resultCount.textContent = `Menampilkan ${filtered.length} karakter`;
    }
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <p>Tidak ada karakter yang ditemukan</p>
                <p style="font-size: 0.8rem; margin-top: 0.5rem;">Coba kata kunci lain atau reset filter</p>
            </div>
        `;
        return;
    }
    
    // Render characters
    grid.innerHTML = filtered.map(char => `
        <div class="character-card" onclick="goToDetail('${char.id}')">
            <div class="character-image">
                <img src="${char.foto}" alt="${char.nama}" onerror="this.src='https://placehold.co/200x200/6366f1/white?text=${char.nama.charAt(0)}'">
                <span class="rarity-badge rarity-${char.rank}">${char.rarity}</span>
            </div>
            <div class="character-info">
                <h3 class="character-name">${char.nama}</h3>
                <p class="character-serial">Serial: ${char.serial}</p>
                <div class="price-info">
                    ${char.harga > 0 ? `
                        <span class="price-gold">
                            <i class="fas fa-coins"></i> ${formatNumber(char.harga)}
                        </span>
                    ` : ''}
                    ${char.harga_dark_crystal > 0 ? `
                        <span class="price-crystal">
                            <i class="fas fa-gem"></i> ${char.harga_dark_crystal} Dark Crystal
                        </span>
                    ` : ''}
                </div>
                <button class="buy-button" onclick="event.stopPropagation(); buyCharacter('${char.id}')">
                    <i class="fas fa-cart-shopping"></i> Beli
                </button>
            </div>
        </div>
    `).join('');
}

function filterByRank(rank) {
    currentFilter = rank;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.rank === rank) {
            btn.classList.add('active');
        }
    });
    
    renderCharacters();
}

function filterCharacters() {
    const searchInput = document.getElementById('searchInput');
    currentSearch = searchInput ? searchInput.value : '';
    renderCharacters();
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function goToDetail(characterId) {
    // Simpan karakter yang dipilih ke sessionStorage
    const selectedChar = allCharacters.find(c => c.id === characterId);
    if (selectedChar) {
        sessionStorage.setItem('selectedCharacter', JSON.stringify(selectedChar));
    }
    window.location.href = `detail.html?id=${characterId}`;
}

async function buyCharacter(characterId) {
    const userData = sessionStorage.getItem('currentUser');
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(userData);
    const character = allCharacters.find(c => c.id === characterId);
    
    if (!character) {
        showNotification('Karakter tidak ditemukan!', 'error');
        return;
    }
    
    // Cek apakah user memiliki cukup koin
    let canBuy = true;
    let errorMsg = '';
    
    if (character.harga > 0 && user.wallet.koin_emas < character.harga) {
        canBuy = false;
        errorMsg = `Koin Emas tidak cukup! Butuh ${formatNumber(character.harga)} Koin`;
    }
    
    if (character.harga_dark_crystal > 0 && user.wallet.dark_crystal < character.harga_dark_crystal) {
        canBuy = false;
        errorMsg = `Dark Crystal tidak cukup! Butuh ${character.harga_dark_crystal} Dark Crystal`;
    }
    
    if (!canBuy) {
        showNotification(errorMsg, 'error');
        return;
    }
    
    // Simpan karakter yang akan dibeli ke sessionStorage untuk detail
    sessionStorage.setItem('purchaseCharacter', JSON.stringify(character));
    
    // Redirect ke halaman detail untuk konfirmasi pembelian
    window.location.href = `/root/page/detail.html?action=buy&id=${characterId}`;
}

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
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.style.background = type === 'error' ? '#ef4444' : '#10b981';
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}