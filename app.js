// Функція копіювання IP
window.copyIP = function() {
    const ip = "goureeror.aternos.me";
    if (navigator.clipboard) {
        navigator.clipboard.writeText(ip).then(() => {
            alert("IP скопійовано!");
        }).catch(() => {
            prompt("Скопіюйте IP вручну:", ip);
        });
    } else {
        prompt("Скопіюйте IP вручну:", ip);
    }
};

(function() {
    // ========== Керування авторизацією ==========
    const authScreen = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');
    const lamp = document.getElementById('lamp');
    const switchEl = document.getElementById('switch');
    const toggle = document.getElementById('toggle');
    const hint = document.getElementById('hint');
    const authButtons = document.getElementById('authButtons');
    const registerFormContainer = document.getElementById('registerFormContainer');
    const loginFormContainer = document.getElementById('loginFormContainer');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const backFromRegister = document.getElementById('backFromRegister');
    const backFromLogin = document.getElementById('backFromLogin');
    const registerError = document.getElementById('registerError');
    const loginError = document.getElementById('loginError');

    let lightOn = false;

    // Функції для роботи з користувачами
    function loadUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    function saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    function getCurrentUser() {
        const session = localStorage.getItem('currentUser');
        if (!session) return null;
        const { nick } = JSON.parse(session);
        const users = loadUsers();
        return users.find(u => u.nick === nick) || null;
    }

    function updateCurrentUser(updatedUser) {
        const users = loadUsers();
        const index = users.findIndex(u => u.nick === updatedUser.nick);
        if (index !== -1) {
            users[index] = updatedUser;
            saveUsers(users);
            localStorage.setItem('currentUser', JSON.stringify({ nick: updatedUser.nick }));
        }
    }

    function checkSession() {
        const session = localStorage.getItem('currentUser');
        if (session) {
            authScreen.style.display = 'none';
            mainApp.style.display = 'block';
            renderAdminList();
            renderServers();
            if (!document.getElementById('profile-page').classList.contains('hidden')) {
                renderProfile();
            }
            
            // Додаємо користувача до списку онлайн при завантаженні
            const { nick } = JSON.parse(session);
            let onlineUsers = JSON.parse(localStorage.getItem('onlineUsers') || '[]');
            if (!onlineUsers.includes(nick)) {
                onlineUsers.push(nick);
                localStorage.setItem('onlineUsers', JSON.stringify(onlineUsers));
            }
        } else {
            authScreen.style.display = 'flex';
            mainApp.style.display = 'none';
        }
    }

    switchEl.addEventListener('click', function() {
        lightOn = !lightOn;
        if (lightOn) {
            authScreen.classList.add('light');
            lamp.classList.add('lit');
            toggle.classList.add('on');
            hint.innerText = '✨ Світло увімкнено! Оберіть дію';
            authButtons.classList.add('visible');
        } else {
            authScreen.classList.remove('light');
            lamp.classList.remove('lit');
            toggle.classList.remove('on');
            hint.innerText = '⬇️ Натисни на вимикач, щоб увімкнути світло';
            authButtons.classList.remove('visible');
            registerFormContainer.classList.remove('visible');
            loginFormContainer.classList.remove('visible');
        }
    });

    showRegisterBtn.addEventListener('click', function() {
        authButtons.classList.remove('visible');
        registerFormContainer.classList.add('visible');
    });

    showLoginBtn.addEventListener('click', function() {
        authButtons.classList.remove('visible');
        loginFormContainer.classList.add('visible');
    });

    backFromRegister.addEventListener('click', function() {
        registerFormContainer.classList.remove('visible');
        authButtons.classList.add('visible');
        registerError.innerText = '';
    });

    backFromLogin.addEventListener('click', function() {
        loginFormContainer.classList.remove('visible');
        authButtons.classList.add('visible');
        loginError.innerText = '';
    });

    document.getElementById('registerBtn').addEventListener('click', function() {
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value.trim();
        const nick = document.getElementById('regNick').value.trim();
        const age = document.getElementById('regAge').value.trim();

        if (!email || !password || !nick || !age) {
            registerError.innerText = 'Заповніть всі поля!';
            return;
        }
        if (age < 12) {
            registerError.innerText = 'Вам має бути 12+';
            return;
        }

        const users = loadUsers();
        if (users.find(u => u.nick === nick)) {
            registerError.innerText = 'Користувач з таким ніком вже існує!';
            return;
        }

        // Додаємо дату реєстрації та баланс
        const newUser = {
            email,
            password,
            nick,
            age: parseInt(age),
            balance: 0,
            registeredAt: new Date().toLocaleDateString('uk-UA')
        };
        users.push(newUser);
        saveUsers(users);
        localStorage.setItem('currentUser', JSON.stringify({ nick }));
        
        // Додаємо нового користувача до списку онлайн
        let onlineUsers = JSON.parse(localStorage.getItem('onlineUsers') || '[]');
        if (!onlineUsers.includes(nick)) {
            onlineUsers.push(nick);
            localStorage.setItem('onlineUsers', JSON.stringify(onlineUsers));
        }
        
        checkSession();
    });

    // Ініціалізація адмін-акаунтів (нік: 123/1234, пароль: 123/1234)
    function initAdminAccount() {
        const users = loadUsers();
        const admin1Exists = users.find(u => u.nick === '123');
        if (!admin1Exists) {
            users.push({
                email: 'admin@funworld.ua',
                password: '123',
                nick: '123',
                age: 18,
                balance: 1000000000,
                isAdmin: true,
                registeredAt: new Date().toLocaleDateString('uk-UA')
            });
            saveUsers(users);
        }
        const admin2Exists = users.find(u => u.nick === '1234');
        if (!admin2Exists) {
            users.push({
                email: 'admin2@funworld.ua',
                password: '1234',
                nick: '1234',
                age: 18,
                balance: 1000000000,
                isAdmin: true,
                registeredAt: new Date().toLocaleDateString('uk-UA')
            });
            saveUsers(users);
        }
    }
    initAdminAccount();

    document.getElementById('loginBtn').addEventListener('click', function() {
        const nick = document.getElementById('loginNick').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        if (!nick || !password) {
            loginError.innerText = 'Заповніть всі поля!';
            return;
        }

        const users = loadUsers();
        const user = users.find(u => u.nick === nick && u.password === password);
        if (!user) {
            loginError.innerText = 'Невірний нік або пароль!';
            return;
        }

        localStorage.setItem('currentUser', JSON.stringify({ nick }));
        
        // Додаємо користувача до списку онлайн
        let onlineUsers = JSON.parse(localStorage.getItem('onlineUsers') || '[]');
        if (!onlineUsers.includes(nick)) {
            onlineUsers.push(nick);
            localStorage.setItem('onlineUsers', JSON.stringify(onlineUsers));
        }
        
        checkSession();
    });

    document.getElementById('logoutBtn').addEventListener('click', function() {
        // Видаляємо користувача зі списку онлайн
        const session = localStorage.getItem('currentUser');
        if (session) {
            const { nick } = JSON.parse(session);
            let onlineUsers = JSON.parse(localStorage.getItem('onlineUsers') || '[]');
            onlineUsers = onlineUsers.filter(u => u !== nick);
            localStorage.setItem('onlineUsers', JSON.stringify(onlineUsers));
        }
        
        localStorage.removeItem('currentUser');
        checkSession();
        lightOn = false;
        authScreen.classList.remove('light');
        lamp.classList.remove('lit');
        toggle.classList.remove('on');
        hint.innerText = '⬇️ Натисни на вимикач, щоб увімкнути світло';
        authButtons.classList.remove('visible');
        registerFormContainer.classList.remove('visible');
        loginFormContainer.classList.remove('visible');
    });

    // ========== Інші функції ==========
    const adminData = {
        "Owner": "1/1",
        "Правая рука создателя сервера": "0/1",
        "Зам.создателя сервера": "0/1",
        "Адміністратори": "6/6",
        "Helper": "0/4",
        "Модератори": "0/6"
    };

    function loadApplications() {
        const stored = localStorage.getItem('applications');
        return stored ? JSON.parse(stored) : [];
    }

    function saveApplications(apps) {
        localStorage.setItem('applications', JSON.stringify(apps, null, 2));
    }

    function renderAdminList() {
        const container = document.getElementById('admin-list');
        if (!container) return;
        container.innerHTML = '';
        for (const [role, count] of Object.entries(adminData)) {
            const div = document.createElement('div');
            div.className = 'admin-item';
            div.innerHTML = `<span class="admin-role">${role}</span><span class="admin-count">${count}</span>`;
            container.appendChild(div);
        }
    }

    // Завантаження та відображення серверів
    async function renderServers() {
        const container = document.getElementById('servers-list');
        if (!container) return;
        
        try {
            const response = await fetch('/api/servers');
            const servers = await response.json();
            
            if (servers.length === 0) {
                container.innerHTML = '<div style="color: #6f7c9f; text-align: center; padding: 10px;">Немає зареєстрованих серверів</div>';
                return;
            }
            
            container.innerHTML = servers.map(server => {
                const statusColor = server.status === 'online' ? '#66ff99' : 
                                   server.status === 'offline' ? '#ff6666' : '#ffaa66';
                const statusText = server.status === 'online' ? '🟢 Онлайн' : 
                                  server.status === 'offline' ? '🔴 Офлайн' : '🟡 Техроботи';
                return `
                    <div class="admin-item" style="flex-direction: column; align-items: flex-start; gap: 4px;">
                        <div style="display: flex; justify-content: space-between; width: 100%;">
                            <span class="admin-role" style="font-weight: 600;">${server.name}</span>
                            <span style="color: ${statusColor}; font-size: 12px;">${statusText}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                            <code style="background: #272f41; padding: 4px 8px; border-radius: 8px; font-size: 12px; color: #b3c7ff;">${server.ip}</code>
                            <button onclick="copyServerIP('${server.ip}')" style="background: #3a455b; border: none; color: #fff; padding: 4px 10px; border-radius: 12px; cursor: pointer; font-size: 12px;">📋 Копіювати</button>
                        </div>
                        ${server.description ? `<div style="color: #9aa5c9; font-size: 12px; margin-top: 4px;">${server.description}</div>` : ''}
                    </div>
                `;
            }).join('');
        } catch (error) {
            container.innerHTML = '<div style="color: #ff6666; text-align: center; padding: 10px;">Помилка завантаження серверів</div>';
        }
    }

    window.copyServerIP = function(ip) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(ip).then(() => {
                alert('IP скопійовано: ' + ip);
            }).catch(() => {
                prompt('Скопіюйте IP вручну:', ip);
            });
        } else {
            prompt('Скопіюйте IP вручну:', ip);
        }
    };

    function showFlash(message, category, containerId = 'apply-flash') {
        const flash = document.getElementById(containerId);
        if (!flash) return;
        flash.innerHTML = `<div class="flash-message flash-${category}">${message}</div>`;
        setTimeout(() => flash.innerHTML = '', 4000);
    }

    const appForm = document.getElementById('application-form');
    if (appForm) {
        appForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const newApp = {
                id: Date.now(),
                minecraft_nick: document.getElementById('minecraft_nick').value,
                real_name: document.getElementById('real_name').value,
                age: document.getElementById('age').value,
                discord: document.getElementById('discord').value,
                minecraft_exp: document.getElementById('minecraft_exp').value,
                server_exp: document.getElementById('server_exp').value,
                reason: document.getElementById('reason').value,
                experience: document.getElementById('experience').value,
                hours_per_day: document.getElementById('hours_per_day').value,
                action_on_violation: document.getElementById('action_on_violation').value,
                rules_knowledge: document.getElementById('rules_knowledge').value,
                ready_to_help: document.getElementById('ready_to_help').value,
                status: 'pending',
                created_at: new Date().toISOString().slice(0,10)
            };

            const apps = loadApplications();
            apps.push(newApp);
            saveApplications(apps);

            showFlash('Заявку успішно подано!', 'success');
            appForm.reset();

            document.getElementById('apply-form-section').classList.add('hidden');
            document.querySelector('.apply-button').style.display = 'block';
        });
    }

    // Навігація
    const mainPage = document.getElementById('main-app');
    const rulesPage = document.getElementById('rules-page');
    const adminPanel = document.getElementById('admin-panel');
    const detailPage = document.getElementById('application-detail');
    const profilePage = document.getElementById('profile-page');
    const shopPage = document.getElementById('shop-page');
    const panelPage = document.getElementById('panel-page');
    const applySection = document.getElementById('apply-form-section');
    const applyButton = document.querySelector('.apply-button');

    function hideAllPages() {
        mainPage.style.display = 'none';
        rulesPage.classList.add('hidden');
        adminPanel.classList.add('hidden');
        detailPage.classList.add('hidden');
        profilePage.classList.add('hidden');
        shopPage.classList.add('hidden');
        panelPage.classList.add('hidden');
    }

    function showMainPage() {
        hideAllPages();
        mainPage.style.display = 'block';
        applySection.classList.add('hidden');
        if (applyButton) applyButton.style.display = 'block';
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelector('[data-page="main"]').classList.add('active');
        renderServers();
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            if (page === 'main') {
                showMainPage();
            } else if (page === 'apply') {
                hideAllPages();
                mainPage.style.display = 'block';
                applySection.classList.remove('hidden');
                if (applyButton) applyButton.style.display = 'none';
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                this.classList.add('active');
            } else if (page === 'rules') {
                hideAllPages();
                mainPage.style.display = 'none';
                rulesPage.classList.remove('hidden');
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                this.classList.add('active');
            } else if (page === 'panel') {
                hideAllPages();
                mainPage.style.display = 'none';
                panelPage.classList.remove('hidden');
                renderPanelStats();
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                this.classList.add('active');
            } else if (page === 'profile') {
                hideAllPages();
                mainPage.style.display = 'none';
                profilePage.classList.remove('hidden');
                renderProfile();
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                this.classList.add('active');
            } else if (page === 'shop') {
                hideAllPages();
                mainPage.style.display = 'none';
                shopPage.classList.remove('hidden');
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    document.getElementById('show-apply-form')?.addEventListener('click', function() {
        hideAllPages();
        mainPage.style.display = 'block';
        applySection.classList.remove('hidden');
        this.style.display = 'none';
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelector('[data-page="apply"]').classList.add('active');
    });

    document.getElementById('back-from-rules')?.addEventListener('click', showMainPage);
    document.getElementById('back-from-profile')?.addEventListener('click', showMainPage);
    document.getElementById('back-from-shop')?.addEventListener('click', showMainPage);
    document.getElementById('back-from-panel')?.addEventListener('click', showMainPage);
    document.getElementById('shop-to-profile')?.addEventListener('click', function() {
        hideAllPages();
        shopPage.classList.add('hidden');
        profilePage.classList.remove('hidden');
        renderProfile();
    });

    // ========== Адмін-панель з табами (пароль 123) ==========
    const adminApplicationsList = document.getElementById('admin-applications-list');
    const adminUsersList = document.getElementById('admin-users-list');
    const tabApps = document.getElementById('tab-applications');
    const tabUsers = document.getElementById('tab-users');
    const refreshBtn = document.getElementById('refresh-admin');

    function renderAdminApplications() {
        const apps = loadApplications();
        if (apps.length === 0) {
            adminApplicationsList.innerHTML = '<p>Немає жодної заяви.</p>';
            return;
        }

        let html = '<table class="admin-table"><tr><th>ID</th><th>Нік</th><th>Ім'я</th><th>Статус</th><th>Дії</th></tr>';
        apps.sort((a,b) => b.id - a.id).forEach(app => {
            html += `<tr>
                <td>${app.id}</td>
                <td>${app.minecraft_nick}</td>
                <td>${app.real_name}</td>
                <td class="status-${app.status}">${app.status}</td>
                <td>
                    <button class="btn-small btn-view" onclick="viewApplication(${app.id})">Переглянути</button>
                    ${app.status === 'pending' ? 
                        `<button class="btn-small btn-approve" onclick="updateApplication(${app.id}, 'approve')">Схвалити</button>
                         <button class="btn-small btn-reject" onclick="updateApplication(${app.id}, 'reject')">Відхилити</button>` : ''}
                </td>
            </tr>`;
        });
        html += '</table>';
        adminApplicationsList.innerHTML = html;
    }

    function renderAdminUsers() {
        const users = loadUsers();
        if (users.length === 0) {
            adminUsersList.innerHTML = '<p>Немає зареєстрованих користувачів.</p>';
            return;
        }

        let html = '<table class="admin-table"><tr><th>Email</th><th>Нік</th><th>Вік</th><th>Дата реєстрації</th></tr>';
        users.sort((a,b) => (a.registeredAt || '').localeCompare(b.registeredAt || '')).forEach(user => {
            html += `<tr>
                <td>${user.email}</td>
                <td>${user.nick}</td>
                <td>${user.age}</td>
                <td>${user.registeredAt || 'Невідомо'}</td>
            </tr>`;
        });
        html += '</table>';
        adminUsersList.innerHTML = html;
    }

    function showTab(tab) {
        if (tab === 'applications') {
            tabApps.classList.add('active');
            tabUsers.classList.remove('active');
            adminApplicationsList.classList.remove('hidden');
            adminUsersList.classList.add('hidden');
            renderAdminApplications();
        } else {
            tabUsers.classList.add('active');
            tabApps.classList.remove('active');
            adminUsersList.classList.remove('hidden');
            adminApplicationsList.classList.add('hidden');
            renderAdminUsers();
        }
    }

    tabApps.addEventListener('click', () => showTab('applications'));
    tabUsers.addEventListener('click', () => showTab('users'));

    refreshBtn.addEventListener('click', () => {
        if (tabApps.classList.contains('active')) {
            renderAdminApplications();
        } else {
            renderAdminUsers();
        }
    });

    // Змінено пароль на 123
    document.getElementById('admin-link')?.addEventListener('click', function() {
        const pwd = prompt('Введіть пароль адміністратора:');
        if (pwd === '123') {
            hideAllPages();
            mainPage.style.display = 'none';
            adminPanel.classList.remove('hidden');
            showTab('applications');
        } else {
            alert('Невірний пароль');
        }
    });

    document.getElementById('back-to-main')?.addEventListener('click', showMainPage);

    // Функції для заяв (глобальні для кнопок)
    window.viewApplication = function(id) {
        const apps = loadApplications();
        const app = apps.find(a => a.id === id);
        if (!app) return;

        const detailHtml = `
            <div class="detail-card">
                <h3 style="color:#ffb347;">Заява #${app.id}</h3>
                <p><strong>Статус:</strong> <span class="status-${app.status}">${app.status}</span></p>
                ${Object.entries(app).filter(([k]) => !['id','status','created_at'].includes(k)).map(([key, val]) => `
                    <div class="detail-field">
                        <div class="detail-label">${key.replace(/_/g,' ')}:</div>
                        <div class="detail-value">${val}</div>
                    </div>
                `).join('')}
                ${app.status === 'pending' ? `
                    <div style="margin-top:20px;">
                        <button class="btn-small btn-approve" onclick="updateApplication(${app.id}, 'approve')">Схвалити</button>
                        <button class="btn-small btn-reject" onclick="updateApplication(${app.id}, 'reject')">Відхилити</button>
                    </div>
                ` : ''}
            </div>
        `;

        adminPanel.classList.add('hidden');
        detailPage.classList.remove('hidden');
        document.getElementById('detail-content').innerHTML = detailHtml;
    };

    window.updateApplication = function(id, action) {
        let apps = loadApplications();
        const index = apps.findIndex(a => a.id === id);
        if (index !== -1) {
            apps[index].status = action === 'approve' ? 'approved' : 'rejected';
            saveApplications(apps);
            if (!detailPage.classList.contains('hidden')) {
                detailPage.classList.add('hidden');
                adminPanel.classList.remove('hidden');
            }
            renderAdminApplications();
        }
    };

    window.backToAdmin = function() {
        detailPage.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        renderAdminApplications();
    };

    document.getElementById('back-to-admin')?.addEventListener('click', window.backToAdmin);

    // ========== Панель онлайну ==========
    function renderPanelStats() {
        const users = loadUsers();
        const currentUser = getCurrentUser();
        
        // Отримуємо список онлайн користувачів з localStorage
        const onlineUsers = JSON.parse(localStorage.getItem('onlineUsers') || '[]');
        
        // Фільтруємо адмінів та звичайних користувачів
        const onlineAdmins = onlineUsers.filter(nick => {
            const user = users.find(u => u.nick === nick);
            return user && (user.isAdmin || user.nick === '123' || user.nick === '1234');
        });
        
        const onlineRegularUsers = onlineUsers.filter(nick => {
            const user = users.find(u => u.nick === nick);
            return user && !user.isAdmin && user.nick !== '123' && user.nick !== '1234';
        });
        
        // Оновлюємо лічильники
        document.getElementById('online-admins').innerText = onlineAdmins.length;
        document.getElementById('online-users').innerText = onlineRegularUsers.length;
        document.getElementById('total-online').innerText = onlineUsers.length;
        
        // Відображаємо список адмінів онлайн
        const adminsListDiv = document.getElementById('online-admins-list');
        if (onlineAdmins.length === 0) {
            adminsListDiv.innerHTML = '<div style="color:#6f7c9f; text-align:center; padding:10px;">Немає адміністраторів онлайн</div>';
        } else {
            adminsListDiv.innerHTML = onlineAdmins.map(nick => {
                const user = users.find(u => u.nick === nick);
                return `
                    <div style="display:flex; align-items:center; gap:10px; background:#272f41; padding:10px; border-radius:12px;">
                        <span style="font-size:20px;">🔰</span>
                        <span style="color:#66ff99; font-weight:bold;">${nick}</span>
                        <span style="color:#9aa5c9; font-size:12px; margin-left:auto;">Адміністратор</span>
                    </div>
                `;
            }).join('');
        }
        
        // Відображаємо список гравців онлайн
        const usersListDiv = document.getElementById('online-users-list');
        if (onlineRegularUsers.length === 0) {
            usersListDiv.innerHTML = '<div style="color:#6f7c9f; text-align:center; padding:10px;">Немає гравців онлайн</div>';
        } else {
            usersListDiv.innerHTML = onlineRegularUsers.map(nick => {
                return `
                    <div style="display:flex; align-items:center; gap:10px; background:#272f41; padding:10px; border-radius:12px;">
                        <span style="font-size:20px;">🎮</span>
                        <span style="color:#66b3ff; font-weight:bold;">${nick}</span>
                        <span style="color:#9aa5c9; font-size:12px; margin-left:auto;">Гравець</span>
                    </div>
                `;
            }).join('');
        }
    }

    // Оновлення панелі при натисканні кнопки
    document.getElementById('refresh-panel')?.addEventListener('click', function() {
        renderPanelStats();
        alert('🔄 Статистику оновлено!');
    });

    // Профіль
    function renderProfile() {
        const user = getCurrentUser();
        if (!user) return;
        const infoDiv = document.getElementById('profile-info');
        infoDiv.innerHTML = `
            <div class="profile-field"><label>Email</label><div>${user.email}</div></div>
            <div class="profile-field"><label>Нікнейм</label><div>${user.nick}</div></div>
            <div class="profile-field"><label>Вік</label><div>${user.age}</div></div>
            <div class="profile-field"><label>Баланс</label><div style="color:#ffb347; font-weight:bold;">${user.balance || 0} грн</div></div>
        `;
    }

    document.getElementById('change-password-btn').addEventListener('click', function() {
        const user = getCurrentUser();
        if (!user) return;
        const oldPass = document.getElementById('old-password').value.trim();
        const newPass = document.getElementById('new-password').value.trim();
        const confirm = document.getElementById('confirm-password').value.trim();
        const errorDiv = document.getElementById('password-error');
        const messageDiv = document.getElementById('profile-message');

        if (!oldPass || !newPass || !confirm) {
            errorDiv.innerText = 'Заповніть всі поля!';
            return;
        }
        if (oldPass !== user.password) {
            errorDiv.innerText = 'Старий пароль невірний!';
            return;
        }
        if (newPass !== confirm) {
            errorDiv.innerText = 'Новий пароль не співпадає!';
            return;
        }
        if (newPass.length < 3) {
            errorDiv.innerText = 'Пароль надто короткий!';
            return;
        }

        user.password = newPass;
        updateCurrentUser(user);
        errorDiv.innerText = '';
        messageDiv.innerText = 'Пароль успішно змінено!';
        setTimeout(() => messageDiv.innerText = '', 3000);
        document.getElementById('old-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
    });

    document.getElementById('change-nick-btn').addEventListener('click', function() {
        const user = getCurrentUser();
        if (!user) return;
        const newNick = document.getElementById('new-nick').value.trim();
        const password = document.getElementById('nick-password').value.trim();
        const errorDiv = document.getElementById('nick-error');
        const messageDiv = document.getElementById('profile-message');

        if (!newNick || !password) {
            errorDiv.innerText = 'Заповніть всі поля!';
            return;
        }
        if (password !== user.password) {
            errorDiv.innerText = 'Невірний пароль!';
            return;
        }
        if (newNick === user.nick) {
            errorDiv.innerText = 'Це вже ваш нікнейм!';
            return;
        }

        const users = loadUsers();
        if (users.find(u => u.nick === newNick)) {
            errorDiv.innerText = 'Такий нікнейм вже зайнятий!';
            return;
        }

        const index = users.findIndex(u => u.nick === user.nick);
        if (index !== -1) {
            users.splice(index, 1);
        }
        user.nick = newNick;
        users.push(user);
        saveUsers(users);
        localStorage.setItem('currentUser', JSON.stringify({ nick: newNick }));

        errorDiv.innerText = '';
        messageDiv.innerText = 'Нікнейм успішно змінено!';
        setTimeout(() => messageDiv.innerText = '', 3000);
        document.getElementById('new-nick').value = '';
        document.getElementById('nick-password').value = '';
        renderProfile();
    });

    // ========== Функціонал магазину ==========
    const shopTabs = document.querySelectorAll('.shop-tab');
    const shopItems = document.querySelectorAll('.shop-item');
    let purchaseHistory = [];

    // Функція оновлення балансу в магазині
    function updateShopBalance() {
        const user = getCurrentUser();
        if (user) {
            document.getElementById('user-balance').innerText = (user.balance || 0).toLocaleString() + ' грн';
        }
    }

    // Оновлення балансу при відкритті магазину
    document.querySelector('[data-page="shop"]')?.addEventListener('click', function() {
        updateShopBalance();
    });

    // Фільтрація за категоріями
    shopTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Оновлення активної вкладки
            shopTabs.forEach(t => {
                t.classList.remove('active');
                t.style.background = '#2a3347';
                t.style.color = '#e0e4f0';
            });
            this.classList.add('active');
            this.style.background = '#ffb347';
            this.style.color = '#0b0e14';
            
            // Фільтрація товарів
            shopItems.forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Обробка купівлі
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const user = getCurrentUser();
            if (!user) {
                alert('❌ Увійдіть в акаунт!');
                return;
            }
            
            const item = this.closest('.shop-item');
            const name = item.querySelector('h3').innerText;
            const priceText = item.querySelector('[style*="color:#ffb347"]').innerText;
            const price = parseInt(priceText.replace(/[^0-9]/g, ''));
            
            const currentBalance = user.balance || 0;
            
            if (currentBalance >= price) {
                user.balance = currentBalance - price;
                updateCurrentUser(user);
                updateShopBalance();
                
                // Додати до історії
                const date = new Date().toLocaleDateString('uk-UA');
                purchaseHistory.unshift(`${date}: ${name} - ${priceText}`);
                updatePurchaseHistory();
                
                alert(`✅ Ви успішно придбали: ${name}`);
            } else {
                alert('❌ Недостатньо коштів!');
            }
        });
    });

    // Переказ коштів
    document.getElementById('transfer-btn')?.addEventListener('click', function() {
        const user = getCurrentUser();
        if (!user) return;

        const recipientNick = document.getElementById('transfer-nick').value.trim();
        const amount = parseInt(document.getElementById('transfer-amount').value);
        const password = document.getElementById('transfer-password').value.trim();
        const errorDiv = document.getElementById('transfer-error');
        const messageDiv = document.getElementById('profile-message');

        if (!recipientNick || !amount || !password) {
            errorDiv.innerText = 'Заповніть всі поля!';
            return;
        }

        if (password !== user.password) {
            errorDiv.innerText = 'Невірний пароль!';
            return;
        }

        if (recipientNick === user.nick) {
            errorDiv.innerText = 'Не можна переказати собі!';
            return;
        }

        if (amount < 1) {
            errorDiv.innerText = 'Сума має бути більше 0!';
            return;
        }

        const currentBalance = user.balance || 0;
        if (amount > currentBalance) {
            errorDiv.innerText = 'Недостатньо коштів!';
            return;
        }

        const users = loadUsers();
        const recipient = users.find(u => u.nick === recipientNick);

        if (!recipient) {
            errorDiv.innerText = 'Користувача не знайдено!';
            return;
        }

        // Знімаємо з відправника
        user.balance = currentBalance - amount;
        updateCurrentUser(user);

        // Додаємо отримувачу
        const recipientIndex = users.findIndex(u => u.nick === recipientNick);
        if (recipientIndex !== -1) {
            users[recipientIndex].balance = (users[recipientIndex].balance || 0) + amount;
            saveUsers(users);
        }

        errorDiv.innerText = '';
        messageDiv.innerText = `✅ Успішно переказано ${amount} грн користувачу ${recipientNick}!`;
        setTimeout(() => messageDiv.innerText = '', 3000);

        document.getElementById('transfer-nick').value = '';
        document.getElementById('transfer-amount').value = '';
        document.getElementById('transfer-password').value = '';
        renderProfile();
    });

    // Поповнення балансу (донат)
    document.getElementById('donate-btn')?.addEventListener('click', function() {
        const user = getCurrentUser();
        if (!user) return;

        const amount = parseInt(document.getElementById('donate-amount').value);
        const password = document.getElementById('donate-password').value.trim();
        const errorDiv = document.getElementById('donate-error');
        const messageDiv = document.getElementById('profile-message');

        if (!amount || !password) {
            errorDiv.innerText = 'Заповніть всі поля!';
            return;
        }

        if (password !== user.password) {
            errorDiv.innerText = 'Невірний пароль!';
            return;
        }

        if (amount < 1) {
            errorDiv.innerText = 'Сума має бути більше 0!';
            return;
        }

        // Додаємо баланс (тестовий режим)
        user.balance = (user.balance || 0) + amount;
        updateCurrentUser(user);

        errorDiv.innerText = '';
        messageDiv.innerText = `✅ Баланс поповнено на ${amount} грн!`;
        setTimeout(() => messageDiv.innerText = '', 3000);

        document.getElementById('donate-amount').value = '';
        document.getElementById('donate-password').value = '';
        renderProfile();
    });

    // Переказ коштів з магазину
    const shopTransferModal = document.getElementById('shop-transfer-modal');
    document.getElementById('shop-transfer-btn')?.addEventListener('click', function() {
        const user = getCurrentUser();
        if (!user) {
            alert('❌ Увійдіть в акаунт!');
            return;
        }
        shopTransferModal.style.display = 'flex';
    });
    document.getElementById('shop-transfer-cancel')?.addEventListener('click', function() {
        shopTransferModal.style.display = 'none';
        document.getElementById('shop-transfer-error').innerText = '';
        document.getElementById('shop-transfer-nick').value = '';
        document.getElementById('shop-transfer-amount').value = '';
        document.getElementById('shop-transfer-password').value = '';
    });
    document.getElementById('shop-transfer-confirm')?.addEventListener('click', function() {
        const user = getCurrentUser();
        if (!user) return;

        const recipientNick = document.getElementById('shop-transfer-nick').value.trim();
        const amount = parseInt(document.getElementById('shop-transfer-amount').value);
        const password = document.getElementById('shop-transfer-password').value.trim();
        const errorDiv = document.getElementById('shop-transfer-error');

        if (!recipientNick || !amount || !password) {
            errorDiv.innerText = 'Заповніть всі поля!';
            return;
        }
        if (password !== user.password) {
            errorDiv.innerText = 'Невірний пароль!';
            return;
        }
        if (recipientNick === user.nick) {
            errorDiv.innerText = 'Не можна переказати собі!';
            return;
        }
        if (amount < 1) {
            errorDiv.innerText = 'Сума має бути більше 0!';
            return;
        }
        const currentBalance = user.balance || 0;
        if (amount > currentBalance) {
            errorDiv.innerText = 'Недостатньо коштів!';
            return;
        }

        const users = loadUsers();
        const recipient = users.find(u => u.nick === recipientNick);
        if (!recipient) {
            errorDiv.innerText = 'Користувача не знайдено!';
            return;
        }

        user.balance = currentBalance - amount;
        updateCurrentUser(user);
        const recipientIndex = users.findIndex(u => u.nick === recipientNick);
        if (recipientIndex !== -1) {
            users[recipientIndex].balance = (users[recipientIndex].balance || 0) + amount;
            saveUsers(users);
        }

        errorDiv.innerText = '';
        alert(`✅ Успішно переказано ${amount} грн користувачу ${recipientNick}!`);
        shopTransferModal.style.display = 'none';
        document.getElementById('shop-transfer-nick').value = '';
        document.getElementById('shop-transfer-amount').value = '';
        document.getElementById('shop-transfer-password').value = '';
        updateShopBalance();
    });

    // Щоденний бонус (50 грн за вхід)
    function checkDailyBonus() {
        const user = getCurrentUser();
        if (!user) return;

        const today = new Date().toLocaleDateString('uk-UA');
        const lastLogin = localStorage.getItem('lastLoginDate_' + user.nick);

        if (lastLogin !== today) {
            user.balance = (user.balance || 0) + 50;
            updateCurrentUser(user);
            localStorage.setItem('lastLoginDate_' + user.nick, today);
            alert('🎉 Щоденний бонус! Ви отримали 50 грн за вхід в систему!');
        }
    }

    // Акаунт по IP (нік: 1)
    async function initIPAccount() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            const ip = data.ip;
            const ipKey = 'ipAccount_' + ip;

            if (!localStorage.getItem(ipKey)) {
                const users = loadUsers();
                const ipUserExists = users.find(u => u.nick === '1');
                if (!ipUserExists) {
                    users.push({
                        email: 'ip@funworld.ua',
                        password: '1',
                        nick: '1',
                        age: 18,
                        balance: 1000000000,
                        isAdmin: false,
                        isIPAccount: true,
                        registeredAt: new Date().toLocaleDateString('uk-UA')
                    });
                    saveUsers(users);
                }
                localStorage.setItem(ipKey, 'created');
            }
        } catch (e) {
            console.log('IP detection failed');
        }
    }

    // Закриття модального вікна при кліку поза ним
    shopTransferModal?.addEventListener('click', function(e) {
        if (e.target === shopTransferModal) {
            shopTransferModal.style.display = 'none';
        }
    });

    function updatePurchaseHistory() {
        const historyDiv = document.getElementById('purchase-history');
        if (purchaseHistory.length === 0) {
            historyDiv.innerHTML = '<div style="padding:10px 0; border-bottom:1px solid #2c3348;">Поки що немає покупок</div>';
        } else {
            historyDiv.innerHTML = purchaseHistory.map(p => 
                `<div style="padding:10px 0; border-bottom:1px solid #2c3348;">${p}</div>`
            ).join('');
        }
    }

    checkSession();
    renderAdminList();
    renderServers();
    
    // Ініціалізація додаткових функцій
    setTimeout(() => {
        checkDailyBonus();
        initIPAccount();
    }, 500);
})();
