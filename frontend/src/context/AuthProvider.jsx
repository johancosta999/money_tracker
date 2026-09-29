import { useCallback, useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import api, { AUTH_LOGOUT_EVENT } from "../services/api";

// Reads the JWT payload locally so we can skip the network when it's already expired
function isTokenValid(token) {
    if (!token) {
        return false;
    }

    try {
        const payload = JSON.parse(
            atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        );
        return !payload.exp || payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

function readCachedUser() {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch {
        return null;
    }
}

function clearStorage() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

function AuthProvider({ children }) {

    const [token, setToken] = useState(() => {
        const storedToken = localStorage.getItem("token");

        if (!isTokenValid(storedToken)) {
            clearStorage();
            return null;
        }

        return storedToken;
    });

    const [user, setUser] = useState(() => (token ? readCachedUser() : null));

    // Only block rendering when we have a valid token but no cached user to show
    const [isLoading, setIsLoading] = useState(() => Boolean(token) && !user);


    const logout = useCallback(() => {
        clearStorage();
        setUser(null);
        setToken(null);
    }, []);


    // Revalidate the session in the background
    useEffect(() => {
        if (!token) {
            return;
        }

        api.get("/auth/me")
            .then(({ data }) => {
                setUser(data.user);
                localStorage.setItem("user", JSON.stringify(data.user));
            })
            .catch(() => {
                // 401s are handled by the api interceptor; network errors keep the cached session
            })
            .finally(() => setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // The api interceptor fires this when any request returns 401
    useEffect(() => {
        window.addEventListener(AUTH_LOGOUT_EVENT, logout);
        return () => window.removeEventListener(AUTH_LOGOUT_EVENT, logout);
    }, [logout]);


    const login = (userData, jwtToken) => {

        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        localStorage.setItem(
            "token",
            jwtToken
        );

        setUser(userData);
        setToken(jwtToken);
        setIsLoading(false);
    };


    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
