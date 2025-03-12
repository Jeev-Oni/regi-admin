// AdminDashboard.jsx - Updated with logo
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/firebase";
import SessionManagement from "./SessionManagement";
import PlayerManagement from "./PlayerManagement";
import RecordsManagement from "./RecordsManagement";

const AdminDashboard = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("sessions");

	const handleLogout = async () => {
		try {
			await logoutUser();
			navigate("/admin/login");
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	const renderContent = () => {
		switch (activeTab) {
			case "sessions":
				return <SessionManagement />;
			case "players":
				return <PlayerManagement />;
			case "records":
				return <RecordsManagement />;
			default:
				return <SessionManagement />;
		}
	};

	return (
		<div className="min-h-screen bg-gray-100 flex">
			{/* Sidebar */}
			<div className="w-64 bg-gray-800 text-white p-6">
				{/* Logo section */}
				<div className="flex justify-center mb-4">
					<div className="text-center">
						<div className="bg-white p-2 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
							{/* Placeholder logo - replace with your actual logo */}
							<span className="text-gray-800 font-bold text-xl">LOGO</span>
						</div>
						<p className="mt-2 font-semibold">Admin System</p>
					</div>
				</div>

				{/* Divider */}
				<div className="border-b border-gray-600 my-4"></div>

				<h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
				<nav className="space-y-4">
					<button
						onClick={() => setActiveTab("sessions")}
						className={`w-full text-left p-2 rounded ${
							activeTab === "sessions" ? "bg-blue-600" : "hover:bg-gray-700"
						}`}>
						Sessions
					</button>
					<button
						onClick={() => setActiveTab("players")}
						className={`w-full text-left p-2 rounded ${
							activeTab === "players" ? "bg-blue-600" : "hover:bg-gray-700"
						}`}>
						Players
					</button>
					<button
						onClick={() => setActiveTab("records")}
						className={`w-full text-left p-2 rounded ${
							activeTab === "records" ? "bg-blue-600" : "hover:bg-gray-700"
						}`}>
						Records
					</button>
					<button
						onClick={handleLogout}
						className="w-full text-left p-2 rounded hover:bg-red-600">
						Logout
					</button>
				</nav>
			</div>

			{/* Main Content */}
			<div className="flex-1 p-10">{renderContent()}</div>
		</div>
	);
};

export default AdminDashboard;
