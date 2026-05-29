import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, RadialBarChart, RadialBar, PieChart, Pie
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Users, DollarSign, Target, 
  ArrowUpRight, Activity, PieChart as PieIcon,
  CreditCard, Home, UserPlus, UserCheck, UserMinus,
  MessageCircle, UserX, Banknote, Clock, Download
} from 'lucide-react';
import DashboardFilters from './DashboardFilters';
import AnimatedCounter from './AnimatedCounter';
import AdminMasterGuard from './AdminMasterGuard';

// --- Types ---
interface KPIData {
  totalVentas: number;
  totalPendiente: number;
  totalInscritas: number;
  totalConfirmadas: number;
  totalCompletadas: number;
  totalParciales: number;
  totalFaltaPago: number;
  porcentajeMeta: number;
  meta: number;
}

interface ChartData {
  date: string;
  count: number;
}

interface DistributionData {
  name: string;
  value: number;
}

interface SparklineData {
  hour: number;
  count: number;
}

interface AsistenteRaw {
  id: string;
  nombre: string;
  whatsapp: string;
  monto_pagado: number;
  monto_total: number;
  status_pago: string;
  es_brave: boolean;
  metodo_pago: string;
  stripe_session_id?: string;
  folio?: string;
  created_at: string;
  asistio: boolean;
  fecha_checkin?: string;
  es_casa: boolean;
}

interface StatsResponse {
  kpis: KPIData;
  distribution: DistributionData[];
  paymentMethods: DistributionData[];
  originStats: DistributionData[];
  hypeChart: ChartData[];
  sparkline: SparklineData[];
  asistentes: AsistenteRaw[];
}

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

// --- Custom Components ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-admin-deep border border-brave-moss/30 p-4 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] text-brave-light-soft/60 font-bold uppercase tracking-widest mb-1">{label || payload[0].name}</p>
        <p className="text-xl font-black text-white">
          {payload[0].value} <span className="text-xs text-brave-light-soft/40 font-medium">unidades</span>
        </p>
      </div>
    );
  }
  return null;
};

const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - card.left;
    const y = e.clientY - card.top;
    const centerX = card.width / 2;
    const centerY = card.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    setRotate({ x: rotateX, y: rotateY });
  };

  const onMouseLeave = () => setRotate({ x: 0, y: 0 });

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const KPICard = ({ title, numericValue, prefix = '', subtitle, icon: Icon, sparklineData }: any) => (
  <motion.div variants={itemVariants}>
    <TiltCard className="glass-card p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] relative overflow-hidden group hover:border-brave-moss/30 transition-all border-t-white/20 border-b-white/5 border-x-white/10 shadow-2xl">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-brave-forest/20 transition-colors">
          <Icon size={20} className="text-brave-light-soft group-hover:animate-pulse" />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
          <ArrowUpRight size={10} />
          Live
        </div>
      </div>
      
      <p className="text-[10px] text-brave-light-soft/50 font-black uppercase tracking-[0.3em] mb-2">{title}</p>
      <h3 className="text-5xl text-glow-gold mb-2 font-black">
        <AnimatedCounter value={numericValue} prefix={prefix} />
      </h3>
      <p className="text-[10px] text-brave-light-soft/60 font-bold uppercase tracking-widest">{subtitle}</p>

      {/* Mini Sparkline with Aura */}
      <div className="h-12 w-full mt-4 -mx-2 opacity-50 group-hover:opacity-100 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData}>
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#d4af37" 
              fill="url(#sparkGradient)" 
              strokeWidth={1} 
            />
            <defs>
              <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </TiltCard>
  </motion.div>
);

