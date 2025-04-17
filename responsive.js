// Responsive functionality for Sakha Sampark

// Wait for both DOM content and window load to ensure all elements are available
window.addEventListener('load', initializeResponsiveUI);
document.addEventListener('DOMContentLoaded', initializeResponsiveUI);

// Track if we've already initialized to prevent double initialization
let initialized = false;

// Define touch event handlers at global scope
let touchStartHandler, touchEndHandler;

function initializeResponsiveUI() {
    // Only run once
    if (initialized) return;
    initialized = true;
    
    console.log('Initializing responsive UI');
    
    // Only apply mobile UI changes if screen width is below the breakpoint
    if (window.innerWidth <= 992) {
        // Wait a short time to ensure all DOM elements are fully loaded
        setTimeout(createMobileUI, 500);
    }

    // Fix for iOS viewport height issue
    const setVhProperty = () => {
        // Set a CSS variable equal to 1% of the viewport height
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set the property initially and on resize
    setVhProperty();
    window.addEventListener('resize', setVhProperty);

    // Handle orientation changes and screen resizes
    window.addEventListener('resize', function() {
        // If screen width becomes larger than mobile breakpoint, reset mobile UI
        if (window.innerWidth > 992) {
            resetMobileUI();
        } else if (window.innerWidth <= 992 && !document.querySelector('.mobile-header')) {
            // If screen width becomes smaller than breakpoint and mobile UI doesn't exist
            setTimeout(createMobileUI, 500);
        }
        
        // Update vh property
        setVhProperty();
    });
}

// Function to create mobile UI elements
function createMobileUI() {
    console.log('Creating mobile UI elements');
    
    // Check if sidebar exists
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) {
        console.error('Sidebar element not found');
        // Try again after a short delay
        setTimeout(createMobileUI, 500);
        return;
    }
    
    // Create mobile header if it doesn't exist
    if (!document.querySelector('.mobile-header')) {
        createMobileHeader();
    }
    
    // Create contacts toggle button if it doesn't exist
    if (!document.getElementById('contactsToggleBtn')) {
        createContactsToggle();
    }
    
    // Create overlay for sidebar if it doesn't exist
    if (!document.querySelector('.sidebar-overlay')) {
        const sidebarOverlay = document.createElement('div');
        sidebarOverlay.className = 'sidebar-overlay';
        document.body.appendChild(sidebarOverlay);
    }
    
    // Setup event listeners
    setupMobileEventListeners();
    
    // Add swipe gestures
    setupSwipeGestures();
    
    console.log('Mobile UI elements created');
}

// Function to create mobile header with dropdown menu
function createMobileHeader() {
    // Get current chat name or default
    const currentChatNameElement = document.getElementById('currentChatName');
    const chatName = currentChatNameElement ? currentChatNameElement.textContent : 'Chat';
    
    // Create mobile header
    const mobileHeader = document.createElement('div');
    mobileHeader.className = 'mobile-header';
    mobileHeader.innerHTML = `
        <div class="mobile-header-title">
            <i class="fas fa-comments"></i>
            <span id="mobile-chat-name">${chatName}</span>
        </div>
        <button class="mobile-menu-toggle" aria-label="Toggle Menu">
            <i class="fas fa-ellipsis-v"></i>
        </button>
    `;
    document.body.insertBefore(mobileHeader, document.body.firstChild);
    
    // Create dropdown menu
    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'mobile-dropdown-menu';
    dropdownMenu.innerHTML = `
        <a href="#" class="mobile-dropdown-item" id="theme-toggle">
            <i class="fas fa-palette"></i>
            <span>Change Theme</span>
        </a>
        <a href="#" class="mobile-dropdown-item" id="add-contact-menu">
            <i class="fas fa-user-plus"></i>
            <span>Add Contact</span>
        </a>
        <a href="#" class="mobile-dropdown-item" id="view-requests">
            <i class="fas fa-bell"></i>
            <span>Connection Requests</span>
        </a>
        <a href="#" class="mobile-dropdown-item" id="settings-menu">
            <i class="fas fa-cog"></i>
            <span>Settings</span>
        </a>
        <a href="#" class="mobile-dropdown-item" id="logout-menu">
            <i class="fas fa-sign-out-alt"></i>
            <span>Logout</span>
        </a>
    `;
    document.body.appendChild(dropdownMenu);
}

