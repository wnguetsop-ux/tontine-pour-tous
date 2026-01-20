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
  setDoc,
  query
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
// CONFIGURATION FIREBASE
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
const FREE_MEMBER_LIMIT = 10; // Limite de membres pour la version gratuite

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

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
    dots: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    print: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />,
    phone: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />,
    whatsapp: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396 0 12.032c0 2.12.542 4.19 1.578 6.041L0 24l6.105-1.603a11.82 11.82 0 005.94 1.577h.005c6.632 0 12.028-5.396 12.033-12.034a11.81 11.81 0 00-3.527-8.421" />,
    arrowUp: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />,
    lock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
  };
  return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>{icons[name] || null}</svg>;
};

// ==========================================
// COMPOSANTS UI ATOMIQUES
// ==========================================

function ActionButton({ onClick, label, className = "", icon }) {
  const [loading, setLoading] = useState(false);
  const handleAction = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try { await onClick(); } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  return (
    <button onClick={handleAction} disabled={loading} className={`relative flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-80 cursor-pointer ${className}`}>
      {!loading ? (
        <span className="flex items-center gap-2">{icon && <Icon name={icon} className="w-4 h-4" />} {String(label)}</span>
      ) : (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      )}
    </button>
  );
}

function ConfirmModal({ isOpen, title, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative w-full max-w-xs bg-white rounded-[2.5rem] shadow-2xl p-8 text-center text-slate-800">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><Icon name="trash" className="w-8 h-8" /></div>
        <h3 className="text-sm font-black uppercase mb-2">Confirmation</h3>
        <p className="text-xs text-slate-500 mb-8 px-2 leading-relaxed">{String(title)}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-4 bg-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-500">Annuler</button>
          <button onClick={onConfirm} className="flex-1 py-4 bg-rose-500 rounded-2xl text-[10px] font-black uppercase text-white shadow-lg">Supprimer</button>
        </div>
      </div>
    </div>
  );
}

function GenericHistory({ title, transactions, members, currency, onDelete, onUpdate, isVisionOnly }) {
  const edit = (id, old) => { const next = prompt("Montant :", old.toString()); if (next && !isNaN(Number(next))) onUpdate(id, Number(next)); };
  const grouped = (transactions || []).reduce((groups, t) => { const date = String(t.date || 'Inconnue'); if (!groups[date]) groups[date] = []; groups[date].push(t); return groups; }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden text-slate-800">
      {title && <div className="p-5 border-b bg-slate-50/50 font-black uppercase text-[10px] text-slate-500"><h3>{String(title)}</h3></div>}
      {sortedDates.length === 0 ? <div className="p-8 text-center text-slate-400 text-[10px] font-bold uppercase">Aucune donnée</div> : sortedDates.map(date => (
          <div key={date} className="border-b last:border-none">
            <div className="bg-slate-50/30 px-4 py-2 text-[8px] font-black text-slate-400 uppercase tracking-tighter">{String(date)}</div>
            <table className="w-full text-left text-[11px]"><tbody className="divide-y divide-slate-50">{grouped[date].map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 text-slate-800"><td className="px-4 py-3 font-bold">{members.find((m)=>m.id===t.memberId)?.name || '...'}</td><td className={`px-4 py-3 text-right font-black ${t.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{t.amount >= 0 ? '+' : ''}{formatCurrency(t.amount, currency)}</td>{!isVisionOnly && <td className="px-4 py-3 text-right space-x-1"><button onClick={() => edit(t.id, t.amount)} className="p-1 text-slate-300 hover:text-indigo-600"><Icon name="edit" className="w-4 h-4" /></button><button onClick={() => onDelete('transactions', t.id)} className="p-1 text-slate-300 hover:text-rose-500"><Icon name="trash" className="w-4 h-4" /></button></td>}</tr>
            ))}</tbody></table>
          </div>
        ))}
    </div>
  );
}

// ==========================================
// VUES PRINCIPALES
// ==========================================

