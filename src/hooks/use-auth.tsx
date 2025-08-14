
'use client';

import * as React from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { doc, setDoc, getDoc, DocumentData } from 'firebase/firestore';
import { UserProfile } from '@/lib/user-profile';
import { useToast } from './use-toast';


interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<any>;
  signUpWithEmail: (email: string, pass: string, displayName: string) => Promise<any>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const fetchUserProfile = React.useCallback(async (firebaseUser: User) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserProfile(userSnap.data() as UserProfile);
        } else {
           // Create profile if it doesn't exist
           const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              planId: 'Free',
              isAdmin: false, // Default to not admin
           };
           await setDoc(userRef, newProfile);
           setUserProfile(newProfile);
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({ title: 'Error', description: 'Could not fetch user profile.', variant: 'destructive' });
    }
  }, [toast])

  const refreshUserProfile = React.useCallback(async () => {
    if (user) {
        setLoading(true);
        await fetchUserProfile(user);
        setLoading(false);
        toast({ title: 'Success', description: 'Your profile has been updated.' });
    }
  }, [user, fetchUserProfile, toast]);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        await fetchUserProfile(user);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserProfile]);

  const handleSuccessfulSignIn = async (userCredential: any) => {
    const firebaseUser = userCredential.user;
    setUser(firebaseUser);
    await fetchUserProfile(firebaseUser);
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handleSuccessfulSignIn(result);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, displayName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const { user: firebaseUser } = result;
    
    // Update Firebase Auth profile
    await updateProfile(firebaseUser, { displayName });

    // Create user profile document in Firestore
    const userRef = doc(db, 'users', firebaseUser.uid);
    const newProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: displayName,
      photoURL: null,
      planId: 'Free',
      isAdmin: false,
    };
    await setDoc(userRef, newProfile);
    setUser(firebaseUser);
    setUserProfile(newProfile);
    return result;
  }

  const signInWithEmail = async (email: string, pass: string) => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    await handleSuccessfulSignIn(result);
    return result;
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      // Redirect to login page after sign out only if not on a public page
      if (!['/', '/login', '/signup', '/community', '/pricing'].includes(pathname)) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signInWithGoogle, signOut, signUpWithEmail, signInWithEmail, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