// Function to create contacts toggle button
function createContactsToggle() {
    // Remove existing button if it exists
    const existingButton = document.querySelector('.contacts-toggle');
    if (existingButton) {
        existingButton.remove();
    }
    
    // Create new button
    const contactsToggle = document.createElement('button');
    contactsToggle.className = 'contacts-toggle';
    contactsToggle.innerHTML = '<i class="fas fa-address-book"></i>';
    contactsToggle.setAttribute('aria-label', 'Toggle Contacts');
    contactsToggle.setAttribute('id', 'contactsToggleBtn');
    
    // Add direct click handler
    contactsToggle.onclick = function() {
        console.log('Contacts toggle clicked directly');
        const sidebar = document.querySelector('.sidebar');
        const sidebarOverlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar && sidebarOverlay) {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
            
            // Change icon based on sidebar state
            const icon = contactsToggle.querySelector('i');
            if (sidebar.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-address-book';
            }
        }
    };
    
    document.body.appendChild(contactsToggle);
    
    console.log('Contacts toggle button created with direct click handler');
}

// Function to setup mobile event listeners
function setupMobileEventListeners() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    const contactsToggle = document.getElementById('contactsToggleBtn');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileDropdownMenu = document.querySelector('.mobile-dropdown-menu');
    
    if (!sidebar || !sidebarOverlay || !contactsToggle || !mobileMenuToggle || !mobileDropdownMenu) {
        console.error('Missing required elements for mobile UI');
        console.log({
            sidebar: !!sidebar,
            sidebarOverlay: !!sidebarOverlay,
            contactsToggle: !!contactsToggle,
            mobileMenuToggle: !!mobileMenuToggle,
            mobileDropdownMenu: !!mobileDropdownMenu
        });
        
        // Try again after a short delay
        setTimeout(setupMobileEventListeners, 500);
        return;
    }
    
    console.log('Setting up mobile event listeners');
    
    // Toggle dropdown menu
    mobileMenuToggle.addEventListener('click', function() {
        mobileDropdownMenu.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.mobile-menu-toggle') && 
            !e.target.closest('.mobile-dropdown-menu')) {
            mobileDropdownMenu.classList.remove('active');
        }
    });
    
    // Toggle sidebar when contacts button is clicked
    contactsToggle.addEventListener('click', function() {
        console.log('Contacts toggle clicked');
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
        
        // Change icon based on sidebar state
        const icon = contactsToggle.querySelector('i');
        if (sidebar.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-address-book';
        }
    });
    
    // Close sidebar when overlay is clicked
    sidebarOverlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        contactsToggle.querySelector('i').className = 'fas fa-address-book';
    });
    
    // Add event listeners to contact items
    function setupContactItemListeners() {
        const contactItems = document.querySelectorAll('.contact-item');
        if (contactItems.length === 0) {
            // If no contact items found, try again after contacts are loaded
            setTimeout(setupContactItemListeners, 1000);
            return;
        }
        
        contactItems.forEach(item => {
            // Remove existing listeners to prevent duplicates
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            newItem.addEventListener('click', function() {
                // Update mobile header with contact name
                const contactName = this.querySelector('.contact-name').textContent;
                const mobileHeaderName = document.getElementById('mobile-chat-name');
                if (mobileHeaderName) {
                    mobileHeaderName.textContent = contactName;
                }
                
                // Close sidebar
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
                contactsToggle.querySelector('i').className = 'fas fa-address-book';
            });
        });
    }
    
    // Setup contact item listeners initially and when contacts list changes
    setupContactItemListeners();
    
    // Watch for changes in the contacts list
    const contactsList = document.getElementById('contactsList');
    if (contactsList) {
        const observer = new MutationObserver(setupContactItemListeners);
        observer.observe(contactsList, { childList: true, subtree: true });
    }
    
    // Handle dropdown menu items
    document.getElementById('logout-menu').addEventListener('click', function(e) {
        e.preventDefault();
        // Trigger the existing logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.click();
    });
    
    // Theme toggle functionality
    document.getElementById('theme-toggle').addEventListener('click', function(e) {
        e.preventDefault();
        // Create a simple theme selector popup
        const themePopup = document.createElement('div');
        themePopup.className = 'theme-popup';
        themePopup.innerHTML = `
            <div class="theme-popup-content">
                <h3>Select Theme</h3>
                <div class="theme-options">
                    <button class="theme-option" data-theme="light">Light</button>
                    <button class="theme-option" data-theme="dark">Dark</button>
                    <button class="theme-option" data-theme="neon">Neon</button>
                </div>
                <button class="theme-close">Close</button>
            </div>
        `;
        document.body.appendChild(themePopup);
        
        // Add event listeners for theme selection
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', function() {
                const theme = this.dataset.theme;
                document.body.className = theme === 'dark' ? 'dark-theme' : 
                                         theme === 'neon' ? 'neon-theme' : '';
                localStorage.setItem('theme', theme);
                themePopup.remove();
                mobileDropdownMenu.classList.remove('active');
            });
        });
        
        // Close button
        document.querySelector('.theme-close').addEventListener('click', function() {
            themePopup.remove();
        });
    });
}

