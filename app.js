// ProductivityHub Dashboard Application
class ProductivityHub {
    constructor() {
        this.tasks = [];
        this.notes = [];
        this.timerInterval = null;
        this.timerSeconds = 25 * 60; // 25 minutes
        this.timerOriginalSeconds = 25 * 60;
        this.timerRunning = false;
        this.timerSessions = 0;
        
        this.init();
    }

    init() {
        // Load data first
        this.loadData();
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeApp();
            });
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        this.initializeElements();
        this.bindEvents();
        this.updateTime();
        this.updateStats();
        this.loadWeather();
        this.loadQuote();
        this.updateAnalytics();
        this.setIntervals();
    }

    // Initialize DOM elements and set up sample data
    initializeElements() {
        // Load sample data if no existing data
        if (this.tasks.length === 0) {
            this.tasks = [
                {id: 1, title: "Complete project proposal", priority: "high", category: "work", dueDate: "2025-07-22", completed: false, createdAt: new Date().toISOString()},
                {id: 2, title: "Review quarterly reports", priority: "medium", category: "work", dueDate: "2025-07-23", completed: true, createdAt: new Date().toISOString()},
                {id: 3, title: "Plan weekend trip", priority: "low", category: "personal", dueDate: "2025-07-25", completed: false, createdAt: new Date().toISOString()}
            ];
        }

        if (this.notes.length === 0) {
            this.notes = [
                {id: 1, content: "Remember to follow up with client", timestamp: "2025-07-20T19:25:00Z"},
                {id: 2, content: "Book dentist appointment", timestamp: "2025-07-20T12:15:00Z"}
            ];
        }

        this.renderTasks();
        this.renderNotes();
        this.updateTimerDisplay();
        
        // Initialize timer sessions display
        const timerSessionsEl = document.getElementById('timerSessions');
        if (timerSessionsEl) {
            timerSessionsEl.textContent = this.timerSessions;
        }
    }

    // Event binding
    bindEvents() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Task management
        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => this.addTask(e));
        }
        
        const taskFilter = document.getElementById('taskFilter');
        if (taskFilter) {
            taskFilter.addEventListener('change', (e) => this.filterTasks(e.target.value));
        }
        
        // Notes management
        const noteForm = document.getElementById('noteForm');
        if (noteForm) {
            noteForm.addEventListener('submit', (e) => this.addNote(e));
        }
        
        const noteSearch = document.getElementById('noteSearch');
        if (noteSearch) {
            noteSearch.addEventListener('input', (e) => this.searchNotes(e.target.value));
        }
        
        // Timer controls
        const timerStart = document.getElementById('timerStart');
        const timerPause = document.getElementById('timerPause');
        const timerReset = document.getElementById('timerReset');
        
        if (timerStart) {
            timerStart.addEventListener('click', () => this.startTimer());
        }
        if (timerPause) {
            timerPause.addEventListener('click', () => this.pauseTimer());
        }
        if (timerReset) {
            timerReset.addEventListener('click', () => this.resetTimer());
        }
        
        // Quote refresh
        const refreshQuote = document.getElementById('refreshQuote');
        if (refreshQuote) {
            refreshQuote.addEventListener('click', () => this.loadQuote());
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    // Time and greeting management
    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const dateString = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const timeEl = document.getElementById('currentTime');
        const dateEl = document.getElementById('currentDate');
        const greetingEl = document.getElementById('greeting');
        
        if (timeEl) timeEl.textContent = timeString;
        if (dateEl) dateEl.textContent = dateString;
        
        // Update greeting based on time
        if (greetingEl) {
            const hour = now.getHours();
            let greeting = 'Good evening!';
            if (hour < 12) greeting = 'Good morning!';
            else if (hour < 17) greeting = 'Good afternoon!';
            
            greetingEl.textContent = greeting;
        }
    }

    // Theme management
    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-color-scheme') || 
                           (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-color-scheme', newTheme);
        
        const icon = document.querySelector('.theme-toggle__icon');
        if (icon) {
            icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
        
        localStorage.setItem('theme', newTheme);
        this.showToast(`Switched to ${newTheme} mode`, 'info');
    }

    // Task management
    addTask(e) {
        e.preventDefault();
        
        const titleEl = document.getElementById('taskTitle');
        const priorityEl = document.getElementById('taskPriority');
        const categoryEl = document.getElementById('taskCategory');
        const dueDateEl = document.getElementById('taskDueDate');
        
        if (!titleEl) return;
        
        const title = titleEl.value.trim();
        const priority = priorityEl ? priorityEl.value : 'medium';
        const category = categoryEl ? categoryEl.value : 'work';
        const dueDate = dueDateEl ? dueDateEl.value : '';
        
        if (!title) {
            this.showToast('Please enter a task title', 'error');
            return;
        }
        
        const task = {
            id: Date.now(),
            title,
            priority,
            category,
            dueDate,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.unshift(task);
        this.saveData();
        this.renderTasks();
        this.updateStats();
        this.updateAnalytics();
        
        // Reset form
        const form = document.getElementById('taskForm');
        if (form) {
            form.reset();
        }
        if (priorityEl) {
            priorityEl.value = 'medium';
        }
        
        this.showToast('Task added successfully!', 'success');
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            if (task.completed) {
                task.completedAt = new Date().toISOString();
            } else {
                delete task.completedAt;
            }
            
            this.saveData();
            this.renderTasks();
            this.updateStats();
            this.updateAnalytics();
            
            const message = task.completed ? 'Task completed!' : 'Task reopened';
            this.showToast(message, 'success');
        }
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveData();
            this.renderTasks();
            this.updateStats();
            this.updateAnalytics();
            this.showToast('Task deleted', 'info');
        }
    }

    filterTasks(filter) {
        this.renderTasks(filter);
    }

    renderTasks(filter = 'all') {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;
        
        let filteredTasks = this.tasks;
        
        if (filter === 'pending') {
            filteredTasks = this.tasks.filter(t => !t.completed);
        } else if (filter === 'completed') {
            filteredTasks = this.tasks.filter(t => t.completed);
        }
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<div class="task__empty" style="text-align: center; color: var(--color-text-secondary); padding: 20px;">No tasks found</div>';
            return;
        }
        
        taskList.innerHTML = filteredTasks.map(task => `
            <div class="task__item ${task.completed ? 'task__item--completed' : ''}" data-id="${task.id}">
                <input type="checkbox" class="task__checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="window.app.toggleTask(${task.id})">
                <div class="task__content">
                    <div class="task__title">${this.escapeHtml(task.title)}</div>
                    <div class="task__meta">
                        <span class="task__priority task__priority--${task.priority}">${task.priority}</span>
                        <span class="task__category">${task.category}</span>
                        ${task.dueDate ? `<span class="task__due">Due: ${task.dueDate}</span>` : ''}
                    </div>
                </div>
                <div class="task__actions">
                    <button class="task__action task__action--delete" onclick="window.app.deleteTask(${task.id})" 
                            aria-label="Delete task">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
        
        this.initDragAndDrop();
    }

    // Notes management
    addNote(e) {
        e.preventDefault();
        
        const contentEl = document.getElementById('noteContent');
        if (!contentEl) return;
        
        const content = contentEl.value.trim();
        if (!content) {
            this.showToast('Please enter note content', 'error');
            return;
        }
        
        const note = {
            id: Date.now(),
            content,
            timestamp: new Date().toISOString()
        };
        
        this.notes.unshift(note);
        this.saveData();
        this.renderNotes();
        
        contentEl.value = '';
        this.showToast('Note added!', 'success');
    }

    deleteNote(id) {
        this.notes = this.notes.filter(n => n.id !== id);
        this.saveData();
        this.renderNotes();
        this.showToast('Note deleted', 'info');
    }

    searchNotes(query) {
        this.renderNotes(query);
    }

    renderNotes(searchQuery = '') {
        const noteList = document.getElementById('noteList');
        if (!noteList) return;
        
        let filteredNotes = this.notes;
        
        if (searchQuery) {
            filteredNotes = this.notes.filter(note => 
                note.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        if (filteredNotes.length === 0) {
            noteList.innerHTML = '<div class="note__empty" style="text-align: center; color: var(--color-text-secondary); padding: 20px;">No notes found</div>';
            return;
        }
        
        noteList.innerHTML = filteredNotes.map(note => `
            <div class="note__item">
                <div class="note__content">${this.escapeHtml(note.content)}</div>
                <div class="note__meta">
                    <span class="note__timestamp">${this.formatDate(note.timestamp)}</span>
                    <button class="note__delete" onclick="window.app.deleteNote(${note.id})" 
                            aria-label="Delete note">
                        ×
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Timer management
    startTimer() {
        if (this.timerRunning) return;
        
        this.timerRunning = true;
        this.updateTimerButtons();
        
        this.timerInterval = setInterval(() => {
            this.timerSeconds--;
            this.updateTimerDisplay();
            
            if (this.timerSeconds <= 0) {
                this.completeTimer();
            }
        }, 1000);
        
        const statusEl = document.getElementById('timerStatus');
        if (statusEl) {
            statusEl.textContent = 'Focus time!';
        }
        
        this.showToast('Timer started!', 'info');
    }

    pauseTimer() {
        if (!this.timerRunning) return;
        
        this.timerRunning = false;
        clearInterval(this.timerInterval);
        this.updateTimerButtons();
        
        const statusEl = document.getElementById('timerStatus');
        if (statusEl) {
            statusEl.textContent = 'Paused';
        }
        
        this.showToast('Timer paused', 'info');
    }

    resetTimer() {
        this.timerRunning = false;
        clearInterval(this.timerInterval);
        this.timerSeconds = this.timerOriginalSeconds;
        this.updateTimerDisplay();
        this.updateTimerButtons();
        
        const statusEl = document.getElementById('timerStatus');
        if (statusEl) {
            statusEl.textContent = 'Ready to focus';
        }
        
        this.showToast('Timer reset', 'info');
    }

    completeTimer() {
        this.timerRunning = false;
        clearInterval(this.timerInterval);
        this.timerSessions++;
        this.updateTimerButtons();
        
        const sessionsEl = document.getElementById('timerSessions');
        if (sessionsEl) {
            sessionsEl.textContent = this.timerSessions;
        }
        
        const statusEl = document.getElementById('timerStatus');
        if (statusEl) {
            statusEl.textContent = 'Session complete!';
        }
        
        // Reset timer for next session
        this.timerSeconds = this.timerOriginalSeconds;
        this.updateTimerDisplay();
        
        this.saveData();
        this.showToast('🎉 Focus session completed!', 'success');
        
        // Browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Focus Session Complete!', {
                body: 'Take a break and start your next session when ready.',
                icon: '/favicon.ico'
            });
        }
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timerSeconds / 60);
        const seconds = this.timerSeconds % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const timeEl = document.getElementById('timerTime');
        if (timeEl) {
            timeEl.textContent = timeString;
        }
        
        // Update progress bar
        const progress = ((this.timerOriginalSeconds - this.timerSeconds) / this.timerOriginalSeconds) * 100;
        const progressEl = document.getElementById('timerProgress');
        if (progressEl) {
            progressEl.style.width = `${progress}%`;
        }
    }

    updateTimerButtons() {
        const startBtn = document.getElementById('timerStart');
        const pauseBtn = document.getElementById('timerPause');
        
        if (startBtn) {
            startBtn.disabled = this.timerRunning;
            startBtn.textContent = this.timerRunning ? 'Running...' : 'Start';
        }
        if (pauseBtn) {
            pauseBtn.disabled = !this.timerRunning;
        }
    }

    // Weather integration
    async loadWeather() {
        const weatherContent = document.getElementById('weatherContent');
        if (!weatherContent) return;
        
        try {
            // Try to get user's location
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        await this.fetchWeather(latitude, longitude);
                    },
                    () => {
                        // Fallback to default location
                        this.showFallbackWeather();
                    }
                );
            } else {
                this.showFallbackWeather();
            }
        } catch (error) {
            this.showFallbackWeather();
        }
    }

    async fetchWeather(lat, lon) {
        try {
            // Note: In a real app, you'd use your own OpenWeatherMap API key
            // For this demo, we'll show fallback weather immediately
            this.showFallbackWeather();
        } catch (error) {
            this.showFallbackWeather();
        }
    }

    showFallbackWeather() {
        const weatherContent = document.getElementById('weatherContent');
        if (weatherContent) {
            weatherContent.innerHTML = `
                <div class="weather__location">Mumbai, IN</div>
                <div class="weather__temp">28°C</div>
                <div class="weather__condition">⛅ Partly Cloudy</div>
                <div class="weather__details">
                    <div>Humidity: 65%</div>
                    <div>Wind: 12 km/h</div>
                </div>
            `;
        }
    }

    // Quote integration
    async loadQuote() {
        const quoteContent = document.getElementById('quoteContent');
        if (!quoteContent) return;
        
        try {
            // Try to fetch from quotable API
            const response = await fetch('https://api.quotable.io/random?tags=motivational,inspirational,success');
            if (response.ok) {
                const data = await response.json();
                this.showQuote(data.content, data.author);
            } else {
                this.showFallbackQuote();
            }
        } catch (error) {
            this.showFallbackQuote();
        }
    }

    showQuote(text, author) {
        const quoteContent = document.getElementById('quoteContent');
        if (quoteContent) {
            quoteContent.innerHTML = `
                <div class="quote__text">"${text}"</div>
                <div class="quote__author">${author}</div>
            `;
        }
    }

    showFallbackQuote() {
        const fallbackQuotes = [
            { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
            { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
            { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
            { text: "The future depends on what you do today.", author: "Mahatma Gandhi" }
        ];
        
        const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        this.showQuote(randomQuote.text, randomQuote.author);
    }

    // Analytics and stats
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const totalEl = document.getElementById('totalTasks');
        const completedEl = document.getElementById('completedTasks');
        const rateEl = document.getElementById('completionRate');
        
        if (totalEl) totalEl.textContent = total;
        if (completedEl) completedEl.textContent = completed;
        if (rateEl) rateEl.textContent = `${completionRate}%`;
    }

    updateAnalytics() {
        this.updateDailyProgress();
        this.updateWeeklyChart();
        this.updateAchievements();
    }

    updateDailyProgress() {
        const today = new Date().toDateString();
        const todaysTasks = this.tasks.filter(task => 
            new Date(task.createdAt).toDateString() === today
        );
        const completedToday = todaysTasks.filter(task => task.completed);
        
        const total = todaysTasks.length;
        const completed = completedToday.length;
        const percentage = total > 0 ? (completed / total) * 100 : 0;
        
        const progressEl = document.getElementById('dailyProgress');
        const completedTodayEl = document.getElementById('dailyTasksCompleted');
        const totalTodayEl = document.getElementById('dailyTasksTotal');
        
        if (progressEl) progressEl.style.width = `${percentage}%`;
        if (completedTodayEl) completedTodayEl.textContent = completed;
        if (totalTodayEl) totalTodayEl.textContent = total;
    }

    updateWeeklyChart() {
        const weekChart = document.getElementById('weekChart');
        if (!weekChart) return;
        
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const currentDate = new Date();
        
        let chartHTML = '';
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() - (6 - i));
            
            const tasksForDay = this.tasks.filter(task => {
                const taskDate = new Date(task.createdAt);
                return taskDate.toDateString() === date.toDateString();
            });
            
            const completedForDay = tasksForDay.filter(task => task.completed);
            const percentage = tasksForDay.length > 0 ? (completedForDay.length / tasksForDay.length) * 100 : 0;
            
            chartHTML += `
                <div class="week-day">
                    <div class="week-day__bar" style="height: ${Math.max(percentage, 10)}%"></div>
                    <div class="week-day__label">${days[i]}</div>
                </div>
            `;
        }
        
        weekChart.innerHTML = chartHTML;
    }

    updateAchievements() {
        const achievements = document.getElementById('achievements');
        if (!achievements) return;
        
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const totalSessions = this.timerSessions;
        
        const achievementList = [
            { icon: '🎯', name: 'First Task', condition: completedTasks >= 1, unlocked: completedTasks >= 1 },
            { icon: '🔥', name: 'Task Master', condition: completedTasks >= 10, unlocked: completedTasks >= 10 },
            { icon: '⏰', name: 'Focused', condition: totalSessions >= 1, unlocked: totalSessions >= 1 },
            { icon: '🏆', name: 'Productive', condition: totalSessions >= 5, unlocked: totalSessions >= 5 }
        ];
        
        achievements.innerHTML = achievementList.map(achievement => `
            <div class="achievement ${achievement.unlocked ? 'achievement--unlocked' : ''}">
                <span class="achievement__icon">${achievement.icon}</span>
                <span class="achievement__name">${achievement.name}</span>
            </div>
        `).join('');
    }

    // Drag and drop functionality
    initDragAndDrop() {
        const taskItems = document.querySelectorAll('.task__item');
        
        taskItems.forEach(item => {
            item.draggable = true;
            
            item.addEventListener('dragstart', (e) => {
                item.classList.add('task__item--dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', item.outerHTML);
                e.dataTransfer.setData('text/plain', item.dataset.id);
            });
            
            item.addEventListener('dragend', (e) => {
                item.classList.remove('task__item--dragging');
            });
            
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                item.classList.add('task__item--drop-target');
            });
            
            item.addEventListener('dragleave', (e) => {
                item.classList.remove('task__item--drop-target');
            });
            
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.classList.remove('task__item--drop-target');
                
                const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
                const targetId = parseInt(item.dataset.id);
                
                if (draggedId !== targetId) {
                    this.reorderTasks(draggedId, targetId);
                }
            });
        });
    }

    reorderTasks(draggedId, targetId) {
        const draggedIndex = this.tasks.findIndex(t => t.id === draggedId);
        const targetIndex = this.tasks.findIndex(t => t.id === targetId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
            const draggedTask = this.tasks.splice(draggedIndex, 1)[0];
            this.tasks.splice(targetIndex, 0, draggedTask);
            
            this.saveData();
            this.renderTasks();
            this.showToast('Tasks reordered', 'info');
        }
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter to add task
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (document.activeElement.id === 'taskTitle') {
                const form = document.getElementById('taskForm');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                }
            } else if (document.activeElement.id === 'noteContent') {
                const form = document.getElementById('noteForm');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                }
            }
        }
        
        // Escape to clear forms
        if (e.key === 'Escape') {
            if (document.activeElement.id === 'taskTitle') {
                const form = document.getElementById('taskForm');
                if (form) form.reset();
            } else if (document.activeElement.id === 'noteContent') {
                document.getElementById('noteContent').value = '';
            }
        }
        
        // Space to start/pause timer (when not in input)
        if (e.key === ' ' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            e.preventDefault();
            if (this.timerRunning) {
                this.pauseTimer();
            } else {
                this.startTimer();
            }
        }
    }

    // Toast notifications
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };
        
        toast.innerHTML = `
            <span class="toast__icon">${icons[type]}</span>
            <span class="toast__message">${message}</span>
            <button class="toast__close">×</button>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 3000);
        
        // Close button
        const closeBtn = toast.querySelector('.toast__close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (toast.parentNode) {
                    toast.remove();
                }
            });
        }
    }

    // Data persistence
    saveData() {
        try {
            localStorage.setItem('productivityHub_tasks', JSON.stringify(this.tasks));
            localStorage.setItem('productivityHub_notes', JSON.stringify(this.notes));
            localStorage.setItem('productivityHub_sessions', this.timerSessions.toString());
        } catch (error) {
            console.error('Failed to save data:', error);
            this.showToast('Failed to save data', 'error');
        }
    }

    loadData() {
        try {
            const savedTasks = localStorage.getItem('productivityHub_tasks');
            const savedNotes = localStorage.getItem('productivityHub_notes');
            const savedSessions = localStorage.getItem('productivityHub_sessions');
            const savedTheme = localStorage.getItem('theme');
            
            if (savedTasks) {
                this.tasks = JSON.parse(savedTasks);
            }
            
            if (savedNotes) {
                this.notes = JSON.parse(savedNotes);
            }
            
            if (savedSessions) {
                this.timerSessions = parseInt(savedSessions);
            }
            
            if (savedTheme) {
                document.documentElement.setAttribute('data-color-scheme', savedTheme);
                setTimeout(() => {
                    const icon = document.querySelector('.theme-toggle__icon');
                    if (icon) {
                        icon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Failed to load saved data:', error);
            this.showToast('Failed to load saved data', 'error');
        }
    }

    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    setIntervals() {
        // Update time every second
        setInterval(() => this.updateTime(), 1000);
        
        // Update analytics every minute
        setInterval(() => this.updateAnalytics(), 60000);
        
        // Auto-save every 30 seconds
        setInterval(() => this.saveData(), 30000);
    }
}

// Initialize the application when DOM is ready
let app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new ProductivityHub();
        window.app = app; // Make globally available for onclick handlers
    });
} else {
    app = new ProductivityHub();
    window.app = app; // Make globally available for onclick handlers
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}
