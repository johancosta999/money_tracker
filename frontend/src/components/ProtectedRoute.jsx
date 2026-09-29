import { Navigate } from "react-router-dom";
import useAuth from "../context/useAuth";

function ProtectedRoute({ children }) {
	const { token, isLoading } = useAuth();

	if (!token) {
		return <Navigate to="/login" replace />;
	}

	// Only shown when there's a token but no cached user yet
	if (isLoading) {
		return <div >Checking authentication...</div>;
	}

	return children;
}

export default ProtectedRoute;
