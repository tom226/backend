// Shared auth bootstrap: captures token/user from URL, stores in localStorage, and exposes authSession
(() => {
    const BACKEND_URL = 'https://backend-production-f128.up.railway.app';

    function persistTokenFromUrl() {
        const url = new URL(window.location.href);
        const params = url.searchParams;
        const token = params.get('token');
        const user = params.get('user');

        if (token) {
            try { localStorage.setItem('authToken', token); } catch (e) { console.warn('Cannot persist token', e); }
        }
        if (user) {
            try { localStorage.setItem('userData', user); } catch (e) { console.warn('Cannot persist user', e); }
        }
        if (token || user) {
            params.delete('token');
            params.delete('user');
            const clean = url.pathname + (params.toString() ? '?' + params.toString() : '') + url.hash;
            window.history.replaceState({}, document.title, clean);
        }
    }

    async function fetchProfile(token) {
        if (!token) return null;
        try {
            const res = await fetch(`${BACKEND_URL}/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('profile fetch failed');
            const data = await res.json();
            return data.user || null;
        } catch (err) {
            console.warn('Profile fetch failed', err);
            return null;
        }
    }

    persistTokenFromUrl();

    window.authSession = {
        getToken: () => {
            try { return localStorage.getItem('authToken'); } catch { return null; }
        },
        getUser: () => {
            try {
                const raw = localStorage.getItem('userData');
                return raw ? JSON.parse(raw) : null;
            } catch {
                return null;
            }
        },
        saveUser: (userObj) => {
            try { localStorage.setItem('userData', JSON.stringify(userObj)); } catch (e) { console.warn('Cannot save user', e); }
        },
        fetchProfile
    };

    function currentDisplayName() {
        const u = window.authSession.getUser();
        if (u && (u.firstName || u.email)) return u.firstName || u.email;
        return 'Signed in';
    }

    function renderAuthBadge() {
        if (!document.body) return;
        const existing = document.getElementById('authBadge');
        if (existing) existing.remove();

        const style = document.createElement('style');
        style.textContent = `
        #authBadge { position: fixed; bottom: 16px; right: 16px; z-index: 1200; font-family: 'Manrope', sans-serif; }
        #authBadge .badge-shell { display:flex; align-items:center; gap:10px; background:#ffffff; border:1px solid #dfe5d9; box-shadow:0 10px 30px rgba(12,53,36,0.12); border-radius:14px; padding:10px 12px; }
        #authBadge .avatar { width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg,#1c6b44,#2dc653); color:#fff; font-weight:800; display:flex; align-items:center; justify-content:center; }
        #authBadge .info { display:flex; flex-direction:column; line-height:1.2; }
        #authBadge .info .name { font-weight:700; color:#1f2b2a; font-size:0.92rem; }
        #authBadge .info .hint { color:#5c6f68; font-size:0.82rem; }
        #authBadge .actions { display:flex; gap:6px; }
        #authBadge button, #authBadge a { border:none; background:#f0f7ed; color:#1c6b44; font-weight:700; padding:7px 10px; border-radius:10px; cursor:pointer; text-decoration:none; font-size:0.85rem; }
        #authBadge button:hover, #authBadge a:hover { background:#e1f0e6; }
        `;

        const wrapper = document.createElement('div');
        wrapper.id = 'authBadge';
        const shell = document.createElement('div');
        shell.className = 'badge-shell';

        const token = window.authSession.getToken();
        if (token) {
            const name = currentDisplayName();
            const avatar = document.createElement('div');
            avatar.className = 'avatar';
            avatar.textContent = (name || 'NG').slice(0,2).toUpperCase();

            const info = document.createElement('div');
            info.className = 'info';
            const n = document.createElement('div'); n.className = 'name'; n.textContent = name;
            const h = document.createElement('div'); h.className = 'hint'; h.textContent = 'Signed in';
            info.appendChild(n); info.appendChild(h);

            const actions = document.createElement('div');
            actions.className = 'actions';
            const logoutBtn = document.createElement('button');
            logoutBtn.textContent = 'Logout';
            logoutBtn.onclick = () => {
                try {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userData');
                } catch {}
                renderAuthBadge();
            };
            actions.appendChild(logoutBtn);

            shell.appendChild(avatar);
            shell.appendChild(info);
            shell.appendChild(actions);
        } else {
            const info = document.createElement('div');
            info.className = 'info';
            const n = document.createElement('div'); n.className = 'name'; n.textContent = 'Guest';
            const h = document.createElement('div'); h.className = 'hint'; h.textContent = 'Sign in to unlock features';
            info.appendChild(n); info.appendChild(h);

            const actions = document.createElement('div');
            actions.className = 'actions';
            const loginLink = document.createElement('a');
            loginLink.href = 'login.html';
            loginLink.textContent = 'Sign in';
            actions.appendChild(loginLink);

            shell.appendChild(info);
            shell.appendChild(actions);
        }

        wrapper.appendChild(style);
        wrapper.appendChild(shell);
        document.body.appendChild(wrapper);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderAuthBadge);
    } else {
        renderAuthBadge();
    }

    document.addEventListener('authReady', renderAuthBadge);
    document.dispatchEvent(new Event('authReady'));
})();