// Componer variant wrapper para KPICard
const MotionKPICard = motion(KPICard);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'all'
  });

  const [selectedEvent, setSelectedEvent] = useState<'Brave' | 'Valiente' | null>(null);
  const [searchAttended, setSearchAttended] = useState('');
  const [searchPending, setSearchPending] = useState('');
  const [filterCasaAsistieron, setFilterCasaAsistieron] = useState<'all' | 'casa' | 'visita'>('all');
  const [filterCasaSeguimiento, setFilterCasaSeguimiento] = useState<'all' | 'casa' | 'visita'>('all');

  // --- Ticket Regeneration ---
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenResult, setRegenResult] = useState<{ generados: number; omitidos: number; errores: number; logs: string[] } | null>(null);
  const [regenForce, setRegenForce] = useState(false);

  const runRegeneration = async () => {
    const password = sessionStorage.getItem('admin_password');
    if (!password) return;
    setRegenLoading(true);
    setRegenResult(null);
    try {
      const force = regenForce ? '&force=true' : '';
      const resp = await fetch(`/api/regenerate-tickets?key=${encodeURIComponent(password)}${force}`);
      const data = await resp.json();
      setRegenResult(data);
    } catch (err) {
      setRegenResult({ generados: 0, omitidos: 0, errores: 1, logs: ['Error de red al llamar al endpoint'] });
    } finally {
      setRegenLoading(false);
    }
  };

  const handleDownloadCSV = (list: AsistenteRaw[], statusText: string, filename: string) => {
    const headers = ["Nombre", "Asistencia", "Tipo", "Telefono"];
    const rows = list.map(a => {
      const cleanName = `"${a.nombre.replace(/"/g, '""')}"`;
      const tipo = a.es_casa ? "Casa" : "Visita";
      return [cleanName, statusText, tipo, a.whatsapp];
    });
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper para el Flujo de Entrada (Bloques de 30 mins)
  const calculateFlowChart = (attendees: AsistenteRaw[]) => {
    let beforeFive = 0; // "4:30 PM" (Todo antes de las 17:00)
    let fiveToFiveThirty = 0; // "5:00 PM" (17:00 a 17:29)
    let afterFiveThirty = 0; // "Después de 5:30" (17:30 en adelante)

    attendees.forEach(a => {
      if (a.asistio && a.fecha_checkin) {
        try {
          const date = new Date(a.fecha_checkin);
          let hours = date.getHours();
          let minutes = date.getMinutes();
          
          if (hours < 17) {
            beforeFive++;
          } else if (hours === 17 && minutes < 30) {
            fiveToFiveThirty++;
          } else {
            afterFiveThirty++;
          }
        } catch (e) {
          // ignore invalid dates
        }
      }
    });
    
    return [
      { time: '4:30 PM', count: beforeFive },
      { time: '5:00 PM', count: fiveToFiveThirty },
      { time: 'Después de 5:30', count: afterFiveThirty }
    ];
  };

  const getEventSpecificStats = (eventName: 'Brave' | 'Valiente') => {
    if (!stats) return null;
    const isBrave = eventName === 'Brave';
    const eventAttendees = stats.asistentes.filter(a => a.es_brave === isBrave);

    const attended = eventAttendees.filter(a => a.asistio);
    const pending = eventAttendees.filter(a => !a.asistio);

    const digital = eventAttendees.filter(a => (a.stripe_session_id && a.stripe_session_id.trim() !== '') || a.metodo_pago === 'transferencia').length;
    const efectivo = eventAttendees.length - digital;

    const casaCount = eventAttendees.filter(a => a.es_casa).length;
    const visitaCount = eventAttendees.length - casaCount;

    const flowData = calculateFlowChart(eventAttendees);

    return {
      attendedCount: attended.length,
      pendingCount: pending.length,
      digitalCount: digital,
      efectivoCount: efectivo,
      casaCount: casaCount,
      visitaCount: visitaCount,
      flowData,
      attendedList: attended.filter(a => {
        const matchesSearch = a.nombre.toLowerCase().includes(searchAttended.toLowerCase()) || a.whatsapp.includes(searchAttended);
        const matchesFilter = filterCasaAsistieron === 'all' || (filterCasaAsistieron === 'casa' && a.es_casa) || (filterCasaAsistieron === 'visita' && !a.es_casa);
        return matchesSearch && matchesFilter;
      }),
      pendingList: pending.filter(a => {
        const matchesSearch = a.nombre.toLowerCase().includes(searchPending.toLowerCase()) || a.whatsapp.includes(searchPending);
        const matchesFilter = filterCasaSeguimiento === 'all' || (filterCasaSeguimiento === 'casa' && a.es_casa) || (filterCasaSeguimiento === 'visita' && !a.es_casa);
        return matchesSearch && matchesFilter;
      })
    };
  };

  const fetchStats = async () => {
    const password = sessionStorage.getItem('admin_password');
    if (!password) return;

    setLoading(true);
    try {
      const resp = await fetch('/api/admin/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, ...filters })
      });
      const data = await resp.json();
      if (resp.ok) {
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [filters]);

  // Glow filters for charts
  const svgFilters = (
    <svg className="h-0 w-0 absolute">
      <defs>
        <filter id="goldAura" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="sageAura" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </svg>
  );

  if (loading && !stats) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative w-16 h-16"
        >
          <div className="absolute inset-0 border-4 border-brave-forest/20 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-brave-light-soft rounded-full"></div>
        </motion.div>
        <p className="mt-8 text-brave-light-soft/50 font-black uppercase tracking-widest text-[10px] animate-pulse">Obteniendo Analíticas...</p>
      </div>
    );
  }

  return (
    <AdminMasterGuard>
      <div className="w-full max-w-7xl mx-auto pb-48 md:pb-32">
        {svgFilters}
        <DashboardFilters filters={filters} setFilters={setFilters} />

        <AnimatePresence mode="wait">
          {stats && (
            <motion.div 
              key="dashboard-content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="px-4 space-y-12"
            >
              {/* Main KPIs Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div variants={itemVariants}>
                  <KPICard 
                    title="Inscritas (Total)" 
                    numericValue={stats.kpis.totalInscritas}
                    subtitle="Total en sistema"
                    icon={Users}
                    sparklineData={stats.sparkline}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <KPICard 
                    title="Ya Completaron" 
                    numericValue={stats.kpis.totalCompletadas}
                    subtitle="Liquidado al 100%"
                    icon={UserCheck}
                    sparklineData={stats.sparkline}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <KPICard 
                    title="No han Liquidado" 
                    numericValue={stats.kpis.totalParciales}
                    subtitle="Con Saldo Pendiente"
                    icon={Activity}
                    sparklineData={stats.sparkline}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <KPICard 
                    title="Falta por Contactar" 
                    numericValue={stats.kpis.totalFaltaPago}
                    subtitle="Saldo en Ceros ($0)"
                    icon={UserMinus}
                    sparklineData={stats.sparkline}
                  />
                </motion.div>
              </div>

              {/* Event Toggles */}
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center py-4">
                <button
                  onClick={() => setSelectedEvent(selectedEvent === 'Brave' ? null : 'Brave')}
                  className={`px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all ${
                    selectedEvent === 'Brave'
                      ? 'bg-[#d4af37] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                      : 'bg-white/5 text-brave-light-soft hover:bg-white/10 border border-white/10'
                  }`}
                >
                  Análisis Brave
                </button>
                <button
                  onClick={() => setSelectedEvent(selectedEvent === 'Valiente' ? null : 'Valiente')}
                  className={`px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all ${
                    selectedEvent === 'Valiente'
                      ? 'bg-[#C4CF9A] text-black shadow-[0_0_20px_rgba(196,207,154,0.4)]'
                      : 'bg-white/5 text-[#C4CF9A] hover:bg-white/10 border border-white/10'
                  }`}
                >
                  Análisis Valiente
                </button>
              </div>

              <AnimatePresence mode="wait">
                {selectedEvent === 'Valiente' && (
                  <motion.div
                    key="valiente-view"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="glass-card p-12 rounded-[3rem] border border-white/10 text-center mb-12">
                      <Clock size={48} className="mx-auto text-brave-light-soft/50 mb-6" />
                      <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Evento por realizar</h3>
                      <p className="text-sm text-brave-light-soft/70">Los datos de logística y check-in se reflejarán el día del evento.</p>
                    </div>
                  </motion.div>
                )}

                {selectedEvent === 'Brave' && (() => {
                  const data = getEventSpecificStats('Brave');
                  if (!data) return null;
                  const { attendedCount, pendingCount, digitalCount, efectivoCount, casaCount, visitaCount, flowData, attendedList, pendingList } = data;

                  return (
                    <motion.div
                      key="brave-view"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-8 mb-12 overflow-hidden"
                    >
                      {/* Metricas Brave */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="glass-card p-6 rounded-[2rem] border border-white/10 bg-white/5 relative overflow-hidden group hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <UserCheck className="text-[#d4af37]" size={20} />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-brave-light-soft/70">Asistencia</h4>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{attendedCount}</span>
                            <span className="text-[10px] text-brave-light-soft/50 font-bold uppercase">vs {pendingCount} Pendientes</span>
                          </div>
                        </div>

                        <div className="glass-card p-6 rounded-[2rem] border border-white/10 bg-white/5 relative overflow-hidden group hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <CreditCard className="text-[#C4CF9A]" size={20} />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-brave-light-soft/70">Pagos Digitales</h4>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{digitalCount}</span>
                            <span className="text-[10px] text-brave-light-soft/50 font-bold uppercase">vs {efectivoCount} Efectivo</span>
                          </div>
                        </div>

                        <div className="glass-card p-6 rounded-[2rem] border border-white/10 bg-white/5 relative overflow-hidden group hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <Home className="text-emerald-400" size={20} />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-brave-light-soft/70">Alcance (Casa)</h4>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{casaCount}</span>
                            <span className="text-[10px] text-brave-light-soft/50 font-bold uppercase">vs {visitaCount} Visitas</span>
                          </div>
                        </div>
                      </div>

                      {/* Flujo de Asistencia Chart */}
                      <div className="glass-card p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/10 bg-white/5">
                        <div className="flex items-center gap-3 mb-6">
                          <Activity className="text-rose-400" size={20} />
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-white">Afluencia de Asistencia</h4>
                            <p className="text-[10px] text-brave-light-soft/50 font-bold uppercase">Frecuencia de Check-ins en horarios clave</p>
                          </div>
                        </div>
                        <div className="h-48 w-full">
                          {flowData && flowData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={flowData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis 
                                  dataKey="time" 
                                  stroke="#ffffff20" 
                                  fontSize={10} 
                                  tickLine={false} 
                                  axisLine={false}
                                  tick={{ fill: '#71717a' }}
                                />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                                <Bar dataKey="count" fill="#d4af37" radius={[10, 10, 0, 0]} barSize={40} animationDuration={1500} />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <p className="text-xs text-brave-light-soft/30 font-black uppercase tracking-widest">Aún no hay datos de Check-in</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Directorios de Seguimiento */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        {/* Columna Confirmados */}
                        <div className="glass-card p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/10 bg-white/5 flex flex-col">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="text-center sm:text-left">
                              <h4 className="text-xs font-black uppercase tracking-widest text-white">Asistencia Confirmada</h4>
                              <p className="text-[10px] text-brave-light-soft/50 font-bold uppercase mt-1">Registradas con Check-in ({attendedList.length})</p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                              <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchAttended}
                                onChange={(e) => setSearchAttended(e.target.value)}
                                className="bg-white/5 border border-white/10 text-xs rounded-xl px-3 py-2 text-white placeholder-brave-light-soft/30 focus:outline-none focus:border-white/30 transition-all w-full sm:w-[130px]"
                              />
                              <select
                                value={filterCasaAsistieron}
                                onChange={(e) => setFilterCasaAsistieron(e.target.value as 'all' | 'casa' | 'visita')}
                                className="bg-white/5 border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-white/30 appearance-none cursor-pointer w-full sm:w-auto"
                              >
                                <option value="all" className="bg-zinc-900 text-white">Todos</option>
                                <option value="casa" className="bg-zinc-900 text-white">De Casa</option>
                                <option value="visita" className="bg-zinc-900 text-white">Visitas</option>
                              </select>
                              <button
                                onClick={() => handleDownloadCSV(attendedList, 'Asistio', 'brave_asistentes_filtrado.csv')}
                                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-brave-light-soft transition-all flex-shrink-0"
                                title="Descargar CSV"
                              >
                                <Download size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="overflow-y-auto max-h-96 pr-2 space-y-3 custom-scrollbar">
                            {attendedList.length === 0 ? (
                              <p className="text-center text-xs text-brave-light-soft/30 py-8 font-black uppercase tracking-widest">Sin coincidencias</p>
                            ) : (
                              attendedList.map(a => {
                                const cleanPhone = a.whatsapp.replace(/\D/g, '');
                                const finalPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
                                return (
                                  <div key={a.id} className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                    <div className="overflow-hidden pr-2">
                                      <span className="text-xs font-bold text-white block capitalize truncate">{a.nombre.toLowerCase()}</span>
                                      <span className="text-[10px] text-brave-light-soft/40 font-bold tracking-widest mt-1 block">FOLIO: {a.folio || '—'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                      <span className="text-xs text-brave-light-soft/70 font-mono font-medium">{a.whatsapp}</span>
                                      <a
                                        href={`https://wa.me/${finalPhone}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all hover:scale-105 active:scale-95"
                                      >
                                        <MessageCircle size={14} />
                                      </a>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Columna Pendientes */}
                        <div className="glass-card p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/10 bg-white/5 flex flex-col">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="text-center sm:text-left">
                              <h4 className="text-xs font-black uppercase tracking-widest text-white">Seguimiento Pendiente</h4>
                              <p className="text-[10px] text-brave-light-soft/50 font-bold uppercase mt-1">Sin check-in ({pendingList.length})</p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                              <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchPending}
                                onChange={(e) => setSearchPending(e.target.value)}
                                className="bg-white/5 border border-white/10 text-xs rounded-xl px-3 py-2 text-white placeholder-brave-light-soft/30 focus:outline-none focus:border-white/30 transition-all w-full sm:w-[130px]"
                              />
                              <select
                                value={filterCasaSeguimiento}
                                onChange={(e) => setFilterCasaSeguimiento(e.target.value as 'all' | 'casa' | 'visita')}
                                className="bg-white/5 border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-white/30 appearance-none cursor-pointer w-full sm:w-auto"
                              >
                                <option value="all" className="bg-zinc-900 text-white">Todos</option>
                                <option value="casa" className="bg-zinc-900 text-white">De Casa</option>
                                <option value="visita" className="bg-zinc-900 text-white">Visitas</option>
                              </select>
                              <button
                                onClick={() => handleDownloadCSV(pendingList, 'No Asistio', 'brave_seguimiento_pendiente.csv')}
                                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-brave-light-soft transition-all flex-shrink-0"
                                title="Descargar CSV"
                              >
                                <Download size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="overflow-y-auto max-h-96 pr-2 space-y-3 custom-scrollbar">
                            {pendingList.length === 0 ? (
                              <p className="text-center text-xs text-brave-light-soft/30 py-8 font-black uppercase tracking-widest">Sin coincidencias</p>
                            ) : (
                              pendingList.map(a => {
                                const cleanPhone = a.whatsapp.replace(/\D/g, '');
                                const finalPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
                                return (
                                  <div key={a.id} className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                    <div className="overflow-hidden pr-2">
                                      <span className="text-xs font-bold text-white block capitalize truncate">{a.nombre.toLowerCase()}</span>
                                      <span className="text-[10px] text-brave-light-soft/40 font-bold tracking-widest mt-1 block">FOLIO: {a.folio || '—'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                      <span className="text-xs text-brave-light-soft/70 font-mono font-medium">{a.whatsapp}</span>
                                      <a
                                        href={`https://wa.me/${finalPhone}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all hover:scale-105 active:scale-95"
                                      >
                                        <MessageCircle size={14} />
                                      </a>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>

              {/* Intermediate Analytics: Donut Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <motion.div variants={itemVariants} className="glass-card p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] border-t-white/10 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-brave-forest/20 rounded-2xl">
                      <CreditCard className="text-brave-light-soft" size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-white">Distribución de Inscritas</h4>
                      <p className="text-[10px] text-brave-light-soft/50 font-bold uppercase">Efectivo vs. Stripe</p>
                    </div>
                  </div>
                  <div className="h-auto flex flex-col md:flex-row items-center gap-6 md:gap-0">
                    <div className="w-full h-48 md:h-64 flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.paymentMethods}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={10}
                            dataKey="value"
                            animationDuration={1500}
                          >
                            <Cell fill="#C4CF9A" />
                            <Cell fill="#d4af37" />
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-48 space-y-4">
                      {stats.paymentMethods.map((item, idx) => (
                        <div key={item.name} className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-brave-light-soft' : 'bg-[#d4af37]'}`}></div>
                            <span className="text-[10px] font-bold text-brave-light-soft/70 uppercase">{item.name}</span>
                          </div>
                          <span className="text-sm font-black text-white">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-card p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] border-t-white/10 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl">
                      <Home className="text-emerald-400" size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-white">Forma parte del Reino</h4>
                      <p className="text-[10px] text-brave-light-soft/50 font-bold uppercase tracking-widest">Casa vs Visitas</p>
                    </div>
                  </div>
                  <div className="h-auto flex flex-col md:flex-row items-center gap-6 md:gap-0">
                    <div className="w-full h-48 md:h-64 flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.originStats}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={10}
                            dataKey="value"
                            animationDuration={1500}
                          >
                            <Cell fill="#10b981" />
                            <Cell fill="#ffffff20" />
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-48 space-y-4">
                      {stats.originStats.map((item, idx) => (
                        <div key={item.name} className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
                            <span className="text-[10px] font-bold text-zinc-300 uppercase">{item.name}</span>
                          </div>
                          <span className="text-sm font-black text-white">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Main Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-12">
                <motion.div 
                  variants={itemVariants}
                  className="lg:col-span-2 glass-card p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] min-h-[400px] border-t-white/10 shadow-2xl relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-brave-forest/10 to-transparent"></div>
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="text-brave-light-soft" size={18} />
                      <h4 className="text-xs font-black uppercase tracking-widest text-white">Curva de Registro (Hype Chart)</h4>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/5">
                      <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse"></div>
                      <span className="text-[10px] text-brave-light-soft/50 font-bold uppercase">Registros Diarios</span>
                    </div>
                  </div>

                  <div className="h-[300px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.hypeChart}>
                        <defs>
                          <linearGradient id="hypeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C4CF9A" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="#C4CF9A" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="10 10" stroke="#ffffff05" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#ffffff20" 
                          fontSize={8} 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fill: '#71717a' }}
                        />
                        <YAxis 
                          stroke="#ffffff20" 
                          fontSize={8} 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fill: '#71717a' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#d4af37" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#hypeGradient)" 
                          animationDuration={2000}
                          filter="url(#goldAura)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div 
                  variants={itemVariants} 
                  className="glass-card p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] flex flex-col border-t-white/10 shadow-2xl relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-bl from-brave-forest/10 to-transparent"></div>
                  <div className="flex items-center gap-3 mb-8 relative z-10">
                    <PieIcon className="text-brave-light-soft" size={18} />
                    <h4 className="text-xs font-black uppercase tracking-widest text-white">Brave vs Valiente</h4>
                  </div>
                  
                  <div className="flex-1 h-full min-h-[250px] relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.distribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#ffffff20" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fill: '#71717a' }}
                        />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                        <Bar dataKey="value" radius={[15, 15, 0, 0]} barSize={50} animationDuration={2000}>
                          {stats.distribution.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={index === 0 ? '#d4af37' : '#C4CF9A'} 
                              fillOpacity={0.9}
                              filter="url(#sageAura)"
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-8 space-y-3 relative z-10">
                    {stats.distribution.map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-brave-light-soft/30 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-[#d4af37]' : 'bg-brave-light-soft shadow-[0_0_10px_rgba(196,207,154,0.5)]'}`}></div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.name}</span>
                        </div>
                        <span className="text-xl font-black text-white italic">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            {/* ── Herramientas: Regenerar Boletos ── */}
              <motion.div variants={itemVariants} className="glass-card p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/10 bg-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#364e44]/40 rounded-2xl">
                      <Download size={20} className="text-[#a8c480]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-white">Herramientas · Boletos</h4>
                      <p className="text-[10px] text-brave-light-soft/50 font-bold uppercase mt-0.5">Genera los tickets faltantes en storage</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <div
                        onClick={() => setRegenForce(v => !v)}
                        className={`relative w-10 h-5 rounded-full transition-all ${ regenForce ? 'bg-[#a8c480]' : 'bg-white/10' }`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${ regenForce ? 'left-5' : 'left-0.5' }`} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brave-light-soft/60">
                        {regenForce ? 'Forzar todos' : 'Solo faltantes'}
                      </span>
                    </label>
                    <button
                      onClick={runRegeneration}
                      disabled={regenLoading}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#364e44] hover:bg-[#4a6b5a] text-white font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {regenLoading ? (
                        <><span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Procesando...</>
                      ) : (
                        <><Download size={14} />Generar Boletos</>
                      )}
                    </button>
                  </div>
                </div>

                {regenResult && (
                  <div className="space-y-4">
                    {/* Contadores */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <p className="text-2xl font-black text-emerald-400">{regenResult.generados}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-400/70 mt-1">Generados</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                        <p className="text-2xl font-black text-white/60">{regenResult.omitidos}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mt-1">Omitidos</p>
                      </div>
                      <div className={`p-4 rounded-2xl border text-center ${ regenResult.errores > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/10' }`}>
                        <p className={`text-2xl font-black ${ regenResult.errores > 0 ? 'text-red-400' : 'text-white/60' }`}>{regenResult.errores}</p>
                        <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${ regenResult.errores > 0 ? 'text-red-400/70' : 'text-white/40' }`}>Errores</p>
                      </div>
                    </div>

                    {/* Log detallado */}
                    <div className="bg-black/40 rounded-2xl border border-white/5 p-4 max-h-60 overflow-y-auto custom-scrollbar">
                      {regenResult.logs.map((line, i) => (
                        <p key={i} className="text-[10px] font-mono text-brave-light-soft/60 leading-relaxed">{line}</p>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
      </div>
    </AdminMasterGuard>
  );
}
