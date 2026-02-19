import {
    isAuthenticated,
    startSessionExpiryWatcher,
    logout
} from "../core/auth.js";

export function protectPage() {
    const enforceAuth = () => {
        if (!isAuthenticated()) {
            logout();
            return;
        }

        startSessionExpiryWatcher();
    };

    enforceAuth();
    window.addEventListener("pageshow", enforceAuth);
}
