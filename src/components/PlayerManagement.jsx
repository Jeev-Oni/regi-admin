import React, { useState, useEffect } from "react";
import { getAllSessions, database } from "../services/firebase";
import { ref, get } from "firebase/database";

const PlayerManagement = () => {
	const [sessions, setSessions] = useState([]);
	const [selectedSession, setSelectedSession] = useState("");
	const [selectedTeam, setSelectedTeam] = useState("Team A");
	const [slots, setSlots] = useState([]);
	const [loading, setLoading] = useState(true);
	const [sessionLoading, setSessionLoading] = useState(true);

	// Fetch all sessions on component mount
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

					// If we have sessions, select the first one by default
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

	// Fetch slots when session or team changes
	useEffect(() => {
		if (selectedSession && selectedTeam) {
			fetchSlots();
		} else {
			setSlots([]);
			setLoading(false);
		}
	}, [selectedSession, selectedTeam]);

	const fetchSlots = async () => {
		setLoading(true);
		try {
			// Path to the slots based on the screenshot structure
			const slotsRef = ref(
				database,
				`sessions/${selectedSession}/${selectedTeam}/slots`
			);
			const snapshot = await get(slotsRef);

			if (snapshot.exists()) {
				const slotsData = snapshot.val();
				// Convert the object of slots to an array with their indices
				const slotsArray = Object.entries(slotsData).map(([index, data]) => ({
					index,
					...data,
				}));
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

	// Get session display name - show the event name instead of ID
	const getSessionDisplayName = (sessionId, session) => {
		return session.event || sessionId;
	};

	return (
		<div className="bg-white p-6 rounded-lg shadow-md">
			<h2 className="text-2xl font-bold mb-6">Player Management</h2>

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
					<h3 className="font-semibold">Registered Players</h3>
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
						<p>Loading players...</p>
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
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{slots.length > 0 ? (
									slots.map((slot) => (
										<tr key={slot.index}>
											<td className="px-6 py-4 whitespace-nowrap">
												{slot.index}
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
												{slot.reservedAt
													? new Date(slot.reservedAt).toLocaleString()
													: "N/A"}
											</td>
										</tr>
									))
								) : (
									<tr>
										<td
											colSpan="5"
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
							: "Select a session to view registered players"}
					</div>
				)}
			</div>
		</div>
	);
};

export default PlayerManagement;
