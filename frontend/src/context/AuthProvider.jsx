import { useState } from "react";
import AuthContext from "./AuthContext";

const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => {

        const savedUser = localStorage.getItem("user");

        if (savedUser) {
            return JSON.parse(savedUser);
        }

        return null;
    });

    const [token, setToken] = useState(() => {

        const savedToken = localStorage.getItem("token");

        return savedToken;
    });

    const login = (userData, jwtToken) => {

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", jwtToken);

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
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;