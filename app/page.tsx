"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  query,
  getDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  signInWithCustomToken,
  signInAnonymously
} from 'firebase/auth';

// ==========================================
// CONFIGURATION FIREBASE & GEMINI
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

const apiKey = "AIzaSyCO3RwS9VvZNJIvUj3PneYVYhiiDfxijmQ"; 
const NJANGI_APP_ID = typeof __app_id !== 'undefined' ? __app_id : "tontine_pour_tous_v1";
const ADMIN_EMAIL = "wnguetsop@gmail.com";
const WHATSAPP_SUPPORT = "00393299639430"; 
const MOMO_NUMBER = "00237674095062"; 

const FREE_MEMBER_LIMIT = 10; 
const FREE_AI_LIMIT = 2;
const PRO_AI_LIMIT = 10;

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
    sparkles: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />,
    send: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />,
    lock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
  };
  return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>{icons[name] || null}</svg>;
};

// ==========================================
// COMPOSANTS ATOMIQUES (DÉCLARÉS EN PREMIER)
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
        <span className="flex items-center gap-2 tracking-tighter">{icon && <Icon name={icon} className="w-4 h-4" />} {String(label)}</span>
      ) : (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      )}
    </button>
  );
}

function ConfirmModal({ isOpen, title, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300 text-slate-800">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative w-full max-w-xs bg-white rounded-[2.5rem] shadow-2xl p-8 text-center">
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
      {sortedDates.length === 0 ? <div className="p-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">Aucune donnée</div> : sortedDates.map(date => (
          <div key={date} className="border-b last:border-none">
            <div className="bg-slate-50/30 px-4 py-2 text-[8px] font-black text-slate-400 uppercase tracking-tighter">{String(date)}</div>
            <table className="w-full text-left text-[11px]"><tbody className="divide-y divide-slate-50">{grouped[date].map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-bold">{members.find((m)=>m.id===t.memberId)?.name || '...'}</td><td className={`px-4 py-3 text-right font-black ${t.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{t.amount >= 0 ? '+' : ''}{formatCurrency(t.amount, currency)}</td>{!isVisionOnly && <td className="px-4 py-3 text-right space-x-1"><button onClick={() => edit(t.id, t.amount)} className="p-1 text-slate-300 hover:text-indigo-600"><Icon name="edit" className="w-4 h-4" /></button><button onClick={() => onDelete('transactions', t.id)} className="p-1 text-slate-300 hover:text-rose-500"><Icon name="trash" className="w-4 h-4" /></button></td>}</tr>
            ))}</tbody></table>
          </div>
        ))}
    </div>
  );
}

// ==========================================
// COMPOSANTS FEATURES (IA & PDF)
// ==========================================

