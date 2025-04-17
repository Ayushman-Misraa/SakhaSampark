// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
    // Theme management
    const lightThemeBtn = document.getElementById('lightThemeBtn');
    const darkThemeBtn = document.getElementById('darkThemeBtn');
    const neonThemeBtn = document.getElementById('neonThemeBtn');
    
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = savedTheme;
    }
    
    // Theme button handlers
    if (lightThemeBtn && darkThemeBtn && neonThemeBtn) {
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
        
        lightThemeBtn.addEventListener('click', function() {
            // Preserve the page mode class (login-mode, signup-mode, dashboard-mode)
            const pageMode = document.body.classList.contains('login-mode') ? 'login-mode' : 
                            document.body.classList.contains('signup-mode') ? 'signup-mode' : 
                            'dashboard-mode';
            
            document.body.className = pageMode;
            localStorage.setItem('theme', '');
            animateThemeChange();
        });
        
        darkThemeBtn.addEventListener('click', function() {
            // Preserve the page mode class
            const pageMode = document.body.classList.contains('login-mode') ? 'login-mode' : 
                            document.body.classList.contains('signup-mode') ? 'signup-mode' : 
                            'dashboard-mode';
            
            document.body.className = 'dark-theme ' + pageMode;
            localStorage.setItem('theme', 'dark-theme');
            animateThemeChange();
        });
        
        neonThemeBtn.addEventListener('click', function() {
            // Preserve the page mode class
            const pageMode = document.body.classList.contains('login-mode') ? 'login-mode' : 
                            document.body.classList.contains('signup-mode') ? 'signup-mode' : 
                            'dashboard-mode';
            
            document.body.className = 'neon-theme ' + pageMode;
            localStorage.setItem('theme', 'neon-theme');
            animateThemeChange();
        });
    }
    
    function animateThemeChange() {
        // Add a flash animation to show theme change
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        flash.style.zIndex = '9999';
        flash.style.pointerEvents = 'none';
        flash.style.opacity = '0';
        flash.style.transition = 'opacity 0.3s ease';
        
        document.body.appendChild(flash);
        
        // Trigger animation
        setTimeout(() => {
            flash.style.opacity = '0.5';
            setTimeout(() => {
                flash.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(flash);
                }, 300);
            }, 100);
        }, 10);
        
        // Update particle colors if the function exists
        if (typeof updateParticleColors === 'function') {
            updateParticleColors();
        }
        
        // Dispatch a custom event for other scripts to listen for theme changes
        const themeChangedEvent = new CustomEvent('themeChanged', {
            detail: { theme: document.body.className }
        });
        document.dispatchEvent(themeChangedEvent);
    }
    
    // Add form animations
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        // Add glassmorphism effect
        formContainer.classList.add('glassmorphism');
        
        // Animate form entrance
        formContainer.style.opacity = '0';
        formContainer.style.transform = 'translateY(20px)';
        setTimeout(() => {
            formContainer.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            formContainer.style.opacity = '1';
            formContainer.style.transform = 'translateY(0)';
        }, 200);
        
        const inputs = formContainer.querySelectorAll('input');
        
        inputs.forEach((input, index) => {
            // Staggered animation for inputs
            input.style.opacity = '0';
            input.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                input.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                input.style.opacity = '1';
                input.style.transform = 'translateX(0)';
            }, 500 + (index * 100));
            
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                if (this.value === '') {
                    this.parentElement.classList.remove('focused');
                }
            });
        });
        
        // Animate button and switch form text
        const button = formContainer.querySelector('.btn');
        const switchForm = formContainer.querySelector('.switch-form');
        
        if (button) {
            button.style.opacity = '0';
            button.style.transform = 'translateY(20px)';
            setTimeout(() => {
                button.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                button.style.opacity = '1';
                button.style.transform = 'translateY(0)';
            }, 800);
        }
        
        if (switchForm) {
            switchForm.style.opacity = '0';
            setTimeout(() => {
                switchForm.style.transition = 'opacity 0.5s ease';
                switchForm.style.opacity = '1';
            }, 1000);
        }
    }
    
    // Authentication state check
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in, redirect to dashboard
            if (window.location.pathname.includes('index.html') || 
                window.location.pathname.includes('signup.html') || 
                window.location.pathname === '/' || 
                window.location.pathname === '/SakhaSampark/') {
                
                // Add exit animation before redirect
                const formContainer = document.querySelector('.form-container');
                if (formContainer) {
                    formContainer.style.opacity = '0';
                    formContainer.style.transform = 'translateY(-20px)';
                    
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 300);
                } else {
                    window.location.href = 'dashboard.html';
                }
            }
        } else {
            // User is signed out, redirect to login if trying to access dashboard
            if (window.location.pathname.includes('dashboard.html')) {
                window.location.href = 'index.html';
            }
        }
    });
});

// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    // Add animation to form elements on load
    const formElements = loginForm.querySelectorAll('.input-group, button');
    formElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('loginError');
        
        // Clear previous error messages
        errorElement.textContent = '';
        
        // Validate inputs
        if (!username || !password) {
            errorElement.textContent = 'Please fill in all fields';
            errorElement.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                errorElement.style.animation = '';
            }, 500);
            return;
        }
        
        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;
        submitBtn.classList.add('clicked');
        
        // Sign in directly with Firebase Auth using email format
        const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@sakhasampark.com`;
        
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                // Show success animation before redirect
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
                submitBtn.style.background = 'linear-gradient(to right, #00b09b, #96c93d)';
                
                // Fade out the form
                setTimeout(() => {
                    const formContainer = document.querySelector('.form-container');
                    formContainer.style.opacity = '0';
                    formContainer.style.transform = 'translateY(-20px) scale(0.95)';
                    
                    // Redirect to dashboard after animation
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 500);
                }, 500);
            })
            .catch((error) => {
                console.error('Login error:', error);
                
                // Show error with animation
                errorElement.textContent = 'Invalid username or password';
                errorElement.style.animation = 'shake 0.5s ease';
                
                // Reset button state with animation
                submitBtn.classList.add('error');
                submitBtn.innerHTML = '<i class="fas fa-times"></i> Failed';
                submitBtn.style.background = 'linear-gradient(to right, #ff416c, #ff4b2b)';
                
                setTimeout(() => {
                    submitBtn.classList.remove('error');
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('clicked');
                    errorElement.style.animation = '';
                }, 1000);
            });
    });
}

// Signup Form Handler
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    // Add animation to form elements on load
    const formElements = signupForm.querySelectorAll('.input-group, button');
    formElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
    
    // Add password strength meter
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (passwordInput) {
        // Create strength meter element
        const strengthMeter = document.createElement('div');
        strengthMeter.className = 'password-strength';
        strengthMeter.innerHTML = `
            <div class="strength-meter">
                <div class="strength-meter-fill"></div>
            </div>
            <div class="strength-text"></div>
        `;
        passwordInput.parentElement.appendChild(strengthMeter);
        
        // Style the strength meter
        const style = document.createElement('style');
        style.textContent = `
            .password-strength {
                margin-top: 5px;
                font-size: 12px;
            }
            .strength-meter {
                height: 4px;
                background-color: #ddd;
                border-radius: 2px;
                margin-bottom: 5px;
            }
            .strength-meter-fill {
                height: 100%;
                border-radius: 2px;
                transition: width 0.3s ease, background-color 0.3s ease;
                width: 0;
            }
            .strength-text {
                font-size: 12px;
                text-align: right;
            }
        `;
        document.head.appendChild(style);
        
        // Check password strength on input
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strengthMeterFill = document.querySelector('.strength-meter-fill');
            const strengthText = document.querySelector('.strength-text');
            
            if (password.length === 0) {
                strengthMeterFill.style.width = '0';
                strengthText.textContent = '';
                return;
            }
            
            // Calculate strength
            let strength = 0;
            if (password.length >= 6) strength += 20;
            if (password.length >= 8) strength += 20;
            if (/[A-Z]/.test(password)) strength += 20;
            if (/[0-9]/.test(password)) strength += 20;
            if (/[^A-Za-z0-9]/.test(password)) strength += 20;
            
            // Update UI
            strengthMeterFill.style.width = strength + '%';
            
            if (strength < 40) {
                strengthMeterFill.style.backgroundColor = '#ff4b2b';
                strengthText.textContent = 'Weak';
                strengthText.style.color = '#ff4b2b';
            } else if (strength < 80) {
                strengthMeterFill.style.backgroundColor = '#ffa500';
                strengthText.textContent = 'Medium';
                strengthText.style.color = '#ffa500';
            } else {
                strengthMeterFill.style.backgroundColor = '#00b09b';
                strengthText.textContent = 'Strong';
                strengthText.style.color = '#00b09b';
            }
        });
        
        // Check password match
        confirmPasswordInput.addEventListener('input', function() {
            const password = passwordInput.value;
            const confirmPassword = this.value;
            
            if (confirmPassword && password !== confirmPassword) {
                this.style.borderColor = '#ff4b2b';
            } else if (confirmPassword) {
                this.style.borderColor = '#00b09b';
            } else {
                this.style.borderColor = '';
            }
        });
    }
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const name = document.getElementById('name').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorElement = document.getElementById('signupError');
        
        // Clear previous error messages
        errorElement.textContent = '';
        
        // Validate inputs with animations
        if (!username || !name || !password || !confirmPassword) {
            errorElement.textContent = 'Please fill in all fields';
            errorElement.style.animation = 'shake 0.5s ease';
            
            // Highlight empty fields
            const inputs = [
                { elem: document.getElementById('username'), value: username },
                { elem: document.getElementById('name'), value: name },
                { elem: document.getElementById('password'), value: password },
                { elem: document.getElementById('confirmPassword'), value: confirmPassword }
            ];
            
            inputs.forEach(input => {
                if (!input.value) {
                    input.elem.style.borderColor = '#ff4b2b';
                    input.elem.style.animation = 'shake 0.5s ease';
                    setTimeout(() => {
                        input.elem.style.animation = '';
                    }, 500);
                }
            });
            
            setTimeout(() => {
                errorElement.style.animation = '';
            }, 500);
            
            return;
        }
        
        if (password !== confirmPassword) {
            errorElement.textContent = 'Passwords do not match';
            errorElement.style.animation = 'shake 0.5s ease';
            
            document.getElementById('confirmPassword').style.borderColor = '#ff4b2b';
            document.getElementById('confirmPassword').style.animation = 'shake 0.5s ease';
            
            setTimeout(() => {
                errorElement.style.animation = '';
                document.getElementById('confirmPassword').style.animation = '';
            }, 500);
            
            return;
        }
        
        if (password.length < 6) {
            errorElement.textContent = 'Password must be at least 6 characters';
            errorElement.style.animation = 'shake 0.5s ease';
            
            document.getElementById('password').style.borderColor = '#ff4b2b';
            document.getElementById('password').style.animation = 'shake 0.5s ease';
            
            setTimeout(() => {
                errorElement.style.animation = '';
                document.getElementById('password').style.animation = '';
            }, 500);
            
            return;
        }
        
        // Show loading state
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
        submitBtn.disabled = true;
        submitBtn.classList.add('clicked');
        
        // Create email from username for Firebase Auth
        const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@sakhasampark.com`;
        
        // Create user with Firebase Auth
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Now that we're authenticated, we can write to our own user record
                return firebase.database().ref('users/' + userCredential.user.uid).set({
                    username: username,
                    name: name,
                    email: email,
                    createdAt: firebase.database.ServerValue.TIMESTAMP
                });
            })
            .then(() => {
                // Show success animation before redirect
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
                submitBtn.style.background = 'linear-gradient(to right, #00b09b, #96c93d)';
                
                // Fade out the form
                setTimeout(() => {
                    const formContainer = document.querySelector('.form-container');
                    formContainer.style.opacity = '0';
                    formContainer.style.transform = 'translateY(-20px) scale(0.95)';
                    
                    // Redirect to dashboard after animation
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 500);
                }, 500);
            })
            .catch((error) => {
                console.error('Signup error:', error);
                
                // Handle specific errors with animation
                if (error.code === 'auth/email-already-in-use') {
                    errorElement.textContent = 'Username already exists';
                } else {
                    errorElement.textContent = error.message;
                }
                
                errorElement.style.animation = 'shake 0.5s ease';
                
                // Reset button state with animation
                submitBtn.classList.add('error');
                submitBtn.innerHTML = '<i class="fas fa-times"></i> Failed';
                submitBtn.style.background = 'linear-gradient(to right, #ff416c, #ff4b2b)';
                
                setTimeout(() => {
                    submitBtn.classList.remove('error');
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('clicked');
                    errorElement.style.animation = '';
                }, 1000);
            });
    });
}