import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, RadialBarChart, RadialBar, PieChart, Pie
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Users, DollarSign, Target, 
  ArrowUpRight, Activity, PieChart as PieIcon,
  CreditCard, Home, UserPlus
} from 'lucide-react';
import DashboardFilters from './DashboardFilters';
import AnimatedCounter from './AnimatedCounter';

// --- Types ---
interface KPIData {
  totalVentas: number;
  totalPendiente: number;
  totalInscritas: number;
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

interface StatsResponse {
  kpis: KPIData;
  distribution: DistributionData[];
  paymentMethods: DistributionData[];
  originStats: DistributionData[];
  hypeChart: ChartData[];
  sparkline: SparklineData[];
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
    <TiltCard className="glass-card p-8 rounded-[3rem] relative overflow-hidden group hover:border-brave-moss/30 transition-all border-t-white/20 border-b-white/5 border-x-white/10 shadow-2xl">
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
    <div className="w-full max-w-7xl mx-auto pb-32">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              <motion.div variants={itemVariants}>
                <KPICard 
                  title="Inscritas" 
                  numericValue={stats.kpis.totalInscritas}
                  subtitle="Mujeres confirmadas"
                  icon={Users}
                  sparklineData={stats.sparkline}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <KPICard 
                  title="Tendencia" 
                  numericValue={100}
                  subtitle="Estado de Sistema Live"
                  icon={Activity}
                  sparklineData={stats.sparkline}
                />
              </motion.div>
            </div>

            {/* Intermediate Analytics: Donut Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div variants={itemVariants} className="glass-card p-10 rounded-[3rem] border-t-white/10 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-brave-forest/20 rounded-2xl">
                    <CreditCard className="text-brave-light-soft" size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white">Distribución de Ingresos</h4>
                    <p className="text-[10px] text-brave-light-soft/50 font-bold uppercase">Efectivo vs. En Línea</p>
                  </div>
                </div>
                <div className="h-64 flex flex-col md:flex-row items-center">
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

              <motion.div variants={itemVariants} className="glass-card p-10 rounded-[3rem] border-t-white/10 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl">
                    <Home className="text-emerald-400" size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white">Forma parte del Reino</h4>
                    <p className="text-[10px] text-brave-light-soft/50 font-bold uppercase tracking-widest">Casa vs Visitas</p>
                  </div>
                </div>
                <div className="h-64 flex flex-col md:flex-row items-center">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
              <motion.div 
                variants={itemVariants}
                className="lg:col-span-2 glass-card p-10 rounded-[3rem] min-h-[400px] border-t-white/10 shadow-2xl relative overflow-hidden group"
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
                className="glass-card p-10 rounded-[3rem] flex flex-col border-t-white/10 shadow-2xl relative overflow-hidden group"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
