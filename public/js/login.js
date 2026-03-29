class AuthManager {
    constructor() {
        this.userData = null;
        this.init();
    }

    init() {
        this.form = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.loginBtn = document.getElementById('loginBtn');
        this.togglePasswordBtn = document.getElementById('togglePassword');
        this.rememberCheckbox = document.getElementById('rememberMe');
        this.toast = document.getElementById('toast');

        this.setupEventListeners();
        this.checkRememberedUser();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleLogin(e));
        this.togglePasswordBtn.addEventListener('click', () => this.togglePassword());
        
        // Input validation on blur
        this.usernameInput.addEventListener('blur', () => this.validateUsername());
        this.passwordInput.addEventListener('blur', () => this.validatePassword());
        
        // Register link
        const registerLink = document.getElementById('registerLink');
        if (registerLink) {
            registerLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showToast('Fitur pendaftaran akan segera hadir! 🎉', 'info');
                window.location.href = 'register.html';
            });
        }
        
        // Forgot password
        const forgotLink = document.getElementById('forgotPassword');
        if (forgotLink) {
            forgotLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showToast('Hubungi admin untuk reset password', 'info');
            });
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        // Clear previous errors
        this.clearErrors();
        
        // Validate inputs
        if (!this.validateUsername() || !this.validatePassword()) {
            return;
        }
        
        // Show loading state
        this.setLoading(true);
        
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value;
        
        try {
            // Fetch user data from database
            const user = await this.authenticateUser(username, password);
            
            if (user) {
                // Save user session
                this.saveUserSession(user);
                
                // Show success message
                this.showToast(`Selamat datang kembali, ${user.nama}! 🎉`, 'success');
                
                // Redirect to home after short delay
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1000);
            } else {
                this.showToast('Username atau kata sandi salah!', 'error');
                this.passwordInput.classList.add('error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
// Update authenticateUser method in login.js to check localStorage as well
async authenticateUser(username, password) {
    try {
        // First try to fetch from user.json
        const response = await fetch('/database/user.json');
        if (response.ok) {
            const data = await response.json();
            const user = data.users.find(u => u.username === username && u.password === password);
            if (user) {
                const { password: _, ...userWithoutPassword } = user;
                return userWithoutPassword;
            }
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
    
    // Check from localStorage (for newly registered users)
    const localUsers = localStorage.getItem('registeredUsers');
    if (localUsers) {
        const users = JSON.parse(localUsers);
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
    }
    
    // Fallback hardcoded admin
    if (username === 'admin' && password === 'admin123') {
        return {
            id: 1,
            nama: 'AdminUser',
            username: 'admin',
            email: 'admin@characterhall.com',
            wallet: {
                koin_emas: 15000,
                dark_crystal: 350,
                ruby: 125
            },
            inventory: {
                characters: [
                    { id: 'char_001', name: 'Knight Lumina', rarity: 'Legendary', value: 2500 },
                    { id: 'char_002', name: 'Shadow Assassin', rarity: 'Epic', value: 1200 }
                ]
            },
            level: 12,
            xp: 2450
        };
    }
    
    return null;
}
    
    saveUserSession(user) {
        // Save to localStorage if remember me is checked
        if (this.rememberCheckbox.checked) {
            localStorage.setItem('rememberedUser', user.username);
        }
        
        // Save session data
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        // Dispatch event for other pages
        window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
    }
    
    checkRememberedUser() {
        const rememberedUser = localStorage.getItem('rememberedUser');
        if (rememberedUser) {
            this.usernameInput.value = rememberedUser;
            this.rememberCheckbox.checked = true;
            this.passwordInput.focus();
        }
    }
    
    validateUsername() {
        const username = this.usernameInput.value.trim();
        const errorElement = document.getElementById('usernameError');
        
        if (!username) {
            this.showError(errorElement, 'Nama pengguna harus diisi');
            this.usernameInput.classList.add('error');
            return false;
        } else if (username.length < 3) {
            this.showError(errorElement, 'Nama pengguna minimal 3 karakter');
            this.usernameInput.classList.add('error');
            return false;
        }
        
        this.usernameInput.classList.remove('error');
        errorElement.classList.remove('show');
        return true;
    }
    
    validatePassword() {
        const password = this.passwordInput.value;
        const errorElement = document.getElementById('passwordError');
        
        if (!password) {
            this.showError(errorElement, 'Kata sandi harus diisi');
            this.passwordInput.classList.add('error');
            return false;
        } else if (password.length < 4) {
            this.showError(errorElement, 'Kata sandi minimal 4 karakter');
            this.passwordInput.classList.add('error');
            return false;
        }
        
        this.passwordInput.classList.remove('error');
        errorElement.classList.remove('show');
        return true;
    }
    
    showError(element, message) {
        element.textContent = message;
        element.classList.add('show');
    }
    
    clearErrors() {
        document.querySelectorAll('.input-error').forEach(el => {
            el.classList.remove('show');
        });
        document.querySelectorAll('input').forEach(input => {
            input.classList.remove('error');
        });
    }
    
    togglePassword() {
        const type = this.passwordInput.type === 'password' ? 'text' : 'password';
        this.passwordInput.type = type;
        const icon = this.togglePasswordBtn.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    }
    
    setLoading(isLoading) {
        if (isLoading) {
            this.loginBtn.classList.add('loading');
            this.loginBtn.innerHTML = '<i class="fas fa-spinner"></i> Memproses...';
            this.loginBtn.disabled = true;
        } else {
            this.loginBtn.classList.remove('loading');
            this.loginBtn.innerHTML = '<i class="fas fa-arrow-right-to-bracket"></i> Masuk';
            this.loginBtn.disabled = false;
        }
    }
    
    showToast(message, type = 'info') {
        this.toast.textContent = message;
        this.toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});