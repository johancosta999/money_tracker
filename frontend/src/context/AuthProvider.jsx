import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import api from "../services/api";

function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem("token")));

    useEffect(() => {
        const storedToken = localStorage.getItem("token");

        if (!storedToken) {
            return;
        }

        api.get("/auth/me")
            .then(({ data }) => {
                setUser(data.user);
                setToken(storedToken);
                localStorage.setItem("user", JSON.stringify(data.user));
            })
            .catch((error) => {
                if (error.response?.status === 401 || error.response?.status === 403) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    setToken(null);
                    setUser(null);
                }
            })
            .finally(() => setIsLoading(false));
    }, []);


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
    };


    const logout = () => {

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        setUser(null);
        setToken(null);
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