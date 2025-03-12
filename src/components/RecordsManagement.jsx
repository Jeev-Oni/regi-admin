import React, { useState, useEffect } from "react";
import { database } from "../services/firebase";
import { ref, get, update, remove } from "firebase/database";

const RecordsManagement = () => {
	const [sessions, setSessions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// State for edit modal
	const [showEditModal, setShowEditModal] = useState(false);
	const [currentSession, setCurrentSession] = useState(null);
	const [editFormData, setEditFormData] = useState({
		event: "",
		date: "",
		time: "",
	});

	useEffect(() => {
		fetchSessions();
	}, []);

	const fetchSessions = async () => {
		setLoading(true);
		setError("");
		try {
			const sessionsRef = ref(database, "sessions");
			const snapshot = await get(sessionsRef);

			if (snapshot.exists()) {
				const sessionsData = snapshot.val();
				const sessionsArray = Object.keys(sessionsData).map((key) => ({
					id: key,
					...sessionsData[key],
				}));
				setSessions(sessionsArray);
			} else {
				setSessions([]);
			}
		} catch (err) {
			console.error("Error fetching sessions:", err);
			setError("Failed to load sessions. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const closeSession = async (sessionId) => {
		try {
			const sessionRef = ref(database, `sessions/${sessionId}`);
			await update(sessionRef, {
				status: "closed",
				updatedAt: new Date().toISOString(),
			});

			// Update local state
			setSessions(
				sessions.map((session) =>
					session.id === sessionId
						? {
								...session,
								status: "closed",
								updatedAt: new Date().toISOString(),
						  }
						: session
				)
			);

			alert("Session closed successfully");
		} catch (err) {
			console.error("Error closing session:", err);
			alert("Failed to close session");
		}
	};

	const reopenSession = async (sessionId) => {
		try {
			const sessionRef = ref(database, `sessions/${sessionId}`);
			await update(sessionRef, {
				status: "active",
				updatedAt: new Date().toISOString(),
			});

			// Update local state
			setSessions(
				sessions.map((session) =>
					session.id === sessionId
						? {
								...session,
								status: "active",
								updatedAt: new Date().toISOString(),
						  }
						: session
				)
			);

			alert("Session reopened successfully");
		} catch (err) {
			console.error("Error reopening session:", err);
			alert("Failed to reopen session");
		}
	};

	const deleteSession = async (sessionId) => {
		if (
			window.confirm(
				"Are you sure you want to delete this session? This action cannot be undone."
			)
		) {
			try {
				const sessionRef = ref(database, `sessions/${sessionId}`);
				await remove(sessionRef);

				// Update local state
				setSessions(sessions.filter((session) => session.id !== sessionId));

				alert("Session deleted successfully");
			} catch (err) {
				console.error("Error deleting session:", err);
				alert("Failed to delete session");
			}
		}
	};

	// Function to open edit modal
	const openEditModal = (session) => {
		setCurrentSession(session);
		setEditFormData({
			event: session.event || "",
			date: session.date || "",
			time: session.time || "",
		});
		setShowEditModal(true);
	};

	// Function to handle form input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setEditFormData({
			...editFormData,
			[name]: value,
		});
	};

	// Function to save session edits
	const saveSessionEdits = async () => {
		if (!currentSession) return;

		try {
			const sessionRef = ref(database, `sessions/${currentSession.id}`);
			await update(sessionRef, {
				...editFormData,
				updatedAt: new Date().toISOString(),
			});

			// Update local state
			setSessions(
				sessions.map((session) =>
					session.id === currentSession.id
						? {
								...session,
								...editFormData,
								updatedAt: new Date().toISOString(),
						  }
						: session
				)
			);

			setShowEditModal(false);
			alert("Session updated successfully");
		} catch (err) {
			console.error("Error updating session:", err);
			alert("Failed to update session");
		}
	};

	const formatDate = (dateString) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleString();
		} catch (e) {
			return dateString;
		}
	};

	return (
		<div className="bg-white p-6 rounded-lg shadow-md">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold">Records Management</h2>
				<button
					onClick={fetchSessions}
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
					Refresh
				</button>
			</div>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					{error}
				</div>
			)}

			{loading ? (
				<div className="flex justify-center items-center h-64">
					<p>Loading sessions...</p>
				</div>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full bg-white border border-gray-200">
						<thead>
							<tr className="bg-gray-100">
								<th className="py-3 px-4 border-b text-left">Session ID</th>
								<th className="py-3 px-4 border-b text-left">Event</th>
								<th className="py-3 px-4 border-b text-left">Date</th>
								<th className="py-3 px-4 border-b text-left">Time</th>
								<th className="py-3 px-4 border-b text-left">Status</th>
								<th className="py-3 px-4 border-b text-left">Created</th>
								<th className="py-3 px-4 border-b text-center">Actions</th>
							</tr>
						</thead>
						<tbody>
							{sessions.length > 0 ? (
								sessions.map((session) => (
									<tr key={session.id} className="hover:bg-gray-50">
										<td className="py-3 px-4 border-b">{session.id}</td>
										<td className="py-3 px-4 border-b">
											{session.event || "N/A"}
										</td>
										<td className="py-3 px-4 border-b">
											{session.date || "N/A"}
										</td>
										<td className="py-3 px-4 border-b">
											{session.time || "N/A"}
										</td>
										<td className="py-3 px-4 border-b">
											<span
												className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${
														session.status === "closed"
															? "bg-red-100 text-red-800"
															: "bg-green-100 text-green-800"
													}`}>
												{session.status || "active"}
											</span>
										</td>
										<td className="py-3 px-4 border-b">
											{session.createdAt
												? formatDate(session.createdAt)
												: "N/A"}
										</td>
										<td className="py-3 px-4 border-b text-center">
											<div className="flex justify-center space-x-2">
												<button
													onClick={() => openEditModal(session)}
													className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
													Edit
												</button>
												{session.status === "closed" ? (
													<button
														onClick={() => reopenSession(session.id)}
														className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
														Reopen
													</button>
												) : (
													<button
														onClick={() => closeSession(session.id)}
														className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700">
														Close
													</button>
												)}
												<button
													onClick={() => deleteSession(session.id)}
													className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
													Delete
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan="7" className="py-8 text-center text-gray-500">
										No sessions found. Create a session first.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			)}

			{/* Edit Session Modal */}
			{showEditModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<h3 className="text-xl font-bold mb-4">Edit Session</h3>

						<div className="space-y-4">
							<div>
								<label className="block mb-2">Session Event</label>
								<input
									type="text"
									name="event"
									value={editFormData.event}
									onChange={handleInputChange}
									className="w-full p-2 border rounded"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block mb-2">Date</label>
									<input
										type="date"
										name="date"
										value={editFormData.date}
										onChange={handleInputChange}
										className="w-full p-2 border rounded"
									/>
								</div>

								<div>
									<label className="block mb-2">Time</label>
									<input
										type="time"
										name="time"
										value={editFormData.time}
										onChange={handleInputChange}
										className="w-full p-2 border rounded"
									/>
								</div>
							</div>

							<div className="flex justify-end space-x-2 mt-6">
								<button
									onClick={() => setShowEditModal(false)}
									className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">
									Cancel
								</button>
								<button
									onClick={saveSessionEdits}
									className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
									Save Changes
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default RecordsManagement;
