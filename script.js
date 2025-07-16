class CountdownTimer {
    constructor() {
        this.timerInterval = null;
        this.totalSeconds = 0;
        this.isRunning = false;
        this.isPaused = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadTheme();
        this.updateDisplay();
    }

    initializeElements() {
        // Input elements
        this.minutesInput = document.getElementById('minutes');
        this.secondsInput = document.getElementById('seconds');
        
        // Display elements
        this.minutesDisplay = document.querySelector('.minutes-display');
        this.secondsDisplay = document.querySelector('.seconds-display');
        this.statusText = document.getElementById('statusText');
        
        // Button elements
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.themeToggle = document.getElementById('themeToggle');
        
        // Container elements
        this.timerDisplay = document.querySelector('.timer-display');
        this.container = document.querySelector('.container');
    }

    bindEvents() {
        // Button events
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Input change events
        this.minutesInput.addEventListener('change', () => this.updateFromInputs());
        this.secondsInput.addEventListener('change', () => this.updateFromInputs());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.isRunning) {
                    this.pause();
                } else {
                    this.start();
                }
            } else if (e.code === 'Escape') {
                this.reset();
            } else if (e.code === 'KeyF') {
                this.toggleFullscreen();
            }
        });
        
        // Prevent space from scrolling page
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target === document.body) {
                e.preventDefault();
            }
        });
    }

    updateFromInputs() {
        if (!this.isRunning) {
            const minutes = parseInt(this.minutesInput.value) || 0;
            const seconds = parseInt(this.secondsInput.value) || 0;
            this.totalSeconds = minutes * 60 + seconds;
            this.updateDisplay();
        }
    }

    start() {
        if (!this.isPaused) {
            this.updateFromInputs();
        }
        
        if (this.totalSeconds <= 0) {
            this.statusText.textContent = 'Please set a time first';
            return;
        }
        
        this.isRunning = true;
        this.isPaused = false;
        this.updateButtons();
        this.statusText.textContent = 'Timer running...';
        
        this.timerInterval = setInterval(() => {
            this.totalSeconds--;
            this.updateDisplay();
            
            if (this.totalSeconds <= 0) {
                this.complete();
            } else if (this.totalSeconds <= 10) {
                this.container.classList.add('warning');
            }
        }, 1000);
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.isPaused = true;
            clearInterval(this.timerInterval);
            this.updateButtons();
            this.statusText.textContent = 'Timer paused';
            this.container.classList.remove('warning');
        }
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.timerInterval);
        this.updateFromInputs();
        this.updateButtons();
        this.statusText.textContent = 'Ready to start';
        this.container.classList.remove('warning');
    }

    complete() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.timerInterval);
        this.totalSeconds = 0;
        this.updateDisplay();
        this.updateButtons();
        this.statusText.textContent = 'Time\'s up!';
        this.container.classList.remove('warning');
        
        // Flash effect
        this.flashScreen();
        
        // Play notification sound (if browser supports it)
        this.playNotificationSound();
    }

    updateDisplay() {
        const minutes = Math.floor(this.totalSeconds / 60);
        const seconds = this.totalSeconds % 60;
        
        this.minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        this.secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    }

    updateButtons() {
        this.startBtn.disabled = this.isRunning;
        this.pauseBtn.disabled = !this.isRunning;
        this.resetBtn.disabled = false;
        
        if (this.isPaused) {
            this.startBtn.textContent = 'Resume';
            this.startBtn.disabled = false;
        } else {
            this.startBtn.textContent = 'Start';
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('countdown-theme', newTheme);
        
        // Update theme toggle icon
        const icon = this.themeToggle.querySelector('.theme-icon');
        icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('countdown-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const icon = this.themeToggle.querySelector('.theme-icon');
        icon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Fullscreen not supported');
            });
        } else {
            document.exitFullscreen();
        }
    }

    flashScreen() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: var(--warning-color);
            opacity: 0.8;
            z-index: 9999;
            pointer-events: none;
        `;
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.style.opacity = '0';
            flash.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                document.body.removeChild(flash);
            }, 500);
        }, 200);
    }

    playNotificationSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
        } catch (error) {
            console.log('Audio notification not supported');
        }
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CountdownTimer();
});

// Add keyboard shortcut information
document.addEventListener('DOMContentLoaded', () => {
    const shortcuts = document.createElement('div');
    shortcuts.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        font-size: 0.9rem;
        color: var(--secondary-color);
        background: var(--button-bg);
        padding: 10px;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        opacity: 0.7;
        transition: opacity 0.3s ease;
    `;
    shortcuts.innerHTML = `
        <strong>Shortcuts:</strong><br>
        Space: Start/Pause<br>
        Esc: Reset<br>
        F: Fullscreen
    `;
    
    shortcuts.addEventListener('mouseenter', () => {
        shortcuts.style.opacity = '1';
    });
    
    shortcuts.addEventListener('mouseleave', () => {
        shortcuts.style.opacity = '0.7';
    });
    
    document.body.appendChild(shortcuts);
});