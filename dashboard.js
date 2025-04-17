document.addEventListener('DOMContentLoaded', function() {
    // Apply glassmorphism to dashboard
    const dashboardElement = document.querySelector('.dashboard');
    if (dashboardElement) {
        dashboardElement.classList.add('glassmorphism');
        
        // Animate dashboard entrance - optimized for performance
        dashboardElement.style.opacity = '0';
        dashboardElement.style.transform = 'translateY(20px) translateZ(0)';
        
        // Use requestAnimationFrame for smoother animation
        requestAnimationFrame(() => {
            dashboardElement.style.transition = 'opacity 0.5s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
            
            requestAnimationFrame(() => {
                dashboardElement.style.opacity = '1';
                dashboardElement.style.transform = 'translateY(0) translateZ(0)';
            });
        });
    }
    
    // Theme management
    const lightThemeBtn = document.getElementById('lightThemeBtn');
    const darkThemeBtn = document.getElementById('darkThemeBtn');
    const neonThemeBtn = document.getElementById('neonThemeBtn');
    
    // Apply glassmorphism to theme buttons container
    const themeContainer = document.querySelector('.theme-toggle-container');
    if (themeContainer) {
        themeContainer.classList.add('glassmorphism');
        
        // Animate theme container entrance
        themeContainer.style.opacity = '0';
        themeContainer.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            themeContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            themeContainer.style.opacity = '1';
            themeContainer.style.transform = 'translateY(0)';
        }, 1200);
    }
    
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        // Preserve the dashboard-mode class
        document.body.className = savedTheme + ' dashboard-mode';
    } else {
        document.body.className = 'dashboard-mode';
    }
    
    // Theme button handlers
    lightThemeBtn.addEventListener('click', function() {
        document.body.className = 'dashboard-mode';
        localStorage.setItem('theme', '');
        animateThemeChange();
    });
    
    darkThemeBtn.addEventListener('click', function() {
        document.body.className = 'dark-theme dashboard-mode';
        localStorage.setItem('theme', 'dark-theme');
        animateThemeChange();
    });
    
    neonThemeBtn.addEventListener('click', function() {
        document.body.className = 'neon-theme dashboard-mode';
        localStorage.setItem('theme', 'neon-theme');
        animateThemeChange();
    });
    
    function animateThemeChange() {
        // Add a flash animation to show theme change - optimized for performance
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        flash.style.zIndex = '9999';
        flash.style.pointerEvents = 'none';
        flash.style.opacity = '0';
        flash.style.transition = 'opacity 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)';
        flash.style.transform = 'translateZ(0)'; // Hardware acceleration
        flash.style.willChange = 'opacity';
        
        document.body.appendChild(flash);
        
        // Trigger animation with requestAnimationFrame for smoother transition
        requestAnimationFrame(() => {
            flash.style.opacity = '0.3';
            
            // Use a single timeout with requestAnimationFrame for better performance
            setTimeout(() => {
                requestAnimationFrame(() => {
                    flash.style.opacity = '0';
                    
                    // Remove after transition completes
                    flash.addEventListener('transitionend', () => {
                        document.body.removeChild(flash);
                    }, { once: true });
                });
            }, 100);
        });
        
        // Update UI elements based on theme - do this first for better perceived performance
        updateUIForTheme();
        
        // Dispatch a custom event for other scripts to listen for theme changes
        const themeChangedEvent = new CustomEvent('themeChanged', {
            detail: { theme: document.body.className }
        });
        document.dispatchEvent(themeChangedEvent);
        
        // Update particle colors if the function exists - do this after the theme change event
        if (typeof updateParticleColors === 'function') {
            // Slight delay to allow theme to apply first
            requestAnimationFrame(() => {
                updateParticleColors();
            });
        }
    }
    
    // Update UI elements based on current theme
    function updateUIForTheme() {
        const isDarkTheme = document.body.classList.contains('dark-theme');
        const isNeonTheme = document.body.classList.contains('neon-theme');
        
        // Get dashboard elements
        const dashboardUI = document.querySelector('.dashboard');
        const userInfo = document.querySelector('.user-info');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (dashboardUI) {
            dashboardUI.classList.add('glassmorphism');
        }
        
        if (userInfo) {
            userInfo.classList.add('glassmorphism');
        }
        
        if (logoutBtn) {
            logoutBtn.classList.add('glassmorphism');
        }
    }
    
    // Check if user is logged in
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in, get user data from database
            // Since we're authenticated, we can read our own user data
            firebase.database().ref('users/' + user.uid).once('value')
                .then((snapshot) => {
                    const userData = snapshot.val();
                    if (userData) {
                        // Display username with animation
                        const userDisplayName = document.getElementById('userDisplayName');
                        userDisplayName.textContent = userData.username;
                        
                        // Add typing animation effect
                        animateTyping(userDisplayName, userData.username);
                        
                        // Enhance user info container
                        const userInfo = document.querySelector('.user-info');
                        if (userInfo) {
                            userInfo.classList.add('glassmorphism');
                            
                            // Add staggered animation
                            userInfo.style.opacity = '0';
                            userInfo.style.transform = 'scale(0.9)';
                            setTimeout(() => {
                                userInfo.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                                userInfo.style.opacity = '1';
                                userInfo.style.transform = 'scale(1)';
                            }, 600);
                            
                            // Add subtle continuous animation
                            setTimeout(() => {
                                userInfo.style.animation = 'floatAnimation 3s ease-in-out infinite';
                            }, 1500);
                        }
                    } else {
                        // If no user data found, display the email (without the domain)
                        const email = user.email;
                        const username = email.split('@')[0];
                        const userDisplayName = document.getElementById('userDisplayName');
                        userDisplayName.textContent = username;
                        
                        // Add typing animation effect
                        animateTyping(userDisplayName, username);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching user data:', error);
                    // Fallback to displaying email if there's an error
                    const email = user.email;
                    const username = email.split('@')[0];
                    document.getElementById('userDisplayName').textContent = username;
                });
        } else {
            // User is not signed in, redirect to login page
            window.location.href = 'index.html';
        }
    });
    
    // Typing animation function
    function animateTyping(element, text) {
        element.textContent = '';
        element.style.borderRight = '2px solid var(--text-color)';
        
        let i = 0;
        const typingSpeed = 100; // milliseconds per character
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, typingSpeed);
            } else {
                // Remove cursor when done typing
                element.style.borderRight = 'none';
                
                // Add floating animation to user info
                const userInfo = document.querySelector('.user-info');
                userInfo.style.animation = 'floatAnimation 3s ease-in-out infinite';
            }
        }
        
        setTimeout(type, 500); // Start typing after a delay
    }
    
    // Logout button handler with animation
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        // Apply glassmorphism to logout button
        logoutBtn.classList.add('glassmorphism');
        
        // Animate logout button entrance
        logoutBtn.style.opacity = '0';
        logoutBtn.style.transform = 'translateY(20px)';
        setTimeout(() => {
            logoutBtn.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            logoutBtn.style.opacity = '1';
            logoutBtn.style.transform = 'translateY(0)';
        }, 1000);
        
        logoutBtn.addEventListener('click', function() {
            // Add click animation
            logoutBtn.classList.add('clicked');
            
            // Create ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            logoutBtn.appendChild(ripple);
            
            const rect = logoutBtn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 2;
            
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${event.clientX - rect.left - size/2}px`;
            ripple.style.top = `${event.clientY - rect.top - size/2}px`;
            
            // Add ripple style if not already added
            if (!document.querySelector('style#ripple-style')) {
                const style = document.createElement('style');
                style.id = 'ripple-style';
                style.textContent = `
                    .ripple {
                        position: absolute;
                        background: rgba(255, 255, 255, 0.3);
                        border-radius: 50%;
                        transform: scale(0);
                        animation: ripple-animation 0.6s linear;
                        pointer-events: none;
                    }
                    
                    @keyframes ripple-animation {
                        to {
                            transform: scale(1);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Show loading state
            const originalContent = logoutBtn.innerHTML;
            setTimeout(() => {
                logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
                logoutBtn.disabled = true;
                
                // Sign out the user
                firebase.auth().signOut()
                    .then(() => {
                        // Add fade out animation to the entire dashboard
                        const dashboard = document.querySelector('.dashboard');
                        dashboard.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                        dashboard.style.opacity = '0';
                        dashboard.style.transform = 'translateY(-20px) scale(0.95)';
                        
                        // Fade out background
                        const background = document.querySelector('.animated-background');
                        if (background) {
                            background.style.transition = 'opacity 0.8s ease';
                            background.style.opacity = '0';
                        }
                        
                        // Redirect to login page after animation completes
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 800);
                    })
                    .catch((error) => {
                        console.error('Logout error:', error);
                        
                        // Reset button state
                        logoutBtn.innerHTML = originalContent;
                        logoutBtn.disabled = false;
                        logoutBtn.classList.remove('clicked');
                    });
            }, 300);
            
            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }
    
    // Add some interactive animations
    const dashboardContainer = document.querySelector('.dashboard');
    
    // Subtle background animation on mouse move - with throttling for performance
    if (dashboardContainer) {
        // Throttle function to limit how often the mousemove event fires
        let lastExecution = 0;
        const throttleDelay = 20; // ms between executions
        let ticking = false;
        let lastX = 0;
        let lastY = 0;
        
        dashboardContainer.addEventListener('mousemove', function(e) {
            lastX = e.clientX;
            lastY = e.clientY;
            
            if (!ticking) {
                const now = performance.now();
                if (now - lastExecution > throttleDelay) {
                    window.requestAnimationFrame(() => {
                        const xPos = (lastX / window.innerWidth) - 0.5;
                        const yPos = (lastY / window.innerHeight) - 0.5;
                        
                        // Smoother transition with cubic-bezier
                        dashboardContainer.style.transition = 'transform 0.1s cubic-bezier(0.25, 0.1, 0.25, 1)';
                        dashboardContainer.style.transform = `perspective(1000px) rotateY(${xPos * 3}deg) rotateX(${yPos * -3}deg) translateZ(0)`;
                        
                        ticking = false;
                        lastExecution = now;
                    });
                    ticking = true;
                }
            }
        });
        
        dashboardContainer.addEventListener('mouseleave', function() {
            dashboardContainer.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)';
            dashboardContainer.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0)';
        });
    }
});