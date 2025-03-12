import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { auth, isUserAdmin } from "../services/firebase";

const PrivateRoute = ({ children }) => {
	const [isAdmin, setIsAdmin] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkAdminStatus = async () => {
			const user = auth.currentUser;
			if (user) {
				const adminStatus = await isUserAdmin(user);
				setIsAdmin(adminStatus);
			}
			setIsLoading(false);
		};

		checkAdminStatus();
	}, []);

	// Show loading state if checking admin status
	if (isLoading) {
		return <div>Loading...</div>;
	}

	// Redirect to login if not an admin
	if (!isAdmin) {
		return <Navigate to="/admin/login" replace />;
	}

	return children;
};

export default PrivateRoute;