// Function to setup swipe gestures
function setupSwipeGestures() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    const contactsToggle = document.getElementById('contactsToggleBtn');
    
    if (!sidebar || !sidebarOverlay || !contactsToggle) {
        console.error('Missing required elements for swipe gestures');
        // Try again after a short delay
        setTimeout(setupSwipeGestures, 500);
        return;
    }
    
    console.log('Setting up swipe gestures');
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Define touch event handlers
    touchStartHandler = function(e) {
        touchStartX = e.changedTouches[0].screenX;
    };
    
    touchEndHandler = function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    };
    
    // Remove existing event listeners to prevent duplicates
    document.removeEventListener('touchstart', touchStartHandler);
    document.removeEventListener('touchend', touchEndHandler);
    
    // Add new event listeners
    document.addEventListener('touchstart', touchStartHandler, false);
    document.addEventListener('touchend', touchEndHandler, false);
    
    function handleSwipe() {
        const swipeThreshold = 100; // Minimum distance for swipe
        
        // Swipe right (from left edge) to open sidebar
        if (touchEndX - touchStartX > swipeThreshold && touchStartX < 50) {
            console.log('Swipe right detected - opening sidebar');
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            contactsToggle.querySelector('i').className = 'fas fa-times';
        }
        
        // Swipe left to close sidebar
        if (touchStartX - touchEndX > swipeThreshold && sidebar.classList.contains('active')) {
            console.log('Swipe left detected - closing sidebar');
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            contactsToggle.querySelector('i').className = 'fas fa-address-book';
        }
    }
}

// Function to reset mobile UI
function resetMobileUI() {
    // Remove mobile header
    const mobileHeader = document.querySelector('.mobile-header');
    if (mobileHeader) mobileHeader.remove();
    
    // Remove dropdown menu
    const dropdownMenu = document.querySelector('.mobile-dropdown-menu');
    if (dropdownMenu) dropdownMenu.remove();
    
    // Remove contacts toggle
    const contactsToggle = document.querySelector('.contacts-toggle');
    if (contactsToggle) contactsToggle.remove();
    
    // Remove overlay
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    if (sidebarOverlay) sidebarOverlay.remove();
    
    // Reset sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.remove('active');
        sidebar.style.left = '';
    }
}