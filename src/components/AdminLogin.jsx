import React, { useState } from "react";
import { adminLogin } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";

const AdminLogin = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleLogin = async (e) => {
		e.preventDefault();
		setError("");

		try {
			await adminLogin(email, password);
			navigate("/admin/dashboard");
		} catch (error) {
			setError("Invalid admin credentials");
			console.error(error);
		}
	};

	return (
		<div
			className="min-h-screen flex items-center justify-center"
			style={{
				background: "radial-gradient(circle, #5999ab 0%, #1b2931 100%)",
			}}>
			<div className="bg-white p-8 rounded-lg shadow-md w-96">
				<h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
					Admin Login
				</h2>
				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
						{error}
					</div>
				)}
				<form onSubmit={handleLogin} className="space-y-4">
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Admin Email"
						required
						className="w-full p-2 border border-gray-300 rounded"
					/>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Password"
						required
						className="w-full p-2 border border-gray-300 rounded"
					/>
					<button
						type="submit"
						className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
						Log In
					</button>
				</form>
				<div className="mt-4 text-center">
					<p className="text-sm">
						Don't have an account?{" "}
						<Link
							to="/admin/register"
							className="text-blue-600 hover:underline">
							Register Here
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default AdminLogin;
