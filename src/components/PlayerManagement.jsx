import React, { useState, useEffect } from "react";
import {
	getAllSessions,
	database,
	releaseSlot,
	reserveSlot,
} from "../services/firebase";
import { ref, get } from "firebase/database";

const PlayerManagement = () => {
	const [sessions, setSessions] = useState([]);
	const [selectedSession, setSelectedSession] = useState("");
	const [selectedTeam, setSelectedTeam] = useState("Team A");
	const [slots, setSlots] = useState([]);
	const [loading, setLoading] = useState(true);
	const [sessionLoading, setSessionLoading] = useState(true);

	// Modal states
	const [showAddModal, setShowAddModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [selectedSlot, setSelectedSlot] = useState(null);
	const [playerInfo, setPlayerInfo] = useState({ userId: "", userName: "" });
	const [actionLoading, setActionLoading] = useState(false);
	const [message, setMessage] = useState({ text: "", type: "" });

	// Fetch all available sessions when component mounts
	useEffect(() => {
		const fetchSessions = async () => {
			setSessionLoading(true);
			try {
				const sessionsData = await getAllSessions();
				if (sessionsData) {
					const sessionsArray = Object.keys(sessionsData).map((key) => ({
						id: key,
						...sessionsData[key],
					}));
					setSessions(sessionsArray);

					// Auto-select first session if available
					if (sessionsArray.length > 0) {
						setSelectedSession(sessionsArray[0].id);
					}
				} else {
					setSessions([]);
				}
			} catch (error) {
				console.error("Error fetching sessions:", error);
				setSessions([]);
			} finally {
				setSessionLoading(false);
			}
		};

		fetchSessions();
	}, []);

	// Fetch slots whenever selected session or team changes
	useEffect(() => {
		if (selectedSession && selectedTeam) {
			fetchSlots();
		} else {
			setSlots([]);
			setLoading(false);
		}
	}, [selectedSession, selectedTeam]);

	// Clear message after 3 seconds
	useEffect(() => {
		if (message.text) {
			const timer = setTimeout(() => {
				setMessage({ text: "", type: "" });
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [message]);

	const fetchSlots = async () => {
		setLoading(true);
		try {
			// Get slots for the selected team in the selected session
			const slotsRef = ref(
				database,
				`sessions/${selectedSession}/teams/${selectedTeam}/slots`
			);
			const snapshot = await get(slotsRef);

			if (snapshot.exists()) {
				const slotsData = snapshot.val();
				// Convert slots object to array with index as a property
				const slotsArray = Object.keys(slotsData).map((slotKey) => ({
					slotNumber: slotKey,
					...slotsData[slotKey],
				}));

				// Sort by slot number for consistent display
				slotsArray.sort(
					(a, b) => parseInt(a.slotNumber) - parseInt(b.slotNumber)
				);
				setSlots(slotsArray);
			} else {
				setSlots([]);
			}
		} catch (error) {
			console.error("Error fetching slots:", error);
			setSlots([]);
		} finally {
			setLoading(false);
		}
	};

	// Helper to display session name
	const getSessionDisplayName = (sessionId, session) => {
		return session.event || sessionId;
	};

	// Format date for display
	const formatDate = (dateString) => {
		try {
			return new Date(dateString).toLocaleString();
		} catch (error) {
			return dateString || "N/A";
		}
	};

	// Open add player modal
	const handleAddPlayer = (slot) => {
		setSelectedSlot(slot);
		setPlayerInfo({ userId: "", userName: "" });
		setShowAddModal(true);
	};

	// Open delete player modal
	const handleDeletePlayer = (slot) => {
		setSelectedSlot(slot);
		setShowDeleteModal(true);
	};

	// Add player to a slot
	const addPlayerToSlot = async () => {
		if (!playerInfo.userId || !playerInfo.userName) {
			setMessage({ text: "User ID and User Name are required", type: "error" });
			return;
		}

		setActionLoading(true);
		try {
			await reserveSlot(
				selectedSession,
				selectedTeam,
				selectedSlot.slotNumber,
				{
					userId: playerInfo.userId,
					userName: playerInfo.userName,
				}
			);

			setMessage({ text: "Player added successfully", type: "success" });
			setShowAddModal(false);
			fetchSlots(); // Refresh the slots list
		} catch (error) {
			console.error("Error adding player:", error);
			setMessage({
				text: `Error adding player: ${error.message}`,
				type: "error",
			});
		} finally {
			setActionLoading(false);
		}
	};

	// Remove player from a slot
	const removePlayerFromSlot = async () => {
		setActionLoading(true);
		try {
			await releaseSlot(selectedSession, selectedTeam, selectedSlot.slotNumber);

			setMessage({ text: "Player removed successfully", type: "success" });
			setShowDeleteModal(false);
			fetchSlots(); // Refresh the slots list
		} catch (error) {
			console.error("Error removing player:", error);
			setMessage({
				text: `Error removing player: ${error.message}`,
				type: "error",
			});
		} finally {
			setActionLoading(false);
		}
	};

	return (
		<div className="bg-white p-6 rounded-lg shadow-md">
			<h2 className="text-2xl font-bold mb-6">Player Management</h2>

			{/* Message notification */}
			{message.text && (
				<div
					className={`mb-4 p-3 rounded ${
						message.type === "success"
							? "bg-green-100 text-green-800"
							: "bg-red-100 text-red-800"
					}`}>
					{message.text}
				</div>
			)}

			{sessionLoading ? (
				<div className="p-4 text-center">
					<p>Loading available sessions...</p>
				</div>
			) : (
				<div className="mb-6 grid grid-cols-2 gap-4">
					<div>
						<label className="block mb-2 font-medium">Select Session</label>
						<select
							className="w-full p-2 border rounded"
							value={selectedSession}
							onChange={(e) => setSelectedSession(e.target.value)}
							disabled={sessions.length === 0}>
							{sessions.length === 0 ? (
								<option value="">No sessions available</option>
							) : (
								<>
									<option value="">Select a session</option>
									{sessions.map((session) => (
										<option key={session.id} value={session.id}>
											{getSessionDisplayName(session.id, session)}
										</option>
									))}
								</>
							)}
						</select>
					</div>

					<div>
						<label className="block mb-2 font-medium">Select Team</label>
						<select
							className="w-full p-2 border rounded"
							value={selectedTeam}
							onChange={(e) => setSelectedTeam(e.target.value)}
							disabled={!selectedSession}>
							<option value="Team A">Team A</option>
							<option value="Team B">Team B</option>
							<option value="Team C">Team C</option>
						</select>
					</div>
				</div>
			)}

			<div className="border rounded-lg overflow-hidden">
				<div className="bg-gray-50 p-4 border-b flex justify-between items-center">
					<h3 className="font-semibold">Player Slots</h3>
					{selectedSession && selectedTeam && (
						<button
							onClick={fetchSlots}
							className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
							Refresh
						</button>
					)}
				</div>

				{loading ? (
					<div className="p-8 text-center">
						<p>Loading slots...</p>
					</div>
				) : selectedSession ? (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Slot #
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										User ID
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										User Name
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Reserved At
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{slots.length > 0 ? (
									slots.map((slot) => (
										<tr key={slot.slotNumber}>
											<td className="px-6 py-4 whitespace-nowrap">
												{slot.slotNumber}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{slot.reserved ? (
													<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
														Reserved
													</span>
												) : (
													<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
														Available
													</span>
												)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{slot.userId || "N/A"}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{slot.userName || "N/A"}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{slot.reservedAt ? formatDate(slot.reservedAt) : "N/A"}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
												{slot.reserved ? (
													<button
														onClick={() => handleDeletePlayer(slot)}
														className="text-red-600 hover:text-red-900 ml-2">
														Delete
													</button>
												) : (
													<button
														onClick={() => handleAddPlayer(slot)}
														className="text-green-600 hover:text-green-900 ml-2">
														Add Player
													</button>
												)}
											</td>
										</tr>
									))
								) : (
									<tr>
										<td
											colSpan="6"
											className="px-6 py-4 text-center text-sm text-gray-500">
											No slots found for this team
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				) : (
					<div className="p-8 text-center text-gray-500">
						{sessions.length === 0
							? "No sessions available. Create a session first."
							: "Select a session to view player slots"}
					</div>
				)}
			</div>

			{/* Add Player Modal */}
			{showAddModal && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
						<h3 className="text-lg font-medium mb-4">
							Add Player to Slot {selectedSlot?.slotNumber}
						</h3>

						<div className="mb-4">
							<label className="block text-sm font-medium mb-1">User ID</label>
							<input
								type="text"
								value={playerInfo.userId}
								onChange={(e) =>
									setPlayerInfo({ ...playerInfo, userId: e.target.value })
								}
								className="w-full p-2 border rounded"
								placeholder="Enter user ID"
							/>
						</div>

						<div className="mb-4">
							<label className="block text-sm font-medium mb-1">
								User Name
							</label>
							<input
								type="text"
								value={playerInfo.userName}
								onChange={(e) =>
									setPlayerInfo({ ...playerInfo, userName: e.target.value })
								}
								className="w-full p-2 border rounded"
								placeholder="Enter user name"
							/>
						</div>

						<div className="flex justify-end space-x-2 mt-4">
							<button
								onClick={() => setShowAddModal(false)}
								className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
								disabled={actionLoading}>
								Cancel
							</button>
							<button
								onClick={addPlayerToSlot}
								className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
								disabled={actionLoading}>
								{actionLoading ? "Adding..." : "Add Player"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Delete Player Modal */}
			{showDeleteModal && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
						<h3 className="text-lg font-medium mb-4">Remove Player</h3>
						<p>
							Are you sure you want to remove {selectedSlot?.userName} from slot{" "}
							{selectedSlot?.slotNumber}?
						</p>

						<div className="flex justify-end space-x-2 mt-4">
							<button
								onClick={() => setShowDeleteModal(false)}
								className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
								disabled={actionLoading}>
								Cancel
							</button>
							<button
								onClick={removePlayerFromSlot}
								className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
								disabled={actionLoading}>
								{actionLoading ? "Removing..." : "Remove Player"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default PlayerManagement;
