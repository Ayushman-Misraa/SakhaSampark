// Dynamic Background Handler
document.addEventListener('DOMContentLoaded', function() {
    // Remove any existing wave elements that might be present from previous versions
    const existingWaves = document.querySelectorAll('.wave-container, .wave');
    existingWaves.forEach(wave => wave.remove());
    // Create background container with ID for easy reference
    const backgroundContainer = document.createElement('div');
    backgroundContainer.className = 'animated-background';
    backgroundContainer.id = 'animatedBackground';
    document.body.prepend(backgroundContainer);
    
    // Add blob elements
    for (let i = 0; i < 3; i++) {
        const blob = document.createElement('div');
        blob.className = 'blob';
        backgroundContainer.appendChild(blob);
    }
    
    // Add floating shapes (increased count to compensate for removed waves)
    const shapes = ['circle', 'triangle', 'square', 'pentagon', 'hexagon'];
    for (let i = 0; i < 20; i++) {
        const shape = document.createElement('div');
        const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
        shape.className = `floating-shape ${shapeType}`;
        
        // Random size between 20px and 80px
        const size = Math.floor(Math.random() * 60) + 20;
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        
        // Random position
        shape.style.left = `${Math.random() * 100}%`;
        shape.style.top = `${Math.random() * 100}%`;
        
        // Random animation delay
        shape.style.animationDelay = `${Math.random() * 10}s`;
        
        // Random animation duration
        shape.style.animationDuration = `${Math.random() * 10 + 10}s`;
        
        backgroundContainer.appendChild(shape);
    }
    
    // Add animated lines
    for (let i = 0; i < 5; i++) {
        const line = document.createElement('div');
        line.className = 'animated-line';
        
        // Random position
        line.style.top = `${Math.random() * 100}%`;
        line.style.left = '0';
        line.style.width = '100%';
        
        // Random animation delay
        line.style.animationDelay = `${Math.random() * 8}s`;
        
        backgroundContainer.appendChild(line);
    }
    
    // Add animated dots (increased count to compensate for removed waves)
    for (let i = 0; i < 70; i++) {
        const dot = document.createElement('div');
        dot.className = 'animated-dot';
        
        // Random position
        dot.style.left = `${Math.random() * 100}%`;
        dot.style.top = `${Math.random() * 100}%`;
        
        // Random animation delay
        dot.style.animationDelay = `${Math.random() * 4}s`;
        
        backgroundContainer.appendChild(dot);
    }
    
    // Add bottom glow effect (replacement for waves)
    const bottomGlow = document.createElement('div');
    bottomGlow.className = 'bottom-glow';
    backgroundContainer.appendChild(bottomGlow);
    
    // Add gradient orbs (increased count to compensate for removed waves)
    for (let i = 0; i < 5; i++) {
        const orb = document.createElement('div');
        orb.className = 'gradient-orb';
        
        // Random size between 100px and 300px
        const size = Math.floor(Math.random() * 200) + 100;
        orb.style.width = `${size}px`;
        orb.style.height = `${size}px`;
        
        // Random position
        orb.style.left = `${Math.random() * 100}%`;
        orb.style.top = `${Math.random() * 100}%`;
        
        // Random animation delay
        orb.style.animationDelay = `${Math.random() * 5}s`;
        
        backgroundContainer.appendChild(orb);
    }
    
    // Add stars and other night sky effects (only for dark and neon themes)
    function createStars() {
        // Remove existing stars and effects first
        const existingElements = backgroundContainer.querySelectorAll('.star, .meteor, .aurora, .firefly, .fog');
        existingElements.forEach(element => element.remove());
        
        // Only add stars for dark and neon themes
        if (document.body.classList.contains('dark-theme') || document.body.classList.contains('neon-theme')) {
            // Add stars
            for (let i = 0; i < 100; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                
                // Random position
                star.style.left = `${Math.random() * 100}%`;
                star.style.top = `${Math.random() * 100}%`;
                
                // Random animation delay
                star.style.animationDelay = `${Math.random() * 4}s`;
                
                // Random size
                const size = Math.random() * 2 + 1;
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;
                
                backgroundContainer.appendChild(star);
            }
            
            // Add meteors
            for (let i = 0; i < 3; i++) {
                const meteor = document.createElement('div');
                meteor.className = 'meteor';
                
                // Random position
                meteor.style.left = `${Math.random() * 100}%`;
                meteor.style.top = `${Math.random() * 30}%`;
                
                // Random animation delay
                meteor.style.animationDelay = `${Math.random() * 15 + 5}s`;
                
                backgroundContainer.appendChild(meteor);
            }
            
            // Add aurora (only for neon theme)
            if (document.body.classList.contains('neon-theme')) {
                const aurora = document.createElement('div');
                aurora.className = 'aurora';
                
                // Set color based on page
                if (document.body.classList.contains('signup-mode')) {
                    aurora.style.background = 'linear-gradient(0deg, rgba(255, 32, 121, 0.1) 0%, transparent 80%)';
                } else if (document.body.classList.contains('dashboard-mode')) {
                    aurora.style.background = 'linear-gradient(0deg, rgba(9, 251, 211, 0.1) 0%, transparent 80%)';
                } else {
                    aurora.style.background = 'linear-gradient(0deg, rgba(8, 247, 254, 0.1) 0%, transparent 80%)';
                }
                
                backgroundContainer.appendChild(aurora);
            }
        } else {
            // Add fireflies for light theme
            for (let i = 0; i < 20; i++) {
                const firefly = document.createElement('div');
                firefly.className = 'firefly';
                
                // Random position
                firefly.style.left = `${Math.random() * 100}%`;
                firefly.style.top = `${Math.random() * 100}%`;
                
                // Random animation delay
                firefly.style.animationDelay = `${Math.random() * 10}s`;
                
                // Random animation duration
                firefly.style.animationDuration = `${Math.random() * 10 + 5}s`;
                
                backgroundContainer.appendChild(firefly);
            }
            
            // Add fog
            const fog = document.createElement('div');
            fog.className = 'fog';
            backgroundContainer.appendChild(fog);
        }
    }
    
    // Listen for theme changes to update stars and effects
    document.addEventListener('themeChanged', createStars);
    
    // Determine which page we're on
    const currentPath = window.location.pathname;
    
    // Set the page mode
    let pageMode;
    if (currentPath.includes('signup.html')) {
        // Signup page - warm theme
        backgroundContainer.classList.add('signup-background');
        pageMode = 'signup-mode';
    } else if (currentPath.includes('dashboard.html')) {
        // Dashboard page - neutral professional theme
        backgroundContainer.classList.add('dashboard-background');
        pageMode = 'dashboard-mode';
    } else {
        // Default/login page - cool theme
        backgroundContainer.classList.add('login-background');
        pageMode = 'login-mode';
    }
    
    // Apply saved theme from localStorage if it exists
    const savedTheme = localStorage.getItem('theme') || '';
    
    // Set body classes with both theme and page mode
    if (savedTheme === 'dark-theme') {
        document.body.className = 'dark-theme ' + pageMode;
    } else if (savedTheme === 'neon-theme') {
        document.body.className = 'neon-theme ' + pageMode;
    } else {
        document.body.className = pageMode;
    }
    
    // Initialize stars based on current theme
    createStars();
    
    // Update gradient orb colors based on theme and page
    updateGradientOrbs();
    
    // Add canvas particles for additional effect
    createParticleCanvas();
    
    // Listen for theme changes to update elements
    document.addEventListener('themeChanged', function(e) {
        updateParticleColors();
        createStars();
        updateGradientOrbs();
    });
    
    // Function to update gradient orb colors based on theme and page
    function updateGradientOrbs() {
        const orbs = document.querySelectorAll('.gradient-orb');
        const isDarkTheme = document.body.classList.contains('dark-theme');
        const isNeonTheme = document.body.classList.contains('neon-theme');
        const isSignupMode = document.body.classList.contains('signup-mode');
        const isDashboardMode = document.body.classList.contains('dashboard-mode');
        
        // Set appropriate colors based on theme and page
        if (orbs.length > 0) {
            // Set blend mode for all orbs
            orbs.forEach(orb => {
                if (isNeonTheme) {
                    orb.style.mixBlendMode = 'screen';
                } else {
                    orb.style.mixBlendMode = 'soft-light';
                }
            });
        }
    }
});

