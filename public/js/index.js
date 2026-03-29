// root/public/js/index.js
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi AOS (Animate on Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 80
        });
    }

    // ==================== MOBILE MENU HANDLER ====================
    const mobileToggle = document.getElementById('mobileToggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    const navbarActions = document.querySelector('.navbar-actions');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            
            if (navbarMenu.style.display === 'flex' && window.innerWidth <= 768) {
                navbarMenu.style.display = 'none';
                if (navbarActions) navbarActions.style.display = 'none';
            } else {
                if (window.innerWidth <= 768) {
                    navbarMenu.style.display = 'flex';
                    navbarMenu.style.flexDirection = 'column';
                    navbarMenu.style.position = 'absolute';
                    navbarMenu.style.top = '70px';
                    navbarMenu.style.left = '0';
                    navbarMenu.style.right = '0';
                    navbarMenu.style.backgroundColor = 'rgba(10, 10, 15, 0.98)';
                    navbarMenu.style.backdropFilter = 'blur(20px)';
                    navbarMenu.style.padding = '1rem';
                    navbarMenu.style.borderRadius = '0';
                    navbarMenu.style.gap = '1rem';
                    navbarMenu.style.zIndex = '999';
                    
                    if (navbarActions) {
                        navbarActions.style.display = 'flex';
                        navbarActions.style.flexDirection = 'column';
                        navbarActions.style.position = 'absolute';
                        navbarActions.style.top = '250px';
                        navbarActions.style.left = '0';
                        navbarActions.style.right = '0';
                        navbarActions.style.backgroundColor = 'rgba(10, 10, 15, 0.98)';
                        navbarActions.style.backdropFilter = 'blur(20px)';
                        navbarActions.style.padding = '1rem';
                        navbarActions.style.gap = '0.5rem';
                        navbarActions.style.zIndex = '999';
                    }
                }
            }
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            const isClickInside = event.target.closest('.navbar') || event.target.closest('.mobile-menu-toggle');
            if (!isClickInside && navbarMenu && navbarMenu.style.display === 'flex') {
                navbarMenu.style.display = 'none';
                if (navbarActions) navbarActions.style.display = 'none';
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            if (navbarMenu) {
                navbarMenu.style.display = '';
                navbarMenu.style.position = '';
                navbarMenu.style.backgroundColor = '';
                navbarMenu.style.padding = '';
                navbarMenu.style.flexDirection = '';
            }
            if (navbarActions) {
                navbarActions.style.display = '';
                navbarActions.style.position = '';
                navbarActions.style.backgroundColor = '';
                navbarActions.style.padding = '';
                navbarActions.style.flexDirection = '';
            }
        }
    });

    // ==================== MODAL HANDLER ====================
    const modal = document.getElementById('demoModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    
    function showModal() {
        if (modal) modal.style.display = 'flex';
    }
    
    function hideModal() {
        if (modal) modal.style.display = 'none';
    }
    
    if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', hideModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    // ==================== BUTTON NAVIGATION ====================
    // Tombol "Masuk Disini" - arah ke halaman login
    const ctaMasuk = document.getElementById('ctaMasukDisini');
    if (ctaMasuk) {
        ctaMasuk.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/public/page/login.html';
        });
    }
    
    // Tombol "Pelajari cara bermain" - arah ke halaman tutorial/guide
    const ctaPelajari = document.getElementById('ctaPelajari');
    if (ctaPelajari) {
        ctaPelajari.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/public/page/guide.html';
        });
    }
    
    // Tombol Login di navbar
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/public/page/login.html';
        });
    }
    
    // Tombol Register/Daftar di navbar
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/public/page/register.html';
        });
    }
    
    // Tombol "Mulai Sekarang" di CTA
    const startNowBtn = document.querySelector('.btn-cta-primary');
    if (startNowBtn) {
        startNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Cek apakah user sudah login
            const userData = sessionStorage.getItem('currentUser');
            if (userData) {
                window.location.href = '/root/page/home.html';
            } else {
                window.location.href = '/public/page/register.html';
            }
        });
    }
    
    // Tombol "Lihat Demo" di CTA
    const demoBtn = document.querySelector('.btn-cta-secondary');
    if (demoBtn) {
        demoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showModal();
        });
    }
    
    // ==================== NAVIGATION LINKS ====================
    // Navigasi untuk menu navbar
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            
            // Cek apakah user sudah login untuk halaman yang membutuhkan login
            const userData = sessionStorage.getItem('currentUser');
            
            switch(page) {
                case 'home':
                case 'beranda':
                    if (userData) {
                        window.location.href = '/root/page/home.html';
                    } else {
                        window.location.href = '/public/page/login.html';
                    }
                    break;
                case 'market':
                    if (userData) {
                        window.location.href = '/root/page/market.html';
                    } else {
                        window.location.href = '/public/page/login.html';
                    }
                    break;
                case 'quest':
                    if (userData) {
                        window.location.href = '/root/page/quest.html';
                    } else {
                        window.location.href = '/public/page/login.html';
                    }
                    break;
                case 'farm':
                    if (userData) {
                        window.location.href = '/root/page/farm.html';
                    } else {
                        window.location.href = '/public/page/login.html';
                    }
                    break;
                default:
                    if (userData) {
                        window.location.href = '/root/page/home.html';
                    } else {
                        window.location.href = '/public/page/login.html';
                    }
            }
        });
    });
    
    // ==================== FEATURE LINKS ====================
    // Feature card links
    const featureLinks = document.querySelectorAll('.feature-link');
    featureLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const userData = sessionStorage.getItem('currentUser');
            const linkText = link.textContent.toLowerCase();
            
            if (linkText.includes('quest')) {
                if (userData) {
                    window.location.href = '/root/page/quest.html';
                } else {
                    window.location.href = '/public/page/login.html';
                }
            } else if (linkText.includes('farm') || linkText.includes('bertani')) {
                if (userData) {
                    window.location.href = '/root/page/farm.html';
                } else {
                    window.location.href = '/public/page/login.html';
                }
            } else if (linkText.includes('level') || linkText.includes('tingkatkan')) {
                if (userData) {
                    window.location.href = '/root/page/home.html';
                } else {
                    window.location.href = '/public/page/login.html';
                }
            } else if (linkText.includes('pasar') || linkText.includes('kunjungi')) {
                if (userData) {
                    window.location.href = '/root/page/market.html';
                } else {
                    window.location.href = '/public/page/login.html';
                }
            } else {
                showModal();
            }
        });
    });
    
    // ==================== STEP ITEMS ====================
    const stepItems = document.querySelectorAll('.step-item');
    stepItems.forEach(step => {
        step.addEventListener('click', () => {
            const userData = sessionStorage.getItem('currentUser');
            if (userData) {
                window.location.href = '/root/page/home.html';
            } else {
                window.location.href = '/public/page/register.html';
            }
        });
    });
    
    // ==================== FOOTER LINKS ====================
    const footerLinks = document.querySelectorAll('.footer-links a, .social-links a');
    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const linkText = link.textContent.toLowerCase();
            
            if (linkText.includes('discord') || linkText.includes('twitter') || 
                linkText.includes('instagram') || linkText.includes('tiktok')) {
                showModal();
            } else {
                // Untuk link lainnya, tampilkan modal
                showModal();
            }
        });
    });
    
    // ==================== NEWSLETTER SUBSCRIBE ====================
    const newsletterBtn = document.querySelector('.newsletter-form button');
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const emailInput = document.querySelector('.newsletter-form input');
            if (emailInput && emailInput.value) {
                showToast('Terima kasih telah berlangganan! 🎉', 'success');
                emailInput.value = '';
            } else {
                showToast('Masukkan email terlebih dahulu', 'error');
            }
        });
    }
    
    // ==================== TESTIMONIAL CARDS ====================
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach(card => {
        card.addEventListener('click', () => {
            showModal();
        });
    });
    
    // ==================== TOAST NOTIFICATION FUNCTION ====================
    function showToast(message, type = 'info') {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 24px;
                border-radius: 12px;
                background: ${type === 'success' ? '#10b981' : '#ef4444'};
                color: white;
                font-weight: 500;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                z-index: 1001;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.background = type === 'success' ? '#10b981' : '#ef4444';
        toast.style.transform = 'translateX(0)';
        
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
        }, 3000);
    }
    
    // ==================== CHECK LOGIN STATUS & UPDATE UI ====================
    function updateNavbarForLoginStatus() {
        const userData = sessionStorage.getItem('currentUser');
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const navbarActions = document.querySelector('.navbar-actions');
        
        if (userData && navbarActions) {
            // Jika sudah login, ubah tombol menjadi user info
            const user = JSON.parse(userData);
            navbarActions.innerHTML = `
                <div class="user-info-mini">
                    <i class="fas fa-user-circle"></i>
                    <span>${user.nama}</span>
                </div>
                <a href="#" class="btn-logout-mini" id="logoutMiniBtn">
                    <i class="fas fa-sign-out-alt"></i> Keluar
                </a>
            `;
            
            const logoutMiniBtn = document.getElementById('logoutMiniBtn');
            if (logoutMiniBtn) {
                logoutMiniBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    sessionStorage.removeItem('currentUser');
                    window.location.reload();
                });
            }
        }
    }
    
    updateNavbarForLoginStatus();
    
    // ==================== SMOOTH SCROLL ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    console.log("CharacterHall.store | Siap menjadi yang terkaya! 🚀");
});