function DashboardView({ stats, members, currency, isVisionOnly, onAddMember, onAddTransaction, themeGradient, activeMeetingDate, setActiveMeetingDate, isPremium }) {
  const [op, setOp] = useState({ mId: '', amt: '', type: 'cotisation', dir: 'in', method: 'cash' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  // Vérification de la limite de membres
  const isLimitReached = !isPremium && members.length >= FREE_MEMBER_LIMIT;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500 text-slate-800">
      <div className="bg-white p-6 rounded-[2rem] border-2 border-indigo-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-slate-800">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Icon name="calendar" /></div>
          <div><h2 className="text-sm font-black uppercase">Séance Active</h2><p className="text-[10px] text-slate-400 font-medium">Sélectionnez la séance pour filtrer les saisies.</p></div>
        </div>
        <div className="relative w-full md:w-auto">
          <input type="date" value={activeMeetingDate || ""} onChange={(e) => setActiveMeetingDate(e.target.value)} className="w-full md:w-64 p-4 bg-slate-50 border-none rounded-2xl font-black text-sm outline-none text-indigo-600 shadow-inner" />
          
          {!activeMeetingDate && (
            <div className="absolute left-1/2 -translate-x-1/2 md:left-auto md:right-4 top-full mt-4 flex flex-col items-center gap-2 animate-bounce pointer-events-none">
              <Icon name="arrowUp" className="w-8 h-8 text-indigo-600" />
              <h3 className="text-[10px] font-black uppercase text-indigo-600 whitespace-nowrap bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 shadow-sm">Choisissez une date pour commencer</h3>
            </div>
          )}
        </div>
      </div>

      {activeMeetingDate && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-slate-800">
              {!isVisionOnly && (
                <div 
                  onClick={() => { if (!isLimitReached) { setShowAddModal(true); setIsConfirming(false); } }} 
                  className={`cursor-pointer p-6 rounded-[2rem] shadow-xl text-white relative overflow-hidden group border-4 border-white/20 active:scale-95 transition-all ${isLimitReached ? 'bg-slate-400 cursor-not-allowed opacity-70' : `bg-gradient-to-br ${themeGradient}`}`}
                >
                  <h3 className="text-base font-black">{isLimitReached ? "Limite Atteinte" : "Inscrire Membre"}</h3>
                  <p className="text-[8px] font-bold opacity-80 uppercase">{isLimitReached ? "Passez en mode PRO" : `${members.length}/${isPremium ? '∞' : FREE_MEMBER_LIMIT} membres`}</p>
                  <div className="absolute -bottom-2 -right-2 opacity-20 group-hover:scale-110 transition-transform">
                    <Icon name={isLimitReached ? "lock" : "plus"} className="w-16 h-16" />
                  </div>
                </div>
              )}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between"><p className="text-[10px] font-black uppercase text-slate-400">Cotisations séance</p><h3 className="text-lg font-black text-indigo-600 truncate">{formatCurrency(stats?.cotisations || 0, currency)}</h3></div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between"><p className="text-[10px] font-black uppercase text-emerald-600">Fond de caisse (Net)</p><h3 className="text-lg font-black text-emerald-600 truncate">{formatCurrency(stats?.fonds || 0, currency)}</h3></div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between"><p className="text-[10px] font-black uppercase text-sky-600">Épargne séance</p><h3 className="text-lg font-black text-sky-600 truncate">{formatCurrency(stats?.epargne || 0, currency)}</h3></div>
          </div>

          {!isVisionOnly && (
            <div className="bg-white p-6 lg:p-10 rounded-[2rem] border border-slate-100 shadow-sm text-slate-800">
              <h3 className="text-[11px] font-black uppercase mb-6 flex items-center gap-3"><div className="w-1 h-4 bg-indigo-600 rounded-full" /> Saisir mouvement ({String(activeMeetingDate)})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-slate-800">
                  <select value={op.mId} onChange={(e)=>setOp({...op, mId:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none text-slate-800"><option value="">Choisir Membre...</option>{members.map((m)=><option key={m.id} value={String(m.id)}>{String(m.name)}</option>)}</select>
                  <select value={op.type} onChange={(e)=>setOp({...op, type:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none text-slate-800"><option value="cotisation">Cotisation</option><option value="epargne">Épargne</option><option value="fonds">Fond de caisse</option></select>
                  <select value={op.method} onChange={(e)=>setOp({...op, method:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none text-slate-800"><option value="cash">Espèces</option><option value="momo">Momo</option></select>
                  <div className="md:col-span-2 lg:col-span-3 flex bg-slate-100 rounded-2xl p-1 text-slate-800">
                    <button onClick={()=>setOp({...op,dir:'in'})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase ${op.dir==='in'?'bg-white shadow text-indigo-600':'text-slate-400'}`}>Entrée / Dépôt</button>
                    <button onClick={()=>setOp({...op,dir:'out'})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase ${op.dir==='out'?'bg-white shadow text-rose-600':'text-slate-400'}`}>Sortie / Retrait</button>
                  </div>
                  <input type="number" value={op.amt} onChange={(e)=>setOp({...op,amt:e.target.value})} className="md:col-span-2 lg:col-span-3 p-4 bg-slate-50 rounded-2xl font-black text-2xl text-center outline-none border border-slate-100 shadow-inner text-slate-800" placeholder="0.00" />
                  <ActionButton onClick={async () => { if(!op.mId||!op.amt) return; await onAddTransaction(op.mId,op.dir==='in'?Number(op.amt):-Number(op.amt),op.type, op.method); setOp({...op,amt:''}); }} label="Valider" className="md:col-span-2 lg:col-span-3 bg-slate-900 text-white p-5 rounded-3xl font-black text-xs uppercase shadow-xl" />
              </div>
            </div>
          )}
        </>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 text-slate-800"><div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAddModal(false)}></div>
            <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl text-slate-800">
               <h2 className="text-xl font-black uppercase mb-6">{isConfirming ? "Confirmation" : "Nouveau Membre"}</h2>
               {!isConfirming ? (
                 <div className="space-y-4 text-slate-800">
                    <input type="text" placeholder="Nom complet..." value={nameInput} onChange={e=>setNameInput(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none text-slate-800" />
                    <input type="text" placeholder="Téléphone (ex: 00237...)" value={phoneInput} onChange={e=>setPhoneInput(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none text-slate-800" />
                    <div className="flex gap-3 text-slate-800"><button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase">Annuler</button>
                    <button onClick={() => { if(nameInput.trim()) setIsConfirming(true); }} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase">Enregistrer</button></div></div>
               ) : (
                 <div className="space-y-4 text-slate-800"><p className="text-xs text-slate-500">Ajouter <strong className="text-indigo-600">{String(nameInput)}</strong> ?</p>
                    <div className="flex gap-3 text-slate-800"><button onClick={() => setIsConfirming(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase">Retour</button>
                    <ActionButton onClick={async () => { try { await onAddMember(nameInput.trim(), phoneInput.trim()); setNameInput(''); setPhoneInput(''); setIsConfirming(false); setShowAddModal(false); } catch (e) { console.error(e); } }} label="Confirmer" className="flex-1 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg" /></div></div>
               )}
            </div>
        </div>
      )}
    </div>
  );
}

function FinancesView({ transactions, allTransactions, members, currency, onDelete, onUpdate, isVisionOnly, activeMeetingDate }) {
  const [showHistory, setShowHistory] = useState(false);
  const displayTrans = showHistory ? allTransactions : transactions;
  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-slate-800">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm text-slate-800">
        <h2 className="text-xs font-black uppercase text-slate-500">{showHistory ? "Historique complet" : `Données du ${String(activeMeetingDate || '?')}`}</h2>
        <button onClick={() => setShowHistory(!showHistory)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${showHistory ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{showHistory ? "Vue séance" : "Voir tout"}</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-slate-800">
        <GenericHistory title="Cotisations" transactions={displayTrans.filter(t => t.type === 'cotisation')} members={members} currency={currency} onDelete={onDelete} onUpdate={onUpdate} isVisionOnly={isVisionOnly} />
        <GenericHistory title="Épargne" transactions={displayTrans.filter(t => t.type === 'epargne')} members={members} currency={currency} onDelete={onDelete} onUpdate={onUpdate} isVisionOnly={isVisionOnly} />
      </div>
    </div>
  );
}

function ReportsView({ members, transactions, rotations, loans, currency, themeGradient, defaultDate }) {
  const [reportDate, setReportDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { if (defaultDate) setReportDate(defaultDate); }, [defaultDate]);

  const sessionData = useMemo(() => {
    const d = String(reportDate || "");
    const trans = (transactions || []).filter((t) => String(t.date) === d && t.status === 'completed');
    const rot = (rotations || []).find((r) => String(r.date) === d);
    const sLoans = (loans || []).filter((l) => String(l.startDate) === d);
    const generationTime = new Date().toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
    
    return {
      date: d,
      generationTime,
      beneficiary: members.find((m) => m.id === rot?.beneficiaryMemberId)?.name || 'Non défini',
      host: members.find((m) => m.id === rot?.hostMemberId)?.name || 'Non défini',
      membersList: (members || []).map((m) => {
        const mTrans = trans.filter((t) => t.memberId === m.id);
        const mLoan = sLoans.find((l) => l.memberId === m.id);
        const cotis = mTrans.filter((t) => t.type === 'cotisation').reduce((s, t) => s + t.amount, 0);
        const fondsTrans = mTrans.filter((t) => t.type === 'fonds');
        const depotFond = fondsTrans.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
        const sortieFond = Math.abs(fondsTrans.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
        let statusBadge = cotis > 0 ? "payé" : "non payé";
        return { name: m.name, cotis, epargne: mTrans.filter((t) => t.type === 'epargne').reduce((s, t) => s + t.amount, 0), depotFond, sortieFond, pretTotal: mLoan?.totalAmount || 0, statusBadge };
      }),
      totals: {
        cotis: trans.filter((t) => t.type === 'cotisation').reduce((s, t) => s + t.amount, 0),
        epargne: trans.filter((t) => t.type === 'epargne').reduce((s, t) => s + t.amount, 0),
        depotsFonds: trans.filter((t) => t.type === 'fonds' && t.amount > 0).reduce((s, t) => s + t.amount, 0),
        sortiesFonds: Math.abs(trans.filter((t) => t.type === 'fonds' && t.amount < 0).reduce((s, t) => s + t.amount, 0)),
        pretsTotal: sLoans.reduce((s, l) => s + (l.totalAmount || 0), 0)
      }
    };
  }, [reportDate, transactions, rotations, loans, members]);

  const shareWhatsApp = () => {
    const text = `📊 *RAPPORT DE TONTINE - ${sessionData.date}*\n\n🏠 Hôte: ${sessionData.host}\n💰 Bénéficiaire: ${sessionData.beneficiary}\n\n💵 *Cotisations:* ${formatCurrency(sessionData.totals.cotis, currency)}\n🏦 *Total Épargne:* ${formatCurrency(sessionData.totals.epargne, currency)}\n\n_Veuillez imprimer le PDF puis le joindre sur WhatsApp pour le détail complet._\n_Généré via Tontine Pour Tous_`;
    window.open(`https://wa.me/${WHATSAPP_SUPPORT}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 text-slate-800">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm text-slate-800">
          <h2 className="text-xl font-black uppercase mb-6">Générer un rapport</h2>
          <div className="flex flex-col sm:flex-row gap-4">
             <input type="date" value={reportDate || ""} onChange={e=>setReportDate(e.target.value)} className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm outline-none text-indigo-600 shadow-inner" />
             <button onClick={() => setShowPreview(true)} className={`px-8 py-4 bg-gradient-to-br ${themeGradient} text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-indigo-100 transition-all active:scale-95`}>Voir le rapport</button>
          </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 print:p-0">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md print:hidden" onClick={()=>setShowPreview(false)}></div>
           <div className="relative w-full max-w-6xl bg-white rounded-[3rem] print:rounded-none shadow-2xl p-6 lg:p-10 max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible text-slate-800">
              
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 border-b border-slate-100 pb-8 print:hidden text-slate-800">
                 <div className="text-center md:text-left text-slate-800">
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-800">Rapport de Séance</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{String(sessionData.date)}</p>
                 </div>
                 <div className="flex gap-3 text-slate-800">
                    <button onClick={shareWhatsApp} className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all">WhatsApp</button>
                    <button onClick={()=>window.print()} className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all">Imprimer PDF</button>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 text-center text-slate-800">
                 <div className="bg-emerald-50 p-6 rounded-3xl print:bg-emerald-50 print:border print:border-emerald-100"><p className="text-[10px] font-black uppercase text-emerald-400 mb-1">Bénéficiaire</p><p className="text-base lg:text-xl font-black text-emerald-600">{String(sessionData.beneficiary)}</p></div>
                 <div className="bg-indigo-50 p-6 rounded-3xl print:bg-indigo-50 print:border print:border-indigo-100"><p className="text-[10px] font-black uppercase text-indigo-400 mb-1">Hôte</p><p className="text-base lg:text-xl font-black text-indigo-600">{String(sessionData.host)}</p></div>
              </div>

              <div className="overflow-x-auto mb-10 border border-slate-100 rounded-3xl text-slate-800">
                 <table className="w-full text-left text-[11px] text-slate-800">
                   <thead>
                     <tr className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 print:bg-slate-100">
                       <th className="px-4 py-5">Membre</th>
                       <th className="px-4 py-5">Statut</th>
                       <th className="px-4 py-5 text-indigo-600">Cotisation</th>
                       <th className="px-4 py-5 text-sky-600">Épargne</th>
                       <th className="px-4 py-5 text-rose-500">Prêt (Dû)</th>
                       <th className="px-4 py-5 text-emerald-600">Entrée Fond</th>
                       <th className="px-4 py-5 text-rose-600">Sortie Fond</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 text-slate-800">
                     {sessionData.membersList.map((m, i) => (
                       <tr key={i} className="hover:bg-slate-50/50 transition-colors text-slate-800 print:bg-white">
                         <td className="px-4 py-4 font-bold">{String(m.name)}</td>
                         <td className="px-4 py-4">
                            <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase print:border ${m.statusBadge === 'payé' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-rose-100 text-rose-500 border-rose-200'}`}>{String(m.statusBadge)}</span>
                         </td>
                         <td className="px-4 py-4 font-black">{formatCurrency(m.cotis, currency)}</td>
                         <td className="px-4 py-4 font-black text-sky-600">{formatCurrency(m.epargne, currency)}</td>
                         <td className="px-4 py-4 font-black text-rose-500">{formatCurrency(m.pretTotal, currency)}</td>
                         <td className="px-4 py-4 font-black text-emerald-600">{formatCurrency(m.depotFond, currency)}</td>
                         <td className="px-4 py-4 font-black text-rose-600">{formatCurrency(m.sortieFond, currency)}</td>
                       </tr>
                     ))}
                   </tbody>
                   <tfoot className="bg-slate-900 text-white font-black print:bg-slate-900 print:text-white">
                     <tr className="text-white">
                       <td colSpan="2" className="px-4 py-5 uppercase tracking-widest text-[10px]">TOTAL SÉANCE</td>
                       <td className="px-4 py-5">{formatCurrency(sessionData.totals.cotis, currency)}</td>
                       <td className="px-4 py-5">{formatCurrency(sessionData.totals.epargne, currency)}</td>
                       <td className="px-4 py-5 text-rose-400">{formatCurrency(sessionData.totals.pretsTotal, currency)}</td>
                       <td className="px-4 py-5 text-emerald-400">{formatCurrency(sessionData.totals.depotsFonds, currency)}</td>
                       <td className="px-4 py-5 text-rose-400">{formatCurrency(sessionData.totals.sortiesFonds, currency)}</td>
                     </tr>
                   </tfoot>
                 </table>
              </div>
           </div>
        </div>
      )}
      
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function RotationsView({ members, rotations, activeMeetingDate, onAddRotation, onDelete, isVisionOnly }) {
  const [beneficiary, setBeneficiary] = useState("");
  const [host, setHost] = useState("");
  const [customDate, setCustomDate] = useState("");
  const sortedRotations = useMemo(() => [...rotations].sort((a, b) => new Date(a.date) - new Date(b.date)), [rotations]);

  return (
    <div className="space-y-6 text-slate-800">
      {!isVisionOnly && (
        <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm animate-in zoom-in-95 text-slate-800">
           <h2 className="text-sm font-black uppercase text-slate-700 mb-6 tracking-widest flex items-center gap-2"><Icon name="calendar" className="w-4 h-4 text-indigo-600" /> Programmer séance</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-slate-800">
              <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none text-indigo-600" />
              <select value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none text-slate-800"><option value="">Bénéficiaire...</option>{members.map(m => <option key={m.id} value={m.id}>{String(m.name)}</option>)}</select>
              <select value={host} onChange={(e) => setHost(e.target.value)} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none text-slate-800"><option value="">Hôte...</option>{members.map(m => <option key={m.id} value={m.id}>{String(m.name)}</option>)}</select>
           </div>
           <ActionButton onClick={async () => { if(!beneficiary || !host || !customDate) return; await onAddRotation(beneficiary, host, customDate); setBeneficiary(""); setHost(""); setCustomDate(""); }} label="Ajouter au calendrier" className="w-full bg-indigo-600 text-white p-5 rounded-3xl font-black text-[10px] uppercase shadow-xl" />
        </div>
      )}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden text-slate-800">
        <div className="p-5 flex justify-between items-center border-b border-slate-50">
          <h3 className="text-[10px] font-black uppercase text-slate-400">Calendrier des Rotations</h3>
          <button onClick={() => window.print()} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"><Icon name="print" className="w-4 h-4" /></button>
        </div>
        <table className="w-full table-fixed text-left text-[11px] text-slate-800">
          <thead className="bg-slate-50/50">
            <tr className="text-[9px] font-black uppercase text-slate-400">
              <th className="px-4 py-3 w-1/4">Date</th>
              <th className="px-4 py-3 w-1/3">Bénéficiaire</th>
              <th className="px-4 py-3 w-1/3">Hôte</th>
              {!isVisionOnly && <th className="px-4 py-3 w-12 text-right"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-800">
            {sortedRotations.map(rot => (
              <tr key={rot.id} className={`hover:bg-slate-50 text-slate-800 ${rot.date === activeMeetingDate ? 'bg-indigo-50/30' : ''}`}>
                <td className="px-4 py-4 font-bold text-slate-600 truncate">{String(rot.date)}</td>
                <td className="px-4 py-4 font-black text-emerald-600 uppercase truncate">
                  {members.find(m => m.id === rot.beneficiaryMemberId)?.name || '...'}
                </td>
                <td className="px-4 py-4 font-black text-indigo-600 uppercase truncate">
                  {members.find(m => m.id === rot.hostMemberId)?.name || '...'}
                </td>
                {!isVisionOnly && (
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => onDelete('rotations', rot.id)} className="p-2 text-slate-300 hover:text-rose-500">
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MembersView({ members, activeMeetingDate, transactions, loans, rotations, currency, onDelete, isVisionOnly, onUpdate }) {
  const [selectedMember, setSelectedMember] = useState(null);
  
  const editMember = (id, cn, cp) => { 
    const n = prompt("Nouveau nom :", cn); 
    const p = prompt("Nouveau téléphone :", cp || "");
    if (n && n.trim()) onUpdate(id, n.trim(), p ? p.trim() : ""); 
  };

  const handleSendMessage = (m) => {
    if (!m.phone) {
        alert("Ce membre n'a pas de numéro de téléphone enregistré.");
        return;
    }
    const cleanPhone = m.phone.replace(/[^0-9]/g, '');
    const mId = m.id;
    const mTrans = transactions.filter(t => t.memberId === mId && t.date === activeMeetingDate && t.status === 'completed');
    const hasPaid = mTrans.some(t => t.type === 'cotisation' && t.amount > 0);
    
    let message = "";
    if (activeMeetingDate && !hasPaid) {
        message = `Bonjour ${m.name}, j'espère que tu vas bien. C'est un petit rappel poli concernant ta cotisation pour la séance du ${activeMeetingDate}. Merci d'avance !`;
    } else if (activeMeetingDate) {
        message = `Bonjour ${m.name}, c'est un rappel pour notre prochaine réunion de tontine prévue le ${activeMeetingDate}. On compte sur ta présence !`;
    } else {
        message = `Bonjour ${m.name}, j'espère que tu vas bien. C'est un petit message de la tontine pour te souhaiter une excellente journée.`;
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const memberReport = useMemo(() => {
    if (!selectedMember || !activeMeetingDate) return null;
    const mId = selectedMember.id;
    const mTrans = transactions.filter(t => t.memberId === mId && t.date === activeMeetingDate && t.status === 'completed');
    const mLoan = loans.find(l => l.memberId === mId && l.startDate === activeMeetingDate);
    return {
      name: selectedMember.name,
      cotis: mTrans.filter(t => t.type === 'cotisation').reduce((s, t) => s + t.amount, 0),
      epargne: mTrans.filter(t => t.type === 'epargne').reduce((s, t) => s + t.amount, 0),
      fonds: mTrans.filter(t => t.type === 'fonds').reduce((s, t) => s + t.amount, 0),
      loan: mLoan?.totalAmount || 0,
    };
  }, [selectedMember, activeMeetingDate, transactions, loans]);

  return (
    <div className="space-y-8 text-slate-800">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 lg:gap-6 animate-in fade-in text-slate-800">
        {members.map((m) => (
          <div key={m.id} onClick={() => setSelectedMember(m)} className="cursor-pointer bg-white p-4 rounded-[1.5rem] border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-95 text-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center font-black text-emerald-600 text-sm">{String(m.name).charAt(0)}</div>
              <div>
                <p className="font-bold text-xs">{String(m.name)}</p>
                {m.phone && <p className="text-[8px] text-slate-400 font-medium">{m.phone}</p>}
              </div>
            </div>
            {!isVisionOnly && (
              <div className="flex items-center">
                <button title="WhatsApp" onClick={(e)=>{ e.stopPropagation(); handleSendMessage(m); }} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors">
                  <Icon name="whatsapp" className="w-4 h-4" />
                </button>
                <button onClick={(e)=>{ e.stopPropagation(); editMember(m.id, m.name, m.phone); }} className="p-2 text-slate-200 hover:text-indigo-600">
                  <Icon name="edit" className="w-4 h-4" />
                </button>
                <button onClick={(e)=>{ e.stopPropagation(); onDelete('members', m.id); }} className="p-2 text-slate-200 hover:text-rose-500">
                  <Icon name="trash" className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {selectedMember && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 text-slate-800 text-slate-800"><div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md text-slate-800" onClick={() => setSelectedMember(null)}></div>
           <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 text-slate-800">
              <div className="flex justify-between items-center mb-6 text-slate-800">
                <h2 className="text-lg font-black uppercase">Bilan Séance</h2>
                <button onClick={() => setSelectedMember(null)} className="p-2 bg-slate-50 rounded-full text-slate-800"><Icon name="close" /></button>
              </div>
              {!activeMeetingDate ? <p className="text-center text-rose-500 text-[10px] font-bold">Sélectionnez une date de séance.</p> : (
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl font-bold"><span className="text-slate-400">Cotisation</span><span>{formatCurrency(memberReport.cotis, currency)}</span></div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl font-bold"><span className="text-slate-400">Épargne</span><span>{formatCurrency(memberReport.epargne, currency)}</span></div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl font-bold"><span className="text-slate-400">Fond de Caisse</span><span className={memberReport.fonds >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{formatCurrency(memberReport.fonds, currency)}</span></div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl font-bold"><span className="text-slate-400">Prêt Dû</span><span className="text-rose-600">{formatCurrency(memberReport.loan, currency)}</span></div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}

function LoansView({ members, loans, currency, onAdd, onDelete, isVisionOnly, themeGradient, activeMeetingDate }) {
  const [data, setData] = useState({ mId: '', amt: '', rate: '10', dueDate: '' });
  const total = (Number(data.amt) || 0) * (1 + (Number(data.rate) || 0) / 100);
  if (!activeMeetingDate) return <div className="bg-rose-50 p-10 rounded-[3rem] border-2 border-dashed border-rose-200 text-center text-rose-700 font-black">DATE DE SÉANCE REQUISE</div>;
  return (
    <div className="space-y-4 lg:space-y-6 text-slate-800">
      {!isVisionOnly && (
        <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-slate-800">
          <h2 className="text-sm font-black uppercase mb-6 text-slate-700">Octroi de Prêt</h2>
          <div className="space-y-5 text-slate-800">
            <select value={data.mId} onChange={(e)=>setData({...data, mId:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none text-slate-800"><option value="">Membre...</option>{members.map((m)=><option key={m.id} value={m.id}>{String(m.name)}</option>)}</select>
            <div className="grid grid-cols-2 gap-4 text-slate-800">
              <input type="number" placeholder="Capital" value={data.amt} onChange={(e)=>setData({...data, amt:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm outline-none text-slate-800" />
              <input type="number" placeholder="Taux %" value={data.rate} onChange={(e)=>setData({...data, rate:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm outline-none text-slate-800" />
            </div>
            <input type="date" value={data.dueDate} onChange={(e)=>setData({...data, dueDate:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm outline-none text-indigo-600" />
            <ActionButton onClick={async () => { if(!data.mId || !data.amt || !data.dueDate) return; await onAdd({memberId: data.mId, principal: Number(data.amt), interestRate: Number(data.rate), totalAmount: total, dueDate: data.dueDate, status: 'actif'}); setData({mId:'', amt:'', rate:'10', dueDate:''}); }} label="Enregistrer le prêt" className={`w-full py-5 bg-gradient-to-br ${themeGradient} text-white rounded-3xl font-black text-[11px] uppercase shadow-lg`} />
          </div>
        </div>
      )}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden text-slate-800">
        <table className="w-full text-left text-[11px] text-slate-800"><tbody className="divide-y divide-slate-50 text-slate-800">{loans.map((l)=>(<tr key={l.id} className="hover:bg-slate-50 text-slate-800"><td className="px-6 py-4 font-bold">{members.find((m)=>m.id===l.memberId)?.name || 'Inconnu'}</td><td className="px-6 py-4 text-indigo-500 font-black text-[9px] uppercase">Taux: {String(l.interestRate)}%</td><td className="px-6 py-4"><span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg font-black text-[9px] uppercase">{String(l.dueDate)}</span></td><td className="px-6 py-4 text-right font-black text-rose-500 text-sm">{formatCurrency(l.totalAmount, currency)}</td>{!isVisionOnly && <td className="px-6 py-4 text-right"><button onClick={()=>onDelete('loans', l.id)} className="p-2 text-slate-300 hover:text-rose-500"><Icon name="trash" className="w-4 h-4" /></button></td>}</tr>))}</tbody></table>
      </div>
    </div>
  );
}

function SettingsView({ currency, setCurrency, profile, onUpgrade, isAdmin, allUsers, onApprove, onAdminDelete, isVisionOnly }) {
  const [exp, setExp] = useState('');
  return (
    <div className="space-y-4 lg:space-y-10 pb-20 text-slate-800">
      <div className="bg-white p-5 lg:p-10 rounded-[2rem] border border-slate-100 shadow-sm text-slate-800">
          <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-3 text-slate-800">Préférences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 text-slate-800">
             <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 text-slate-800">
                <p className="font-black text-[10px] uppercase mb-4 tracking-widest text-slate-400">Devise de l'application</p>
                <select value={currency || "FCFA"} onChange={e => setCurrency(e.target.value)} className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-black text-[11px] outline-none text-slate-800"><option value="FCFA">FCFA</option><option value="USD">USD</option><option value="EUR">EUR</option></select>
             </div>
             <div className="p-8 border-2 border-indigo-50 rounded-[2.5rem] text-center bg-white text-slate-800">
                <div className="w-12 h-12 mx-auto mb-4 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Icon name="settings" /></div>
                <h3 className="text-lg font-black uppercase mb-6 text-slate-800">Service Premium</h3>
                <div className="bg-indigo-50 p-6 rounded-2xl text-left space-y-2 mb-6 text-indigo-700">
                    <p className="text-[10px] font-black">Mobile Money: {String(MOMO_NUMBER)}</p>
                    <p className="text-[10px] font-black">PayPal: j_nguetsop@yahoo.com</p>
                    <p className="text-[9px] font-medium opacity-80 mt-2 italic">* Pour activer votre compte, envoyez le montant de 1€ via l'un des canaux ci-dessus.</p>
                </div>
                {!isVisionOnly && profile?.status === 'none' && <ActionButton onClick={onUpgrade} label="Demander Activation PRO (1€)" className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black text-xs uppercase shadow-xl" />}
                {profile?.status === 'pending' && <div className="p-4 bg-amber-50 text-amber-600 font-black text-[10px] uppercase rounded-2xl border border-amber-100 animate-pulse">Demande d'activation envoyée...</div>}
                {profile?.status === 'pro' && <div className="p-4 bg-emerald-50 text-emerald-600 font-black text-[10px] uppercase rounded-2xl border border-emerald-100 shadow-sm">Premium Actif</div>}
             </div>
          </div>
      </div>

      <div className="bg-white p-6 lg:p-10 rounded-[2rem] border border-slate-100 shadow-sm text-slate-800">
        <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-3 text-slate-800">Support & Assistance</h2>
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg text-slate-800">
            <Icon name="phone" className="w-6 h-6" />
          </div>
          <div className="text-center md:text-left text-slate-800">
            <p className="text-xs font-black uppercase text-emerald-600 tracking-widest">Contact WhatsApp</p>
            <p className="text-xl font-black text-emerald-800">{WHATSAPP_SUPPORT}</p>
          </div>
          <a href={`https://wa.me/${WHATSAPP_SUPPORT.replace(/^00/, '')}`} target="_blank" rel="noreferrer" className="md:ml-auto px-8 py-3 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-emerald-100 active:scale-95 transition-all">
            Discuter maintenant
          </a>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white p-6 lg:p-10 rounded-[2rem] border-4 border-indigo-100 shadow-xl text-slate-800">
          <h2 className="text-xs font-black uppercase text-indigo-600 mb-6 text-slate-800">Admin Panel</h2>
          <div className="overflow-x-auto text-slate-800">
            <table className="w-full text-left text-slate-800">
              <thead>
                <tr className="text-[9px] uppercase text-slate-400">
                  <th>Email</th><th>Échéance</th><th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {(allUsers || []).map(u => (
                  <tr key={u.uid} className="text-slate-800">
                    <td className="py-4 text-xs font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        {u.status === 'pending' && <div className="relative flex h-2 w-2 text-slate-800"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span></div>}
                        {String(u.email)}
                      </div>
                    </td>
                    <td className="py-4 text-[10px] font-black text-indigo-600 text-slate-800">{String(u.expiryDate || 'N/A')}</td>
                    <td className="py-4 text-right space-x-2 text-slate-800">
                      <input type="date" className="p-1 border rounded text-[10px] text-slate-800" onChange={e=>setExp(e.target.value)} />
                      <button onClick={() => onApprove(u.uid, exp || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0])} className="bg-emerald-600 text-white px-2 py-1 rounded text-[8px] font-black uppercase shadow-sm">Activer</button>
                      <button onClick={() => onAdminDelete(u.uid)} className="bg-rose-500 text-white px-2 py-1 rounded shadow-sm"><Icon name="trash" className="w-3 h-3 text-white" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', onConfirm: async () => {} });
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');

  const isVisionOnly = profile?.role === 'member';
  const dataOwnerId = profile?.role === 'member' ? (profile.presidentId || '') : (profile?.uid || '');
  const isPremium = profile?.status === 'pro';
  const themeGradient = isPremium ? 'from-amber-500 to-amber-600' : 'from-indigo-600 to-indigo-800';

  const NAV_LINKS = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'members', label: 'Membres', icon: 'members' },
    { id: 'finances', label: 'Finances', icon: 'cotisations' },
    { id: 'reports', label: 'Rapports', icon: 'fileText' },
    { id: 'prets', label: 'Prêts', icon: 'prets' },
    { id: 'rotations', label: 'Rotations', icon: 'share' },
    { id: 'fonds', label: 'Fond de caisse', icon: 'fonds' },
    { id: 'settings', label: 'Paramètres', icon: 'settings' }, 
  ];

  const filteredTransactions = useMemo(() => {
    if (!activeMeetingDate) return [];
    return transactions.filter(t => t.date === activeMeetingDate);
  }, [transactions, activeMeetingDate]);

  const stats = useMemo(() => {
    const s = filteredTransactions.filter(t => t.status === 'completed');
    return {
      cotisations: s.filter(t => t.type === 'cotisation').reduce((sum, t) => sum + t.amount, 0),
      epargne: s.filter(t => t.type === 'epargne').reduce((sum, t) => sum + t.amount, 0),
      fonds: s.filter(t => t.type === 'fonds').reduce((sum, t) => sum + t.amount, 0),
    };
  }, [filteredTransactions]);

  const handleLogout = async () => { await signOut(auth); setUser(null); setProfile(null); setCurrentPage('dashboard'); setIsMobileMenuOpen(false); };
  
  const handleAddMember = async (name, phone) => { 
    if (isVisionOnly || !user?.uid) return;
    // Blocage si limite atteinte en gratuit
    if (!isPremium && members.length >= FREE_MEMBER_LIMIT) {
        alert("Limite de membres atteinte. Veuillez passer au mode PRO pour ajouter plus de 10 membres.");
        return;
    }
    await addDoc(collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'members'), { 
        name, 
        phone: phone || "", 
        joinDate: new Date().toISOString().split('T')[0], 
        presidentId: user.uid 
    }); 
  };

  const handleUpdateMember = async (id, newName, newPhone) => { 
    if (isVisionOnly) return; 
    await updateDoc(doc(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'members', id), { 
        name: newName,
        phone: newPhone || ""
    }); 
  };

  const handleDelete = (coll, id) => { if (isVisionOnly) return; setConfirmState({ isOpen: true, title: "Supprimer cet élément ?", onConfirm: async () => { try { await deleteDoc(doc(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', coll, id)); setConfirmState(p => ({ ...p, isOpen: false })); } catch (e) { console.error(e); } } }); };
  const handleAddTransaction = async (mId, amt, type, method = 'cash') => { if (isVisionOnly || !dataOwnerId || !activeMeetingDate) return; await addDoc(collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'transactions'), { memberId: mId, amount: amt, type, method, status: 'completed', date: activeMeetingDate, presidentId: dataOwnerId }); };
  const handleUpdateTransaction = async (id, newAmt) => { if (isVisionOnly) return; await updateDoc(doc(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'transactions', id), { amount: newAmt }); };
  const handleAddLoan = async (loanData) => { if (isVisionOnly || !dataOwnerId || !activeMeetingDate) return; await addDoc(collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'loans'), { ...loanData, startDate: activeMeetingDate, presidentId: dataOwnerId }); };
  const handleAddRotation = async (beneficiaryId, hostId, date) => { if (isVisionOnly || !dataOwnerId || !date) return; await addDoc(collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'rotations'), { date: date, beneficiaryMemberId: beneficiaryId, hostMemberId: hostId, presidentId: dataOwnerId }); };
  const handleRequestPro = async () => { if (user) await updateDoc(doc(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'users', user.uid), { status: 'pending', requestDate: new Date().toISOString() }); };
  const handleApprovePro = async (uid, expiry) => { if (user?.email === ADMIN_EMAIL) await updateDoc(doc(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'users', uid), { status: 'pro', expiryDate: expiry }); };
  const handleAdminDeleteUser = (uid) => { if (user?.email !== ADMIN_EMAIL) return; setConfirmState({ isOpen: true, title: "Supprimer ce client ?", onConfirm: async () => { try { await deleteDoc(doc(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'users', uid)); setConfirmState(p => ({ ...p, isOpen: false })); } catch (e) { console.error(e); } } }); };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token).catch(() => {});
        } else { 
          await signInAnonymously(auth).catch(() => {});
        }
      } catch (e) { console.error(e); }
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
            setDoc(userDocRef, newProfile).catch(() => {});
            setProfile(newProfile);
          }
        });
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !dataOwnerId) return;
    const paths = {
      members: collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'members'),
      transactions: collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'transactions'),
      loans: collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'loans'),
      rotations: collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'rotations'),
      users: collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'users')
    };
    
    const unsubMembers = onSnapshot(paths.members, (snap) => setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(m => m.presidentId === dataOwnerId)), (err) => console.error(err));
    const unsubTransactions = onSnapshot(paths.transactions, (snap) => setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => t.presidentId === dataOwnerId)), (err) => console.error(err));
    const unsubLoans = onSnapshot(paths.loans, (snap) => setLoans(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(l => l.presidentId === dataOwnerId)), (err) => console.error(err));
    const unsubRotations = onSnapshot(paths.rotations, (snap) => setRotations(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.presidentId === dataOwnerId)), (err) => console.error(err));
    const unsubUsers = onSnapshot(paths.users, (snap) => setAllUsers(snap.docs.map(d => d.data())), (err) => console.error(err));
    
    return () => { unsubMembers(); unsubTransactions(); unsubLoans(); unsubRotations(); unsubUsers(); };
  }, [user, dataOwnerId]);

  const selectedBalanceValue = useMemo(() => {
    if (!globalFilter.memberId) return null;
    return transactions.filter(t => t.status === 'completed' && t.memberId === globalFilter.memberId && t.type === 'fonds').reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, globalFilter.memberId]);

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-indigo-600 animate-pulse uppercase tracking-widest">Chargement NJANGI...</div>;

  if (!user) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-slate-800 text-center">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100">
          <div className="mb-10 text-slate-800"><div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg"><Icon name="dashboard" className="w-10 h-10" /></div><h1 className="text-2xl font-black uppercase tracking-tighter text-slate-800">Tontine pour tous</h1></div>
          <div className="space-y-4 text-slate-800">
            {authError && <div className="bg-rose-50 text-rose-500 p-4 rounded-xl text-[10px] font-black uppercase">{authError}</div>}
            <input type="email" placeholder="Email" className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none text-slate-800" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
            <input type="password" placeholder="Mot de passe" className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none text-slate-800" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
            <ActionButton onClick={async () => { setAuthError(''); try { if (authMode === 'login') await signInWithEmailAndPassword(auth, authForm.email, authForm.password); else await createUserWithEmailAndPassword(auth, authForm.email, authForm.password); } catch (e) { setAuthError('Identifiants incorrects'); } }} label={authMode === 'login' ? 'Connexion' : 'Inscription'} className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black uppercase shadow-xl" />
          </div>
          <div className="mt-6 text-slate-800"><button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{authMode === 'login' ? "Nouveau ? Créer un compte" : "Déjà membre ? Connexion"}</button></div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden flex-col lg:flex-row">
      <ConfirmModal isOpen={confirmState.isOpen} title={confirmState.title} onConfirm={confirmState.onConfirm} onCancel={() => setConfirmState({...confirmState, isOpen: false})} />

      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 shrink-0">
        <div className="p-8 mb-8 flex items-center gap-2">
          <div className={`p-2 rounded-xl text-white ${isPremium ? 'bg-amber-500' : 'bg-indigo-600'}`}><Icon name="dashboard" /></div>
          <span className="text-xl font-black uppercase tracking-tighter">Tontine</span>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {NAV_LINKS.map(item => (
            <button key={item.id} onClick={() => setCurrentPage(item.id)} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === item.id ? 'bg-slate-50 text-indigo-700 border border-slate-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
              <Icon name={item.icon} className="w-3.5 h-3.5" />
              {String(item.label)}
            </button>
          ))}
        </nav>
        <div className="p-6">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 p-3 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 rounded-xl">Quitter</button>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50/50">
        <header className="h-14 bg-white border-b flex items-center justify-between px-4 lg:px-8 shrink-0">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-800"><Icon name="menu" /></button>
            {activeMeetingDate ? (
              <div className="text-[9px] font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">Réunion : {String(activeMeetingDate)}</div>
            ) : (
              <div className="text-[9px] font-black text-slate-400 uppercase bg-slate-100 px-3 py-1.5 rounded-full">Aucune séance active</div>
            )}
            <div className="flex items-center gap-3">
              <span className="hidden md:block text-[9px] font-black uppercase text-slate-400">{user?.email}</span>
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-[10px] uppercase shadow-md">{user?.email?.charAt(0)}</div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-10 scrollbar-hide">
            <div className="max-w-6xl mx-auto space-y-8">
               {currentPage === 'dashboard' && <DashboardView stats={stats} members={members} currency={currency} isVisionOnly={isVisionOnly} onAddMember={handleAddMember} onAddTransaction={handleAddTransaction} themeGradient={themeGradient} activeMeetingDate={activeMeetingDate} setActiveMeetingDate={setActiveMeetingDate} isPremium={isPremium} />}
               {currentPage === 'members' && <MembersView members={members} activeMeetingDate={activeMeetingDate} transactions={transactions} loans={loans} rotations={rotations} currency={currency} onDelete={handleDelete} isVisionOnly={isVisionOnly} onUpdate={handleUpdateMember} />}
               {currentPage === 'reports' && <ReportsView members={members} transactions={transactions} rotations={rotations} loans={loans} currency={currency} themeGradient={themeGradient} defaultDate={activeMeetingDate} />}
               {currentPage === 'finances' && <FinancesView transactions={filteredTransactions} allTransactions={transactions} members={members} currency={currency} onDelete={handleDelete} onUpdate={handleUpdateTransaction} isVisionOnly={isVisionOnly} activeMeetingDate={activeMeetingDate} />}
               {currentPage === 'rotations' && <RotationsView members={members} rotations={rotations} activeMeetingDate={activeMeetingDate} onAddRotation={handleAddRotation} onDelete={handleDelete} isVisionOnly={isVisionOnly} />}
               {currentPage === 'fonds' && (
                <div className="space-y-4">
                   <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                     <select value={globalFilter.memberId} onChange={(e) => setGlobalFilter({...globalFilter, memberId: e.target.value})} className="flex-1 p-2 bg-slate-50 border-none rounded-xl text-[10px] font-bold outline-none text-slate-800"><option value="">Tous les membres</option>{members.map(m => <option key={m.id} value={String(m.id)}>{String(m.name)}</option>)}</select>
                     {selectedBalanceValue !== null && (<div className="bg-emerald-50 px-3 py-1.5 rounded-xl text-emerald-700 text-[10px] font-black uppercase">Solde Net: {formatCurrency(selectedBalanceValue, currency)}</div>)}
                   </div>
                   <GenericHistory title={`Fond de caisse - ${activeMeetingDate || 'Global'}`} transactions={activeMeetingDate ? filteredTransactions.filter(t => t.type === 'fonds' && (!globalFilter.memberId || t.memberId === globalFilter.memberId)) : transactions.filter(t => t.type === 'fonds')} members={members} currency={currency} onDelete={handleDelete} onUpdate={handleUpdateTransaction} isVisionOnly={isVisionOnly} />
                </div>
               )}
               {currentPage === 'prets' && <LoansView loans={activeMeetingDate ? loans.filter(l => l.startDate === activeMeetingDate) : loans} members={members} currency={currency} onAdd={handleAddLoan} onDelete={handleDelete} isVisionOnly={isVisionOnly} themeGradient={themeGradient} activeMeetingDate={activeMeetingDate} />}
               {currentPage === 'settings' && <SettingsView currency={currency} setCurrency={setCurrency} profile={profile} onUpgrade={handleRequestPro} isAdmin={user?.email === ADMIN_EMAIL} allUsers={allUsers} onApprove={handleApprovePro} onAdminDelete={handleAdminDeleteUser} isVisionOnly={isVisionOnly} />}
            </div>
        </div>

        <div className="lg:hidden bg-white border-t flex justify-around p-2 shadow-2xl">
            {[ { id: 'dashboard', icon: 'dashboard' }, { id: 'members', icon: 'members' }, { id: 'finances', icon: 'cotisations' }, { id: 'reports', icon: 'fileText' } ].map(tab => (
              <button key={tab.id} onClick={() => setCurrentPage(tab.id)} className={`p-2 transition-colors ${currentPage === tab.id ? 'text-indigo-600' : 'text-slate-400'}`}><Icon name={tab.icon} /></button>
            ))}
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-400"><Icon name="dots" /></button>
        </div>
      </main>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden animate-in fade-in">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[3rem] p-8 space-y-4 shadow-2xl">
            <div className="bg-emerald-50 p-4 rounded-2xl flex items-center justify-between border border-emerald-100">
              <div className="flex items-center gap-3">
                <Icon name="phone" className="text-emerald-500 w-5 h-5" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">Assistance: {WHATSAPP_SUPPORT}</span>
              </div>
              <a href={`https://wa.me/${WHATSAPP_SUPPORT.replace(/^00/, '')}`} className="p-2 bg-emerald-500 text-white rounded-xl active:scale-95 transition-all shadow-sm">
                <Icon name="phone" className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {NAV_LINKS.map(item => (
                <button key={item.id} onClick={() => { setCurrentPage(item.id); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === item.id ? 'text-indigo-600 bg-indigo-50 border border-indigo-100' : 'text-slate-800 bg-slate-50 border border-slate-100'}`}>
                  <Icon name={item.icon} className="w-5 h-5" />
                  {String(item.label)}
                </button>
              ))}
            </div>
            <button onClick={handleLogout} className="w-full p-5 bg-rose-50 text-rose-500 rounded-2xl text-[10px] font-black uppercase shadow-sm border border-rose-100">Déconnexion</button>
          </div>
        </div>
      )}
    </div>
  );
}