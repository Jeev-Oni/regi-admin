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
		<div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
			{/* Header banner with upward gradient */}
			<div className="w-full bg-gradient-to-t from-gray-700 to-red-600 text-white">
				<div className="container mx-auto py-3 px-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<img src="/Lipa.png" alt="Logo" className="h-10 w-10 mr-2" />
							<span className="text-3xl font-bold">Football Lipa</span>
						</div>
						<button
							onClick={handleLogout}
							className="text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">
							Sign Out
						</button>
					</div>
				</div>
			</div>

			{/* Subtle Navy Separator */}
			<div className="h-1 bg-gray-700 w-full"></div>

			<div className="flex flex-1">
				{/* Sidebar */}
				<div className="w-64 bg-gray-100 border-r border-gray-300 p-4">
					<h3 className="text-lg font-semibold mb-4 text-gray-700">
						Admin Dashboard
					</h3>
					<nav>
						{[
							{ name: "Sessions Management", key: "sessions", icon: "📝" },
							{ name: "Player Management", key: "players", icon: "👥" },
							{ name: "Records Management", key: "records", icon: "📊" },
						].map(({ name, key, icon }) => (
							<button
								key={key}
								onClick={() => setActiveTab(key)}
								className={`w-full text-left px-3 py-2 rounded-md flex items-center mb-2 transition ${
									activeTab === key
										? "bg-red-500 text-white"
										: "hover:bg-gray-200 text-gray-800"
								}`}>
								<span className="mr-2">{icon}</span>
								{name}
							</button>
						))}
					</nav>
				</div>

				{/* Main Content */}
				<div className="flex-1 p-6">
					<div className="bg-white p-4 shadow-md rounded-md mb-6">
						<h2 className="text-xl font-bold text-gray-700">
							Welcome to Football Lipa Admin
						</h2>
						<p className="text-sm text-gray-600">
							Manage your sessions, players, and records.
						</p>
					</div>
					{renderContent()}
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard;
