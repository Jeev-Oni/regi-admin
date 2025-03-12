import React, { useState } from "react";
import { createSession } from "../services/firebase"; // Make sure this is correct
import { serverTimestamp } from "firebase/database";

const SessionManagement = () => {
	const [sessionData, setSessionData] = useState({
		event: "",
		date: "",
		time: "",
		status: "active",
		teams: {
			"Team A": { slotCount: 9 },
			"Team B": { slotCount: 9 },
			"Team C": { slotCount: 9 },
		},
	});

	const handleCreateSession = async () => {
		try {
			// Build "teams" object, storing both slotCount and slots array
			const transformedTeams = {};
			Object.keys(sessionData.teams).forEach((team) => {
				const count = sessionData.teams[team].slotCount;
				transformedTeams[team] = {
					slotCount: count, // Keep the slotCount in Firebase
					slots: Array(count).fill(null), // Initialize the slots array
				};
			});

			// Prepare final session object
			const sessionToCreate = {
				...sessionData,
				teams: transformedTeams,
				createdAt: serverTimestamp(),
			};

			// Call your Firebase function that creates the session
			await createSession(sessionToCreate);

			alert("Session created successfully");

			// Optionally reset the form
			setSessionData({
				event: "",
				date: "",
				time: "",
				status: "active",
				teams: {
					"Team A": { slotCount: 9 },
					"Team B": { slotCount: 9 },
					"Team C": { slotCount: 9 },
				},
			});
		} catch (error) {
			console.error("Error creating session:", error);
			alert("Failed to create session. Check console for details.");
		}
	};

	return (
		<div className="bg-white p-6 rounded-lg shadow-md">
			<h2 className="text-2xl font-bold mb-6">Session Management</h2>
			<div className="space-y-4">
				{/* SESSION EVENT NAME */}
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

				{/* DATE & TIME */}
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

				{/* TEAM CONFIGURATIONS */}
				<div>
					<h3 className="font-semibold mb-2">Team Configurations</h3>
					{Object.keys(sessionData.teams).map((team) => (
						<div key={team} className="mb-2 flex items-center">
							<div className="w-1/4">
								{/* Color circle for each team (optional) */}
								<span
									className="inline-block w-4 h-4 rounded-full mr-2"
									style={{
										backgroundColor:
											team === "Team A"
												? "blue"
												: team === "Team B"
												? "yellow"
												: "green",
									}}
								/>
								<label>{team}</label>
							</div>
							<div className="w-3/4 flex items-center">
								<label className="block ml-2 mr-2">Slots:</label>
								<input
									type="number"
									value={sessionData.teams[team].slotCount}
									onChange={(e) =>
										setSessionData({
											...sessionData,
											teams: {
												...sessionData.teams,
												[team]: { slotCount: parseInt(e.target.value, 10) },
											},
										})
									}
									className="w-20 p-2 border rounded"
									min="1"
									max="20"
								/>
							</div>
						</div>
					))}
				</div>

				{/* CREATE BUTTON */}
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
