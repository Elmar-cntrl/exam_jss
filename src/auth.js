import { Helpers } from './utils/helpers.js';

export const Auth = {
    register: (username, password) => {
        const users = Helpers.loadFromStorage('pm_users') || [];

        if (users.some(u => u.username === username)) {
            return { ok: false, message: "User already exists" };
        }

        const newUser = {
            id: 'USR-' + Date.now(),
            username,
            password
        };

        users.push(newUser);
        Helpers.saveToStorage('pm_users', users);
        Helpers.saveToStorage('pm_currentUser', newUser);

        return { ok: true, user: newUser };
    },

    login: (username, password) => {
        const users = Helpers.loadFromStorage('pm_users') || [];
        const user = users.find(u => u.username === username && u.password === password);

        if (!user) {
            return { ok: false, message: "Invalid username or password" };
        }

        Helpers.saveToStorage('pm_currentUser', user);
        return { ok: true, user };
    },

    logout: () => {
        localStorage.removeItem('pm_currentUser');
    },

    getCurrentUser: () => {
        return Helpers.loadFromStorage('pm_currentUser');
    }
};
