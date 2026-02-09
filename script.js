

const app = {
    
    data: {
        subjects: [],
        tasks: [],
        schedule: [] 
    },

   
    init() {
        this.loadData();
        this.cacheDOM();
        this.bindEvents();
        this.renderAll();
        this.updateDate();
        console.log("App Initialized. Schedule Data:", this.data.schedule);
    },

    cacheDOM() {
        this.views = document.querySelectorAll('.view');
        this.navBtns = document.querySelectorAll('.nav-btn');
        this.pageTitle = document.getElementById('page-title');
    },

    bindEvents() {
        this.navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.dataset.target;
                this.switchView(target);
                this.navBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    },

    loadData() {
        const stored = localStorage.getItem('studyPlannerData');
        if (stored) {
            try {
                this.data = JSON.parse(stored);
                
                if (!this.data.schedule) this.data.schedule = [];
            } catch (e) {
                console.error("Data load error", e);
            }
        }
    },

    saveData() {
        localStorage.setItem('studyPlannerData', JSON.stringify(this.data));
        this.renderAll();
    },

    resetData() {
        if(confirm('Are you sure? This will wipe all data.')) {
            localStorage.removeItem('studyPlannerData');
            this.data = { subjects: [], tasks: [], schedule: [] };
            location.reload();
        }
    },

    switchView(viewName) {
        this.views.forEach(view => {
            view.classList.add('hidden');
            view.classList.remove('active');
        });
        
        const activeView = document.getElementById(`${viewName}-view`);
        if (activeView) {
            activeView.classList.remove('hidden');
            activeView.classList.add('active');
            this.pageTitle.innerText = viewName.charAt(0).toUpperCase() + viewName.slice(1);
        }
    },

    
    saveSubject() {
        const name = document.getElementById('subject-name').value;
        const credits = document.getElementById('subject-credits').value;
        
        if (name) {
            this.data.subjects.push({ id: Date.now(), name, credits });
            this.saveData();
            closeModal('subject-modal');
            document.getElementById('subject-name').value = ''; 
            document.getElementById('subject-credits').value = '';
        } else {
            alert('Subject name is required!');
        }
    },

    deleteSubject(id) {
        if(confirm('Delete this subject?')) {
            this.data.subjects = this.data.subjects.filter(s => s.id !== id);
            this.saveData();
        }
    },

    
    saveTask() {
        const desc = document.getElementById('task-desc').value;
        const date = document.getElementById('task-date').value;
        const subjectId = document.getElementById('task-subject-select').value;

        if (desc && date) {
            this.data.tasks.push({ 
                id: Date.now(), 
                desc, 
                date, 
                subjectId, 
                completed: false 
            });
            this.saveData();
            closeModal('task-modal');
            
            document.getElementById('task-desc').value = '';
            document.getElementById('task-date').value = '';
        } else {
            alert('Please fill all fields');
        }
    },

    toggleTask(id) {
        const task = this.data.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveData();
        }
    },

    
    saveSchedule() {
        console.log("Attempting to save schedule..."); 
        const day = document.getElementById('schedule-day').value;
        const start = document.getElementById('schedule-start').value;
        const end = document.getElementById('schedule-end').value;
        const activity = document.getElementById('schedule-activity').value;

        if (day && start && end && activity) {
            this.data.schedule.push({ 
                id: Date.now(), 
                day, 
                start, 
                end, 
                activity 
            });
            
            
            this.data.schedule.sort((a, b) => a.start.localeCompare(b.start));

            this.saveData();
            closeModal('schedule-modal');
            
            
            document.getElementById('schedule-start').value = '';
            document.getElementById('schedule-end').value = '';
            document.getElementById('schedule-activity').value = '';
        } else {
            alert('Please fill all schedule fields (Day, Start, End, and Activity).');
        }
    },

    deleteSchedule(id) {
        this.data.schedule = this.data.schedule.filter(s => s.id !== id);
        this.saveData();
    },

    
    renderAll() {
        this.renderDashboard();
        this.renderSubjects();
        this.renderTasks();
        this.renderSchedule();
        this.renderAnalytics();
        this.populateSubjectSelect();
    },

    renderDashboard() {
        document.getElementById('stat-total-subjects').innerText = this.data.subjects.length;
        document.getElementById('stat-pending-tasks').innerText = this.data.tasks.filter(t => !t.completed).length;
        
        
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todaysSessions = this.data.schedule.filter(s => s.day === today).length;
        document.getElementById('stat-hours').innerText = todaysSessions + ' sessions';

        const list = document.getElementById('dashboard-deadlines');
        list.innerHTML = '';
        
        const upcoming = this.data.tasks
            .filter(t => !t.completed)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3);
            
        if (upcoming.length === 0) list.innerHTML = '<li style="color:var(--secondary)">No upcoming deadlines.</li>';

        upcoming.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${task.desc}</span> <span style="font-size:0.8rem; color:var(--danger)">${task.date}</span>`;
            list.appendChild(li);
        });
    },

    renderSubjects() {
        const container = document.getElementById('subjects-list');
        container.innerHTML = '';
        this.data.subjects.forEach(sub => {
            const div = document.createElement('div');
            div.className = 'card';
            div.innerHTML = `
                <h3>${sub.name}</h3>
                <p style="color:var(--secondary)">Priority: ${sub.credits}</p>
                <button onclick="app.deleteSubject(${sub.id})" class="btn-danger" style="margin-top:1rem; padding:0.5rem 1rem;">Delete</button>
            `;
            container.appendChild(div);
        });
    },

    renderTasks() {
        const list = document.getElementById('tasks-list');
        list.innerHTML = '';
        this.data.tasks.forEach(task => {
            const li = document.createElement('li');
            li.style.opacity = task.completed ? '0.5' : '1';
            li.innerHTML = `
                <div>
                    <strong>${task.desc}</strong>
                    <div style="font-size:0.8rem; color:var(--secondary)">Due: ${task.date}</div>
                </div>
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="app.toggleTask(${task.id})">
            `;
            list.appendChild(li);
        });
    },

    renderSchedule() {
        const container = document.getElementById('schedule-list');
        container.innerHTML = '';
        
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        let hasData = false;

        days.forEach(day => {
            const dayItems = this.data.schedule.filter(s => s.day === day);
            if (dayItems.length > 0) {
                hasData = true;
                const dayCard = document.createElement('div');
                dayCard.className = 'card';

                dayCard.innerHTML = `<h3 style="color:var(--primary); border-bottom:1px solid #eee; margin-bottom:10px; padding-bottom:5px;">${day}</h3>`;
                
                dayItems.forEach(item => {
                    const row = document.createElement('div');
                    row.style.cssText = "display:flex; justify-content:space-between; margin-bottom:8px; border-bottom:1px dashed #eee; padding-bottom:4px;";
                    row.innerHTML = `
                        <span><strong>${item.start} - ${item.end}</strong>: ${item.activity}</span>
                        <button onclick="app.deleteSchedule(${item.id})" style="color:red; background:none; border:none; cursor:pointer; font-weight:bold;">&times;</button>
                    `;
                    dayCard.appendChild(row);
                });
                container.appendChild(dayCard);
            }
        });

        if (!hasData) {
            container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:var(--secondary);">No schedule added yet. Click "+ Add Session".</p>`;
        }
    },

    renderAnalytics() {
        const total = this.data.tasks.length;
        const completed = this.data.tasks.filter(t => t.completed).length;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        
        document.getElementById('analytics-progress').style.width = `${percentage}%`;
        document.getElementById('analytics-text').innerText = `${percentage}% Tasks Completed`;
    },

    populateSubjectSelect() {
        const select = document.getElementById('task-subject-select');
        if(!select) return;
        select.innerHTML = '<option value="">Select Subject</option>';
        this.data.subjects.forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub.id;
            opt.innerText = sub.name;
            select.appendChild(opt);
        });
    },

    updateDate() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('date-display').innerText = new Date().toLocaleDateString('en-US', options);
    }
};


function openModal(id) { 
    const modal = document.getElementById(id);
    if(modal) modal.classList.remove('hidden');
}

function closeModal(id) { 
    const modal = document.getElementById(id);
    if(modal) modal.classList.add('hidden');
}


document.addEventListener('DOMContentLoaded', () => {
    app.init();
});