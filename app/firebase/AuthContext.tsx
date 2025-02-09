'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
	User,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,  
	signOut
} from 'firebase/auth';
import { auth } from './firebase.config';

interface AuthContextType {
	user: User | null;
	loading: boolean;
	signIn: (email: string, password: string) => Promise<void>;
	signUp: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType> ({
	user: null,
	loading: true,
	signIn: async () => {},
	signUp: async () => {},
	logout: async () => {}
});

export function AuthProvider({children}: {children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Subscribe to auth state changes
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user){
				setUser(user);
			} else {
				setUser(null);
			}
			setLoading(false);			
		});
		
		// Cleanup subscription
		return () => unsubscribe();
	}, []);

	const signIn = async (email: string, password: string) => {
		try {
			await signInWithEmailAndPassword(auth, email, password);
		} catch (error) {
			console.error('Error signing in:', error);
			throw error;
		}
	};

	const signUp = async (email: string, password: string) => {
		try {
			await createUserWithEmailAndPassword(auth, email, password);
		} catch (error) {
			console.error('Error signing up:', error);
			throw error;
		}
	};

	const logout = async () => {
		try {
			await signOut(auth);
		} catch (error) {
			console.error('Error signing out:', error);
			throw error;
		}
	};

	return (
		<AuthContext.Provider value={{ user, loading, signIn, signUp, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => useContext(AuthContext);