

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

        console.log("App Initialized");
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

            } catch {

                console.error("Storage Load Failed");

            }

        }
    },

    saveData() {

        localStorage.setItem(
            'studyPlannerData',
            JSON.stringify(this.data)
        );

        this.renderAll();
    },

    resetData() {

        if (confirm('This will delete all data. Continue?')) {

            localStorage.removeItem('studyPlannerData');

            this.data = {
                subjects: [],
                tasks: [],
                schedule: []
            };

            location.reload();
        }
    },

  

    switchView(viewName) {

        this.views.forEach(view => {

            view.classList.add('hidden');
            view.classList.remove('active');

        });

        const activeView =
            document.getElementById(`${viewName}-view`);

        if (activeView) {

            activeView.classList.remove('hidden');
            activeView.classList.add('active');

            this.pageTitle.innerText =
                viewName.charAt(0).toUpperCase() +
                viewName.slice(1);

        }
    },

  

    saveSubject() {

        const name =
            document.getElementById('subject-name').value;

        const credits =
            document.getElementById('subject-credits').value;

        if (!name) {
            alert('Subject name required');
            return;
        }

        this.data.subjects.push({

            id: Date.now(),
            name,
            credits

        });

        this.saveData();

        closeModal('subject-modal');

        document.getElementById('subject-name').value = '';
        document.getElementById('subject-credits').value = '';
    },

    deleteSubject(id) {

        if (!confirm('Delete subject?')) return;

        this.data.subjects =
            this.data.subjects.filter(s => s.id !== id);

        this.saveData();
    },


    saveTask() {

        const desc =
            document.getElementById('task-desc').value;

        const date =
            document.getElementById('task-date').value;

        const subjectId =
            document.getElementById('task-subject-select').value;

        if (!desc || !date) {

            alert('Fill all fields');
            return;

        }

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
    },

    toggleTask(id) {

        const task =
            this.data.tasks.find(t => t.id === id);

        if (!task) return;

        task.completed = !task.completed;

        this.saveData();
    },

  

    saveSchedule() {

        const day =
            document.getElementById('schedule-day').value;

        const start =
            document.getElementById('schedule-start').value;

        const end =
            document.getElementById('schedule-end').value;

        const activity =
            document.getElementById('schedule-activity').value;

        if (!day || !start || !end || !activity) {

            alert('Fill all fields');
            return;

        }

        this.data.schedule.push({

            id: Date.now(),
            day,
            start,
            end,
            activity

        });

        this.data.schedule.sort(
            (a, b) => a.start.localeCompare(b.start)
        );

        this.saveData();

        closeModal('schedule-modal');

        document.getElementById('schedule-start').value = '';
        document.getElementById('schedule-end').value = '';
        document.getElementById('schedule-activity').value = '';
    },

    deleteSchedule(id) {

        this.data.schedule =
            this.data.schedule.filter(s => s.id !== id);

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

        document.getElementById('stat-total-subjects').innerText =
            this.data.subjects.length;

        document.getElementById('stat-pending-tasks').innerText =
            this.data.tasks.filter(t => !t.completed).length;

        const today =
            new Date().toLocaleDateString(
                'en-US',
                { weekday: 'long' }
            );

        const sessions =
            this.data.schedule.filter(s => s.day === today).length;

        document.getElementById('stat-hours').innerText =
            sessions + ' sessions';

        const list =
            document.getElementById('dashboard-deadlines');

        list.innerHTML = '';

        const upcoming =
            this.data.tasks
                .filter(t => !t.completed)
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 3);

        if (upcoming.length === 0) {

            list.innerHTML =
                '<li style="color:var(--secondary)">No deadlines</li>';

            return;
        }

        upcoming.forEach(task => {

            const li = document.createElement('li');

            li.innerHTML = `
                <span>${task.desc}</span>
                <span style="color:var(--danger);font-size:0.8rem">
                    ${task.date}
                </span>
            `;

            list.appendChild(li);

        });
    },

    renderSubjects() {

        const container =
            document.getElementById('subjects-list');

        container.innerHTML = '';

        this.data.subjects.forEach(sub => {

            const div = document.createElement('div');

            div.className = 'card';

            div.innerHTML = `
                <h3>${sub.name}</h3>
                <p style="color:var(--secondary)">
                    Priority: ${sub.credits}
                </p>
                <button
                    class="btn-danger"
                    onclick="app.deleteSubject(${sub.id})">
                    Delete
                </button>
            `;

            container.appendChild(div);

        });
    },

    renderTasks() {

        const list =
            document.getElementById('tasks-list');

        list.innerHTML = '';

        this.data.tasks.forEach(task => {

            const li = document.createElement('li');

            li.style.opacity = task.completed ? '0.5' : '1';

            li.innerHTML = `
                <div>
                    <strong>${task.desc}</strong>
                    <div style="font-size:0.8rem;color:var(--secondary)">
                        Due: ${task.date}
                    </div>
                </div>

                <input type="checkbox"
                    ${task.completed ? 'checked' : ''}
                    onchange="app.toggleTask(${task.id})">
            `;

            list.appendChild(li);

        });
    },

    renderSchedule() {

        const container =
            document.getElementById('schedule-list');

        container.innerHTML = '';

        const days = [
            'Monday','Tuesday','Wednesday',
            'Thursday','Friday','Saturday','Sunday'
        ];

        let hasData = false;

        days.forEach(day => {

            const items =
                this.data.schedule.filter(s => s.day === day);

            if (!items.length) return;

            hasData = true;

            const card = document.createElement('div');

            card.className = 'card';

            card.innerHTML =
                `<h3 style="color:var(--primary)">${day}</h3>`;

            items.forEach(item => {

                const row = document.createElement('div');

                row.style.cssText =
                    'display:flex;justify-content:space-between;margin-bottom:6px';

                row.innerHTML = `
                    <span>
                        <strong>${item.start}-${item.end}</strong>
                        : ${item.activity}
                    </span>

                    <button
                        onclick="app.deleteSchedule(${item.id})"
                        style="background:none;border:none;color:red">
                        ×
                    </button>
                `;

                card.appendChild(row);

            });

            container.appendChild(card);

        });

        if (!hasData) {

            container.innerHTML =
                '<p style="text-align:center;color:var(--secondary)">No schedule</p>';

        }
    },

    renderAnalytics() {

        const total = this.data.tasks.length;

        const completed =
            this.data.tasks.filter(t => t.completed).length;

        const percent =
            total ? Math.round((completed / total) * 100) : 0;

        document.getElementById('analytics-progress').style.width =
            percent + '%';

        document.getElementById('analytics-text').innerText =
            percent + '% Tasks Completed';
    },

    populateSubjectSelect() {

        const select =
            document.getElementById('task-subject-select');

        if (!select) return;

        select.innerHTML =
            '<option value="">Select Subject</option>';

        this.data.subjects.forEach(sub => {

            const opt = document.createElement('option');

            opt.value = sub.id;
            opt.innerText = sub.name;

            select.appendChild(opt);

        });
    },

    updateDate() {

    const updateClock = () => {

        const now = new Date();

        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        const date =
            now.toLocaleDateString('en-US', options);

        const time =
            now.toLocaleTimeString('en-US');

        document.getElementById('date-display').innerText =
            `${date} | ${time}`;
    };

    
    updateClock();

    
    setInterval(updateClock, 1000);
}

};



function openModal(id) {

    const modal = document.getElementById(id);

    if (modal) modal.classList.remove('hidden');
}

function closeModal(id) {

    const modal = document.getElementById(id);

    if (modal) modal.classList.add('hidden');
}



function initTheme() {

    const btn = document.getElementById('theme-toggle');

    if (!btn) return;

    const saved = localStorage.getItem('theme');

    if (saved === 'dark') {

        document.body.classList.add('dark');
        btn.innerText = '☀️ Light';

    }

    btn.addEventListener('click', () => {

        document.body.classList.toggle('dark');

        if (document.body.classList.contains('dark')) {

            localStorage.setItem('theme', 'dark');
            btn.innerText = '☀️ Light';

        } else {

            localStorage.setItem('theme', 'light');
            btn.innerText = '🌙 Dark';

        }
    });
}




document.addEventListener('DOMContentLoaded', () => {

    app.init();
    initTheme();

});
