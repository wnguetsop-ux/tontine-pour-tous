"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  signInWithCustomToken,
  signInAnonymously
} from 'firebase/auth';

// ==========================================
// CONFIGURATION FIREBASE DYNAMIQUE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyD1uU27aXfdcVaRWAxmj8Md-fQld7E48Dc",
  authDomain: "tontine-pour-tous.firebaseapp.com",
  projectId: "tontine-pour-tous",
  storageBucket: "tontine-pour-tous.firebasestorage.app",
  messagingSenderId: "49437145671",
  appId: "1:49437145671:web:bda8e0747ec16283600f62",
  measurementId: "G-VCQB93KYZB"
};

const NJANGI_APP_ID = typeof __app_id !== 'undefined' ? __app_id : "tontine_pour_tous_v1";
const ADMIN_EMAIL = "wnguetsop@gmail.com";
const WHATSAPP_SUPPORT = "00393299639430";
const MOMO_NUMBER = "00237674095062"; 

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'members', label: 'Membres', icon: 'members' },
  { id: 'finances', label: 'Finances', icon: 'cotisations' },
  { id: 'reports', label: 'Rapports', icon: 'fileText' },
  { id: 'prets', label: 'Prêts', icon: 'prets' },
  { id: 'rotations', label: 'Rotations', icon: 'share' },
  { id: 'fonds', label: 'Caisse', icon: 'fonds' },
];

// ==========================================
// UTILITAIRES
// ==========================================

const formatCurrency = (amount, currency) => {
  const safeAmount = typeof amount === 'number' ? amount : 0;
  const c = String(currency || 'FCFA');
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: c === 'FCFA' ? 'XAF' : c,
    currencyDisplay: 'symbol'
  }).format(safeAmount).replace('XAF', 'FCFA');
};

const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    members: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    cotisations: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    fonds: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />,
    prets: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    settings: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    logout: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
    menu: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />,
    close: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />,
    fileText: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    share: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />,
    edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
    bell: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    filter: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />,
    dots: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />,
    shield: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    home: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  };
  return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>{icons[name] || null}</svg>;
};

// ==========================================
// COMPOSANTS UI ATOMIQUES
// ==========================================

const ActionButton = ({ onClick, label, className = "", icon }) => {
  const [loading, setLoading] = useState(false);
  const handleAction = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try { 
      await onClick(); 
    } catch (err) {
      console.error("Action error:", err);
    } finally { 
      setLoading(false); 
    }
  };
  return (
    <button onClick={handleAction} disabled={loading} className={`relative flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-80 overflow-hidden cursor-pointer ${className}`}>
      {!loading ? (
          <span className="flex items-center gap-2 animate-in fade-in">{icon && <Icon name={icon} className="w-4 h-4" />} {String(label)}</span>
      ) : (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      )}
    </button>
  );
};

