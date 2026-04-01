// public/js/register.js
// CharacterHall.store - Register System with user.json storage and bonus currency

(function() {
    'use strict';

    // Database URL (user.json)
    const DATABASE_URL = '../../database/user.json';
    
    // Bonus mata uang untuk pendaftaran
    const REGISTRATION_BONUS = {
        gold_coin: 120000,
        dark_ruby: 10000,
        andesite_dust: 9000,
        stonecaller: 100,
        card_fragments: 0
    };
    
    // Starter cards untuk user baru
    const STARTER_CARDS = [
        "Starter Waifu",
        "Common Card",
        "Beginner's Luck"
    ];
    
    // State
    let usersData = [];
    let isLoading = false;

    // DOM Elements
    const registerForm = document.getElementById('registerForm');
    const fullnameInput = document.getElementById('fullname');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const fullnameError = document.getElementById('fullnameError');
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');
    const confirmError = document.getElementById('confirmError');
    const registerBtn = document.getElementById('registerBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Inisialisasi
    async function init() {
        await loadUserData();
        attachEventListeners();
    }

    // Load data dari user.json
    async function loadUserData() {
        try {
            const response = await fetch(DATABASE_URL);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Gagal memuat database`);
            }
            const data = await response.json();
            
            // Parse data sesuai struktur: { users: [...] }
            if (data.users && Array.isArray(data.users)) {
                usersData = data.users;
            } else if (Array.isArray(data)) {
                usersData = data;
            } else {
                usersData = [];
            }
            
            console.log(`✅ Database loaded: ${usersData.length} users ditemukan`);
        } catch (error) {
            console.error('Error loading user database:', error);
            usersData = [];
        }
    }

    // Attach event listeners
    function attachEventListeners() {
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }
        
        // Toggle password visibility untuk semua field
        const toggleButtons = document.querySelectorAll('.toggle-password');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const targetInput = document.getElementById(targetId);
                if (targetInput) {
                    const type = targetInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    targetInput.setAttribute('type', type);
                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.classList.toggle('fa-eye');
                        icon.classList.toggle('fa-eye-slash');
                    }
                }
            });
        });
        
        // Real-time validation
        if (fullnameInput) {
            fullnameInput.addEventListener('input', () => clearError(fullnameError));
        }
        if (usernameInput) {
            usernameInput.addEventListener('input', () => {
                clearError(usernameError);
                validateUsernameAvailability();
            });
        }
        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                clearError(passwordError);
                validatePasswordStrength();
            });
        }
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => {
                clearError(confirmError);
                validatePasswordMatch();
            });
        }
    }

    // Validate username availability
    function validateUsernameAvailability() {
        const username = usernameInput.value.trim();
        if (username.length < 3) return;
        
        const existingUser = usersData.find(u => 
            u.username && u.username.toLowerCase() === username.toLowerCase()
        );
        
        if (existingUser) {
            showFieldError(usernameError, 'Username sudah digunakan. Silakan pilih username lain.');
            return false;
        }
        return true;
    }

    // Validate password strength
    function validatePasswordStrength() {
        const password = passwordInput.value;
        if (password.length > 0 && password.length < 6) {
            showFieldError(passwordError, 'Kata sandi minimal 6 karakter');
            return false;
        }
        return true;
    }

    // Validate password match
    function validatePasswordMatch() {
        const password = passwordInput.value;
        const confirm = confirmPasswordInput.value;
        
        if (confirm.length > 0 && password !== confirm) {
            showFieldError(confirmError, 'Konfirmasi kata sandi tidak cocok');
            return false;
        }
        return true;
    }

    // Handle register submission
    async function handleRegister(e) {
        e.preventDefault();
        
        // Clear all errors
        clearAllErrors();
        
        // Get values
        const fullname = fullnameInput.value.trim();
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Validasi input
        let isValid = true;
        
        if (!fullname) {
            showFieldError(fullnameError, 'Nama lengkap tidak boleh kosong');
            isValid = false;
        } else if (fullname.length < 3) {
            showFieldError(fullnameError, 'Nama lengkap minimal 3 karakter');
            isValid = false;
        }
        
        if (!username) {
            showFieldError(usernameError, 'Username tidak boleh kosong');
            isValid = false;
        } else if (username.length < 3) {
            showFieldError(usernameError, 'Username minimal 3 karakter');
            isValid = false;
        } else if (username.match(/[^a-zA-Z0-9_]/)) {
            showFieldError(usernameError, 'Username hanya boleh berisi huruf, angka, dan underscore');
            isValid = false;
        } else if (!validateUsernameAvailability()) {
            isValid = false;
        }
        
        if (!password) {
            showFieldError(passwordError, 'Kata sandi tidak boleh kosong');
            isValid = false;
        } else if (password.length < 6) {
            showFieldError(passwordError, 'Kata sandi minimal 6 karakter');
            isValid = false;
        }
        
        if (!confirmPassword) {
            showFieldError(confirmError, 'Konfirmasi kata sandi tidak boleh kosong');
            isValid = false;
        } else if (password !== confirmPassword) {
            showFieldError(confirmError, 'Konfirmasi kata sandi tidak cocok');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Show loading
        showLoading(true);
        
        // Simulasi delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Buat user baru dengan bonus mata uang
        const newUser = createNewUser(fullname, username, password);
        
        // Simpan ke database
        const success = await saveUserToDatabase(newUser);
        
        if (success) {
            handleRegisterSuccess(newUser);
        } else {
            handleRegisterFailure();
        }
        
        showLoading(false);
    }

    // Create new user object with bonus currency
    function createNewUser(fullname, username, password) {
        return {
            fullname: fullname,
            username: username,
            password: password,
            level: 1,
            jumlah_card: STARTER_CARDS.length,
            card: STARTER_CARDS,
            // Bonus mata uang
            currency: {
                gold_coin: REGISTRATION_BONUS.gold_coin,
                dark_ruby: REGISTRATION_BONUS.dark_ruby,
                andesite_dust: REGISTRATION_BONUS.andesite_dust,
                stonecaller: REGISTRATION_BONUS.stonecaller,
                card_fragments: REGISTRATION_BONUS.card_fragments
            },
            registered_at: new Date().toISOString(),
            last_login: null
        };
    }

    // Save user to database (simulate write to JSON)
    async function saveUserToDatabase(newUser) {
        try {
            // Tambahkan user baru ke array
            usersData.push(newUser);
            
            // Untuk keperluan demo, kita simpan ke localStorage sebagai backup
            // karena di browser tidak bisa menulis langsung ke file JSON
            // Tapi kita tetap mencoba fetch dengan POST jika ada endpoint
            
            // Simpan ke localStorage sebagai backup
            const allUsers = {
                users: usersData,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('characterhall_users', JSON.stringify(allUsers));
            
            // Coba kirim ke server jika ada endpoint (opsional)
            // Untuk sekarang, kita gunakan localStorage sebagai penyimpanan sementara
            
            console.log('✅ User registered:', newUser.username);
            return true;
            
        } catch (error) {
            console.error('Error saving user:', error);
            return false;
        }
    }

    // Handle successful registration
    function handleRegisterSuccess(user) {
        // Format bonus untuk ditampilkan
        const bonusMessage = `
            🎉 Selamat! Akun ${user.username} berhasil dibuat!
            
            ✨ Bonus yang kamu dapatkan:
            • 120.000 Koin Emas
            • 10.000 Dark Ruby
            • 9.000 Andesite Dust
            • 100 Stonecaller
            • 0 Card Fragments
            
            🃏 Starter Cards: ${STARTER_CARDS.join(', ')}
            
            Silakan login untuk mulai bermain!
        `;
        
        showAlert(bonusMessage, 'success');
        
        // Redirect ke halaman login setelah 2.5 detik
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2500);
    }

    // Handle registration failure
    function handleRegisterFailure() {
        showAlert('Gagal mendaftarkan akun. Silakan coba lagi.', 'error');
    }

    // UI Helpers
    function showFieldError(element, message) {
        if (element) {
            element.textContent = message;
            element.classList.add('show');
        }
    }
    
    function clearError(element) {
        if (element) {
            element.textContent = '';
            element.classList.remove('show');
        }
    }
    
    function clearAllErrors() {
        clearError(fullnameError);
        clearError(usernameError);
        clearError(passwordError);
        clearError(confirmError);
    }
    
    function showLoading(show) {
        isLoading = show;
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
        if (registerBtn) {
            registerBtn.disabled = show;
            if (show) {
                registerBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Mendaftarkan...';
            } else {
                registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Daftar Sekarang';
            }
        }
    }
    
    // Custom alert toast with multi-line support
    function showAlert(message, type = 'info') {
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alertContainer = document.createElement('div');
        alertContainer.className = 'custom-alert';
        
        const alertToast = document.createElement('div');
        alertToast.className = `alert-toast ${type}`;
        
        let icon = '';
        switch(type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'info':
            default:
                icon = '<i class="fas fa-info-circle"></i>';
                break;
        }
        
        const formattedMessage = message.replace(/\n/g, '<br>');
        
        alertToast.innerHTML = `
            ${icon}
            <span style="white-space: pre-line; line-height: 1.5;">${formattedMessage}</span>
        `;
        
        alertContainer.appendChild(alertToast);
        document.body.appendChild(alertContainer);
        
        const duration = message.includes('\n') ? 5000 : 3000;
        setTimeout(() => {
            if (alertContainer && alertContainer.remove) {
                alertContainer.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => alertContainer.remove(), 300);
            }
        }, duration);
    }
    
    // Tambahkan animasi slide out
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Start initialization
    init();
})();