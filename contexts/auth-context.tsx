
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/lib/auth-types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        
        try {
          // Forzar la actualización del token
          await firebaseUser.getIdToken(true);
          
          // Pequeña espera para asegurar la propagación del token
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Obtener datos del usuario desde Firestore con reintentos
          let userDoc;
          let retries = 3;
          
          while (retries > 0) {
            try {
              userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              break;
            } catch (error: any) {
              if (error.code === 'permission-denied' && retries > 1) {
                // Esperar antes de reintentar
                await new Promise(resolve => setTimeout(resolve, 500));
                retries--;
              } else {
                throw error;
              }
            }
          }
          
          if (userDoc && userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
          } else {
            console.warn('Usuario autenticado pero sin documento en Firestore');
            setUser(null);
          }
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
          setUser(null);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
