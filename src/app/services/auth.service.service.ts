import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, UserCredential, User as FirebaseUser } from 'firebase/auth';
import { Firestore, setDoc, doc } from '@angular/fire/firestore';

export interface User {
  uid?: string;
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

  constructor(private firestore: Firestore) {
    const auth = getAuth();

    // Ouve as mudanças no estado de autenticação
    onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Você pode buscar dados reais do Firestore aqui, se quiser
        // Por enquanto, defino role e name com base no email, igual no login
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          role: firebaseUser.email === 'profissional@default.com' ? 'profissional' : 'cliente',
          name: firebaseUser.email === 'profissional@default.com' ? 'Profissional Teste' : 'Cliente Teste'
        };
        this.userSubject.next(user);
      } else {
        this.userSubject.next(null);
      }
    });
  }

  async login(email: string, password: string): Promise<boolean> {
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Usuário será definido automaticamente no onAuthStateChanged
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  }

  async signup(email: string, password: string, name: string, role: 'cliente' | 'profissional'): Promise<boolean> {
    const auth = getAuth();
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: User = {
        uid: userCredential.user.uid,
        email,
        role,
        name
      };

      await setDoc(doc(this.firestore, 'users', newUser.uid!), newUser);
      this.userSubject.next(newUser);
      return true;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return false;
    }
  }

  logout(): void {
    const auth = getAuth();
    auth.signOut();
    this.userSubject.next(null);
  }
}
