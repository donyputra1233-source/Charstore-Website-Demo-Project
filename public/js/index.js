// root/public/js/index.js
// CharacterHall.store - Interaktivitas & Fitur Dinamis

(function() {
    'use strict';

    // State untuk tracking event dan interaksi
    const state = {
        isBubbleAnimating: false,
        clickCount: 0
    };

    // DOM Elements
    const elements = {
        masukBtn: null,
        pelajariBtn: null,
        discordLink: null,
        whatsappLink: null,
        telegramLink: null,
        mascot: null,
        bubbleText: null,
        speechBubble: null
    };

    // Fungsi untuk inisialisasi setelah DOM siap
    function init() {
        cacheDomElements();
        attachEventListeners();
        setupInteractiveMascot();
        setupButtonEffects();
        logBetaInfo();
        
        // Tandai bahwa JS sudah dijalankan
        console.log('✨ CharacterHall.store | JS loaded & interactive');
    }

    // Cache elemen DOM yang sering digunakan
    function cacheDomElements() {
        elements.masukBtn = document.getElementById('masukBtn');
        elements.pelajariBtn = document.getElementById('pelajariBtn');
        elements.discordLink = document.getElementById('discordLink');
        elements.whatsappLink = document.getElementById('whatsappLink');
        elements.telegramLink = document.getElementById('telegramLink');
        elements.mascot = document.getElementById('mascotAvatar');
        elements.bubbleText = document.getElementById('bubbleText');
        elements.speechBubble = document.getElementById('speechBubble');
    }

    // Event listeners untuk semua link dan tombol
    function attachEventListeners() {
        // Tombol Masuk Disini
        if (elements.masukBtn) {
            elements.masukBtn.addEventListener('click', handleMasukClick);
        }
        
        // Tombol Pelajari cara bermain
        if (elements.pelajariBtn) {
            elements.pelajariBtn.addEventListener('click', handlePelajariClick);
        }
        
        // Social media links dengan custom handler (bisa diarahkan ke link official nantinya)
        if (elements.discordLink) {
            elements.discordLink.addEventListener('click', (e) => handleSocialClick(e, 'discord'));
        }
        
        if (elements.whatsappLink) {
            elements.whatsappLink.addEventListener('click', (e) => handleSocialClick(e, 'whatsapp'));
        }
        
        if (elements.telegramLink) {
            elements.telegramLink.addEventListener('click', (e) => handleSocialClick(e, 'telegram'));
        }
    }

    // Handler untuk tombol "Masuk Disini" (simulasi auth / redirect)
    function handleMasukClick(e) {
        e.preventDefault();
        // Efek loading ringan
        const btn = e.currentTarget;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Mengarahkan...';
        btn.style.opacity = '0.8';
        
        // Simulasi delay lalu alert / redirect (versi beta)
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.opacity = '1';
            // Menampilkan notifikasi interaktif
            showToast('🚀 Meluncur ke Gerbang Pendataan', 'info');
            // Alternatif: bisa diarahkan ke halaman login jika ada
             window.location.href = 'public/pages/login.html';
        }, 1200);
        
        // Track event
        trackEvent('CTA_Click', 'Masuk Disini');
    }

    // Handler untuk "Pelajari cara bermain"
    function handlePelajariClick(e) {
        e.preventDefault();
        showModalTutorial();
        trackEvent('CTA_Click', 'Pelajari cara bermain');
    }

    // Social media click handler dengan efek dan redirect dummy (menampilkan info komunitas)
    function handleSocialClick(e, platform) {
        e.preventDefault();
        const platformNames = {
            discord: 'Discord',
            whatsapp: 'WhatsApp',
            telegram: 'Telegram'
        };
        
        // Efek notifikasi bahwa komunitas sedang hangat
        showToast(`✨ Bergabung dengan komunitas ${platformNames[platform]} akan segera tersedia! Dukung CharacterHall.store`, 'community');
        
        // Bisa juga diarahkan ke link resmi setelah production
        // Contoh: if(platform === 'discord') window.open('https://discord.gg/characterhall', '_blank');
        
        // Track interaksi sosial
        trackEvent('Social_Click', platform);
        
        // Efek animasi pada link yang diklik
        const targetLink = e.currentTarget;
        targetLink.style.transform = 'scale(0.95)';
        setTimeout(() => {
            if (targetLink) targetLink.style.transform = '';
        }, 150);
    }

    // Mascot interaktif: klik, hover dinamis dan bubble berubah
    function setupInteractiveMascot() {
        if (!elements.mascot) return;
        
        // Klik maskot menampilkan pesan random dan animasi
        elements.mascot.addEventListener('click', () => {
            const randomMessages = [
                '🎴 Jual waifu mu dengan harga tertinggi!',
                '⛏️ Kelola tambang mu sekarang!',
                '💸 Trade card = cuan melimpah!',
                '🤖 Beta version — kamu early bird!',
                '🔥 Rare card worth more than gold!',
                '🎁 Follow sosmed dapat bonus karakter!'
            ];
            const randomMsg = randomMessages[Math.floor(Math.random() * randomMessages.length)];
            if (elements.bubbleText) {
                elements.bubbleText.style.transition = 'opacity 0.15s';
                elements.bubbleText.style.opacity = '0';
                setTimeout(() => {
                    elements.bubbleText.textContent = randomMsg;
                    elements.bubbleText.style.opacity = '1';
                }, 100);
            }
            
            // Efek bounce pada maskot
            elements.mascot.style.transform = 'scale(1.1)';
            setTimeout(() => {
                if (elements.mascot) elements.mascot.style.transform = '';
            }, 200);
            
            trackEvent('Mascot_Click', 'Interactive');
        });
        
        // Efek hover bubble tambahan
        if (elements.mascot && elements.speechBubble) {
            elements.mascot.addEventListener('mouseenter', () => {
                elements.speechBubble.style.transform = 'scale(1.02)';
            });
            elements.mascot.addEventListener('mouseleave', () => {
                elements.speechBubble.style.transform = 'scale(1)';
            });
        }
    }

    // Efek tambahan untuk tombol agar lebih responsif
    function setupButtonEffects() {
        const allBtns = document.querySelectorAll('.btn, .social-icon');
        allBtns.forEach(btn => {
            btn.addEventListener('mousedown', () => {
                btn.style.transform = 'scale(0.97)';
            });
            btn.addEventListener('mouseup', () => {
                btn.style.transform = '';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    // Menampilkan modal / popup tutorial sederhana (tanpa library eksternal)
    function showModalTutorial() {
        // Cek apakah modal sudah ada, jika belum buat
        let modal = document.getElementById('tutorialModal');
        if (modal) {
            modal.style.display = 'flex';
            return;
        }
        
        modal = document.createElement('div');
        modal.id = 'tutorialModal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        modal.style.backdropFilter = 'blur(8px)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';
        modal.style.fontFamily = "'Inter', sans-serif";
        
        const modalContent = document.createElement('div');
        modalContent.style.maxWidth = '500px';
        modalContent.style.width = '90%';
        modalContent.style.backgroundColor = '#1e1e2e';
        modalContent.style.borderRadius = '28px';
        modalContent.style.padding = '2rem';
        modalContent.style.border = '1px solid #8b5cf6';
        modalContent.style.boxShadow = '0 25px 40px rgba(0,0,0,0.5)';
        modalContent.style.color = '#f1f5f9';
        
        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
                <h2 style="font-size: 1.6rem; background: linear-gradient(135deg,#c084fc,#ec489a); -webkit-background-clip:text; background-clip:text; color:transparent;">🎮 Cara Bermain</h2>
                <button id="closeModalBtn" style="background:none; border:none; color:#a0a0c0; font-size:1.8rem; cursor:pointer;">&times;</button>
            </div>
            <div style="line-height:1.6;">
                <p><strong>📌 1. Trade Waifu Card</strong> — Jual/beli karakter waifu premium dan raih profit.</p>
                <p><strong>⛏️ 2. Kelola Tambang</strong> — Dapatkan passive income dari tambang digitalmu.</p>
                <p><strong>💎 3. Koleksi Langka</strong> — Semakin langka kartu, semakin tinggi harganya.</p>
                <p><strong>🤝 4. Tukar dengan pemain lain</strong> — Bangun kerajaan waifu-mu.</p>
                <hr style="margin: 1rem 0; border-color:#334155;">
                <p style="font-size:0.85rem; color:#c084fc;">✨ Versi Beta: Nikmati fitur awal dan support development kami!</p>
            </div>
            <button id="tutCloseAction" style="margin-top:1.5rem; width:100%; background: #8b5cf6; border:none; padding:0.7rem; border-radius:40px; font-weight:bold; color:white; cursor:pointer;">Mengerti, siap trade!</button>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Event close modal
        const closeBtn = document.getElementById('closeModalBtn');
        const closeAction = document.getElementById('tutCloseAction');
        const closeModal = () => {
            modal.style.display = 'none';
            setTimeout(() => modal.remove(), 300);
        };
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (closeAction) closeAction.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Toast notifikasi sederhana
    function showToast(message, type = 'info') {
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.style.position = 'fixed';
            toastContainer.style.bottom = '20px';
            toastContainer.style.right = '20px';
            toastContainer.style.zIndex = '10000';
            document.body.appendChild(toastContainer);
        }
        
        const toast = document.createElement('div');
        toast.style.background = '#1e1e2ecc';
        toast.style.backdropFilter = 'blur(12px)';
        toast.style.borderRadius = '60px';
        toast.style.padding = '0.75rem 1.3rem';
        toast.style.marginBottom = '0.75rem';
        toast.style.fontSize = '0.85rem';
        toast.style.fontWeight = '500';
        toast.style.border = `1px solid ${type === 'info' ? '#8b5cf6' : '#f59e0b'}`;
        toast.style.color = '#f1f5f9';
        toast.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '8px';
        toast.innerHTML = `<i class="fas ${type === 'info' ? 'fa-info-circle' : 'fa-users'}"></i> ${message}`;
        
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            toast.style.transition = 'all 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
    
    // Tracking sederhana (console & analytics ready)
    function trackEvent(category, action, label = '') {
        console.log(`[Event Tracking] ${category} : ${action} ${label ? `- ${label}` : ''}`);
        // Jika nanti ingin integrasi dengan Google Analytics atau platform lain, siap
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }
    }
    
    function logBetaInfo() {
        console.log('%c✨ CharacterHall.store Beta ✨', 'color: #f59e0b; font-size: 16px; font-weight: bold;');
        console.log('%cTrade karakter, kelola tambang, raih kekayaan!', 'color: #8b5cf6;');
    }
    
    // Run init setelah DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();