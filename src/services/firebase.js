import { initializeApp } from "firebase/app";
import {
	getAuth,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	sendPasswordResetEmail,
} from "firebase/auth";
import {
	getDatabase,
	ref,
	set,
	push,
	update,
	remove,
	get,
	query,
	orderByChild,
	equalTo,
} from "firebase/database";
import { firebaseConfig } from "../components/FirebaseConfig";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// Authentication Services
export const adminLogin = async (email, password) => {
	try {
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password
		);

		// Additional admin check
		const adminRef = ref(database, `admins/${userCredential.user.uid}`);
		const snapshot = await get(adminRef);

		if (!snapshot.exists()) {
			// If user is not in admins list, sign out and throw an error
			await signOut(auth);
			throw new Error("Unauthorized access: Not an admin");
		}

		return userCredential;
	} catch (error) {
		console.error("Login error:", error);
		throw error;
	}
};

export const createAdminUser = async (email, password, name) => {
	try {
		// Create user in Firebase Authentication
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password
		);
		const user = userCredential.user;

		// Store admin status in Realtime Database
		const adminRef = ref(database, `admins/${user.uid}`);
		await set(adminRef, {
			email: email,
			name: name,
			createdAt: new Date().toISOString(),
			role: "admin",
		});

		return user;
	} catch (error) {
		console.error("Admin creation error:", error);
		throw error;
	}
};

// Rest of the existing code remains the same

export const logoutUser = () => {
	return signOut(auth);
};

export const resetPassword = (email) => {
	return sendPasswordResetEmail(auth, email);
};

export const isUserAdmin = async (user) => {
	if (!user) return false;

	try {
		const adminRef = ref(database, `admins/${user.uid}`);
		const snapshot = await get(adminRef);
		return snapshot.exists();
	} catch (error) {
		console.error("Admin status check error:", error);
		return false;
	}
};

// Session Management Services
export const createSession = async (sessionData) => {
	try {
		const sessionsRef = ref(database, "sessions");
		const newSessionRef = push(sessionsRef);
		await set(newSessionRef, {
			...sessionData,
			createdAt: new Date().toISOString(),
			status: "active",
		});
		return newSessionRef.key;
	} catch (error) {
		console.error("Session creation error:", error);
		throw error;
	}
};

export const updateSession = async (sessionId, sessionData) => {
	try {
		const sessionRef = ref(database, `sessions/${sessionId}`);
		await update(sessionRef, {
			...sessionData,
			updatedAt: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Session update error:", error);
		throw error;
	}
};

export const deleteSession = async (sessionId) => {
	try {
		const sessionRef = ref(database, `sessions/${sessionId}`);
		await remove(sessionRef);
	} catch (error) {
		console.error("Session deletion error:", error);
		throw error;
	}
};

export const getAllSessions = async () => {
	try {
		const sessionsRef = ref(database, "sessions");
		const snapshot = await get(sessionsRef);
		return snapshot.exists() ? snapshot.val() : {};
	} catch (error) {
		console.error("Fetching sessions error:", error);
		throw error;
	}
};

// Player Management Services
export const addPlayerToSession = async (sessionId, teamName, playerData) => {
	try {
		const playerRef = ref(
			database,
			`sessions/${sessionId}/${teamName}/players`
		);
		const newPlayerRef = push(playerRef);
		await set(newPlayerRef, {
			...playerData,
			registeredAt: new Date().toISOString(),
		});
		return newPlayerRef.key;
	} catch (error) {
		console.error("Adding player error:", error);
		throw error;
	}
};

export const getSessionPlayers = async (sessionId, teamName) => {
	try {
		const playersRef = ref(
			database,
			`sessions/${sessionId}/${teamName}/players`
		);
		const snapshot = await get(playersRef);
		return snapshot.exists() ? snapshot.val() : {};
	} catch (error) {
		console.error("Fetching players error:", error);
		throw error;
	}
};
// Utility Functions
export const generateUniqueId = () => {
	return push(ref(database)).key;
};

// Add these functions to your firebase.js file

// Reserve a slot for a player
export const reserveSlot = async (sessionId, teamName, slotNumber, playerData) => {
  try {
    const slotRef = ref(
      database,
      `sessions/${sessionId}/teams/${teamName}/slots/${slotNumber}`
    );
    
    await update(slotRef, {
      reserved: true,
      reservedAt: new Date().toISOString(),
      userId: playerData.userId,
      userName: playerData.userName
    });
    
    return true;
  } catch (error) {
    console.error("Error reserving slot:", error);
    throw error;
  }
};

// Release a slot (remove player)
export const releaseSlot = async (sessionId, teamName, slotNumber) => {
  try {
    const slotRef = ref(
      database,
      `sessions/${sessionId}/teams/${teamName}/slots/${slotNumber}`
    );
    
    await update(slotRef, {
      reserved: false,
      reservedAt: null,
      userId: null,
      userName: null
    });
    
    return true;
  } catch (error) {
    console.error("Error releasing slot:", error);
    throw error;
  }
};

// Initialize slots for a team (optional function if you need to create slots)
export const initializeTeamSlots = async (sessionId, teamName, slotCount = 9) => {
  try {
    const teamRef = ref(database, `sessions/${sessionId}/teams/${teamName}`);
    
    // First create the slotCount entry
    await set(ref(database, `sessions/${sessionId}/teams/${teamName}/slotCount`), slotCount);
    
    // Then create empty slots
    const slots = {};
    for (let i = 0; i < slotCount; i++) {
      slots[i] = {
        reserved: false,
        reservedAt: null,
        userId: null,
        userName: null
      };
    }
    
    await set(ref(database, `sessions/${sessionId}/teams/${teamName}/slots`), slots);
    
    return true;
  } catch (error) {
    console.error("Error initializing team slots:", error);
    throw error;
  }
};