function PdfOutputView({ content, currency, onExit }) {
  if (!content) return null;
  const handleShareText = () => {
    let text = "";
    if (content.type === 'report') {
      text = `📊 *RAPPORT - ${content.date}*\n\n🏠 Hôte: ${content.host}\n💰 Bénéf: ${content.beneficiary}\n\n`;
      content.membersList.forEach(m => { text += `👤 ${m.name} [${m.status}]\n   💵 Cotis: ${formatCurrency(m.cotis, currency)}\n   🏦 Épargne: ${formatCurrency(m.epargne, currency)}\n\n`; });
      text += `_Tontine Pour Tous_`;
    } else {
      text = `📅 *CALENDRIER*\n\n`;
      content.list.forEach(r => { text += `🗓️ ${r.date} -> ${r.beneficiary}\n`; });
    }
    if (navigator.share) navigator.share({ title: 'Rapport Tontine', text: text }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[999] bg-slate-50 flex flex-col items-center overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="w-full bg-slate-900 px-4 py-4 flex justify-between items-center sticky top-0 print:hidden z-[1000] shadow-xl">
        <button onClick={onExit} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-white font-black text-[10px] uppercase tracking-tighter">Fermer</button>
        <button onClick={handleShareText} className="flex items-center gap-2 px-6 py-2 bg-indigo-500 rounded-xl text-white font-black text-[10px] uppercase shadow-lg">Partager</button>
      </div>
      <div className="bg-white my-6 p-6 md:p-12 min-h-[297mm] w-full max-w-[210mm] print:m-0 print:shadow-none print:w-full text-slate-900 shadow-2xl rounded-sm border border-slate-200">
        {content.type === 'report' ? (
          <div className="space-y-8">
            <div className="bg-slate-900 text-white p-8 rounded-3xl text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16"></div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">Rapport de Séance</h1>
              <p className="text-indigo-300 font-bold uppercase tracking-widest text-sm mt-2">{content.date}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-indigo-50 p-4 rounded-2xl text-center"><p className="text-[8px] font-black uppercase text-indigo-400">Cotisations</p><p className="text-sm font-black text-indigo-700">{formatCurrency(content.totals.cotis, currency)}</p></div>
              <div className="bg-emerald-50 p-4 rounded-2xl text-center"><p className="text-[8px] font-black uppercase text-emerald-400">Solde Fonds</p><p className="text-sm font-black text-emerald-700">{formatCurrency(content.totals.depotsFonds - content.totals.sortiesFonds, currency)}</p></div>
              <div className="bg-amber-50 p-4 rounded-2xl text-center"><p className="text-[8px] font-black uppercase text-amber-400">Épargne</p><p className="text-sm font-black text-amber-700">{formatCurrency(content.totals.epargne, currency)}</p></div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-left text-[10px] border-collapse">
                <thead><tr className="bg-slate-900 text-white uppercase text-[8px] tracking-widest"><th className="p-4 border-r border-white/10">Membre</th><th className="p-4 border-r border-white/10 text-center">Status</th><th className="p-4 border-r border-white/10 text-right">Cotis.</th><th className="p-4 border-r border-white/10 text-right">Épargne</th><th className="p-4 border-r border-white/10 text-right">Fonds</th><th className="p-4 text-right">Prêt</th></tr></thead>
                <tbody>{content.membersList.map((m, i) => (
                    <tr key={i} className="border-b border-slate-100 odd:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-700 uppercase">{m.name}</td>
                      <td className="p-4 text-center"><span className={`px-2 py-1 rounded-md text-[7px] font-black ${m.status === 'PAYÉ' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{m.status}</span></td>
                      <td className="p-4 text-right font-black text-indigo-600">{formatCurrency(m.cotis, currency)}</td>
                      <td className="p-4 text-right font-black text-amber-600">{formatCurrency(m.epargne, currency)}</td>
                      <td className="p-4 text-right font-black text-emerald-600">{formatCurrency(m.depotFond - m.sortieFond, currency)}</td>
                      <td className="p-4 text-right font-black text-rose-600">{formatCurrency(m.pretTotal, currency)}</td>
                    </tr>
                ))}</tbody>
              </table>
            </div>
            <div className="mt-12 flex justify-center print:hidden">
              <button onClick={() => window.print()} className="flex flex-col items-center gap-1 group">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-90"><Icon name="print" className="w-7 h-7" /></div>
                <span className="text-[8px] font-black uppercase text-slate-400">Imprimer / PDF</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-indigo-600 text-white p-8 rounded-3xl text-center"><h1 className="text-3xl font-black uppercase tracking-tighter">{content.title}</h1></div>
            <div className="overflow-hidden rounded-2xl border border-slate-200"><table className="w-full text-left text-xs border-collapse"><thead><tr className="bg-slate-900 text-white uppercase text-[10px]"><th className="p-4 border-r border-white/10">Date</th><th className="p-4 border-r border-white/10">Bénéficiaire</th><th className="p-4">Hôte</th></tr></thead><tbody>{content.list.map((r, i) => (<tr key={i} className="border-b border-slate-100 odd:bg-slate-50"><td className="p-4 font-black text-slate-500">{r.date}</td><td className="p-4 uppercase font-bold text-emerald-600">{r.beneficiary}</td><td className="p-4 uppercase font-bold text-indigo-600">{r.host}</td></tr>))}</tbody></table></div>
            <div className="mt-12 flex justify-center print:hidden">
              <button onClick={() => window.print()} className="flex flex-col items-center gap-1 group">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-90"><Icon name="print" className="w-7 h-7" /></div>
                <span className="text-[8px] font-black uppercase text-slate-400">Imprimer / PDF</span>
              </button>
            </div>
          </div>
        )}
        <div className="mt-16 pt-8 border-t border-slate-200 text-center text-[10px] font-black uppercase text-indigo-600 tracking-widest">Tontine Pour Tous</div>
      </div>
      <style>{`@media print {@page { size: A4; margin: 0; } body { background: white !important; margin: 0; } .print\\:hidden, button, .sticky { display: none !important; } .min-h-[297mm] { height: 100vh !important; width: 100vw !important; border: none !important; margin: 0 !important; }}`}</style>
    </div>
  );
}

function AiAssistant({ members, stats, activeMeetingDate, transactions, currency, onClose, profile, user }) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([{ role: 'ai', text: "Bonjour ! Je suis votre assistant. Que souhaitez-vous savoir ?" }]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const isPro = profile?.status === 'pro';
  const dailyLimit = isPro ? PRO_AI_LIMIT : FREE_AI_LIMIT;
  const todayStr = new Date().toISOString().split('T')[0];
  const usageToday = (profile?.aiUsage?.date === todayStr) ? (profile?.aiUsage?.count || 0) : 0;

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const askAI = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    if (usageToday >= dailyLimit) {
      setMessages(prev => [...prev, { role: 'ai', text: `Limite atteinte (${usageToday}/${dailyLimit}). ${!isPro ? 'Passez PRO pour 10 questions/jour.' : ''}` }]);
      return;
    }
    const userText = query.trim();
    setQuery("");
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const context = `Assistant Tontine. Séance=${activeMeetingDate}, Membres=${members.map(m=>m.name).join(',')}. Stats Séance: Cotis=${stats.cotisations}.`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `Contexte : ${context}\n\nUtilisateur : ${userText}` }] }] })
      });
      const data = await response.json();
      const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      await updateDoc(doc(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'users', user.uid), { aiUsage: { date: todayStr, count: usageToday + 1 } });
      setMessages(prev => [...prev, { role: 'ai', text: resultText || "Désolé, réessayez." }]);
    } catch (err) { setMessages(prev => [...prev, { role: 'ai', text: "Erreur connexion." }]); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300 text-slate-800">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl flex flex-col h-[80vh] overflow-hidden">
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg"><Icon name="sparkles" className="w-6 h-6" /></div>
            <div><h3 className="text-sm font-black uppercase">IA Assistant</h3><p className="text-[8px] text-indigo-300 font-bold uppercase">Usage : {usageToday}/{dailyLimit}</p></div>
          </div>
          <button onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-3xl text-xs font-medium shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'}`}>{m.text}</div>
            </div>
          ))}
          <div ref={scrollRef}></div>
        </div>
        <form onSubmit={askAI} className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0"><input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Question..." className="flex-1 p-4 bg-slate-100 border-none rounded-2xl text-xs font-bold outline-none text-slate-800" /><button type="submit" disabled={loading} className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg active:scale-90 transition-all"><Icon name="send" /></button></form>
      </div>
    </div>
  );
}

// ==========================================
// VUES SECONDAIRES
// ==========================================

function DashboardView({ stats, members, currency, isVisionOnly, onAddMember, onAddTransaction, themeGradient, activeMeetingDate, setActiveMeetingDate, isPremium, onOpenAI }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [op, setOp] = useState({ mId: '', amt: '', type: 'cotisation', dir: 'in', method: 'cash' });
  const isLimitReached = !isPremium && members.length >= FREE_MEMBER_LIMIT;

  return (
    <div className="space-y-4 animate-in fade-in duration-500 text-slate-800">
      {!isVisionOnly && (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${isLimitReached ? 'bg-slate-400' : `bg-gradient-to-br ${themeGradient}`}`}><Icon name="plus" /></div>
            <div><h3 className="text-sm font-black uppercase tracking-tight">Membres</h3><p className="text-[9px] text-slate-400 font-bold uppercase">{members.length} / {isPremium ? '∞' : FREE_MEMBER_LIMIT}</p></div>
          </div>
          <ActionButton onClick={() => setShowAddModal(true)} label={isLimitReached ? "Limite Atteinte" : "Inscrire Membre"} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg ${isLimitReached ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white'}`} icon={isLimitReached ? "lock" : "plus"} />
        </div>
      )}
      <div className="bg-white p-6 rounded-[2rem] border-2 border-indigo-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Icon name="calendar" /></div>
          <div><h2 className="text-sm font-black uppercase tracking-tight">Séance Active</h2><p className="text-[10px] text-slate-400 font-medium tracking-tight">Sélectionnez la séance actuelle.</p></div>
        </div>
        <div className="relative w-full md:w-auto">
          <input type="date" value={activeMeetingDate || ""} onChange={(e) => setActiveMeetingDate(e.target.value)} className="w-full md:w-64 p-4 bg-slate-50 border-none rounded-2xl font-black text-sm outline-none text-indigo-600 shadow-inner" />
          {!activeMeetingDate && <div className="absolute left-1/2 -translate-x-1/2 md:left-auto md:right-4 top-full mt-4 flex flex-col items-center gap-2 animate-bounce pointer-events-none z-[50]"><Icon name="arrowUp" className="w-8 h-8 text-indigo-600" /><h3 className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 shadow-sm whitespace-nowrap tracking-tighter">Choisissez une date</h3></div>}
        </div>
      </div>
      {activeMeetingDate && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div onClick={onOpenAI} className="cursor-pointer p-6 rounded-[2rem] shadow-xl bg-slate-900 text-white relative overflow-hidden group border-4 border-white/20 active:scale-95 transition-all">
              <h3 className="text-base font-black uppercase tracking-tighter">Assistant IA</h3><p className="text-[8px] font-bold opacity-80 uppercase tracking-widest">Questions & Bilans</p>
              <div className="absolute -bottom-2 -right-2 opacity-20 group-hover:scale-110 transition-transform"><Icon name="sparkles" className="w-16 h-16" /></div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between"><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cotisations séance</p><h3 className="text-lg font-black text-indigo-600 truncate">{formatCurrency(stats?.cotisations || 0, currency)}</h3></div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between"><p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Fond de caisse</p><h3 className="text-lg font-black text-emerald-600 truncate">{formatCurrency(stats?.fonds || 0, currency)}</h3></div>
        </div>
      )}
      {activeMeetingDate && !isVisionOnly && (
        <div className="bg-white p-6 lg:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-[11px] font-black uppercase mb-6 tracking-tighter flex items-center gap-3"><div className="w-1 h-4 bg-indigo-600 rounded-full" /> Saisir mouvement ({activeMeetingDate})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <select value={op.mId} onChange={(e)=>setOp({...op, mId:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none text-slate-800 shadow-inner"><option value="">Choisir Membre...</option>{members.map((m)=><option key={m.id} value={String(m.id)}>{String(m.name)}</option>)}</select>
              <select value={op.type} onChange={(e)=>setOp({...op, type:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none text-slate-800 shadow-inner"><option value="cotisation">Cotisation</option><option value="epargne">Épargne</option><option value="fonds">Fond de caisse</option></select>
              <select value={op.method} onChange={(e)=>setOp({...op, method:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none text-slate-800 shadow-inner"><option value="cash">Espèces</option><option value="momo">Momo</option></select>
              <div className="md:col-span-2 lg:col-span-3 flex bg-slate-100 rounded-2xl p-1">
                <button onClick={()=>setOp({...op,dir:'in'})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase ${op.dir==='in'?'bg-white shadow text-indigo-600':'text-slate-400'}`}>Entrée</button>
                <button onClick={()=>setOp({...op,dir:'out'})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase ${op.dir==='out'?'bg-white shadow text-rose-600':'text-slate-400'}`}>Sortie</button>
              </div>
              <input type="number" value={op.amt} onChange={(e)=>setOp({...op,amt:e.target.value})} className="md:col-span-2 lg:col-span-3 p-4 bg-slate-50 rounded-2xl font-black text-2xl text-center outline-none border border-slate-100 text-slate-800 shadow-inner" placeholder="0.00" />
              <ActionButton onClick={async () => { if(!op.mId||!op.amt) return; await onAddTransaction(op.mId,op.dir==='in'?Number(op.amt):-Number(op.amt),op.type, op.method); setOp({...op,amt:''}); }} label="Valider" className="md:col-span-2 lg:col-span-3 bg-slate-900 text-white p-5 rounded-3xl font-black text-xs uppercase shadow-xl" />
          </div>
        </div>
      )}
      {showAddModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 text-slate-800"><div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAddModal(false)}></div>
            <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl">
               <h2 className="text-xl font-black uppercase mb-6 tracking-tighter">{isConfirming ? "Confirmation" : "Nouveau Membre"}</h2>
               {isLimitReached ? (
                 <div className="text-center p-6 space-y-4">
                   <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto"><Icon name="lock" className="w-8 h-8" /></div>
                   <p className="text-xs text-slate-500 font-medium">Limite atteinte (10 membres). Passez en mode PRO pour en ajouter davantage.</p>
                   <button onClick={() => setShowAddModal(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase">Compris</button>
                 </div>
               ) : !isConfirming ? (
                 <div className="space-y-4">
                    <input type="text" placeholder="Nom complet..." value={nameInput} onChange={e=>setNameInput(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none text-slate-800 shadow-inner" />
                    <input type="text" placeholder="Téléphone..." value={phoneInput} onChange={e=>setPhoneInput(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none text-slate-800 shadow-inner" />
                    <div className="flex gap-3"><button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-tighter">Annuler</button><button onClick={() => { if(nameInput.trim()) setIsConfirming(true); }} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-tighter shadow-lg">Enregistrer</button></div></div>
               ) : (
                 <div className="space-y-4"><p className="text-xs text-slate-500">Inscrire <strong className="text-indigo-600 uppercase">{String(nameInput)}</strong> ?</p>
                    <div className="flex gap-3"><button onClick={() => setIsConfirming(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-tighter">Retour</button>
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
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
        <h2 className="text-xs font-black uppercase text-slate-500 tracking-tight">{showHistory ? "Historique" : `Séance ${activeMeetingDate || '?'}`}</h2>
        <button onClick={() => setShowHistory(!showHistory)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${showHistory ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}>{showHistory ? "Vue séance" : "Voir tout"}</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GenericHistory title="Cotisations" transactions={displayTrans.filter(t => t.type === 'cotisation')} members={members} currency={currency} onDelete={onDelete} onUpdate={onUpdate} isVisionOnly={isVisionOnly} />
        <GenericHistory title="Épargne" transactions={displayTrans.filter(t => t.type === 'epargne')} members={members} currency={currency} onDelete={onDelete} onUpdate={onUpdate} isVisionOnly={isVisionOnly} />
      </div>
    </div>
  );
}

function ReportsView({ members, transactions, rotations, loans, currency, themeGradient, defaultDate, onRedirectToPdf }) {
  const [reportDate, setReportDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  useEffect(() => { if (defaultDate) setReportDate(defaultDate); }, [defaultDate]);

  const sessionData = useMemo(() => {
    const d = String(reportDate || "");
    const trans = (transactions || []).filter((t) => String(t.date) === d && t.status === 'completed');
    const rot = (rotations || []).find((r) => String(r.date) === d);
    const sLoans = (loans || []).filter((l) => String(l.startDate) === d);
    return {
      type: 'report', date: d, beneficiary: members.find((m) => m.id === rot?.beneficiaryMemberId)?.name || 'Non défini',
      host: members.find((m) => m.id === rot?.hostMemberId)?.name || 'Non défini',
      membersList: (members || []).map((m) => {
        const mTrans = trans.filter((t) => t.memberId === m.id);
        const mLoan = sLoans.find((l) => l.memberId === m.id);
        const cotis = mTrans.filter((t) => t.type === 'cotisation').reduce((s, t) => s + t.amount, 0);
        return { name: m.name, cotis, epargne: mTrans.filter((t) => t.type === 'epargne').reduce((s, t) => s + t.amount, 0), 
          depotFond: mTrans.filter((t) => t.type === 'fonds' && t.amount > 0).reduce((s, t) => s + t.amount, 0), 
          sortieFond: Math.abs(mTrans.filter((t) => t.type === 'fonds' && t.amount < 0).reduce((s, t) => s + t.amount, 0)), 
          pretTotal: mLoan?.totalAmount || 0, status: cotis > 0 ? 'PAYÉ' : 'NON PAYÉ' };
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

  return (
    <div className="space-y-6 text-slate-800">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div><h2 className="text-xl font-black uppercase tracking-tighter">Éditer Rapport</h2><p className="text-[10px] text-slate-400 font-bold uppercase">Bilan de séance complet</p></div>
          <div className="flex items-center gap-4">
              <input type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)} className="p-4 bg-slate-50 border-none rounded-2xl font-black outline-none text-indigo-600 shadow-inner" />
              <button onClick={() => onRedirectToPdf(sessionData)} className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg transition-all active:scale-90"><Icon name="print" /></button>
          </div>
      </div>
    </div>
  );
}

function RotationsView({ members, rotations, activeMeetingDate, onAddRotation, onDelete, isVisionOnly, themeGradient, onRedirectToPdf }) {
  const [beneficiary, setBeneficiary] = useState("");
  const [host, setHost] = useState("");
  const [customDate, setCustomDate] = useState("");
  const sortedRotations = useMemo(() => [...rotations].sort((a, b) => new Date(a.date) - new Date(b.date)), [rotations]);
  const rotationData = useMemo(() => ({
    type: 'rotations', title: 'Calendrier des Rotations',
    list: sortedRotations.map(r => ({ date: r.date, beneficiary: members.find(m => m.id === r.beneficiaryMemberId)?.name || '...', host: members.find(m => m.id === r.hostMemberId)?.name || '...' }))
  }), [sortedRotations, members]);

  return (
    <div className="space-y-6 text-slate-800">
      {!isVisionOnly && (
        <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
           <div className="flex justify-between items-center mb-6"><h2 className="text-sm font-black uppercase tracking-widest text-slate-700">Calendrier</h2><button onClick={() => onRedirectToPdf(rotationData)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Icon name="print" /></button></div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none text-indigo-600 shadow-inner" />
              <select value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none"><option value="">Bénéficiaire...</option>{members.map(m => <option key={m.id} value={m.id}>{String(m.name)}</option>)}</select>
              <select value={host} onChange={(e) => setHost(e.target.value)} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none"><option value="">Hôte...</option>{members.map(m => <option key={m.id} value={m.id}>{String(m.name)}</option>)}</select>
           </div>
           <ActionButton onClick={async () => { if(!beneficiary || !host || !customDate) return; await onAddRotation(beneficiary, host, customDate); setBeneficiary(""); setHost(""); setCustomDate(""); }} label="Valider au calendrier" className="w-full bg-indigo-600 text-white p-5 rounded-3xl font-black uppercase shadow-xl" />
        </div>
      )}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full table-fixed text-[11px] text-slate-800">
          <thead><tr className="bg-slate-50 font-black uppercase text-slate-400 tracking-tighter"><th className="p-4 text-left">Date</th><th className="p-4 text-left">Bénéficiaire</th><th className="p-4 text-left">Hôte</th>{!isVisionOnly && <th className="p-4 w-12"></th>}</tr></thead>
          <tbody className="divide-y divide-slate-50">
            {sortedRotations.map(rot => (<tr key={rot.id} className="hover:bg-slate-50"><td className="p-4 font-bold text-slate-600">{rot.date}</td><td className="p-4 uppercase font-black text-emerald-600">{members.find(m => m.id === rot.beneficiaryMemberId)?.name || '...'}</td><td className="p-4 uppercase font-black text-indigo-600">{members.find(m => m.id === rot.hostMemberId)?.name || '...'}</td>{!isVisionOnly && <td className="p-4"><button onClick={()=>onDelete('rotations', rot.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><Icon name="trash" /></button></td>}</tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MembersView({ members, activeMeetingDate, transactions, loans, onDelete, isVisionOnly, onUpdate, currency }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const editMember = (id, cn, cp) => { const n = prompt("Nom :", cn); const p = prompt("Tél :", cp || ""); if (n && n.trim()) onUpdate(id, n.trim(), p ? p.trim() : ""); };
  const memberReport = useMemo(() => {
    if (!selectedMember || !activeMeetingDate) return null;
    const mId = selectedMember.id;
    const mTrans = transactions.filter(t => t.memberId === mId && t.date === activeMeetingDate && t.status === 'completed');
    const mLoans = (loans || []).filter(l => l.memberId === mId && l.startDate === activeMeetingDate);
    return { name: selectedMember.name, cotis: mTrans.filter(t => t.type === 'cotisation').reduce((s, t) => s + t.amount, 0), epargne: mTrans.filter(t => t.type === 'epargne').reduce((s, t) => s + t.amount, 0), fonds: mTrans.filter(t => t.type === 'fonds').reduce((s, t) => s + t.amount, 0), loan: mLoans.reduce((s, l) => s + l.totalAmount, 0) };
  }, [selectedMember, activeMeetingDate, transactions, loans]);

  return (
    <div className="space-y-8 text-slate-800">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {members.map(m => (
          <div key={m.id} onClick={() => setSelectedMember(m)} className="bg-white p-4 rounded-[1.5rem] border border-slate-100 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">{m.name.charAt(0)}</div>
              <div><p className="font-bold text-xs">{m.name}</p>{m.phone && <p className="text-[8px] text-slate-400 font-medium">{m.phone}</p>}</div>
            </div>
            {!isVisionOnly && <div className="flex gap-1"><button onClick={(e)=>{ e.stopPropagation(); editMember(m.id, m.name, m.phone); }} className="p-2 text-slate-200 hover:text-indigo-600 transition-colors"><Icon name="edit" className="w-4 h-4" /></button><button onClick={(e)=>{ e.stopPropagation(); onDelete('members', m.id); }} className="p-2 text-slate-200 hover:text-rose-500 transition-colors"><Icon name="trash" className="w-4 h-4" /></button></div>}
          </div>
        ))}
      </div>
      {selectedMember && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 text-slate-800 animate-in zoom-in-95 duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedMember(null)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden">
            <div className="flex justify-between items-center mb-6"><div><h2 className="text-lg font-black uppercase tracking-tighter">Fiche Membre</h2><p className="text-[10px] text-slate-400 font-black uppercase">{selectedMember.name}</p></div><button onClick={() => setSelectedMember(null)}><Icon name="close" /></button></div>
            {!activeMeetingDate ? <div className="p-6 bg-rose-50 text-rose-500 rounded-2xl text-center font-black text-[10px] uppercase">Choisissez une séance active</div> : (
              <div className="space-y-3">
                <div className="flex justify-between p-4 bg-slate-50 rounded-2xl font-bold text-xs"><span className="text-slate-400 uppercase tracking-tight">Cotisation</span><span className="text-indigo-600 font-black">{formatCurrency(memberReport.cotis, currency)}</span></div>
                <div className="flex justify-between p-4 bg-slate-50 rounded-2xl font-bold text-xs"><span className="text-slate-400 uppercase tracking-tight">Épargne</span><span className="text-amber-600 font-black">{formatCurrency(memberReport.epargne, currency)}</span></div>
                <div className="flex justify-between p-4 bg-slate-50 rounded-2xl font-bold text-xs"><span className="text-slate-400 uppercase tracking-tight">Fond de Caisse</span><span className={memberReport.fonds >= 0 ? 'text-emerald-600 font-black' : 'text-rose-600 font-black'}>{formatCurrency(memberReport.fonds, currency)}</span></div>
                <div className="flex justify-between p-4 bg-rose-50 rounded-2xl font-bold text-xs text-rose-600"><span className="uppercase tracking-tight">Prêt Dû</span><span className="font-black">{formatCurrency(memberReport.loan, currency)}</span></div>
              </div>
            )}
            <div className="mt-8 pt-6 border-t border-slate-100"><ActionButton onClick={async () => { window.open(`https://wa.me/${selectedMember.phone?.replace(/[^0-9]/g, '')}`, '_blank'); }} label="Contacter WhatsApp" className="w-full bg-emerald-500 text-white p-4 rounded-2xl font-black text-[10px] uppercase shadow-lg" /></div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoansView({ members, loans, currency, onAdd, onDelete, isVisionOnly, themeGradient, activeMeetingDate }) {
  const [data, setData] = useState({ mId: '', amt: '', rate: '10', dueDate: '' });
  const total = (Number(data.amt) || 0) * (1 + (Number(data.rate) || 0) / 100);
  if (!activeMeetingDate) return <div className="bg-rose-50 p-10 rounded-[3rem] border-2 border-dashed border-rose-200 text-center text-rose-700 font-black">DATE SÉANCE REQUISE</div>;
  return (
    <div className="space-y-4 text-slate-800">
      {!isVisionOnly && (
        <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-sm font-black uppercase mb-6 text-slate-700 tracking-widest">Octroi de Prêt</h2>
          <div className="space-y-5 text-slate-800">
            <select value={data.mId} onChange={(e)=>setData({...data, mId:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none text-slate-800 shadow-inner"><option value="">Membre...</option>{members.map((m)=><option key={m.id} value={m.id}>{String(m.name)}</option>)}</select>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Capital" value={data.amt} onChange={(e)=>setData({...data, amt:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm outline-none shadow-inner" />
              <input type="number" placeholder="Taux %" value={data.rate} onChange={(e)=>setData({...data, rate:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm outline-none shadow-inner" />
            </div>
            <input type="date" value={data.dueDate} onChange={(e)=>setData({...data, dueDate:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm outline-none text-indigo-600 shadow-inner" />
            <ActionButton onClick={async () => { if(!data.mId || !data.amt || !data.dueDate) return; await onAdd({memberId: data.mId, principal: Number(data.amt), interestRate: Number(data.rate), totalAmount: total, dueDate: data.dueDate, status: 'actif'}); setData({mId:'', amt:'', rate:'10', dueDate:''}); }} label="Enregistrer le prêt" className={`w-full py-5 bg-gradient-to-br ${themeGradient} text-white rounded-3xl font-black text-[11px] uppercase shadow-lg`} />
          </div>
        </div>
      )}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden text-slate-800">
        <table className="w-full text-left text-[11px]"><tbody className="divide-y divide-slate-50">{loans.map((l)=>(<tr key={l.id} className="hover:bg-slate-50"><td className="p-4 font-bold">{members.find((m)=>m.id===l.memberId)?.name || 'Inconnu'}</td><td className="p-4 text-indigo-500 font-black">Taux: {l.interestRate}%</td><td className="p-4"><span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg font-black text-[9px] uppercase tracking-tighter">{l.dueDate}</span></td><td className="p-4 text-right font-black text-rose-500">{formatCurrency(l.totalAmount, currency)}</td>{!isVisionOnly && <td className="p-4 text-right"><button onClick={()=>onDelete('loans', l.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Icon name="trash" className="w-4 h-4" /></button></td>}</tr>))}</tbody></table>
      </div>
    </div>
  );
}

function SettingsView({ currency, setCurrency, profile, onUpgrade, isAdmin, allUsers, onApprove, onDelete, isVisionOnly }) {
  const [exp, setExp] = useState('');
  return (
    <div className="space-y-4 lg:space-y-10 pb-20 text-slate-800 animate-in fade-in duration-500">
      <div className="bg-white p-5 lg:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-3 tracking-tighter">Préférences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
             <div className="p-5 bg-slate-50 rounded-[1.5rem] border">
                <p className="font-black text-[10px] uppercase mb-4 tracking-widest text-slate-400">Devise App</p>
                <select value={currency || "FCFA"} onChange={e => setCurrency(e.target.value)} className="w-full p-4 bg-white border border-slate-100 rounded-2xl font-black text-[11px] outline-none shadow-sm"><option value="FCFA">FCFA</option><option value="USD">USD</option><option value="EUR">EUR</option></select>
             </div>
             <div className="p-8 border-2 border-indigo-50 rounded-[2.5rem] text-center bg-white shadow-inner">
                <div className="w-12 h-12 mx-auto mb-4 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Icon name="settings" /></div>
                <h3 className="text-lg font-black uppercase mb-6 tracking-tighter">Service Premium</h3>
                <div className="bg-indigo-50 p-6 rounded-2xl text-left space-y-2 mb-6 text-indigo-700">
                    <p className="text-[10px] font-black uppercase tracking-tighter">Mobile Money : {MOMO_NUMBER}</p>
                    <p className="text-[10px] font-black uppercase tracking-tighter">PayPal : j_nguetsop@yahoo.com</p>
                    <p className="text-[9px] font-medium opacity-80 mt-2 italic">* Activation (1€) : membres illimités et 10 questions IA par jour.</p>
                </div>
                {!isVisionOnly && profile?.status === 'none' && <ActionButton onClick={onUpgrade} label="Demander Activation PRO" className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black text-xs uppercase shadow-xl" />}
                {profile?.status === 'pending' && <div className="p-4 bg-amber-50 text-amber-600 font-black text-[10px] uppercase rounded-2xl border border-amber-100 animate-pulse text-center">Demande en cours...</div>}
                {profile?.status === 'pro' && <div className="p-4 bg-emerald-50 text-emerald-600 font-black text-[10px] uppercase rounded-2xl border border-emerald-100 shadow-sm text-center">Premium Actif</div>}
             </div>
          </div>
      </div>
      <div className="bg-white p-6 lg:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
        <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-3 tracking-tighter">Support & Assistance</h2>
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 text-slate-800">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg"><Icon name="phone" className="w-6 h-6" /></div>
          <div className="text-center md:text-left"><p className="text-xs font-black uppercase text-emerald-600 tracking-widest">WhatsApp Direct</p><p className="text-xl font-black text-emerald-800">{WHATSAPP_SUPPORT}</p></div>
          <a href={`https://wa.me/${WHATSAPP_SUPPORT.replace(/^00/, '')}`} target="_blank" rel="noreferrer" className="md:ml-auto px-8 py-3 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all text-center tracking-tighter">Discuter maintenant</a>
        </div>
      </div>
      {isAdmin && (
        <div className="bg-white p-6 lg:p-10 rounded-[2rem] border-4 border-indigo-100 shadow-xl text-slate-800">
          <h2 className="text-xs font-black uppercase text-indigo-600 mb-6 font-bold uppercase tracking-widest">Admin Panel</h2>
          <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="text-[9px] uppercase text-slate-400 tracking-widest"><th className="py-2">Utilisateur</th><th className="py-2">Expiration</th><th className="text-right py-2">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {(allUsers || []).map(u => (
                  <tr key={u.uid}><td className="py-4 text-xs font-bold uppercase flex items-center gap-2">{u.status === 'pending' && <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></div>}{String(u.email)}</td>
                    <td className="py-4 text-[10px] font-black text-indigo-600">{String(u.expiryDate || 'N/A')}</td>
                    <td className="py-4 text-right space-x-2"><input type="date" className="p-1 border rounded text-[10px] outline-none text-slate-800" onChange={e=>setExp(e.target.value)} /><button onClick={() => onApprove(u.uid, exp || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0])} className="bg-emerald-600 text-white px-3 py-1 rounded text-[8px] font-black uppercase shadow-sm transition-colors">Valider</button><button onClick={() => onDelete('users', u.uid)} className="bg-rose-500 text-white px-2 py-1 rounded shadow-sm"><Icon name="trash" className="w-3 h-3 text-white" /></button></td>
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
// COMPOSANT PRINCIPAL APP
// ==========================================

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pdfContent, setPdfContent] = useState(null); 
  const [showAI, setShowAI] = useState(false);
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
    { id: 'dashboard', label: 'Accueil', icon: 'dashboard' }, { id: 'members', label: 'Membres', icon: 'members' },
    { id: 'finances', label: 'Finances', icon: 'cotisations' }, { id: 'reports', label: 'Rapports', icon: 'fileText' },
    { id: 'prets', label: 'Prêts', icon: 'prets' }, { id: 'rotations', label: 'Rotations', icon: 'share' },
    { id: 'fonds', label: 'Caisse', icon: 'fonds' }, { id: 'settings', label: 'Options', icon: 'settings' }, 
  ];

  const filteredTransactions = useMemo(() => activeMeetingDate ? transactions.filter(t => t.date === activeMeetingDate) : [], [transactions, activeMeetingDate]);
  const stats = useMemo(() => {
    const s = filteredTransactions.filter(t => t.status === 'completed');
    return { cotisations: s.filter(t => t.type === 'cotisation').reduce((sum, t) => sum + t.amount, 0), epargne: s.filter(t => t.type === 'epargne').reduce((sum, t) => sum + t.amount, 0), fonds: s.filter(t => t.type === 'fonds').reduce((sum, t) => sum + t.amount, 0) };
  }, [filteredTransactions]);

  const handleLogout = async () => { await signOut(auth); setUser(null); setProfile(null); setCurrentPage('dashboard'); setIsMobileMenuOpen(false); };
  const handleAddMember = async (name, phone) => { 
    if (isVisionOnly || !user?.uid) return;
    if (!isPremium && members.length >= FREE_MEMBER_LIMIT) return;
    await addDoc(collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'members'), { name, phone: phone || "", joinDate: new Date().toISOString().split('T')[0], presidentId: user.uid }); 
  };
  const handleUpdateMember = async (id, newName, newPhone) => { if (isVisionOnly) return; await updateDoc(doc(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'members', id), { name: newName, phone: newPhone || "" }); };
  const handleDelete = (coll, id) => { 
    if (isVisionOnly) return; 
    setConfirmState({ isOpen: true, title: "Supprimer cet élément ?", onConfirm: async () => { try { const path = coll === 'users' ? 'users' : coll; await deleteDoc(doc(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', path, id)); setConfirmState(p => ({ ...p, isOpen: false })); } catch (e) { console.error(e); } } }); 
  };
  const handleAddTransaction = async (mId, amt, type, method = 'cash') => { if (isVisionOnly || !dataOwnerId || !activeMeetingDate) return; await addDoc(collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'transactions'), { memberId: mId, amount: amt, type, method, status: 'completed', date: activeMeetingDate, presidentId: dataOwnerId }); };
  const handleUpdateTransaction = async (id, newAmt) => { if (isVisionOnly) return; await updateDoc(doc(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'transactions', id), { amount: newAmt }); };
  const handleAddLoan = async (loanData) => { if (isVisionOnly || !dataOwnerId || !activeMeetingDate) return; await addDoc(collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'loans'), { ...loanData, startDate: activeMeetingDate, presidentId: dataOwnerId }); };
  const handleAddRotation = async (beneficiaryId, hostId, date) => { if (isVisionOnly || !dataOwnerId || !date) return; await addDoc(collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'rotations'), { date: date, beneficiaryMemberId: beneficiaryId, hostMemberId: hostId, presidentId: dataOwnerId }); };
  const handleRequestPro = async () => { if (user) await updateDoc(doc(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'users', user.uid), { status: 'pending', requestDate: new Date().toISOString() }); };
  const handleApprovePro = async (uid, expiry) => { if (user?.email === ADMIN_EMAIL) await updateDoc(doc(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'users', uid), { status: 'pro', expiryDate: expiry }); };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token).catch(() => {});
        else await signInAnonymously(auth).catch(() => {});
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
            const newProfile = { uid: firebaseUser.uid, email: firebaseUser.email || 'Anonyme', status: 'none', role: 'president', aiUsage: { date: '', count: 0 } };
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
    const paths = { members: collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'members'), transactions: collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'transactions'), loans: collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'loans'), rotations: collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'rotations'), users: collection(db, 'artifacts', NJANGI_APP_ID, 'public', 'data', 'users') };
    const unsubMembers = onSnapshot(paths.members, (snap) => setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(m => m.presidentId === dataOwnerId)), (err) => console.error(err));
    const unsubTransactions = onSnapshot(paths.transactions, (snap) => setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => t.presidentId === dataOwnerId)), (err) => console.error(err));
    const unsubLoans = onSnapshot(paths.loans, (snap) => setLoans(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(l => l.presidentId === dataOwnerId)), (err) => console.error(err));
    const unsubRotations = onSnapshot(paths.rotations, (snap) => setRotations(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.presidentId === dataOwnerId)), (err) => console.error(err));
    const unsubUsers = onSnapshot(paths.users, (snap) => setAllUsers(snap.docs.map(d => d.data())), (err) => console.error(err));
    return () => { unsubMembers(); unsubTransactions(); unsubLoans(); unsubRotations(); unsubUsers(); };
  }, [user, dataOwnerId]);

  const selectedBalanceValue = useMemo(() => globalFilter.memberId ? transactions.filter(t => t.status === 'completed' && t.memberId === globalFilter.memberId && t.type === 'fonds').reduce((sum, t) => sum + t.amount, 0) : null, [transactions, globalFilter.memberId]);

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-indigo-600 animate-pulse uppercase tracking-widest text-sm">Chargement...</div>;
  if (!user) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-slate-800 text-center">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100 text-slate-800">
          <div className="mb-10 text-slate-800"><div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg"><Icon name="dashboard" className="w-10 h-10" /></div><h1 className="text-2xl font-black uppercase tracking-tighter">Tontine pour tous</h1></div>
          <div className="space-y-4">
            {authError && <div className="bg-rose-50 text-rose-500 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest">{authError}</div>}
            <input type="email" placeholder="Email" className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none text-slate-800 shadow-inner" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
            <input type="password" placeholder="Mot de passe" className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none text-slate-800 shadow-inner" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
            <ActionButton onClick={async () => { setAuthError(''); try { if (authMode === 'login') await signInWithEmailAndPassword(auth, authForm.email, authForm.password); else await createUserWithEmailAndPassword(auth, authForm.email, authForm.password); } catch (e) { setAuthError('Échec connexion'); } }} label={authMode === 'login' ? 'Connexion' : 'Inscription'} className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black uppercase shadow-xl" />
          </div>
          <div className="mt-6 text-slate-800"><button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{authMode === 'login' ? "Nouveau ? Créer un compte" : "Déjà membre ? Connexion"}</button></div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden flex-col lg:flex-row">
      <ConfirmModal isOpen={confirmState.isOpen} title={confirmState.title} onConfirm={confirmState.onConfirm} onCancel={() => setConfirmState({...confirmState, isOpen: false})} />
      {pdfContent && <PdfOutputView content={pdfContent} currency={currency} onExit={() => setPdfContent(null)} />}
      {showAI && <AiAssistant members={members} stats={stats} activeMeetingDate={activeMeetingDate} transactions={transactions} currency={currency} onClose={() => setShowAI(false)} profile={profile} user={user} />}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 shrink-0">
        <div className="p-8 mb-8 flex items-center gap-2"><div className={`p-2 rounded-xl text-white ${isPremium ? 'bg-amber-500' : 'bg-indigo-600'}`}><Icon name="dashboard" /></div><span className="text-xl font-black uppercase tracking-tight">Tontine</span></div>
        <nav className="flex-1 px-4 space-y-1">{NAV_LINKS.map(item => (<button key={item.id} onClick={() => setCurrentPage(item.id)} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === item.id ? 'bg-slate-50 text-indigo-700 border border-slate-100 shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}><Icon name={item.icon} className="w-3.5 h-3.5" />{String(item.label)}</button>))}</nav>
        <div className="p-6"><button onClick={handleLogout} className="w-full flex items-center gap-4 p-3 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-all">Quitter</button></div>
      </aside>
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50/50">
        <header className="h-14 bg-white border-b flex items-center justify-between px-4 lg:px-8 shrink-0">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-800"><Icon name="menu" /></button>
            <div className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border ${activeMeetingDate ? 'text-indigo-600 bg-indigo-50 border-indigo-100 shadow-sm' : 'text-slate-400 bg-slate-100 border-transparent shadow-none'}`}>{activeMeetingDate ? `Séance : ${activeMeetingDate}` : 'Attente séance'}</div>
            <div className="flex items-center gap-3 text-slate-800"><span className="hidden md:block text-[9px] font-black uppercase text-slate-400">{user?.email}</span><div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-[10px] uppercase shadow-md">{user?.email?.charAt(0)}</div></div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 scrollbar-hide text-slate-800">
            <div className="max-w-6xl mx-auto space-y-8">
               {currentPage === 'dashboard' && <DashboardView stats={stats} members={members} currency={currency} isVisionOnly={isVisionOnly} onAddMember={handleAddMember} onAddTransaction={handleAddTransaction} themeGradient={themeGradient} activeMeetingDate={activeMeetingDate} setActiveMeetingDate={setActiveMeetingDate} isPremium={isPremium} onOpenAI={() => setShowAI(true)} />}
               {currentPage === 'members' && <MembersView members={members} activeMeetingDate={activeMeetingDate} transactions={transactions} loans={loans} onDelete={handleDelete} isVisionOnly={isVisionOnly} onUpdate={handleUpdateMember} currency={currency} />}
               {currentPage === 'reports' && <ReportsView members={members} transactions={transactions} rotations={rotations} loans={loans} currency={currency} themeGradient={themeGradient} defaultDate={activeMeetingDate} onRedirectToPdf={(data) => setPdfContent(data)} />}
               {currentPage === 'finances' && <FinancesView transactions={filteredTransactions} allTransactions={transactions} members={members} currency={currency} onDelete={handleDelete} onUpdate={handleUpdateTransaction} isVisionOnly={isVisionOnly} activeMeetingDate={activeMeetingDate} />}
               {currentPage === 'rotations' && <RotationsView members={members} rotations={rotations} activeMeetingDate={activeMeetingDate} onAddRotation={handleAddRotation} onDelete={handleDelete} isVisionOnly={isVisionOnly} themeGradient={themeGradient} onRedirectToPdf={(data) => setPdfContent(data)} />}
               {currentPage === 'fonds' && (<div className="space-y-4"><div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-slate-800"><select value={globalFilter.memberId} onChange={(e) => setGlobalFilter({...globalFilter, memberId: e.target.value})} className="flex-1 p-2 bg-slate-50 border-none rounded-xl text-[10px] font-bold outline-none shadow-inner"><option value="">Tous les membres</option>{members.map(m => <option key={m.id} value={String(m.id)}>{String(m.name)}</option>)}</select>{selectedBalanceValue !== null && (<div className="bg-emerald-50 px-3 py-1.5 rounded-xl text-emerald-700 text-[10px] font-black uppercase shadow-sm tracking-tighter">Net: {formatCurrency(selectedBalanceValue, currency)}</div>)}</div><GenericHistory title={`Fond de Caisse`} transactions={activeMeetingDate ? filteredTransactions.filter(t => t.type === 'fonds' && (!globalFilter.memberId || t.memberId === globalFilter.memberId)) : transactions.filter(t => t.type === 'fonds')} members={members} currency={currency} onDelete={handleDelete} onUpdate={handleUpdateTransaction} isVisionOnly={isVisionOnly} /></div>)}
               {currentPage === 'prets' && <LoansView loans={activeMeetingDate ? loans.filter(l => l.startDate === activeMeetingDate) : loans} members={members} currency={currency} onAdd={handleAddLoan} onDelete={handleDelete} isVisionOnly={isVisionOnly} themeGradient={themeGradient} activeMeetingDate={activeMeetingDate} />}
               {currentPage === 'settings' && <SettingsView currency={currency} setCurrency={setCurrency} profile={profile} onUpgrade={handleRequestPro} isAdmin={user?.email === ADMIN_EMAIL} allUsers={allUsers} onApprove={handleApprovePro} onDelete={handleDelete} isVisionOnly={isVisionOnly} />}
            </div>
        </div>
        <div className="lg:hidden bg-white border-t flex justify-around p-2 shadow-2xl">
            {[ { id: 'dashboard', icon: 'dashboard' }, { id: 'members', icon: 'members' }, { id: 'finances', icon: 'cotisations' }, { id: 'reports', icon: 'fileText' } ].map(tab => (<button key={tab.id} onClick={() => setCurrentPage(tab.id)} className={`p-2 transition-colors ${currentPage === tab.id ? 'text-indigo-600' : 'text-slate-400'}`}><Icon name={tab.icon} /></button>))}
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-400"><Icon name="dots" /></button>
        </div>
      </main>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden animate-in fade-in">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[3rem] p-8 space-y-4 shadow-2xl">
            <div className="bg-emerald-50 p-4 rounded-2xl flex items-center justify-between border border-emerald-100 shadow-sm text-slate-800"><div className="flex items-center gap-3"><Icon name="phone" className="text-emerald-500 w-5 h-5" /><span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter text-slate-800">Support: {WHATSAPP_SUPPORT}</span></div><a href={`https://wa.me/${WHATSAPP_SUPPORT.replace(/^00/, '')}`} className="p-2 bg-emerald-500 text-white rounded-xl active:scale-95 transition-all shadow-sm"><Icon name="phone" className="w-4 h-4" /></a></div>
            <div className="grid grid-cols-2 gap-4 text-slate-800"><button onClick={() => { setShowAI(true); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-white bg-slate-900 border border-slate-800 shadow-sm"><Icon name="sparkles" className="w-5 h-5" /> Assistant IA</button>{NAV_LINKS.map(item => (<button key={item.id} onClick={() => { setCurrentPage(item.id); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === item.id ? 'text-indigo-600 bg-indigo-50 border border-indigo-100' : 'text-slate-800 bg-slate-50 border border-slate-100 shadow-sm'}`}><Icon name={item.icon} className="w-5 h-5" />{String(item.label)}</button>))}</div>
            <button onClick={handleLogout} className="w-full p-5 bg-rose-50 text-rose-500 rounded-2xl text-[10px] font-black uppercase shadow-sm border border-rose-100 transition-all tracking-tighter">Quitter l'application</button>
          </div>
        </div>
      )}
    </div>
  );
}