// public/js/home.js
// CharacterHall.store - Home Page with user.json data

(function() {
    'use strict';

    // Database URL
    const DATABASE_URL = '../../database/user.json';
    
    // State
    let currentUser = null;
    let allUsers = [];

    // DOM Elements
    const userNameSpan = document.getElementById('userName');
    const userLevelSpan = document.getElementById('userLevel');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const logoutBtn = document.getElementById('logoutBtn');

    // Currency Elements
    const goldCoinSpan = document.getElementById('goldCoin');
    const darkRubySpan = document.getElementById('darkRuby');
    const andesiteDustSpan = document.getElementById('andesiteDust');
    const stonecallerSpan = document.getElementById('stonecaller');
    const cardFragmentsSpan = document.getElementById('cardFragments');

    // Inisialisasi
    async function init() {
        await loadUserData();
        checkSession();
        attachEventListeners();
        updateUI();
    }

    // Load data dari user.json
    async function loadUserData() {
        try {
            const response = await fetch(DATABASE_URL);
            if (!response.ok) {
                throw new Error('Gagal memuat database');
            }
            const data = await response.json();
            
            if (data.users && Array.isArray(data.users)) {
                allUsers = data.users;
            } else if (Array.isArray(data)) {
                allUsers = data;
            }
            
            console.log(`✅ Database loaded: ${allUsers.length} users`);
        } catch (error) {
            console.error('Error loading database:', error);
            allUsers = [];
        }
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
        const fullUserData = allUsers.find(u => u.username === currentUser.username);
        if (fullUserData) {
            currentUser = { ...currentUser, ...fullUserData };
            // Update session dengan data lengkap
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    }

    // Attach event listeners
    function attachEventListeners() {
        // Logout handler
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.removeItem('currentUser');
                sessionStorage.removeItem('isLoggedIn');
                window.location.href = logoutBtn.getAttribute('href');
            });
        }
    }

    // Update UI dengan data user
    function updateUI() {
        if (!currentUser) return;
        
        userNameSpan.textContent = currentUser.fullname || currentUser.username;
        userLevelSpan.textContent = `Lv.${currentUser.level || 1}`;
        welcomeMessage.textContent = `Selamat datang, ${currentUser.fullname || currentUser.username}!`;
        
        // Update currency jika ada
        if (currentUser.currency) {
            goldCoinSpan.textContent = formatNumber(currentUser.currency.gold_coin || 0);
            darkRubySpan.textContent = formatNumber(currentUser.currency.dark_ruby || 0);
            andesiteDustSpan.textContent = formatNumber(currentUser.currency.andesite_dust || 0);
            stonecallerSpan.textContent = formatNumber(currentUser.currency.stonecaller || 0);
            cardFragmentsSpan.textContent = formatNumber(currentUser.currency.card_fragments || 0);
        } else {
            // Default currency jika tidak ada
            goldCoinSpan.textContent = '0';
            darkRubySpan.textContent = '0';
            andesiteDustSpan.textContent = '0';
            stonecallerSpan.textContent = '0';
            cardFragmentsSpan.textContent = '0';
        }
    }

    // Format number dengan separator
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    
    // Start initialization
    init();
})();                                                                                                                                           