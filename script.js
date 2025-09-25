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
        this.savedLists = [];
        this.maxActivePlayers = 9;
        this.isDragging = false;
        this.draggedPlayerId = null;
        this.managementVisible = true;
        
        this.initializeElements();
        this.bindEvents();
        this.loadSavedData();
        this.updateDisplay();
        this.updatePlayersDisplay();
        this.updatePlayerCount();
        this.updateSavedListsDisplay();
        this.loadToggleState();
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
        this.resetPlayersBtn = document.getElementById('reset-players-btn');
        this.summaryBtn = document.getElementById('summary-btn');
        this.playersContainer = document.getElementById('players-container');
        this.playerCountDisplay = document.getElementById('player-count');
        
        
        // Saved lists elements
        this.listNameInput = document.getElementById('list-name-input');
        this.saveListBtn = document.getElementById('save-list-btn');
        this.loadListBtn = document.getElementById('load-list-btn');
        this.savedListsContainer = document.getElementById('saved-lists-container');
        
        // Export/Import elements
        this.exportListsBtn = document.getElementById('export-lists-btn');
        this.importListsBtn = document.getElementById('import-lists-btn');
        this.importFileInput = document.getElementById('import-file-input');
        
        // Toggle elements
        this.toggleManagementBtn = document.getElementById('toggle-management-btn');
        this.managementContent = document.getElementById('management-content');
        
        // Modal elements
        this.summaryModal = document.getElementById('summary-modal');
        this.summaryContent = document.getElementById('summary-content');
        this.closeModal = document.querySelector('.close');
        this.printSummaryBtn = document.getElementById('print-summary-btn');
    }
    
    bindEvents() {
        // Main timer controls
        this.startBtn.addEventListener('click', () => this.startMainTimer());
        this.pauseBtn.addEventListener('click', () => this.pauseMainTimer());
        this.resetBtn.addEventListener('click', () => this.resetMainTimer());
        
        // Player management
        this.addPlayerBtn.addEventListener('click', () => this.addPlayer());
        this.clearDataBtn.addEventListener('click', () => this.clearAllData());
        this.resetPlayersBtn.addEventListener('click', () => this.resetAllPlayers());
        this.summaryBtn.addEventListener('click', () => this.showSummary());
        this.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addPlayer();
            }
        });
        
        
        // Saved lists functionality
        this.saveListBtn.addEventListener('click', () => this.saveCurrentList());
        this.loadListBtn.addEventListener('click', () => this.showLoadListDialog());
        this.listNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveCurrentList();
            }
        });
        
        // Export/Import functionality
        this.exportListsBtn.addEventListener('click', () => this.exportLists());
        this.importListsBtn.addEventListener('click', () => this.triggerFileInput());
        this.importFileInput.addEventListener('change', (e) => this.importLists(e));
        
        // Toggle functionality
        this.toggleManagementBtn.addEventListener('click', () => this.toggleManagementSection());
        
        // Modal functionality
        this.closeModal.addEventListener('click', () => this.closeSummaryModal());
        this.printSummaryBtn.addEventListener('click', () => this.printSummary());
        window.addEventListener('click', (e) => {
            if (e.target === this.summaryModal) {
                this.closeSummaryModal();
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
    }
    
    resetAllPlayers() {
        if (confirm('Reset all player timers to 00:00:00?')) {
            this.players.forEach(player => {
                player.elapsed = 0;
                player.isRunning = false;
                clearInterval(player.interval);
            });
            this.updatePlayersDisplay();
            this.updatePlayerCount();
            this.saveData();
        }
    }
    
    updateMainTimer() {
        this.mainTimer.elapsed = Date.now() - this.mainTimer.startTime;
        this.updateDisplay();
    }
    
    // Player Management Functions
    addPlayer() {
        const input = this.playerNameInput.value.trim();
        if (input === '') {
            alert('Please enter a player name');
            return;
        }
        
        // Check if input contains commas (multiple players)
        if (input.includes(',')) {
            this.addMultiplePlayers(input);
        } else {
            // Single player
            const name = input;
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
            this.updatePlayerCount();
            this.saveData();
            alert(`Player "${name}" added successfully!`);
        }
    }
    
    addMultiplePlayers(input = null) {
        const playerInput = input || this.playerNameInput.value.trim();
        if (!playerInput) {
            alert('Please enter player names separated by commas');
            return;
        }
        
        const names = playerInput.split(',').map(name => name.trim()).filter(name => name.length > 0);
        if (names.length === 0) {
            alert('Please enter valid player names');
            return;
        }
        
        let addedCount = 0;
        let skippedCount = 0;
        
        names.forEach(name => {
            if (name.length <= 20 && !this.players.some(player => player.name.toLowerCase() === name.toLowerCase())) {
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
                addedCount++;
            } else {
                skippedCount++;
            }
        });
        
        this.playerNameInput.value = '';
        this.updatePlayersDisplay();
        this.updatePlayerCount();
        this.saveData();
        
        if (addedCount > 0 && skippedCount === 0) {
            alert(`Added ${addedCount} new players!`);
        } else if (addedCount > 0 && skippedCount > 0) {
            alert(`Added ${addedCount} new players! ${skippedCount} were skipped (duplicates or invalid names).`);
        } else {
            alert('No new players were added. Check for duplicates or invalid names.');
        }
    }
    
    deletePlayer(playerId) {
        if (confirm('Are you sure you want to delete this player?')) {
            const playerIndex = this.players.findIndex(p => p.id === playerId);
            if (playerIndex !== -1) {
                const player = this.players[playerIndex];
                clearInterval(player.interval);
                this.players.splice(playerIndex, 1);
                this.updatePlayersDisplay();
                this.updatePlayerCount();
                this.saveData();
            }
        }
    }
    
    togglePlayerActive(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;
        
        // If trying to activate a player, check if we're at the limit
        if (!player.isActive) {
            const activeCount = this.players.filter(p => p.isActive).length;
            if (activeCount >= this.maxActivePlayers) {
                alert(`Maximum ${this.maxActivePlayers} players can be active at once!`);
                return;
            }
        }
        
        player.isActive = !player.isActive;
        
        if (player.isActive && this.mainTimer.isRunning) {
            this.startPlayerTimer(playerId);
        } else if (!player.isActive) {
            this.stopPlayerTimer(playerId);
        }
        
        this.updatePlayersDisplay();
        this.updatePlayerCount();
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
            this.updatePlayerCount();
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
            // Don't toggle if clicking on buttons or if dragging
            if (!e.target.classList.contains('edit-btn') && !e.target.classList.contains('delete-btn') && !this.isDragging) {
                this.togglePlayerActive(player.id);
            }
        });
        
        // Add drag and drop functionality
        this.addDragAndDrop(card, player.id);
        
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
            this.savedLists = [];
            this.nextPlayerId = 1;
            
            // Clear localStorage
            try {
                localStorage.removeItem('soccerTimerData');
            } catch (error) {
                console.warn('Could not clear localStorage:', error);
            }
            
            // Update display
            this.updatePlayersDisplay();
            this.updatePlayerCount();
            this.updateSavedListsDisplay();
            this.updateDisplay();
            
            alert('All data has been cleared!');
        }
    }
    
    // New Advanced Features
    
    saveCurrentList() {
        const listName = this.listNameInput.value.trim();
        if (!listName) {
            alert('Please enter a name for the list');
            return;
        }
        
        if (this.players.length === 0) {
            alert('No players to save');
            return;
        }
        
        const playerNames = this.players.map(p => p.name);
        const listId = Date.now().toString();
        
        const newList = {
            id: listId,
            name: listName,
            players: playerNames,
            created: new Date().toLocaleDateString()
        };
        
        // Check if list name already exists
        const existingIndex = this.savedLists.findIndex(list => list.name.toLowerCase() === listName.toLowerCase());
        if (existingIndex !== -1) {
            if (confirm(`A list named "${listName}" already exists. Replace it?`)) {
                this.savedLists[existingIndex] = newList;
            } else {
                return;
            }
        } else {
            this.savedLists.push(newList);
        }
        
        this.listNameInput.value = '';
        this.updateSavedListsDisplay();
        this.saveData();
        alert(`List "${listName}" saved successfully!`);
    }
    
    showLoadListDialog() {
        if (this.savedLists.length === 0) {
            alert('No saved lists available');
            return;
        }
        
        const listNames = this.savedLists.map(list => list.name).join('\n');
        const selectedName = prompt(`Available lists:\n\n${listNames}\n\nEnter the name of the list to load:`);
        
        if (selectedName) {
            this.loadList(selectedName.trim());
        }
    }
    
    loadList(listName) {
        const list = this.savedLists.find(l => l.name.toLowerCase() === listName.toLowerCase());
        if (!list) {
            alert(`List "${listName}" not found`);
            return;
        }
        
        if (confirm(`Load list "${list.name}"? This will replace all current players.`)) {
            // Clear current players
            this.players.forEach(player => {
                clearInterval(player.interval);
            });
            this.players = [];
            
            // Add players from saved list
            list.players.forEach(name => {
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
            });
            
            this.updatePlayersDisplay();
            this.updatePlayerCount();
            this.saveData();
            alert(`Loaded ${list.players.length} players from "${list.name}"`);
        }
    }
    
    updatePlayerCount() {
        const activeCount = this.players.filter(p => p.isActive).length;
        const totalCount = this.players.length;
        
        this.playerCountDisplay.textContent = `${activeCount}/${totalCount} selected`;
        
        if (activeCount >= this.maxActivePlayers) {
            this.playerCountDisplay.classList.add('full');
        } else {
            this.playerCountDisplay.classList.remove('full');
        }
    }
    
    updateSavedListsDisplay() {
        this.savedListsContainer.innerHTML = '';
        
        this.savedLists.forEach(list => {
            const listItem = document.createElement('div');
            listItem.className = 'saved-list-item';
            listItem.innerHTML = `
                <div class="saved-list-name">${this.escapeHtml(list.name)}</div>
                <div class="saved-list-count">${list.players.length} players</div>
            `;
            
            listItem.addEventListener('click', () => {
                this.loadList(list.name);
            });
            
            this.savedListsContainer.appendChild(listItem);
        });
    }
    
    showSummary() {
        if (this.players.length === 0) {
            alert('No players to show in summary');
            return;
        }
        
        let summaryHtml = '';
        
        // Sort players by elapsed time (descending)
        const sortedPlayers = [...this.players].sort((a, b) => b.elapsed - a.elapsed);
        
        sortedPlayers.forEach(player => {
            const timeStr = this.formatTime(player.elapsed);
            
            summaryHtml += `
                <div class="summary-player">
                    <span class="summary-player-name">${this.escapeHtml(player.name)}</span>
                    <span class="summary-player-time">${timeStr}</span>
                </div>
            `;
        });
        
        this.summaryContent.innerHTML = summaryHtml;
        this.summaryModal.style.display = 'block';
    }
    
    closeSummaryModal() {
        this.summaryModal.style.display = 'none';
    }
    
    printSummary() {
        if (this.players.length === 0) {
            alert('No players to print in summary');
            return;
        }
        
        // Create print-friendly HTML
        const printHtml = this.createPrintHTML();
        
        // Create a temporary container for printing
        const printContainer = document.createElement('div');
        printContainer.className = 'print-summary';
        printContainer.innerHTML = printHtml;
        
        // Add to body temporarily
        document.body.appendChild(printContainer);
        
        // Print
        window.print();
        
        // Remove temporary container
        document.body.removeChild(printContainer);
    }
    
    createPrintHTML() {
        const sortedPlayers = [...this.players].sort((a, b) => b.elapsed - a.elapsed);
        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();
        
        let playersHtml = '';
        sortedPlayers.forEach(player => {
            const timeStr = this.formatTime(player.elapsed);
            playersHtml += `
                <div class="print-player">
                    <span class="print-player-name">${this.escapeHtml(player.name)}</span>
                    <span class="print-player-time">${timeStr}</span>
                </div>
            `;
        });
        
        return `
            <div class="print-header">
                <h1>⚽ Soccer Game Summary</h1>
                <div class="print-date">${currentDate} at ${currentTime}</div>
            </div>
            ${playersHtml}
        `;
    }
    
    // Update saveData to include saved lists
    saveData() {
        const dataToSave = {
            players: this.players.map(player => ({
                id: player.id,
                name: player.name,
                elapsed: player.elapsed,
                isActive: player.isActive
            })),
            nextPlayerId: this.nextPlayerId,
            savedLists: this.savedLists
        };
        
        try {
            localStorage.setItem('soccerTimerData', JSON.stringify(dataToSave));
        } catch (error) {
            console.warn('Could not save data to localStorage:', error);
        }
    }
    
    // Update loadSavedData to include saved lists
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
                
                // Restore saved lists
                this.savedLists = data.savedLists || [];
                
                console.log(`Loaded ${this.players.length} saved players and ${this.savedLists.length} saved lists`);
            }
        } catch (error) {
            console.warn('Could not load data from localStorage:', error);
            // If there's an error, start fresh
            this.players = [];
            this.savedLists = [];
            this.nextPlayerId = 1;
        }
    }
    
    // Drag and Drop Functionality (Desktop + Mobile)
    addDragAndDrop(card, playerId) {
        card.draggable = true;
        
        // Desktop drag and drop
        card.addEventListener('dragstart', (e) => {
            this.isDragging = true;
            this.draggedPlayerId = playerId;
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', card.outerHTML);
        });
        
        card.addEventListener('dragend', (e) => {
            this.isDragging = false;
            this.draggedPlayerId = null;
            card.classList.remove('dragging');
            // Remove drag-over class from all cards
            document.querySelectorAll('.player-card').forEach(c => {
                c.classList.remove('drag-over');
            });
        });
        
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            // Only show drop effect if it's a different player
            if (this.draggedPlayerId !== playerId) {
                card.classList.add('drag-over');
            }
        });
        
        card.addEventListener('dragleave', (e) => {
            card.classList.remove('drag-over');
        });
        
        card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.classList.remove('drag-over');
            
            if (this.draggedPlayerId !== null && this.draggedPlayerId !== playerId) {
                this.movePlayer(this.draggedPlayerId, playerId);
            }
        });
        
        // Mobile touch events
        let touchStartY = 0;
        let touchStartTime = 0;
        let isTouchDragging = false;
        
        card.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();
                isTouchDragging = false;
            }
        }, { passive: true });
        
        card.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                const touchY = e.touches[0].clientY;
                const touchDuration = Date.now() - touchStartTime;
                
                // Start dragging if moved enough and held long enough
                if (!isTouchDragging && Math.abs(touchY - touchStartY) > 10 && touchDuration > 200) {
                    isTouchDragging = true;
                    this.isDragging = true;
                    this.draggedPlayerId = playerId;
                    card.classList.add('dragging');
                    
                    // Add haptic feedback if available
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                }
                
                if (isTouchDragging) {
                    e.preventDefault();
                    // Find which card we're over
                    const elementBelow = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
                    const cardBelow = elementBelow?.closest('.player-card');
                    
                    // Remove drag-over from all cards
                    document.querySelectorAll('.player-card').forEach(c => {
                        c.classList.remove('drag-over');
                    });
                    
                    // Add drag-over to the card we're over (if different)
                    if (cardBelow && cardBelow !== card) {
                        cardBelow.classList.add('drag-over');
                    }
                }
            }
        }, { passive: false });
        
        card.addEventListener('touchend', (e) => {
            if (isTouchDragging) {
                e.preventDefault();
                isTouchDragging = false;
                this.isDragging = false;
                card.classList.remove('dragging');
                
                // Find which card we dropped on
                const elementBelow = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                const cardBelow = elementBelow?.closest('.player-card');
                
                // Remove drag-over from all cards
                document.querySelectorAll('.player-card').forEach(c => {
                    c.classList.remove('drag-over');
                });
                
                // Move player if dropped on different card
                if (cardBelow && cardBelow !== card) {
                    const targetPlayerId = parseInt(cardBelow.dataset.playerId);
                    if (this.draggedPlayerId !== null && this.draggedPlayerId !== targetPlayerId) {
                        this.movePlayer(this.draggedPlayerId, targetPlayerId);
                    }
                }
                
                this.draggedPlayerId = null;
            }
        }, { passive: false });
    }
    
    movePlayer(fromPlayerId, toPlayerId) {
        const fromIndex = this.players.findIndex(p => p.id === fromPlayerId);
        const toIndex = this.players.findIndex(p => p.id === toPlayerId);
        
        if (fromIndex !== -1 && toIndex !== -1) {
            // Remove the dragged player from its current position
            const [movedPlayer] = this.players.splice(fromIndex, 1);
            
            // Insert it at the new position
            this.players.splice(toIndex, 0, movedPlayer);
            
            // Update the display
            this.updatePlayersDisplay();
            this.saveData();
        }
    }
    
    // Export/Import Functionality
    triggerFileInput() {
        // Clear any previous selection
        this.importFileInput.value = '';
        
        // Trigger file input
        this.importFileInput.click();
    }
    
    exportLists() {
        if (this.savedLists.length === 0) {
            alert('No saved lists to export');
            return;
        }
        
        const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            savedLists: this.savedLists
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        // Create download link
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `soccer-timer-lists-${new Date().toISOString().split('T')[0]}.json`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert(`Exported ${this.savedLists.length} saved lists!`);
    }
    
    importLists(event) {
        const file = event.target.files[0];
        if (!file) {
            console.log('No file selected');
            return;
        }
        
        console.log('File selected:', file.name, file.type, file.size);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                if (!importData.savedLists || !Array.isArray(importData.savedLists)) {
                    alert('Invalid file format. Please select a valid export file.');
                    return;
                }
                
                if (importData.savedLists.length === 0) {
                    alert('No saved lists found in the file.');
                    return;
                }
                
                const existingCount = this.savedLists.length;
                let addedCount = 0;
                let skippedCount = 0;
                
                importData.savedLists.forEach(importedList => {
                    // Check if list with same name already exists
                    const existingIndex = this.savedLists.findIndex(list => 
                        list.name.toLowerCase() === importedList.name.toLowerCase()
                    );
                    
                    if (existingIndex !== -1) {
                        // Ask user what to do with duplicate
                        const shouldReplace = confirm(
                            `List "${importedList.name}" already exists. Replace it?`
                        );
                        if (shouldReplace) {
                            this.savedLists[existingIndex] = importedList;
                            addedCount++;
                        } else {
                            skippedCount++;
                        }
                    } else {
                        this.savedLists.push(importedList);
                        addedCount++;
                    }
                });
                
                this.updateSavedListsDisplay();
                this.saveData();
                
                // Clear the file input
                event.target.value = '';
                
                if (addedCount > 0) {
                    alert(`Import successful!\nAdded: ${addedCount} lists\nSkipped: ${skippedCount} lists`);
                } else {
                    alert('No lists were imported.');
                }
                
            } catch (error) {
                alert('Error reading file. Please make sure it\'s a valid export file.\n\nError: ' + error.message);
                console.error('Import error:', error);
            }
        };
        
        reader.onerror = () => {
            alert('Error reading the file. Please try again.');
            console.error('FileReader error');
        };
        
        reader.readAsText(file);
    }
    
    // Toggle Management Section
    toggleManagementSection() {
        this.managementVisible = !this.managementVisible;
        
        if (this.managementVisible) {
            this.managementContent.classList.remove('hidden');
            this.toggleManagementBtn.innerHTML = '👁️ Hide';
        } else {
            this.managementContent.classList.add('hidden');
            this.toggleManagementBtn.innerHTML = '👁️ Show';
        }
        
        // Save toggle state
        this.saveToggleState();
    }
    
    saveToggleState() {
        try {
            localStorage.setItem('soccerTimerToggleState', JSON.stringify({
                managementVisible: this.managementVisible
            }));
        } catch (error) {
            console.warn('Could not save toggle state:', error);
        }
    }
    
    loadToggleState() {
        try {
            const savedState = localStorage.getItem('soccerTimerToggleState');
            if (savedState) {
                const state = JSON.parse(savedState);
                this.managementVisible = state.managementVisible || true;
                
                // Apply the state
                if (!this.managementVisible) {
                    this.managementContent.classList.add('hidden');
                    this.toggleManagementBtn.innerHTML = '👁️ Show';
                }
            }
        } catch (error) {
            console.warn('Could not load toggle state:', error);
            this.managementVisible = true;
        }
    }
}

// Initialize the app when the page loads
let soccerTimer;
document.addEventListener('DOMContentLoaded', () => {
    soccerTimer = new SoccerTimer();
});
