class RegisterManager {
    constructor() {
        this.users = [];
        this.init();
    }

    init() {
        this.form = document.getElementById('registerForm');
        this.namaInput = document.getElementById('nama');
        this.usernameInput = document.getElementById('username');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.confirmInput = document.getElementById('confirmPassword');
        this.registerBtn = document.getElementById('registerBtn');
        this.termsCheckbox = document.getElementById('termsCheckbox');
        this.toast = document.getElementById('toast');
        
        this.setupEventListeners();
        this.loadUsers();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleRegister(e));
        
        // Toggle password visibility
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', () => this.togglePassword(btn.dataset.target));
        });
        
        // Real-time validation
        this.namaInput.addEventListener('blur', () => this.validateNama());
        this.usernameInput.addEventListener('blur', () => this.validateUsername());
        this.emailInput.addEventListener('blur', () => this.validateEmail());
        this.passwordInput.addEventListener('blur', () => this.validatePassword());
        this.confirmInput.addEventListener('blur', () => this.validateConfirmPassword());
        
        // Terms link
        const termsLink = document.getElementById('termsLink');
        if (termsLink) {
            termsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showToast('Syarat & Ketentuan akan segera hadir', 'info');
            });
        }
    }

    async loadUsers() {
        try {
            const response = await fetch('/database/user.json');
            if (response.ok) {
                const data = await response.json();
                this.users = data.users || [];
            }
        } catch (error) {
            console.error('Error loading users:', error);
            this.users = [];
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        // Clear previous errors
        this.clearErrors();
        
        // Validate all fields
        const isNamaValid = this.validateNama();
        const isUsernameValid = await this.validateUsername();
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        const isConfirmValid = this.validateConfirmPassword();
        const isTermsChecked = this.validateTerms();
        
        if (!isNamaValid || !isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmValid || !isTermsChecked) {
            this.showToast('Harap lengkapi data dengan benar', 'error');
            return;
        }
        
        // Check if username already exists
        if (await this.isUsernameExists(this.usernameInput.value.trim())) {
            this.showError('usernameError', 'Username sudah digunakan');
            this.usernameInput.classList.add('error');
            return;
        }
        
        // Check if email already exists
        if (await this.isEmailExists(this.emailInput.value.trim())) {
            this.showError('emailError', 'Email sudah terdaftar');
            this.emailInput.classList.add('error');
            return;
        }
        
        // Create new user
        const newUser = this.createUserObject();
        
        // Save to database
        await this.saveUser(newUser);
        
        // Show success and redirect
        this.showToast(`Selamat! Akun ${newUser.nama} berhasil dibuat. Reward telah ditambahkan ke dompetmu! 🎉`, 'success');
        
        // Store user session and redirect to home
        setTimeout(() => {
            sessionStorage.setItem('currentUser', JSON.stringify(newUser));
            window.location.href = '/root/page/home.html';
        }, 1500);
    }

    createUserObject() {
        const now = new Date().toISOString();
        
        return {
            id: Date.now(),
            nama: this.namaInput.value.trim(),
            username: this.usernameInput.value.trim(),
            password: this.passwordInput.value,
            email: this.emailInput.value.trim(),
            created_at: now,
            wallet: {
                koin_emas: 10000,
                dark_crystal: 100,
                ruby: 10
            },
            inventory: {
                characters: [
                    {
                        id: "starter_char_001",
                        name: "Pemula Warrior",
                        rarity: "Common",
                        value: 100
                    },
                    {
                        id: "starter_char_002",
                        name: "Mage Pemula",
                        rarity: "Common",
                        value: 100
                    }
                ]
            },
            level: 1,
            xp: 0,
            registration_reward_claimed: true
        };
    }

    async saveUser(newUser) {
        try {
            // Add to users array
            this.users.push(newUser);
            
            // Save to user.json
            const data = { users: this.users };
            const response = await fetch('../../database/user.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            // Since we can't actually write to file from frontend (would need backend),
            // we'll store in localStorage for demo purposes
            localStorage.setItem('registeredUsers', JSON.stringify(this.users));
            
            console.log('User saved successfully:', newUser.username);
            
        } catch (error) {
            console.error('Error saving user:', error);
            // Fallback: store in localStorage
            const existingUsers = localStorage.getItem('registeredUsers');
            let allUsers = existingUsers ? JSON.parse(existingUsers) : [];
            allUsers.push(newUser);
            localStorage.setItem('registeredUsers', JSON.stringify(allUsers));
        }
    }

    async isUsernameExists(username) {
        // Check from loaded users
        const exists = this.users.some(user => user.username === username);
        
        // Also check from localStorage backup
        const localUsers = localStorage.getItem('registeredUsers');
        if (localUsers) {
            const users = JSON.parse(localUsers);
            return exists || users.some(user => user.username === username);
        }
        
        return exists;
    }

    async isEmailExists(email) {
        const exists = this.users.some(user => user.email === email);
        
        const localUsers = localStorage.getItem('registeredUsers');
        if (localUsers) {
            const users = JSON.parse(localUsers);
            return exists || users.some(user => user.email === email);
        }
        
        return exists;
    }

    validateNama() {
        const nama = this.namaInput.value.trim();
        const errorElement = document.getElementById('namaError');
        
        if (!nama) {
            this.showError('namaError', 'Nama lengkap harus diisi');
            this.namaInput.classList.add('error');
            return false;
        } else if (nama.length < 3) {
            this.showError('namaError', 'Nama lengkap minimal 3 karakter');
            this.namaInput.classList.add('error');
            return false;
        }
        
        this.namaInput.classList.remove('error');
        errorElement.classList.remove('show');
        return true;
    }

    async validateUsername() {
        const username = this.usernameInput.value.trim();
        const errorElement = document.getElementById('usernameError');
        
        if (!username) {
            this.showError('usernameError', 'Username harus diisi');
            this.usernameInput.classList.add('error');
            return false;
        } else if (username.length < 3) {
            this.showError('usernameError', 'Username minimal 3 karakter');
            this.usernameInput.classList.add('error');
            return false;
        } else if (username.length > 20) {
            this.showError('usernameError', 'Username maksimal 20 karakter');
            this.usernameInput.classList.add('error');
            return false;
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            this.showError('usernameError', 'Username hanya boleh huruf, angka, dan underscore');
            this.usernameInput.classList.add('error');
            return false;
        }
        
        // Check if username exists
        if (await this.isUsernameExists(username)) {
            this.showError('usernameError', 'Username sudah digunakan');
            this.usernameInput.classList.add('error');
            return false;
        }
        
        this.usernameInput.classList.remove('error');
        errorElement.classList.remove('show');
        return true;
    }

    validateEmail() {
        const email = this.emailInput.value.trim();
        const errorElement = document.getElementById('emailError');
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        
        if (!email) {
            this.showError('emailError', 'Email harus diisi');
            this.emailInput.classList.add('error');
            return false;
        } else if (!emailRegex.test(email)) {
            this.showError('emailError', 'Format email tidak valid');
            this.emailInput.classList.add('error');
            return false;
        }
        
        this.emailInput.classList.remove('error');
        errorElement.classList.remove('show');
        return true;
    }

    validatePassword() {
        const password = this.passwordInput.value;
        const errorElement = document.getElementById('passwordError');
        
        if (!password) {
            this.showError('passwordError', 'Kata sandi harus diisi');
            this.passwordInput.classList.add('error');
            return false;
        } else if (password.length < 6) {
            this.showError('passwordError', 'Kata sandi minimal 6 karakter');
            this.passwordInput.classList.add('error');
            return false;
        } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
            this.showError('passwordError', 'Kata sandi harus mengandung huruf dan angka');
            this.passwordInput.classList.add('error');
            return false;
        }
        
        this.passwordInput.classList.remove('error');
        errorElement.classList.remove('show');
        return true;
    }

    validateConfirmPassword() {
        const password = this.passwordInput.value;
        const confirm = this.confirmInput.value;
        const errorElement = document.getElementById('confirmError');
        
        if (!confirm) {
            this.showError('confirmError', 'Konfirmasi kata sandi harus diisi');
            this.confirmInput.classList.add('error');
            return false;
        } else if (password !== confirm) {
            this.showError('confirmError', 'Kata sandi tidak cocok');
            this.confirmInput.classList.add('error');
            return false;
        }
        
        this.confirmInput.classList.remove('error');
        errorElement.classList.remove('show');
        return true;
    }

    validateTerms() {
        const errorElement = document.getElementById('termsError');
        
        if (!this.termsCheckbox.checked) {
            if (!document.getElementById('termsError')) {
                const termsGroup = document.querySelector('.form-options');
                const errorDiv = document.createElement('div');
                errorDiv.id = 'termsError';
                errorDiv.className = 'input-error';
                errorDiv.style.marginTop = '0.5rem';
                errorDiv.textContent = 'Harap setujui syarat & ketentuan';
                termsGroup.appendChild(errorDiv);
                setTimeout(() => errorDiv.classList.add('show'), 10);
            } else {
                const errorDiv = document.getElementById('termsError');
                errorDiv.textContent = 'Harap setujui syarat & ketentuan';
                errorDiv.classList.add('show');
            }
            return false;
        }
        
        const errorDiv = document.getElementById('termsError');
        if (errorDiv) {
            errorDiv.classList.remove('show');
        }
        return true;
    }

    togglePassword(targetId) {
        const input = document.getElementById(targetId);
        const icon = event.currentTarget.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.classList.add('show');
        }
    }

    clearErrors() {
        document.querySelectorAll('.input-error').forEach(el => {
            el.classList.remove('show');
        });
        document.querySelectorAll('input').forEach(input => {
            input.classList.remove('error');
        });
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.registerBtn.classList.add('loading');
            this.registerBtn.innerHTML = '<i class="fas fa-spinner"></i> Mendaftarkan...';
            this.registerBtn.disabled = true;
        } else {
            this.registerBtn.classList.remove('loading');
            this.registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Daftar Sekarang';
            this.registerBtn.disabled = false;
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

// Initialize register manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RegisterManager();
});