import React, { useState } from "react";
import { createAdminUser } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";

const AdminRegistration = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleRegistration = async (e) => {
		e.preventDefault();
		setError("");

		// Basic validation
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters long");
			return;
		}

		try {
			await createAdminUser(email, password, name);
			alert("Admin user created successfully");
			navigate("/admin/login");
		} catch (error) {
			setError(error.message);
		}
	};

	return (
		<div
			className="min-h-screen flex items-center justify-center"
			style={{
				background: "radial-gradient(circle, #f80a0a 0%, #ad0707 100%)",
			}}>
			<div className="bg-white p-8 rounded-lg shadow-md w-96">
				<h2 className="text-2xl font-bold text-center mb-6">
					Admin Registration
				</h2>
				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
						{error}
					</div>
				)}
				<form onSubmit={handleRegistration} className="space-y-4">
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Full Name"
						required
						className="w-full p-2 border border-gray-300 rounded"
					/>
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
					<input
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						placeholder="Confirm Password"
						required
						className="w-full p-2 border border-gray-300 rounded"
					/>
					<button
						type="submit"
						className="w-full bg-red-600 text-white py-2 rounded hover:bg-blue-700">
						Register Admin
					</button>
				</form>
				<div className="mt-4 text-center">
					<p className="text-sm">
						Already have an account?{" "}
						<Link to="/admin/login" className="text-blue-600 hover:underline">
							Login Here
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default AdminRegistration;
