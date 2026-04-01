// public/js/login.js
// CharacterHall.store - Login System with redirect to home.html

(function() {
    'use strict';

    // Database URL (user.json)
    const DATABASE_URL = '../../database/user.json';
    
    // Redirect target setelah login sukses (ke home.html di folder pages)
    const REDIRECT_URL = '../pages/home.html';
    
    // State
    let usersData = [];
    let isLoading = false;

    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');
    const loginBtn = document.getElementById('loginBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const registerLink = document.getElementById('registerLink');

    // Inisialisasi
    async function init() {
        await loadUserData();
        attachEventListeners();
        
        // Cek apakah sudah login sebelumnya (session storage)
        checkExistingSession();
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
                console.warn('Format database tidak dikenali, menggunakan array kosong');
                usersData = [];
            }
            
            console.log(`✅ Database loaded: ${usersData.length} users ditemukan`);
        } catch (error) {
            console.error('Error loading user database:', error);
            showAlert('Gagal memuat database pengguna. Silakan refresh halaman.', 'error');
            
            // Fallback data untuk testing jika file tidak ditemukan
            usersData = getFallbackData();
        }
    }

    // Fallback data jika file user.json tidak ada
    function getFallbackData() {
        return [
            {
                fullname: "Admin Character",
                username: "admin",
                password: "admin123",
                level: 10,
                jumlah_card: 25,
                card: ["Waifu Rare", "Mythic Card", "Legendary"]
            },
            {
                fullname: "John Doe",
                username: "johndoe",
                password: "john123",
                level: 5,
                jumlah_card: 12,
                card: ["Common Card", "Rare Card"]
            },
            {
                fullname: "Jane Smith",
                username: "janesmith",
                password: "jane456",
                level: 8,
                jumlah_card: 18,
                card: ["Epic Card", "Waifu Limited"]
            }
        ];
    }

    // Attach event listeners
    function attachEventListeners() {
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
        }
        
        if (registerLink) {
            registerLink.addEventListener('click', handleRegisterClick);
        }
        
        // Real-time validation
        if (usernameInput) {
            usernameInput.addEventListener('input', () => clearError(usernameError));
        }
        if (passwordInput) {
            passwordInput.addEventListener('input', () => clearError(passwordError));
        }
        
        // Enter key submit
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && loginForm) {
                    loginForm.dispatchEvent(new Event('submit'));
                }
            });
        }
    }

    // Handle login submission
    async function handleLogin(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearAllErrors();
        
        // Get values
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Validasi input
        let isValid = true;
        
        if (!username) {
            showFieldError(usernameError, 'Nama atau username tidak boleh kosong');
            isValid = false;
        }
        
        if (!password) {
            showFieldError(passwordError, 'Kata sandi tidak boleh kosong');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Show loading
        showLoading(true);
        
        // Simulasi delay untuk efek loading
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Validasi user dengan password dari database
        const user = validateUser(username, password);
        
        if (user) {
            // Login sukses
            handleLoginSuccess(user);
        } else {
            // Login gagal
            handleLoginFailure();
        }
        
        showLoading(false);
    }

    // Validate user credentials dengan password dari database
    function validateUser(username, password) {
        // Cari user berdasarkan username (case insensitive)
        const user = usersData.find(u => 
            u.username && u.username.toLowerCase() === username.toLowerCase()
        );
        
        if (!user) {
            return null;
        }
        
        // Validasi password (case sensitive untuk keamanan)
        if (user.password && user.password === password) {
            return user;
        }
        
        return null;
    }

    // Handle successful login - redirect ke home.html
    function handleLoginSuccess(user) {
        // Simpan data user ke session storage (tanpa password)
        const sessionData = {
            fullname: user.fullname,
            username: user.username,
            level: user.level,
            jumlah_card: user.jumlah_card,
            card: user.card,
            loginTime: new Date().toISOString()
        };
        
        sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
        sessionStorage.setItem('isLoggedIn', 'true');
        
        showAlert(`Selamat datang kembali, ${user.fullname || user.username}! ✨ Mengarahkan ke dashboard...`, 'success');
        
        // Redirect ke public/pages/home.html setelah 1 detik
        setTimeout(() => {
            window.location.href = REDIRECT_URL;
        }, 1000);
    }

    // Handle login failure
    function handleLoginFailure() {
        showAlert('Username atau kata sandi salah. Silakan coba lagi.', 'error');
        passwordInput.value = '';
        passwordInput.focus();
    }

    // Toggle password visibility
    function togglePasswordVisibility() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = togglePasswordBtn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        }
    }

    // Handle register link click
    function handleRegisterClick(e) {
        e.preventDefault();
        
        // Tampilkan daftar akun demo yang tersedia
        const demoAccounts = usersData.map(user => 
            `• ${user.username} | Password: ${user.password}`
        ).join('\n');
        
        showAlert(
            `📝 Fitur registrasi akan segera hadir! 🎉\n\nAkun demo yang tersedia:\n${demoAccounts}\n\n✨ Gunakan akun di atas untuk login ke home.html`,
            'info'
        );
    }

    // Check existing session
    function checkExistingSession() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        if (isLoggedIn === 'true') {
            const user = JSON.parse(sessionStorage.getItem('currentUser'));
            if (user) {
                showAlert(`Selamat datang kembali, ${user.fullname || user.username}! Mengarahkan ke dashboard...`, 'success');
                setTimeout(() => {
                    window.location.href = REDIRECT_URL;
                }, 1500);
            }
        }
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
        clearError(usernameError);
        clearError(passwordError);
    }
    
    function showLoading(show) {
        isLoading = show;
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
        if (loginBtn) {
            loginBtn.disabled = show;
            if (show) {
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Memproses...';
            } else {
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Masuk';
            }
        }
    }
    
    // Custom alert toast
    function showAlert(message, type = 'info') {
        // Hapus alert yang sudah ada
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
        
        // Handle multi-line message
        const formattedMessage = message.replace(/\n/g, '<br>');
        
        alertToast.innerHTML = `
            ${icon}
            <span>${formattedMessage}</span>
        `;
        
        alertContainer.appendChild(alertToast);
        document.body.appendChild(alertContainer);
        
        // Auto remove after 4 seconds (lebih lama untuk multi-line)
        const duration = message.includes('\n') ? 6000 : 3000;
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
        
        .alert-toast span {
            white-space: pre-line;
            line-height: 1.4;
        }
    `;
    document.head.appendChild(style);
    
    // Start initialization
    init();
})();