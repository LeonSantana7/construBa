import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  authState,
  User as FirebaseUser,
  updateProfile
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Observable, of, from } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

export interface User { 
  uid: string;
  email: string | null;
  name?: string | null;
  role?: 'cliente' | 'profissional';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user$: Observable<User | null>; 

  constructor(
    private afAuth: Auth,
    private firestore: Firestore
  ) {
    this.user$ = authState(this.afAuth).pipe(
      switchMap((firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          return from(this.getUserDataFromFirestore(firebaseUser.uid)).pipe(
            map(customUserData => ({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: customUserData?.name || firebaseUser.displayName,
              role: customUserData?.role,
            } as User)),
            catchError(() => of({ 
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
            } as User))
          );
        } else {
          return of(null);
        }
      })
    );
  }


  getAuthState(): Observable<FirebaseUser | null> {
    return authState(this.afAuth);
  }

  async login(email: string, password: string): Promise<boolean> {
    try { await signInWithEmailAndPassword(this.afAuth, email, password); return true; }
    catch (error) { console.error('Login error:', error); return false; }
  }

  async register(email: string, password: string, name: string, role: 'cliente' | 'profissional'): Promise<string | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.afAuth, email, password);
      const user = userCredential.user;
      await setDoc(doc(this.firestore, 'users', user.uid), {
        uid: user.uid, email: user.email, name: name, role: role
      });
      if (name) { await updateProfile(user, { displayName: name }); }
      return user.uid;
    } catch (error) { console.error('Register error:', error); return null; }
  }

  async logout(): Promise<void> {
    try { await signOut(this.afAuth); }
    catch (error) { console.error('Logout error:', error); }
  }

  async getUserDataFromFirestore(uid: string): Promise<User | null> {
    const userDocRef = doc(this.firestore, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    return userDocSnap.exists() ? userDocSnap.data() as User : null;
  }
}