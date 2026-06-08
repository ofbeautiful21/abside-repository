import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Calendar as CalendarIcon, Users, Settings, MessageSquare, Plus, 
  X, Clock, User, Scissors, GripHorizontal, Check, Home, 
  Smartphone, Save, Edit2, BarChart2, UserCircle, Moon, Sun, Send, 
  TrendingUp, DollarSign, Loader, Trash2, Info
} from 'lucide-react';

// --- CONFIGURAZIONE ---
const supabase = null; // Sostituisci con il client reale se disponibile
const isSupabaseConfigured = false;

// --- DATI DI DEFAULT (SEED) ---
const SEED_DATA = {
  operatrici: [
    { id: 'op_1', nome: 'Giulia', ruolo: 'Senior Manager', colore: 'bg-stone-200 border-stone-400 text-stone-900' },
    { id: 'op_2', nome: 'Marta', ruolo: 'Specialist', colore: 'bg-amber-200 border-amber-400 text-amber-900' },
  ],
  clienti: [],
  servizi: [
    { id: 'sv_1', nome: 'Manicure', durata: 45, prezzo: 35 },
  ],
  appuntamenti: [],
  memos: []
};

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState(SEED_DATA);

  // Stati Modali
  const [genericModal, setGenericModal] = useState({ isOpen: false, table: null, data: null });
  const [appModal, setAppModal] = useState({ isOpen: false, data: null });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, onConfirm: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // --- LOGICA PERSISTENZA ---
  const generateId = () => crypto.randomUUID ? crypto.randomUUID() : `id_${Date.now()}`;

  const loadData = () => {
    setLoading(true);
    const newDb = { ...SEED_DATA };
    Object.keys(SEED_DATA).forEach(table => {
      const local = localStorage.getItem(`abside_${table}`);
      newDb[table] = local ? JSON.parse(local) : SEED_DATA[table];
    });
    setDb(newDb);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const saveEntity = (table, entityData) => {
    setDb(prev => {
      const tableData = prev[table];
      const isNew = !entityData.id;
      const finalEntity = isNew ? { ...entityData, id: generateId() } : entityData;
      
      const newTableData = isNew 
        ? [...tableData, finalEntity] 
        : tableData.map(e => e.id === finalEntity.id ? finalEntity : e);

      localStorage.setItem(`abside_${table}`, JSON.stringify(newTableData));
      return { ...prev, [table]: newTableData };
    });
    showToast(`Elemento ${table} salvato.`);
  };

  const deleteEntity = (table, id) => {
    setDb(prev => {
      const newTableData = prev[table].filter(e => e.id !== id);
      localStorage.setItem(`abside_${table}`, JSON.stringify(newTableData));
      return { ...prev, [table]: newTableData };
    });
    showToast('Elemento eliminato.');
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  // --- COMPONENTI UI (RENDERERS) ---
  
  const renderDashboard = () => (
    <div className="p-6 h-full overflow-y-auto bg-[#FDFBF7]">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E8E0D5]">
            <h3 className="font-bold text-lg mb-4">Agenda Odierna ({db.appuntamenti.length})</h3>
            {/* Lista semplificata */}
            {db.appuntamenti.map(a => <div key={a.id} className="p-3 border-b">{a.orario} - {a.id}</div>)}
        </div>
      </div>
    </div>
  );

  // --- MODALI ---
  
  // AppModal Component Refactored (Esempio di Form controllato)
  const AppuntamentoForm = ({ initialData, onClose, onSave }) => {
    const [formData, setFormData] = useState(initialData || { cliente_id: '', operatrice_id: '', orario: '09:00', durata: 30 });

    return (
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
        <label className="block text-sm font-bold">Cliente</label>
        <select className="w-full p-3 border rounded-xl" value={formData.cliente_id} onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}>
           {db.clienti.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        {/* ... altri campi */}
        <button type="submit" className="w-full bg-stone-800 text-white p-4 rounded-xl font-bold">Salva</button>
      </form>
    );
  };

  // --- RENDER PRINCIPALE ---
  if (loading) return <div className="flex h-screen items-center justify-center bg-[#FDFBF7]"><Loader className="animate-spin text-amber-600" size={48}/></div>;

  return (
    <div className="flex h-screen bg-[#FDFBF7] text-stone-900">
      {/* Sidebar - Mantenuta coerente */}
      <aside className="w-64 bg-[#F5F0E6] p-6 border-r border-[#E8E0D5] flex flex-col">
        <h1 className="text-2xl font-black mb-8">ABSIDE</h1>
        <nav className="flex-1 space-y-2">
          {['dashboard', 'calendar', 'clienti', 'servizi'].map(view => (
            <button key={view} onClick={() => setCurrentView(view)} className={`w-full p-3 text-left rounded-xl font-bold ${currentView === view ? 'bg-white' : ''}`}>
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {currentView === 'dashboard' && renderDashboard()}
        {/* Aggiungi qui gli altri renderers */}
      </main>

      {/* Global Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 bg-stone-800 text-white px-6 py-4 rounded-2xl shadow-xl z-50">
          {toast.message}
        </div>
      )}
    </div>
  );
}