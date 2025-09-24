class SoccerTimer {
    constructor() {
        this.mainTimer = {
            startTime: 0,
            elapsed: 0,
            isRunning: false,
            interval: null
        };
        
        this.players = [];
        this.nextPlayerId = 1;
        
        this.initializeElements();
        this.bindEvents();
        this.loadSavedData();
        this.updateDisplay();
        this.updatePlayersDisplay();
    }
    
    initializeElements() {
        // Main timer elements
        this.mainTimerDisplay = document.getElementById('main-timer');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        
        // Player management elements
        this.playerNameInput = document.getElementById('player-name-input');
        this.addPlayerBtn = document.getElementById('add-player-btn');
        this.clearDataBtn = document.getElementById('clear-data-btn');
        this.playersContainer = document.getElementById('players-container');
    }
    
    bindEvents() {
        // Main timer controls
        this.startBtn.addEventListener('click', () => this.startMainTimer());
        this.pauseBtn.addEventListener('click', () => this.pauseMainTimer());
        this.resetBtn.addEventListener('click', () => this.resetMainTimer());
        
        // Player management
        this.addPlayerBtn.addEventListener('click', () => this.addPlayer());
        this.clearDataBtn.addEventListener('click', () => this.clearAllData());
        this.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addPlayer();
            }
        });
        
        // Prevent form submission on Enter in input
        this.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
    }
    
    // Main Timer Functions
    startMainTimer() {
        if (!this.mainTimer.isRunning) {
            this.mainTimer.startTime = Date.now() - this.mainTimer.elapsed;
            this.mainTimer.isRunning = true;
            this.mainTimer.interval = setInterval(() => {
                this.updateMainTimer();
            }, 100);
            
            // Update button states
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            
            // Start all active player timers
            this.startActivePlayerTimers();
        }
    }
    
    pauseMainTimer() {
        if (this.mainTimer.isRunning) {
            this.mainTimer.isRunning = false;
            clearInterval(this.mainTimer.interval);
            this.mainTimer.elapsed = Date.now() - this.mainTimer.startTime;
            
            // Update button states
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            
            // Pause all active player timers
            this.pauseActivePlayerTimers();
        }
    }
    
    resetMainTimer() {
        this.pauseMainTimer();
        this.mainTimer.elapsed = 0;
        this.updateDisplay();
        
        // Reset all player timers
        this.players.forEach(player => {
            player.elapsed = 0;
            player.isRunning = false;
            clearInterval(player.interval);
        });
        this.updatePlayersDisplay();
    }
    
    updateMainTimer() {
        this.mainTimer.elapsed = Date.now() - this.mainTimer.startTime;
        this.updateDisplay();
    }
    
    // Player Management Functions
    addPlayer() {
        const name = this.playerNameInput.value.trim();
        if (name === '') {
            alert('Please enter a player name');
            return;
        }
        
        if (this.players.some(player => player.name.toLowerCase() === name.toLowerCase())) {
            alert('A player with this name already exists');
            return;
        }
        
        const player = {
            id: this.nextPlayerId++,
            name: name,
            elapsed: 0,
            startTime: 0,
            isRunning: false,
            isActive: false,
            interval: null
        };
        
        this.players.push(player);
        this.playerNameInput.value = '';
        this.updatePlayersDisplay();
        this.saveData();
    }
    
    deletePlayer(playerId) {
        if (confirm('Are you sure you want to delete this player?')) {
            const playerIndex = this.players.findIndex(p => p.id === playerId);
            if (playerIndex !== -1) {
                const player = this.players[playerIndex];
                clearInterval(player.interval);
                this.players.splice(playerIndex, 1);
                this.updatePlayersDisplay();
                this.saveData();
            }
        }
    }
    
    togglePlayerActive(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;
        
        player.isActive = !player.isActive;
        
        if (player.isActive && this.mainTimer.isRunning) {
            this.startPlayerTimer(playerId);
        } else if (!player.isActive) {
            this.stopPlayerTimer(playerId);
        }
        
        this.updatePlayersDisplay();
    }
    
    editPlayerName(playerId, newName) {
        const player = this.players.find(p => p.id === playerId);
        if (player && newName.trim() !== '') {
            // Check if name already exists (excluding current player)
            const nameExists = this.players.some(p => p.id !== playerId && p.name.toLowerCase() === newName.trim().toLowerCase());
            if (nameExists) {
                alert('A player with this name already exists');
                return false;
            }
            player.name = newName.trim();
            this.updatePlayersDisplay();
            this.saveData();
            return true;
        }
        return false;
    }
    
    // Player Timer Functions
    startPlayerTimer(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player || player.isRunning) return;
        
        player.startTime = Date.now() - player.elapsed;
        player.isRunning = true;
        player.interval = setInterval(() => {
            this.updatePlayerTimer(playerId);
        }, 100);
    }
    
    stopPlayerTimer(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player || !player.isRunning) return;
        
        player.isRunning = false;
        clearInterval(player.interval);
        player.elapsed = Date.now() - player.startTime;
    }
    
    updatePlayerTimer(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (player && player.isRunning) {
            player.elapsed = Date.now() - player.startTime;
            this.updatePlayersDisplay();
        }
    }
    
    startActivePlayerTimers() {
        this.players.forEach(player => {
            if (player.isActive && !player.isRunning) {
                this.startPlayerTimer(player.id);
            }
        });
    }
    
    pauseActivePlayerTimers() {
        this.players.forEach(player => {
            if (player.isActive && player.isRunning) {
                this.stopPlayerTimer(player.id);
            }
        });
    }
    
    // Display Functions
    updateDisplay() {
        this.mainTimerDisplay.textContent = this.formatTime(this.mainTimer.elapsed);
    }
    
    updatePlayersDisplay() {
        this.playersContainer.innerHTML = '';
        
        this.players.forEach(player => {
            const playerCard = this.createPlayerCard(player);
            this.playersContainer.appendChild(playerCard);
        });
    }
    
    createPlayerCard(player) {
        const card = document.createElement('div');
        card.className = `player-card ${player.isActive ? 'active' : ''}`;
        card.dataset.playerId = player.id;
        
        card.innerHTML = `
            <div class="status-indicator"></div>
            <div class="player-name">${this.escapeHtml(player.name)}</div>
            <div class="player-timer">${this.formatTime(player.elapsed)}</div>
            <div class="player-controls">
                <button class="edit-btn" onclick="soccerTimer.startEditPlayer(${player.id})">✏️ Edit</button>
                <button class="delete-btn" onclick="soccerTimer.deletePlayer(${player.id})">🗑️ Delete</button>
            </div>
        `;
        
        // Add click event to toggle active state
        card.addEventListener('click', (e) => {
            // Don't toggle if clicking on buttons
            if (!e.target.classList.contains('edit-btn') && !e.target.classList.contains('delete-btn')) {
                this.togglePlayerActive(player.id);
            }
        });
        
        return card;
    }
    
    startEditPlayer(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;
        
        const playerCard = document.querySelector(`[data-player-id="${playerId}"]`);
        const playerNameElement = playerCard.querySelector('.player-name');
        
        // Create input field
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-input';
        input.value = player.name;
        input.maxLength = 20;
        
        // Replace name with input
        playerNameElement.style.display = 'none';
        playerNameElement.parentNode.insertBefore(input, playerNameElement);
        
        // Focus and select text
        input.focus();
        input.select();
        
        // Handle save
        const saveEdit = () => {
            const newName = input.value.trim();
            if (newName && this.editPlayerName(playerId, newName)) {
                input.remove();
                playerNameElement.style.display = 'block';
            } else {
                // Restore original name if edit failed
                input.remove();
                playerNameElement.style.display = 'block';
            }
        };
        
        // Handle cancel
        const cancelEdit = () => {
            input.remove();
            playerNameElement.style.display = 'block';
        };
        
        // Event listeners
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        });
    }
    
    // Utility Functions
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Local Storage Functions
    saveData() {
        const dataToSave = {
            players: this.players.map(player => ({
                id: player.id,
                name: player.name,
                elapsed: player.elapsed,
                isActive: player.isActive
            })),
            nextPlayerId: this.nextPlayerId
        };
        
        try {
            localStorage.setItem('soccerTimerData', JSON.stringify(dataToSave));
        } catch (error) {
            console.warn('Could not save data to localStorage:', error);
        }
    }
    
    loadSavedData() {
        try {
            const savedData = localStorage.getItem('soccerTimerData');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // Restore players
                this.players = data.players.map(player => ({
                    ...player,
                    startTime: 0,
                    isRunning: false,
                    interval: null
                }));
                
                // Restore next player ID
                this.nextPlayerId = data.nextPlayerId || this.players.length + 1;
                
                console.log(`Loaded ${this.players.length} saved players`);
            }
        } catch (error) {
            console.warn('Could not load data from localStorage:', error);
            // If there's an error, start fresh
            this.players = [];
            this.nextPlayerId = 1;
        }
    }
    
    clearAllData() {
        if (confirm('Are you sure you want to clear all saved data? This will delete all players and cannot be undone.')) {
            // Stop all timers
            this.pauseMainTimer();
            this.players.forEach(player => {
                clearInterval(player.interval);
            });
            
            // Clear data
            this.players = [];
            this.nextPlayerId = 1;
            
            // Clear localStorage
            try {
                localStorage.removeItem('soccerTimerData');
            } catch (error) {
                console.warn('Could not clear localStorage:', error);
            }
            
            // Update display
            this.updatePlayersDisplay();
            this.updateDisplay();
            
            alert('All data has been cleared!');
        }
    }
}

// Initialize the app when the page loads
let soccerTimer;
document.addEventListener('DOMContentLoaded', () => {
    soccerTimer = new SoccerTimer();
});