// Create canvas with floating particles
function createParticleCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particleCanvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';
    document.body.prepend(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    // Initialize particles
    let particles = [];
    const particleCount = 50;
    
    // Function to get colors based on current theme and page mode
    function getThemeColors() {
        const isDarkTheme = document.body.classList.contains('dark-theme');
        const isNeonTheme = document.body.classList.contains('neon-theme');
        const isSignupMode = document.body.classList.contains('signup-mode');
        const isDashboardMode = document.body.classList.contains('dashboard-mode');
        
        // Default light theme colors
        let colors;
        
        if (isNeonTheme) {
            if (isSignupMode) {
                // Neon signup colors
                colors = [
                    'rgba(245, 211, 0, 0.5)',  // Yellow
                    'rgba(255, 32, 121, 0.5)', // Pink
                    'rgba(113, 34, 250, 0.5)'  // Purple
                ];
            } else if (isDashboardMode) {
                // Neon dashboard colors
                colors = [
                    'rgba(8, 247, 254, 0.5)',  // Cyan
                    'rgba(9, 251, 211, 0.5)',  // Teal
                    'rgba(254, 83, 187, 0.5)'  // Pink
                ];
            } else {
                // Neon login colors
                colors = [
                    'rgba(8, 247, 254, 0.5)',  // Cyan
                    'rgba(254, 83, 187, 0.5)', // Pink
                    'rgba(9, 251, 211, 0.5)'   // Teal
                ];
            }
        } else if (isDarkTheme) {
            if (isSignupMode) {
                // Dark signup colors
                colors = [
                    'rgba(75, 101, 132, 0.5)', // Blue-gray
                    'rgba(61, 61, 61, 0.5)',   // Dark gray
                    'rgba(44, 44, 44, 0.5)'    // Darker gray
                ];
            } else if (isDashboardMode) {
                // Dark dashboard colors
                colors = [
                    'rgba(30, 30, 30, 0.5)',   // Dark gray
                    'rgba(44, 44, 44, 0.5)',   // Darker gray
                    'rgba(15, 15, 15, 0.5)'    // Almost black
                ];
            } else {
                // Dark login colors
                colors = [
                    'rgba(45, 52, 54, 0.5)',   // Dark slate
                    'rgba(30, 39, 46, 0.5)',   // Dark blue-gray
                    'rgba(15, 15, 15, 0.5)'    // Almost black
                ];
            }
        } else {
            // Light theme
            if (isSignupMode) {
                // Warm colors for signup
                colors = [
                    'rgba(255, 255, 255, 0.3)', 
                    'rgba(255, 158, 102, 0.3)', 
                    'rgba(255, 94, 98, 0.3)'
                ];
            } else if (isDashboardMode) {
                // Neutral colors for dashboard
                colors = [
                    'rgba(255, 255, 255, 0.3)', 
                    'rgba(96, 108, 136, 0.3)', 
                    'rgba(63, 76, 107, 0.3)'
                ];
            } else {
                // Cool colors for login
                colors = [
                    'rgba(255, 255, 255, 0.3)', 
                    'rgba(43, 50, 178, 0.3)', 
                    'rgba(20, 136, 204, 0.3)'
                ];
            }
        }
        
        return colors;
    }
    
    // Initialize particles with current theme colors
    function initParticles() {
        particles = [];
        const colors = getThemeColors();
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 5 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedX: Math.random() * 0.5 - 0.25,
                speedY: Math.random() * 0.5 - 0.25,
                opacity: Math.random() * 0.5 + 0.5
            });
        }
    }
    
    // Update particle colors when theme changes
    window.updateParticleColors = function() {
        const colors = getThemeColors();
        
        particles.forEach(particle => {
            particle.color = colors[Math.floor(Math.random() * colors.length)];
        });
    }
    
    // Animation loop - optimized for performance
    let lastFrameTime = 0;
    const targetFPS = 30; // Lower FPS for better performance
    const frameInterval = 1000 / targetFPS;
    
    function animate(timestamp) {
        requestAnimationFrame(animate);
        
        // Throttle frame rate for better performance
        const elapsed = timestamp - lastFrameTime;
        if (elapsed < frameInterval) return;
        
        lastFrameTime = timestamp - (elapsed % frameInterval);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Batch processing for better performance
        const len = particles.length;
        for (let i = 0; i < len; i++) {
            const particle = particles[i];
            
            // Move particle
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around edges - simplified boundary checks
            if (particle.x < 0) particle.x = canvas.width;
            else if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            else if (particle.y > canvas.height) particle.y = 0;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.opacity;
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
        
        // Connect nearby particles with lines - but less frequently for better performance
        if (Math.random() < 0.5) { // Only do this 50% of the time
            connectParticles();
        }
    }
    
    // Connect particles that are close to each other - optimized for performance
    function connectParticles() {
        const maxDistance = 150;
        const maxConnections = 50; // Limit the number of connections to improve performance
        let connectionCount = 0;
        
        // Use a spatial grid to optimize particle connection checks
        const gridSize = maxDistance;
        const grid = {};
        
        // Place particles in grid cells
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            const cellX = Math.floor(particle.x / gridSize);
            const cellY = Math.floor(particle.y / gridSize);
            const cellKey = `${cellX},${cellY}`;
            
            if (!grid[cellKey]) {
                grid[cellKey] = [];
            }
            grid[cellKey].push(i);
        }
        
        // Check only nearby grid cells for connections
        for (let i = 0; i < particles.length && connectionCount < maxConnections; i++) {
            const particle = particles[i];
            const cellX = Math.floor(particle.x / gridSize);
            const cellY = Math.floor(particle.y / gridSize);
            
            // Check neighboring cells
            for (let nx = cellX - 1; nx <= cellX + 1; nx++) {
                for (let ny = cellY - 1; ny <= cellY + 1; ny++) {
                    const neighborCellKey = `${nx},${ny}`;
                    const neighborIndices = grid[neighborCellKey];
                    
                    if (neighborIndices) {
                        for (let k = 0; k < neighborIndices.length && connectionCount < maxConnections; k++) {
                            const j = neighborIndices[k];
                            
                            if (j > i) { // Avoid duplicate checks
                                const dx = particle.x - particles[j].x;
                                const dy = particle.y - particles[j].y;
                                const distSquared = dx * dx + dy * dy;
                                
                                if (distSquared < maxDistance * maxDistance) {
                                    // Use squared distance to avoid expensive sqrt
                                    const distance = Math.sqrt(distSquared);
                                    
                                    // Calculate opacity based on distance
                                    const opacity = 1 - (distance / maxDistance);
                                    
                                    // Draw line
                                    ctx.beginPath();
                                    ctx.moveTo(particle.x, particle.y);
                                    ctx.lineTo(particles[j].x, particles[j].y);
                                    ctx.strokeStyle = 'rgba(255, 255, 255, ' + opacity * 0.2 + ')';
                                    ctx.lineWidth = 1;
                                    ctx.stroke();
                                    
                                    connectionCount++;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        resizeCanvas();
        initParticles();
    });
    
    // Initialize
    resizeCanvas();
    initParticles();
    animate();
}

// Add mouse interaction with particles and parallax effect - optimized with throttling
let lastMouseMoveTime = 0;
const mouseMoveThrottleDelay = 20; // ms between executions
let isMouseMoveTicking = false;
let lastMouseX = 0;
let lastMouseY = 0;

document.addEventListener('mousemove', function(e) {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    
    if (!isMouseMoveTicking) {
        const now = performance.now();
        if (now - lastMouseMoveTime > mouseMoveThrottleDelay) {
            window.requestAnimationFrame(() => {
                const canvas = document.getElementById('particleCanvas');
                if (canvas) {
                    const rect = canvas.getBoundingClientRect();
                    const mouseX = lastMouseX - rect.left;
                    const mouseY = lastMouseY - rect.top;
                    
                    // Only create ripple occasionally to reduce load
                    if (Math.random() < 0.1) {
                        createRipple(mouseX, mouseY);
                    }
                }
                
                // Create parallax effect
                createParallaxEffect({clientX: lastMouseX, clientY: lastMouseY});
                
                isMouseMoveTicking = false;
                lastMouseMoveTime = now;
            });
            isMouseMoveTicking = true;
        }
    }
});

// Create parallax effect based on mouse position - optimized for performance
function createParallaxEffect(e) {
    const background = document.getElementById('animatedBackground');
    if (!background) return;
    
    // Get mouse position relative to the center of the screen
    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;
    
    // Apply parallax to different elements with different intensities
    // Use CSS transform for better performance and hardware acceleration
    
    // Optimize blob parallax - only update a subset of blobs each time
    const blobs = background.querySelectorAll('.blob');
    const blobsToUpdate = Math.min(blobs.length, 2); // Only update 2 blobs at a time
    
    for (let i = 0; i < blobsToUpdate; i++) {
        const blob = blobs[i % blobs.length];
        const intensity = 20 + (i * 10);
        blob.style.transform = `translate3d(${mouseX * intensity}px, ${mouseY * intensity}px, 0)`;
    }
    
    // Optimize shapes parallax - only update a subset of shapes
    const shapes = background.querySelectorAll('.floating-shape');
    const shapesToUpdate = Math.min(shapes.length, 5); // Only update 5 shapes at a time
    
    for (let i = 0; i < shapesToUpdate; i++) {
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const intensity = 5 + (i % 5);
        // Use transform instead of margin for better performance
        shape.style.transform = `translate3d(${mouseX * intensity * 2}px, ${mouseY * intensity * 2}px, 0)`;
    }
    
    // Optimize orbs parallax - only update a subset of orbs
    const orbs = background.querySelectorAll('.gradient-orb');
    const orbsToUpdate = Math.min(orbs.length, 2); // Only update 2 orbs at a time
    
    for (let i = 0; i < orbsToUpdate; i++) {
        const orb = orbs[i % orbs.length];
        const intensity = 30 - (i * 5);
        orb.style.transform = `translate3d(${mouseX * intensity}px, ${mouseY * intensity}px, 0)`;
    }
    
    // Move the form container slightly for a subtle 3D effect
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        formContainer.style.transform = `translate3d(${mouseX * -20}px, ${mouseY * -20}px, 0)`;
    }
    
    // Move the dashboard container slightly for a subtle 3D effect
    const dashboardEl = document.querySelector('.dashboard');
    if (dashboardEl) {
        // Use translate3d for hardware acceleration
        dashboardEl.style.transform = `translate3d(${mouseX * -20}px, ${mouseY * -20}px, 0)`;
    }
}

// Create ripple effect at mouse position - optimized for performance
function createRipple(x, y) {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Create ripple with fewer animation frames
    let radius = 0;
    const maxRadius = 80; // Smaller max radius for better performance
    const speed = 8; // Faster speed means fewer frames
    
    // Store the ripple in an object for batch processing
    const ripple = {
        x: x,
        y: y,
        radius: radius,
        maxRadius: maxRadius,
        speed: speed,
        opacity: 1
    };
    
    // Use a single animation frame for the initial ripple
    requestAnimationFrame(() => {
        // Draw 4 frames at once to reduce animation overhead
        for (let i = 0; i < 4; i++) {
            ripple.radius += ripple.speed;
            if (ripple.radius > ripple.maxRadius) break;
            
            const opacity = 1 - (ripple.radius / ripple.maxRadius);
            
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, ' + opacity * 0.8 + ')';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
        
        // Continue animation only if needed
        if (ripple.radius < ripple.maxRadius) {
            requestAnimationFrame(function completeRipple() {
                ripple.radius += ripple.speed * 2; // Double speed for remaining frames
                
                if (ripple.radius > ripple.maxRadius) return;
                
                const opacity = 1 - (ripple.radius / ripple.maxRadius);
                
                ctx.beginPath();
                ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, ' + opacity * 0.6 + ')';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // Continue only if we haven't reached max radius
                if (ripple.radius < ripple.maxRadius) {
                    requestAnimationFrame(completeRipple);
                }
            });
        }
    });
}