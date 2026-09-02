import { Navigate } from "react-router-dom";
import useAuth from "../context/useAuth";

function ProtectedRoute({ children }) {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return <div>Checking authentication...</div>;
	}

	return user ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