const ConfirmModal = ({ isOpen, title, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative w-full max-w-xs bg-white rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><Icon name="trash" className="w-8 h-8" /></div>
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-2">Confirmation</h3>
        <p className="text-xs text-slate-500 mb-8 px-2 leading-relaxed">{String(title)}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-4 bg-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-500 active:scale-95 transition-all">Annuler</button>
          <button onClick={onConfirm} className="flex-1 py-4 bg-rose-500 rounded-2xl text-[10px] font-black uppercase text-white active:scale-95 transition-all shadow-lg">Supprimer</button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [rotations, setRotations] = useState([]);
  const [currency, setCurrency] = useState('FCFA');
  const [isLoading, setIsLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState({ memberId: '', date: '' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMeetingDate, setActiveMeetingDate] = useState("");
  const [authStatusMessage, setAuthStatusMessage] = useState({ text: "", type: "" });
  
  const [confirmState, setConfirmState] = useState({ 
    isOpen: false, 
    title: '', 
    onConfirm: async () => {} 
  });

  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');

  // Détermination des permissions basées uniquement sur le profil utilisateur
  const isVisionOnly = profile?.role === 'member';
  const dataOwnerId = profile?.role === 'member' ? (profile.presidentId || '') : (profile?.uid || '');
  
  const isPremium = profile?.status === 'pro';
  const themeGradient = isPremium ? 'from-amber-500 to-amber-600' : 'from-indigo-600 to-indigo-800';

  // ACTIONS
  const handleLogout = async () => { await signOut(auth); setCurrentPage('dashboard'); setIsMobileMenuOpen(false); };
  
  const handleAddMember = async (name) => { 
    if (isVisionOnly || !user?.uid) return; 
    try {
      await addDoc(collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'members'), { 
        name, 
        joinDate: new Date().toISOString().split('T')[0], 
        presidentId: user.uid 
      }); 
    } catch (e) {
      console.error("Erreur lors de l'ajout du membre:", e);
      throw e;
    }
  };
  
  const handleUpdateMember = async (id, newName) => { if (isVisionOnly) return; await updateDoc(doc(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'members', id), { name: newName }); };
  
  const handleDelete = (coll, id) => { 
    if (isVisionOnly) return; 
    setConfirmState({
      isOpen: true,
      title: "Supprimer définitivement cet élément ?",
      onConfirm: async () => {
         try { 
           await deleteDoc(doc(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', coll, id)); 
           setConfirmState(prev => ({ ...prev, isOpen: false, title: '', onConfirm: async () => {} }));
         } catch (e) { console.error(e); }
      }
    });
  };

  const handleAddTransaction = async (mId, amt, type, method = 'cash') => { 
    if (isVisionOnly || !dataOwnerId || !activeMeetingDate) return; 
    await addDoc(collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'transactions'), { 
      memberId: mId, 
      amount: amt, 
      type, 
      method, 
      status: method === 'cash' ? 'completed' : 'pending', 
      date: activeMeetingDate,
      presidentId: dataOwnerId 
    }); 
  };

  const handleUpdateTransaction = async (id, newAmt) => { if (isVisionOnly) return; await updateDoc(doc(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'transactions', id), { amount: newAmt }); };
  
  const handleAddLoan = async (loanData) => { 
    if (isVisionOnly || !dataOwnerId || !activeMeetingDate) return; 
    await addDoc(collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'loans'), { 
      ...loanData, 
      startDate: activeMeetingDate,
      presidentId: dataOwnerId 
    }); 
    await handleAddTransaction(loanData.memberId, -loanData.principal, 'fonds', 'cash'); 
  };

  const handleAddRotation = async (beneficiaryId, hostId, date) => {
    if (isVisionOnly || !dataOwnerId || !date) return;
    await addDoc(collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'rotations'), {
      date: date,
      beneficiaryMemberId: beneficiaryId,
      hostMemberId: hostId,
      presidentId: dataOwnerId
    });
  };
  
  const handleRequestPro = async () => { if (user) await updateDoc(doc(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'users', user.uid), { status: 'pending', requestDate: new Date().toISOString() }); };
  const handleApprovePro = async (uid, expiry) => { if (user?.email === ADMIN_EMAIL) await updateDoc(doc(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'users', uid), { status: 'pro', expiryDate: expiry }); };
  const handleCancelPro = async (uid) => { if (user?.email === ADMIN_EMAIL) await updateDoc(doc(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'users', uid), { status: 'none', expiryDate: null }); };
  
  const handleAdminDeleteUser = (uid) => { 
    if (user?.email !== ADMIN_EMAIL) return; 
    setConfirmState({ isOpen: true, title: "Supprimer ce client ?", onConfirm: async () => { try { await deleteDoc(doc(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'users', uid)); setConfirmState(prev => ({ ...prev, isOpen: false })); } catch (e) { console.error(e); } } });
  };
  
  const handleResetPassword = async () => {
    if (!authForm.email) {
      setAuthStatusMessage({ text: "Entrez votre email d'abord", type: "error" });
      return;
    }
    try { 
      await sendPasswordResetEmail(auth, authForm.email); 
      setAuthStatusMessage({ text: "Email de récupération envoyé !", type: "success" });
    } catch (e) { 
      setAuthStatusMessage({ text: "Erreur lors de l'envoi", type: "error" });
    }
  };

  // AUTH HOOK
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth init error:", e);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDocRef = doc(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'users', firebaseUser.uid);
        onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) setProfile(snap.data());
          else {
            const newProfile = { uid: firebaseUser.uid, email: firebaseUser.email || 'Anonyme', status: 'none', role: 'president' };
            setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        });
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // FIRESTORE SYNC
  useEffect(() => {
    if (!user || !dataOwnerId) return;
    const paths = {
      members: collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'members'),
      transactions: collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'transactions'),
      loans: collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'loans'),
      rotations: collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'rotations'),
      users: collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'users')
    };
    
    const unsubMembers = onSnapshot(paths.members, (snap) => setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(m => m.presidentId === dataOwnerId)), (e) => console.error(e));
    const unsubTransactions = onSnapshot(paths.transactions, (snap) => setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => t.presidentId === dataOwnerId)), (e) => console.error(e));
    const unsubLoans = onSnapshot(paths.loans, (snap) => setLoans(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(l => l.presidentId === dataOwnerId)), (e) => console.error(e));
    const unsubRotations = onSnapshot(paths.rotations, (snap) => setRotations(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.presidentId === dataOwnerId)), (e) => console.error(e));
    const unsubUsers = onSnapshot(paths.users, (snap) => setAllUsers(snap.docs.map(d => d.data())), (e) => console.error(e));

    return () => { unsubMembers(); unsubTransactions(); unsubLoans(); unsubRotations(); unsubUsers(); };
  }, [user, dataOwnerId]);

  // STATS
  const filteredTransactions = useMemo(() => {
    if (!activeMeetingDate) return [];
    return transactions.filter(t => t.date === activeMeetingDate);
  }, [transactions, activeMeetingDate]);

  const completedTrans = useMemo(() => filteredTransactions.filter(t => t.status === 'completed'), [filteredTransactions]);
  
  const stats = useMemo(() => ({
    cotisations: completedTrans.filter(t => t.type === 'cotisation').reduce((sum, t) => sum + t.amount, 0),
    epargne: completedTrans.filter(t => t.type === 'epargne').reduce((sum, t) => sum + t.amount, 0),
    fonds: completedTrans.filter(t => t.type === 'fonds').reduce((sum, t) => sum + t.amount, 0),
    totalCash: completedTrans.reduce((sum, t) => sum + t.amount, 0),
    prets: loans.filter(l => l.startDate === activeMeetingDate).reduce((sum, t) => sum + (t.totalAmount || 0), 0),
  }), [completedTrans, loans, activeMeetingDate]);

  const selectedBalanceValue = useMemo(() => {
    if (!globalFilter.memberId) return null;
    const relevantTrans = transactions.filter(t => t.status === 'completed' && t.memberId === globalFilter.memberId && t.type === 'fonds');
    return relevantTrans.reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, globalFilter.memberId]);

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-indigo-600 animate-pulse uppercase tracking-[0.4em]">Initialisation...</div>;

  if (!user) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-slate-800 text-center">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100 animate-in fade-in">
          <div className="mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg"><Icon name="dashboard" /></div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-800">Tontine pour tous</h1>
          </div>
          <div className="space-y-4">
             <input type="email" placeholder="Email" className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none text-slate-900 shadow-inner" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
             <input type="password" placeholder="Mot de passe" className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none text-slate-900 shadow-inner" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
             
             {authStatusMessage.text && (
               <p className={`text-[10px] font-black p-3 rounded-xl ${authStatusMessage.type === 'error' ? 'text-rose-500 bg-rose-50' : 'text-emerald-600 bg-emerald-50'}`}>
                 {authStatusMessage.text}
               </p>
             )}
             
             {authError && <p className="text-[10px] font-black text-rose-500 bg-rose-50 p-2 rounded-lg">{String(authError)}</p>}
             <ActionButton onClick={async () => { setAuthError(''); setAuthStatusMessage({text:"", type:""}); try { if (authMode === 'login') await signInWithEmailAndPassword(auth, authForm.email, authForm.password); else await createUserWithEmailAndPassword(auth, authForm.email, authForm.password); } catch (e) { setAuthError(e.code === 'auth/invalid-credential' ? 'Identifiants incorrects' : 'Erreur auth'); } }} label={authMode === 'login' ? 'Connexion' : 'Inscription'} className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black uppercase shadow-xl" />
          </div>
          <div className="mt-6 flex flex-col gap-3">
             <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{authMode === 'login' ? "Nouveau ? Créer un compte" : "Déjà membre ? Connexion"}</button>
             <button onClick={handleResetPassword} className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition-colors cursor-pointer">Mot de passe oublié ?</button>
          </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased overflow-hidden flex-col lg:flex-row">
      <ConfirmModal isOpen={confirmState.isOpen} title={confirmState.title} onConfirm={confirmState.onConfirm} onCancel={() => setConfirmState({...confirmState, isOpen: false})} />

      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 shrink-0">
        <div className="p-8 flex items-center gap-2 mb-8"><div className={`p-2 rounded-xl shadow-lg text-white ${isPremium ? 'bg-amber-500' : 'bg-indigo-600'}`}><Icon name="dashboard" /></div><span className="text-xl font-black text-slate-800 uppercase leading-none">Tontine<br/><span className={`${isPremium ? 'text-amber-500' : 'text-indigo-600'} text-[10px]`}>pour tous</span></span></div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">{NAV_ITEMS.map((item) => (<button key={item.id} onClick={() => setCurrentPage(item.id)} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === item.id ? 'bg-slate-50 text-indigo-700 border border-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}><div className={`p-1.5 rounded-lg transition-colors ${currentPage === item.id ? (isPremium ? 'bg-amber-500' : 'bg-indigo-600') : 'bg-slate-50'}`}><Icon name={item.icon} className={`w-3.5 h-3.5 ${currentPage === item.id ? 'text-white' : 'text-slate-400'}`} /></div><span className="truncate">{item.label}</span></button>))}</nav>
        <div className="p-6 border-t border-slate-50">
          <button onClick={() => setCurrentPage('settings')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[10px] font-black uppercase ${currentPage === 'settings' ? 'bg-slate-50 text-indigo-600' : 'text-slate-400'}`}><Icon name="settings" /> <span>Paramètres</span></button>
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50 transition-all"><Icon name="logout" /> <span>Quitter</span></button>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        <header className="h-14 bg-white/80 backdrop-blur-lg border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 shrink-0 z-20">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 bg-slate-50 text-slate-600 rounded-xl border border-slate-200 shadow-sm"><Icon name="menu" /></button>
              <div className="flex flex-col">
                <h1 className={`lg:hidden text-[11px] font-black ${isPremium ? 'text-amber-500' : 'text-indigo-600'} uppercase tracking-tighter leading-none mb-0.5`}>Tontine pour tous</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${isVisionOnly ? 'bg-amber-400' : isPremium ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                  <span className="text-[8px] font-black uppercase text-slate-500">{String(currentPage)}</span>
                </div>
              </div>
            </div>
            {activeMeetingDate && (
              <div className="hidden sm:flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                <Icon name="calendar" className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[9px] font-black text-indigo-600 uppercase">Réunion : {activeMeetingDate}</span>
              </div>
            )}
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-lg border-2 border-white">{user?.email?.charAt(0).toUpperCase()}</div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 lg:p-10 bg-[#FBFDFF] scroll-smooth pb-24">
            <div className="max-w-6xl mx-auto space-y-4 lg:space-y-8">
               {currentPage === 'dashboard' && <DashboardView stats={stats} members={members} currency={currency} isVisionOnly={isVisionOnly} onAddMember={handleAddMember} onAddTransaction={handleAddTransaction} themeGradient={themeGradient} activeMeetingDate={activeMeetingDate} setActiveMeetingDate={setActiveMeetingDate} />}
               {currentPage === 'members' && <MembersView members={members} activeMeetingDate={activeMeetingDate} transactions={transactions} loans={loans} rotations={rotations} currency={currency} onDelete={handleDelete} isVisionOnly={isVisionOnly} onUpdate={handleUpdateMember} />}
               {currentPage === 'reports' && <ReportsView members={members} transactions={transactions} rotations={rotations} loans={loans} currency={currency} themeGradient={themeGradient} defaultDate={activeMeetingDate} />}
               {currentPage === 'finances' && <FinancesView transactions={filteredTransactions} allTransactions={transactions} members={members} currency={currency} onDelete={handleDelete} onUpdate={handleUpdateTransaction} isVisionOnly={isVisionOnly} activeMeetingDate={activeMeetingDate} />}
               {currentPage === 'rotations' && <RotationsView members={members} rotations={rotations} activeMeetingDate={activeMeetingDate} onAddRotation={handleAddRotation} onDelete={handleDelete} isVisionOnly={isVisionOnly} />}
               {currentPage === 'fonds' && (
                <div className="space-y-4">
                   <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center animate-in fade-in text-slate-800">
                     <Icon name="filter" className="w-4 h-4 text-slate-400" />
                     <select value={globalFilter.memberId} onChange={(e) => setGlobalFilter({...globalFilter, memberId: e.target.value})} className="flex-1 p-2 bg-slate-50 border-none rounded-xl text-[10px] font-bold outline-none text-slate-800"><option value="">Tous les membres</option>{members.map(m => <option key={m.id} value={String(m.id)}>{String(m.name)}</option>)}</select>
                     {selectedBalanceValue !== null && (<div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase">Solde: {formatCurrency(selectedBalanceValue, currency)}</div>)}
                     <button onClick={() => setGlobalFilter({memberId: '', date: ''})} className="text-[9px] font-black text-rose-500 uppercase">Reset</button>
                   </div>
                   <GenericHistory title={`Caisse - Réunion ${activeMeetingDate || 'Globale'}`} transactions={activeMeetingDate ? filteredTransactions.filter(t => t.type === 'fonds' && (!globalFilter.memberId || t.memberId === globalFilter.memberId)) : transactions.filter(t => t.type === 'fonds')} members={members} currency={currency} onDelete={handleDelete} onUpdate={handleUpdateTransaction} isVisionOnly={isVisionOnly} />
                </div>
               )}
               {currentPage === 'prets' && <LoansView loans={activeMeetingDate ? loans.filter(l => l.startDate === activeMeetingDate) : loans} members={members} currency={currency} onAdd={handleAddLoan} onDelete={handleDelete} isVisionOnly={isVisionOnly} themeGradient={themeGradient} activeMeetingDate={activeMeetingDate} />}
               {currentPage === 'settings' && <SettingsView currency={currency} setCurrency={setCurrency} profile={profile} onUpgrade={handleRequestPro} isAdmin={user?.email === ADMIN_EMAIL} allUsers={allUsers} onApprove={handleApprovePro} onCancel={handleCancelPro} onAdminDelete={handleAdminDeleteUser} isVisionOnly={isVisionOnly} />}
            </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 flex justify-around items-center p-2 shadow-2xl">
            {[ { id: 'dashboard', icon: 'dashboard', label: 'Home' }, { id: 'members', icon: 'members', label: 'Membres' }, { id: 'finances', icon: 'cotisations', label: 'Finances' }, { id: 'reports', icon: 'fileText', label: 'Rapport' }, { id: 'menu', icon: 'dots', label: 'Plus' } ].map((tab) => (
              <button key={tab.id} onClick={() => tab.id === 'menu' ? setIsMobileMenuOpen(true) : setCurrentPage(tab.id)} className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all active:scale-90 ${currentPage === tab.id ? (isPremium ? 'text-amber-500' : 'text-indigo-600') : 'text-slate-400'}`}>
                 <Icon name={tab.icon} className="w-6 h-6" />
                 <span className="text-[8px] font-bold uppercase">{String(tab.label)}</span>
              </button>
            ))}
        </div>
      </main>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[3rem] shadow-2xl flex flex-col p-8 pb-12 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8"><h2 className="text-xl font-black uppercase">Options</h2><button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-600"><Icon name="close" /></button></div>
            <div className="grid grid-cols-2 gap-4">
              {NAV_ITEMS.concat([{ id: 'settings', label: 'Paramètres', icon: 'settings' }]).map(item => (
                <button key={item.id} onClick={() => { setCurrentPage(item.id); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 p-4 rounded-[1.5rem] border transition-all ${currentPage === item.id ? 'bg-indigo-50 border-indigo-100 text-indigo-700 font-black' : 'bg-slate-50 border-slate-50 text-slate-600'}`}><Icon name={item.icon} className="w-5 h-5" /><span className="text-[10px] font-black uppercase">{String(item.label)}</span></button>
              ))}
            </div>
            <button onClick={handleLogout} className="mt-8 p-5 bg-rose-50 text-rose-500 rounded-3xl text-[11px] font-black uppercase flex items-center justify-center gap-4 active:scale-95 transition-all"><Icon name="logout" /> Déconnexion</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SOUS-COMPOSANTS DE VUE
// ==========================================

const DashboardView = ({ stats, members, currency, isVisionOnly, onAddMember, onAddTransaction, themeGradient, activeMeetingDate, setActiveMeetingDate }) => {
  const [op, setOp] = useState({ mId: '', amt: '', type: 'cotisation', dir: 'in', method: 'cash' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <div className="space-y-4 lg:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="bg-white p-6 rounded-[2rem] border-2 border-indigo-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Icon name="calendar" /></div>
          <div>
            <h2 className="text-sm font-black uppercase text-slate-800">Date de Réunion Active</h2>
            <p className="text-[10px] text-slate-400 font-medium">Sélectionnez la réunion pour synchroniser toutes les pages.</p>
          </div>
        </div>
        <input type="date" value={activeMeetingDate || ""} onChange={(e) => setActiveMeetingDate(e.target.value)} className="md:w-64 p-4 bg-slate-50 border-none rounded-2xl font-black text-sm outline-none text-indigo-600 shadow-inner" />
      </div>

      {!activeMeetingDate ? (
        <div className="bg-amber-50 p-10 rounded-[3rem] border-2 border-dashed border-amber-200 text-center animate-pulse">
            <Icon name="bell" className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase text-amber-700">Aucune réunion active</h3>
            <p className="text-xs text-amber-600 max-w-sm mx-auto mt-2">Sélectionnez une date ci-dessus pour activer les fonctionnalités.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
              {!isVisionOnly && (
                <div onClick={() => { setShowAddModal(true); setIsConfirming(false); }} className={`cursor-pointer bg-gradient-to-br ${themeGradient} p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] shadow-xl text-white relative overflow-hidden group border-4 border-white/20 active:scale-95 transition-all`}>
                  <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Gestion</p>
                  <h3 className="text-base lg:text-xl font-black">Inscrire Membre</h3>
                  <div className="absolute -bottom-2 -right-2 opacity-20 group-hover:scale-110"><Icon name="plus" className="w-16 h-16 lg:w-20 lg:h-20" /></div>
                </div>
              )}
              
              <div className="bg-white p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between overflow-hidden min-h-[110px]">
                <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Cotisations Séance</p>
                <h3 className="text-base lg:text-lg font-black text-indigo-600 truncate">
                  {formatCurrency(stats?.cotisations || 0, currency)}
                </h3>
              </div>
              
              <div className="bg-white p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between overflow-hidden min-h-[110px]">
                <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Caisse Sociale</p>
                <h3 className="text-base lg:text-lg font-black text-emerald-600 truncate">
                  {formatCurrency(stats?.fonds || 0, currency)}
                </h3>
              </div>
              
              <div className="bg-white p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between overflow-hidden min-h-[110px]">
                <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Épargne Séance</p>
                <h3 className="text-base lg:text-lg font-black text-sky-600 truncate">
                  {formatCurrency(stats?.epargne || 0, currency)}
                </h3>
              </div>
          </div>

          {!isVisionOnly && (
            <div className="bg-white p-5 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-slate-100 shadow-sm animate-in fade-in">
              <h3 className="text-[11px] font-black uppercase mb-4 flex items-center gap-3 text-slate-700"><div className="w-1 h-4 bg-indigo-600 rounded-full" /> Enregistrer un Mouvement ({activeMeetingDate})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
                  <select value={op.mId} onChange={(e)=>setOp({...op, mId:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none shadow-inner text-slate-800"><option value="">Choisir Membre...</option>{members.map((m)=><option key={m.id} value={String(m.id)}>{String(m.name)}</option>)}</select>
                  <select value={op.type} onChange={(e)=>setOp({...op, type:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none shadow-inner text-slate-800"><option value="cotisation">Cotisation</option><option value="epargne">Épargne</option><option value="fonds">Caisse Sociale</option></select>
                  <select value={op.method} onChange={(e)=>setOp({...op, method:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none shadow-inner text-slate-800"><option value="cash">Espèces</option><option value="momo">Momo (Attente)</option><option value="wave">Wave (Attente)</option></select>
                  <div className="md:col-span-2 lg:col-span-3 flex bg-slate-100 rounded-2xl p-1">
                    <button onClick={()=>setOp({...op,dir:'in'})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase ${op.dir==='in'?'bg-white shadow text-indigo-600':'text-slate-400'}`}>Dépôt</button>
                    <button onClick={()=>setOp({...op,dir:'out'})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase ${op.dir==='out'?'bg-white shadow text-rose-600':'text-slate-400'}`}>Retrait</button>
                  </div>
                  <input type="number" value={op.amt} onChange={(e)=>setOp({...op,amt:e.target.value})} className="md:col-span-2 lg:col-span-3 p-4 bg-slate-50 rounded-2xl font-black text-2xl text-center outline-none border border-slate-100 shadow-inner text-slate-900" placeholder="0.00" />
                  <ActionButton onClick={async () => { if(!op.mId||!op.amt) return; await onAddTransaction(op.mId,op.dir==='in'?Number(op.amt):-Number(op.amt),op.type, op.method); setOp({...op,amt:''}); }} label="Valider" className="md:col-span-2 lg:col-span-3 bg-slate-900 text-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl font-black text-xs uppercase" />
              </div>
            </div>
          )}
        </>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in zoom-in-95">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => { if(!isConfirming) setShowAddModal(false); }}></div>
            <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
               <h2 className="text-xl font-black uppercase mb-6 text-slate-800">
                {isConfirming ? "Confirmer Inscription" : "Nouveau Membre"}
               </h2>

               {!isConfirming ? (
                 <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <input 
                      type="text" 
                      placeholder="Nom complet..." 
                      value={nameInput} 
                      onChange={e=>setNameInput(e.target.value)} 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold mb-4 outline-none shadow-inner text-slate-900" 
                    />
                    <div className="flex gap-3">
                      <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase transition-all active:scale-95">Annuler</button>
                      <button 
                        onClick={() => { if(nameInput.trim()) setIsConfirming(true); }} 
                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-indigo-100 transition-all active:scale-95"
                      >
                        Enregistrer
                      </button>
                    </div>
                 </div>
               ) : (
                 <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <p className="text-[11px] text-slate-500 mb-8 leading-relaxed">
                      Voulez-vous vraiment enregistrer le membre <strong className="text-indigo-600">{nameInput}</strong> ?
                    </p>
                    <div className="flex gap-3">
                      <button onClick={() => setIsConfirming(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase transition-all active:scale-95">Retour</button>
                      <ActionButton 
                        onClick={async () => { 
                          try {
                            await onAddMember(nameInput.trim()); 
                            setNameInput(''); 
                            setIsConfirming(false);
                            setShowAddModal(false); 
                          } catch (e) {
                            console.error("Failed to add member:", e);
                          }
                        }} 
                        label="Confirmer" 
                        className="flex-1 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-emerald-100" 
                      />
                    </div>
                 </div>
               )}
            </div>
        </div>
      )}
    </div>
  );
};

const FinancesView = ({ transactions, allTransactions, members, currency, onDelete, onUpdate, isVisionOnly, activeMeetingDate }) => {
  const [showHistory, setShowHistory] = useState(false);
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
        <h2 className="text-xs font-black uppercase text-slate-500 text-slate-500">{showHistory ? "Tout l'historique" : `Données du ${activeMeetingDate || '?'}`}</h2>
        <button onClick={() => setShowHistory(!showHistory)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${showHistory ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{showHistory ? "Mode Séance" : "Voir Historique"}</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
            <div className="flex items-center gap-3 px-2"><div className="w-2 h-6 bg-indigo-500 rounded-full" /><h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Cotisations</h2></div>
            <GenericHistory title="" transactions={(showHistory ? (allTransactions || []) : (transactions || [])).filter((t) => t.type === 'cotisation')} members={members} currency={currency} onDelete={onDelete} onUpdate={onUpdate} isVisionOnly={isVisionOnly} />
        </div>
        <div className="space-y-4">
            <div className="flex items-center gap-3 px-2"><div className="w-2 h-6 bg-sky-500 rounded-full" /><h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Épargne</h2></div>
            <GenericHistory title="" transactions={(showHistory ? (allTransactions || []) : (transactions || [])).filter((t) => t.type === 'epargne')} members={members} currency={currency} onDelete={onDelete} onUpdate={onUpdate} isVisionOnly={isVisionOnly} />
        </div>
      </div>
    </div>
  );
};

const ReportsView = ({ members, transactions, rotations, loans, currency, themeGradient, defaultDate }) => {
  const [reportDate, setReportDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { if (defaultDate) setReportDate(defaultDate); }, [defaultDate]);

  const sessionData = useMemo(() => {
    const d = String(reportDate || "");
    const trans = (transactions || []).filter((t) => String(t.date) === d && t.status === 'completed');
    const rot = (rotations || []).find((r) => String(r.date) === d);
    const sLoans = (loans || []).filter((l) => String(l.startDate) === d);
    
    return {
      date: d,
      beneficiary: members.find((m) => m.id === rot?.beneficiaryMemberId)?.name || 'Non défini',
      host: members.find((m) => m.id === rot?.hostMemberId)?.name || 'Non défini',
      membersList: (members || []).map((m) => {
        const mTrans = trans.filter((t) => t.memberId === m.id);
        const mLoan = sLoans.find((l) => l.memberId === m.id);
        return {
          name: m.name,
          cotis: mTrans.filter((t) => t.type === 'cotisation').reduce((s, t) => s + t.amount, 0),
          epargne: mTrans.filter((t) => t.type === 'epargne').reduce((s, t) => s + t.amount, 0),
          caisse: mTrans.filter((t) => t.type === 'fonds').reduce((s, t) => s + t.amount, 0), 
          pret: mLoan?.principal || 0
        };
      }),
      totals: {
        cotis: trans.filter((t) => t.type === 'cotisation').reduce((s, t) => s + t.amount, 0),
        epargne: trans.filter((t) => t.type === 'epargne').reduce((s, t) => s + t.amount, 0),
        caisse: trans.filter((t) => t.type === 'fonds').reduce((s, t) => s + t.amount, 0),
        prets: sLoans.reduce((s, l) => s + l.principal, 0)
      }
    };
  }, [reportDate, transactions, rotations, loans, members]);

  return (
    <div className="space-y-6 text-slate-800">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
         <h2 className="text-xl font-black uppercase mb-6 text-slate-800">Générer un rapport</h2>
         <div className="flex flex-col sm:flex-row gap-4 text-slate-800">
            <input type="date" value={reportDate || ""} onChange={e=>setReportDate(e.target.value)} className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm outline-none text-indigo-600 shadow-inner" />
            <button onClick={() => setShowPreview(true)} className={`px-8 py-4 bg-gradient-to-br ${themeGradient} text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-indigo-100 transition-all active:scale-95`}>Voir le rapport</button>
         </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={()=>setShowPreview(false)}></div>
           <div className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-10 border-b border-slate-100 pb-8">
                 <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-800 mb-2">Compte Rendu Financier</h1>
                 <p className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-1 rounded-full w-fit mx-auto uppercase">Séance du {String(sessionData.date)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-10 text-center">
                 <div className="bg-emerald-50 p-4 rounded-3xl"><p className="text-[9px] font-black uppercase text-emerald-400 mb-1 text-emerald-400">Bénéficiaire</p><p className="text-sm font-black text-emerald-600">{String(sessionData.beneficiary)}</p></div>
                 <div className="bg-indigo-50 p-4 rounded-3xl"><p className="text-[9px] font-black uppercase text-indigo-400 mb-1 text-indigo-400">Hôte (Réception)</p><p className="text-sm font-black text-indigo-600">{String(sessionData.host)}</p></div>
              </div>
              <div className="overflow-x-auto mb-10">
                 <table className="w-full text-left text-[11px] text-slate-800">
                   <thead>
                     <tr className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 text-slate-400">
                       <th className="px-4 py-3 text-slate-800">Membre</th>
                       <th className="px-4 py-3 text-slate-800">Cotisation</th>
                       <th className="px-4 py-3 text-sky-600">Épargne</th>
                       <th className="px-4 py-3 text-emerald-600">Fond de caisse</th>
                       <th className="px-4 py-3 text-rose-500">Prêt</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 text-slate-800">
                     {sessionData.membersList.map((m, i) => {
                       return (
                         <tr key={i} className="hover:bg-slate-50">
                           <td className="px-4 py-4 font-bold text-slate-700">{String(m.name)}</td>
                           <td className="px-4 py-4 font-black">{formatCurrency(m.cotis, currency)}</td>
                           <td className="px-4 py-4 font-black text-sky-600">{formatCurrency(m.epargne, currency)}</td>
                           <td className={`px-4 py-4 font-black ${m.caisse >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(m.caisse, currency)}</td>
                           <td className="px-4 py-4 font-black text-rose-500">{formatCurrency(m.pret, currency)}</td>
                         </tr>
                       );
                     })}
                   </tbody>
                   <tfoot className="bg-slate-900 text-white font-black">
                     <tr>
                       <td className="px-4 py-4 uppercase">Totaux de séance</td>
                       <td className="px-4 py-4">{formatCurrency(sessionData.totals.cotis, currency)}</td>
                       <td className="px-4 py-4">{formatCurrency(sessionData.totals.epargne, currency)}</td>
                       <td className="px-4 py-4 text-emerald-400">{formatCurrency(sessionData.totals.caisse, currency)}</td>
                       <td className="px-4 py-4 text-rose-400">{formatCurrency(sessionData.totals.prets, currency)}</td>
                     </tr>
                   </tfoot>
                 </table>
              </div>
              <div className="flex gap-4">
                 <button onClick={()=>window.print()} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl">Imprimer en PDF</button>
                 <button onClick={()=>setShowPreview(false)} className="px-8 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase">Fermer</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const RotationsView = ({ members, rotations, activeMeetingDate, onAddRotation, onDelete, isVisionOnly }) => {
  const [beneficiary, setBeneficiary] = useState("");
  const [host, setHost] = useState("");
  const [customDate, setCustomDate] = useState("");

  const sortedRotations = useMemo(() => {
    return [...rotations].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [rotations]);

  return (
    <div className="space-y-6">
      {!isVisionOnly && (
        <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm animate-in zoom-in-95">
           <h2 className="text-sm font-black uppercase text-slate-700 mb-6 tracking-widest flex items-center gap-2 text-slate-700">
             <Icon name="calendar" className="w-4 h-4 text-indigo-600" /> Programmer une séance (Long terme)
           </h2>
           <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-800 text-slate-800">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1 text-slate-400">Date de la séance</label>
                  <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none text-indigo-600" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1 text-slate-400">Bénéficiaire (Preneur)</label>
                  <select value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none text-slate-800 text-slate-800">
                    <option value="">Sélectionner...</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1 text-slate-400">Membre Hôte (Réception)</label>
                  <select value={host} onChange={(e) => setHost(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none text-slate-800 text-slate-800">
                    <option value="">Sélectionner...</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <ActionButton onClick={async () => { if(!beneficiary || !host || !customDate) return; await onAddRotation(beneficiary, host, customDate); setBeneficiary(""); setHost(""); setCustomDate(""); }} label="Ajouter au calendrier" className="w-full bg-indigo-600 text-white p-5 rounded-3xl font-black text-[10px] uppercase shadow-xl" />
           </div>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden text-slate-800 text-slate-800">
        <div className="p-5 bg-slate-50 border-b border-slate-100 text-slate-500 text-slate-500">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Calendrier des rotations programmées</h3>
        </div>
        <div className="overflow-x-auto text-slate-800 text-slate-800">
          <table className="w-full text-left text-[11px] text-slate-800 text-slate-800">
            <thead>
              <tr className="bg-slate-50/50 text-[8px] font-black uppercase text-slate-400 text-slate-400">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Bénéficiaire</th>
                <th className="px-6 py-3">Hôte</th>
                {!isVisionOnly && <th className="px-6 py-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-800 text-slate-800">
              {sortedRotations.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-slate-300 italic text-slate-300">Aucune séance programmée pour le moment.</td></tr>
              ) : (
                sortedRotations.map(rot => (
                  <tr key={rot.id} className={`hover:bg-slate-50 transition-colors ${rot.date === activeMeetingDate ? 'bg-indigo-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <span className={`w-2 h-2 rounded-full ${rot.date === activeMeetingDate ? 'bg-indigo-500 animate-pulse' : 'bg-slate-200'}`}></span>
                        <p className="font-bold text-slate-600">{rot.date}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-600 uppercase text-emerald-600">
                      {members.find(m => m.id === rot.beneficiaryMemberId)?.name}
                    </td>
                    <td className="px-6 py-4 font-black text-indigo-600 uppercase text-indigo-600">
                      {members.find(m => m.id === rot.hostMemberId)?.name}
                    </td>
                    {!isVisionOnly && (
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => onDelete('rotations', rot.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors text-slate-300 hover:text-rose-500">
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MembersView = ({ members, activeMeetingDate, transactions, loans, rotations, currency, onDelete, isVisionOnly, onUpdate }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  
  const editMember = (id, cn) => { const n = prompt("Nouveau nom :", cn); if (n && n.trim()) onUpdate(id, n.trim()); };

  const memberReport = useMemo(() => {
    if (!selectedMember || !activeMeetingDate) return null;
    const mId = selectedMember.id;
    const mTrans = transactions.filter(t => t.memberId === mId && t.date === activeMeetingDate && t.status === 'completed');
    const mLoan = loans.find(l => l.memberId === mId && l.startDate === activeMeetingDate);
    const mRotation = rotations.find(r => r.date === activeMeetingDate && (r.beneficiaryMemberId === mId || r.hostMemberId === mId));

    return {
      name: selectedMember.name,
      cotis: mTrans.filter(t => t.type === 'cotisation').reduce((s, t) => s + t.amount, 0),
      epargne: mTrans.filter(t => t.type === 'epargne').reduce((s, t) => s + t.amount, 0),
      fonds: mTrans.filter(t => t.type === 'fonds').reduce((s, t) => s + t.amount, 0),
      loan: mLoan?.principal || 0,
      isBeneficiary: mRotation?.beneficiaryMemberId === mId,
      isHost: mRotation?.hostMemberId === mId
    };
  }, [selectedMember, activeMeetingDate, transactions, loans, rotations]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 lg:gap-6 animate-in fade-in">
        {(members || []).map((m) => (
          <div key={m.id} onClick={() => setSelectedMember(m)} className="cursor-pointer bg-white p-4 rounded-[1.5rem] border border-slate-100 flex items-center justify-between group shadow-sm hover:shadow-md transition-all active:scale-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center font-black text-emerald-600 text-sm">{(String(m?.name) || '?').charAt(0)}</div>
              <p className="font-bold text-xs text-slate-800">{String(m.name)}</p>
            </div>
            {!isVisionOnly && (
              <div className="flex space-x-1">
                <button onClick={(e)=>{ e.stopPropagation(); editMember(m.id, m.name); }} className="p-2 text-slate-200 hover:text-indigo-600"><Icon name="edit" className="w-4 h-4" /></button>
                <button onClick={(e)=>{ e.stopPropagation(); onDelete('members', m.id); }} className="p-2 text-slate-200 hover:text-rose-500"><Icon name="trash" className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedMember && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedMember(null)}></div>
           <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6 text-slate-800">
                <h2 className="text-lg font-black uppercase text-slate-800">Bilan séance</h2>
                <button onClick={() => setSelectedMember(null)} className="p-2 bg-slate-50 rounded-full text-slate-600"><Icon name="close" /></button>
              </div>
              
              <div className="text-center mb-8 text-slate-800">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-2 text-2xl font-black">{selectedMember.name.charAt(0)}</div>
                <h3 className="text-lg font-black text-slate-800">{selectedMember.name}</h3>
                <p className="text-[10px] font-black text-indigo-500 uppercase">Réunion du {activeMeetingDate || '?'}</p>
              </div>

              {!activeMeetingDate ? (
                <p className="text-center text-rose-500 text-[10px] font-bold">Sélectionnez une réunion sur le Dashboard pour voir le rapport.</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl"><span className="text-[10px] font-black uppercase text-slate-400">Cotisation</span><span className="text-xs font-black text-slate-800">{formatCurrency(memberReport.cotis, currency)}</span></div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl"><span className="text-[10px] font-black uppercase text-slate-400">Épargne</span><span className="text-xs font-black text-slate-800">{formatCurrency(memberReport.epargne, currency)}</span></div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl"><span className="text-[10px] font-black uppercase text-slate-400">Fond de Caisse (Net)</span><span className={`text-xs font-black ${memberReport.fonds >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(memberReport.fonds, currency)}</span></div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl"><span className="text-[10px] font-black uppercase text-slate-400">Prêt Emprunté</span><span className="text-xs font-black text-rose-600">{formatCurrency(memberReport.loan, currency)}</span></div>
                  
                  {(memberReport.isBeneficiary || memberReport.isHost) && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                       {memberReport.isBeneficiary && <span className="flex-1 text-center py-2 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase text-emerald-600">Bénéficiaire</span>}
                       {memberReport.isHost && <span className="flex-1 text-center py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase text-indigo-600">Hôte du jour</span>}
                    </div>
                  )}
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

const GenericHistory = ({ title, transactions, members, currency, onDelete, onUpdate, isVisionOnly }) => {
  const edit = (id, old) => { const next = prompt("Montant :", old.toString()); if (next && !isNaN(Number(next))) onUpdate(id, Number(next)); };
  
  const grouped = useMemo(() => {
    return (transactions || []).reduce((groups, t) => {
      const date = String(t.date || 'Inconnue');
      if (!groups[date]) groups[date] = [];
      groups[date].push(t);
      return groups;
    }, {});
  }, [transactions]);

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden text-slate-800">
      {String(title || "") !== "" && <div className="p-5 lg:p-8 border-b border-slate-50 bg-slate-50/50 font-black uppercase text-[10px] tracking-widest text-slate-500 text-slate-500"><h3>{String(title)}</h3></div>}
      {sortedDates.length === 0 ? <div className="p-8 text-center text-slate-400 text-[10px] font-bold uppercase text-slate-400">Aucune donnée</div> : sortedDates.map(date => (
          <div key={date} className="border-b border-slate-50 last:border-none">
            <div className="bg-slate-50/30 px-4 py-2 text-[8px] font-black text-slate-400 uppercase tracking-tighter text-slate-400">{date}</div>
            <table className="w-full text-left text-[11px] text-slate-800"><tbody className="divide-y divide-slate-50 text-slate-800">{grouped[date].map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50"><td className="px-4 py-3"><div className="flex items-center gap-2 text-slate-700 text-slate-700"><div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-[9px] ${t.method === 'cash' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-600'}`}>{String(t.method || 'cash').charAt(0).toUpperCase()}</div><p className="font-bold">{String(members.find((m)=>m.id===t.memberId)?.name || '...')}</p></div></td><td className={`px-4 py-3 text-right font-black ${t.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{t.amount >= 0 ? '+' : ''}{formatCurrency(t.amount, currency)}</td><td className="px-4 py-3 text-right space-x-1">{!isVisionOnly && (<><button onClick={(e) => { e.stopPropagation(); edit(t.id, t.amount); }} className="p-1 text-slate-300 active:text-indigo-600 text-slate-300 hover:text-indigo-600"><Icon name="edit" className="w-4 h-4" /></button><button onClick={(e) => { e.stopPropagation(); onDelete('transactions', t.id); }} className="p-1 text-slate-300 active:text-rose-500 text-slate-300 hover:text-rose-500"><Icon name="trash" className="w-4 h-4" /></button></>)}</td></tr>
                ))}</tbody></table>
          </div>
        ))}
    </div>
  );
};

const LoansView = ({ members, loans, currency, onAdd, onDelete, isVisionOnly, themeGradient, activeMeetingDate }) => {
  const [data, setData] = useState({ mId: '', amt: '', rate: '10', dueDate: '' });
  const total = (Number(data.amt) || 0) * (1 + (Number(data.rate) || 0) / 100);

  if (!activeMeetingDate) return (
    <div className="bg-rose-50 p-10 rounded-[3rem] border-2 border-dashed border-rose-200 text-center">
       <h3 className="text-xl font-black uppercase text-rose-700">Séance non définie</h3>
       <p className="text-xs text-rose-600 mt-2 text-rose-600">Veuillez sélectionner une réunion sur le Dashboard.</p>
    </div>
  );

  return (
    <div className="space-y-4 lg:space-y-6 text-slate-800">
      {!isVisionOnly && (
        <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in zoom-in-95">
          <h2 className="text-sm font-black uppercase text-slate-700 mb-6 tracking-wider text-slate-700">Octroi de Prêt ({activeMeetingDate})</h2>
          <div className="space-y-5 text-slate-800">
            <select value={data.mId} onChange={(e)=>setData({...data, mId:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none text-slate-800 text-slate-800"><option value="">Choisir un membre...</option>{(members || []).map((m)=><option key={m.id} value={String(m.id)}>{String(m.name)}</option>)}</select>
            <div className="grid grid-cols-2 gap-4 text-slate-800">
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 text-slate-400">Capital</label><input type="number" placeholder="Montant" value={data.amt} onChange={(e)=>setData({...data, amt:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm outline-none text-slate-900 shadow-inner" /></div>
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 text-slate-400">Taux (%)</label><input type="number" value={data.rate} onChange={(e)=>setData({...data, rate:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm outline-none text-slate-900 shadow-inner" /></div>
            </div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 text-slate-400">Date d'échéance</label><input type="date" value={data.dueDate} onChange={(e)=>setData({...data, dueDate:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm outline-none text-indigo-600 shadow-inner" /></div>
            <ActionButton onClick={async () => { if(!data.mId || !data.amt || !data.dueDate) return; await onAdd({memberId: data.mId, principal: Number(data.amt), interestRate: Number(data.rate), totalAmount: total, dueDate: data.dueDate, status: 'actif'}); setData({mId:'', amt:'', rate:'10', dueDate:''}); }} label="Valider et enregistrer le prêt" className={`w-full py-5 bg-gradient-to-br ${themeGradient} text-white rounded-3xl font-black text-[11px] uppercase shadow-xl transition-all`} />
          </div>
        </div>
      )}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden text-slate-800 text-slate-800">
        <table className="w-full text-left text-[11px] text-slate-800"><tbody className="divide-y divide-slate-50 text-slate-800">{(!loans || loans.length === 0) ? <tr><td className="p-10 text-center text-slate-300 italic text-slate-300 italic">Aucun prêt pour cette séance.</td></tr> : loans.map((l)=>(<tr key={l.id} className="hover:bg-slate-50 transition-colors text-slate-800"><td className="px-6 py-4 font-bold text-slate-700">{String(members.find((m)=>m.id===l.memberId)?.name || 'Inconnu')}</td><td className="px-6 py-4 text-indigo-500 font-black text-[9px] uppercase text-indigo-500">Taux: {l.interestRate}%</td><td className="px-6 py-4"><span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg font-black text-[9px] uppercase text-rose-600">{l.dueDate}</span></td><td className="px-6 py-4 text-right font-black text-rose-500 text-sm text-rose-500">{formatCurrency(l.totalAmount, currency)}</td>{!isVisionOnly && <td className="px-6 py-4 text-right"><button onClick={(e)=>{ e.stopPropagation(); onDelete('loans', l.id); }} className="p-2 text-slate-300 hover:text-rose-500 transition-colors text-slate-300 hover:text-rose-500"><Icon name="trash" className="w-4 h-4" /></button></td>}</tr>))}</tbody></table>
      </div>
    </div>
  );
};

const SettingsView = ({ currency, setCurrency, profile, onUpgrade, isAdmin, allUsers, onApprove, onCancel, onAdminDelete, isVisionOnly }) => {
  const [exp, setExp] = useState('');
  const copyInvitation = () => { if (!profile) return; const link = `${window.location.origin}${window.location.pathname}?join=${profile.uid}`; const el = document.createElement('textarea'); el.value = link; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); alert("Lien copié !"); };

  return (
    <div className="space-y-4 lg:space-y-10 pb-20 text-slate-800 text-slate-800">
      <div className="bg-white p-5 lg:p-10 rounded-[2rem] border border-slate-100 shadow-sm text-slate-800">
          <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-3 text-slate-800">Compte & Vision</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 text-slate-800">
             <div className="space-y-4 lg:space-y-8 text-slate-800">
                {!isVisionOnly && (
                  <div className="p-5 lg:p-8 bg-indigo-50 rounded-[1.5rem] border-2 border-indigo-100 shadow-sm space-y-4 text-slate-800 text-indigo-600">
                     <p className="font-black text-[10px] uppercase tracking-widest text-indigo-600">Lien Invitation (Vision Seule)</p>
                     <button onClick={copyInvitation} className="w-full p-4 rounded-2xl font-black text-[10px] uppercase bg-white text-indigo-600 border border-indigo-100 shadow-md flex items-center justify-center gap-2 active:scale-95 text-indigo-600"><Icon name="share" className="w-4 h-4" /> Copier le lien unique</button>
                  </div>
                )}
                <div className="p-5 bg-slate-50 rounded-[1.5rem] shadow-sm border border-slate-100 text-slate-800 text-slate-400">
                   <p className="font-black text-[9px] lg:text-[10px] uppercase mb-4 tracking-widest text-slate-400">Devise</p>
                   <select value={currency || "FCFA"} onChange={e => setCurrency(e.target.value)} className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-black text-[11px] outline-none text-slate-800 text-slate-800"><option value="FCFA">FCFA</option><option value="USD">USD</option><option value="EUR">EUR</option></select>
                </div>
             </div>
             <div className="p-8 border-2 border-indigo-50 rounded-[2.5rem] text-center bg-white text-slate-800">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600"><Icon name="shield" /></div>
                <h3 className="text-lg font-black uppercase text-slate-800">Paiement & Support</h3>
                <div className="bg-indigo-50 p-4 rounded-2xl text-left space-y-1 mb-6 text-slate-800 text-indigo-700">
                    <p className="text-[10px] font-black text-indigo-700">Mobile Money: {MOMO_NUMBER}</p>
                    <p className="text-[9px] font-medium opacity-80 text-indigo-700">• WhatsApp: {WHATSAPP_SUPPORT}</p>
                    <p className="text-[9px] font-medium opacity-80 text-indigo-700">• PayPal: j_nguetsop@yahoo.fr</p>
                </div>
                {!isVisionOnly && profile?.status === 'none' && <ActionButton onClick={onUpgrade} label="Passer PRO (1€)" className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black text-xs uppercase shadow-xl" />}
                {profile?.status === 'pending' && <div className="p-4 bg-amber-50 text-amber-600 font-black text-[10px] uppercase rounded-2xl border border-amber-100 animate-pulse text-amber-600 text-amber-600">Activation en attente...</div>}
                {profile?.status === 'pro' && <div className="p-4 bg-emerald-50 text-emerald-600 font-black text-[10px] uppercase rounded-2xl border border-emerald-100 shadow-sm text-emerald-600 text-emerald-600">Membre Premium Actif</div>}
             </div>
          </div>
      </div>
      {isAdmin && (<div className="bg-white p-6 lg:p-10 rounded-[2rem] border-4 border-indigo-100 shadow-xl text-slate-800 text-indigo-600"><h2 className="text-xs font-black uppercase text-indigo-600 mb-6">Admin Panel</h2><div className="overflow-x-auto text-slate-800"><table className="w-full text-left text-slate-800 text-slate-400"><thead><tr className="text-[9px] uppercase text-slate-400"><th>Email</th><th>Échéance</th><th className="text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 text-slate-800">{(allUsers || []).map(u => (<tr key={u.uid}><td className="py-4 text-xs font-bold text-slate-800 text-slate-800 text-slate-800"><div className="flex items-center gap-2">{u.status === 'pending' && <div className="relative flex h-2 w-2 text-rose-500"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span></div>}{String(u.email)}</div></td><td className="py-4 text-[10px] font-black text-indigo-600 text-indigo-600">{String(u.expiryDate || 'N/A')}</td><td className="py-4 text-right space-x-2 text-slate-800 text-slate-800"><input type="date" className="p-1 border rounded text-[10px] text-slate-800" onChange={e=>setExp(e.target.value)} /><button onClick={() => onApprove(u.uid, exp || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0])} className="bg-emerald-600 text-white px-2 py-1 rounded text-[8px] font-black uppercase">Activer</button><button onClick={() => onAdminDelete(u.uid)} className="bg-rose-500 text-white px-2 py-1 rounded text-[8px] font-black uppercase shadow-sm"><Icon name="trash" className="w-3 h-3 text-white" /></button></td></tr>))}</tbody></table></div></div>)}
    </div>
  );
};