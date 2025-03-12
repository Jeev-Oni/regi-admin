// SessionManagement.jsx - Updated with time input
import React, { useState } from "react";
import {
	createSession,
	updateSession,
	deleteSession,
} from "../services/firebase";

const SessionManagement = () => {
	const [sessionData, setSessionData] = useState({
		event: "",
		date: "",
		time: "", // New time field
		teams: {
			blue: { slots: 9 },
			yellow: { slots: 9 },
			green: { slots: 9 },
		},
	});

	const handleCreateSession = async () => {
		try {
			await createSession(sessionData);
			alert("Session created successfully");
		} catch (error) {
			console.error("Error creating session:", error);
		}
	};

	return (
		<div className="bg-white p-6 rounded-lg shadow-md">
			<h2 className="text-2xl font-bold mb-6">Session Management</h2>

			<div className="space-y-4">
				<div>
					<label className="block mb-2">Session Event</label>
					<input
						type="text"
						value={sessionData.event}
						onChange={(e) =>
							setSessionData({ ...sessionData, event: e.target.value })
						}
						className="w-full p-2 border rounded"
						placeholder="Enter session event"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block mb-2">Date</label>
						<input
							type="date"
							value={sessionData.date}
							onChange={(e) =>
								setSessionData({ ...sessionData, date: e.target.value })
							}
							className="w-full p-2 border rounded"
						/>
					</div>

					<div>
						<label className="block mb-2">Time</label>
						<input
							type="time"
							value={sessionData.time}
							onChange={(e) =>
								setSessionData({ ...sessionData, time: e.target.value })
							}
							className="w-full p-2 border rounded"
						/>
					</div>
				</div>

				<div>
					<h3 className="font-semibold mb-2">Team Configurations</h3>
					{Object.keys(sessionData.teams).map((team) => (
						<div key={team} className="mb-2">
							<label className="block">
								{team.charAt(0).toUpperCase() + team.slice(1)} Team Slots
							</label>
							<input
								type="number"
								value={sessionData.teams[team].slots}
								onChange={(e) =>
									setSessionData({
										...sessionData,
										teams: {
											...sessionData.teams,
											[team]: { slots: parseInt(e.target.value) },
										},
									})
								}
								className="w-full p-2 border rounded"
								min="1"
								max="20"
							/>
						</div>
					))}
				</div>

				<div className="flex space-x-4">
					<button
						onClick={handleCreateSession}
						className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
						Create Session
					</button>
				</div>
			</div>
		</div>
	);
};

export default SessionManagement;
