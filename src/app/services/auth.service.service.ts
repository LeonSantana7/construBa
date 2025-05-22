import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, UserCredential } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

export interface User {
  uid: string;
  email: string;
  role: 'cliente' | 'profissional';
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private auth: Auth, private firestore: Firestore) {
    onAuthStateChanged(this.auth, async fbUser => {
      if (!fbUser) {
        this.userSubject.next(null);
        return;
      }

      const userRef = doc(this.firestore, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as Omit<User, 'uid'>;
        this.userSubject.next({
          uid: fbUser.uid,
          email: data.email,
          name: data.name,
          role: data.role
        });
      } else {
        this.userSubject.next({
          uid: fbUser.uid,
          email: fbUser.email || '',
          role: 'cliente',
          name: fbUser.email || 'Sem Nome'
        });
      }
    });
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      return true;
    } catch (err) {
      console.error('Login falhou:', err);
      return false;
    }
  }

  getCurrentUser(): User | null {
    return this.userSubject.getValue();
  }

  async signup(
    email: string,
    password: string,
    name: string,
    role: 'cliente' | 'profissional'
  ): Promise<boolean> {
    try {
      const cred: UserCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const userRef = doc(this.firestore, 'users', cred.user.uid);
      await setDoc(userRef, { email, name, role });

      this.userSubject.next({
        uid: cred.user.uid,
        email,
        name,
        role
      });

      return true;
    } catch (err) {
      console.error('Signup falhou:', err);
      return false;
    }
  }

  logout(): void {
    this.auth.signOut();
    this.userSubject.next(null);
  }
}
