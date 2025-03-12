import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import AdminRegistration from "./components/AdminRegistration";
import PrivateRoute from "./components/PrivateRoute";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/admin/login" element={<AdminLogin />} />
				<Route path="/admin/register" element={<AdminRegistration />} />
				<Route
					path="/admin/dashboard"
					element={
						<PrivateRoute>
							<AdminDashboard />
						</PrivateRoute>
					}
				/>
				<Route path="*" element={<Navigate to="/admin/login" />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
