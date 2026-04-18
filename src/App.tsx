/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { formatEther } from 'viem';
import { WagmiProvider, useAccount, useConnect, useDisconnect, useSendTransaction, useBalance } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config as web3Config } from './config/web3';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Wallet, 
  RefreshCcw, 
  Layers,
  Fingerprint,
  Radio,
  Binary,
  Cpu,
  ShieldCheck,
  Compass,
  ArrowRight,
  Sparkles,
  Command
} from 'lucide-react';
import { cn } from './lib/utils';
import { getDailyNumberFact, type DailyNumberFact } from './services/geminiService';

const queryClient = new QueryClient();

// Atmospheric Background Components
const Starfield = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute inset-0 tech-grid opacity-20" />
    <motion.div 
      animate={{ opacity: [0.1, 0.3, 0.1] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-base/20 blur-[120px] rounded-full" 
    />
    <motion.div 
      animate={{ opacity: [0.05, 0.15, 0.05] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-accent/20 blur-[100px] rounded-full" 
    />
  </div>
);

// Thematic Components
const HardwareStatus = () => (
  <div className="flex gap-4 p-4 border border-white/5 bg-white/5 backdrop-blur-sm rounded-lg">
    {[
      { label: 'Core', color: 'bg-accent' },
      { label: 'Sync', color: 'bg-blue-400' },
      { label: 'Auth', color: 'bg-purple-400' }
    ].map((item) => (
      <div key={item.label} className="flex items-center gap-2">
        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", item.color)} />
        <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">{item.label}</span>
      </div>
    ))}
  </div>
);

const OracleDisplay = ({ fact, checkedIn, onCheckIn, isPending }: { 
  fact: DailyNumberFact | null, 
  checkedIn: boolean, 
  onCheckIn: () => void,
  isPending: boolean 
}) => {
  if (!fact) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <RefreshCcw className="w-16 h-16 text-white/10 animate-spin" strokeWidth={1} />
          <Binary className="absolute inset-0 m-auto w-6 h-6 text-base animate-pulse" />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-sm font-mono text-white/30 uppercase tracking-[0.5em]">Calibrating Oracle</p>
          <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-1/2 h-full bg-base"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-12 space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Main Number Module */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-8 glass-panel rounded-[2rem] p-1 overflow-hidden group"
        >
          <div className="relative h-full bg-[#07090D]/80 rounded-[1.9rem] p-8 md:p-12 transition-all duration-700 group-hover:bg-[#07090D]/40">
            {/* Corner Tech Marks */}
            <div className="absolute top-8 left-8 text-white/10"><Command size={20} /></div>
            <div className="absolute top-8 right-8 text-white/10"><Radio size={20} className="animate-pulse" /></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 h-full">
              <div className="relative shrink-0 animate-float">
                <div className="absolute inset-0 bg-base/20 blur-[60px] rounded-full scale-150" />
                <h2 className={cn(
                  "text-[12rem] md:text-[18rem] font-display font-black leading-none tracking-tighter text-glow transition-all duration-1000",
                  !checkedIn ? "blur-xl scale-95 opacity-50" : "text-white"
                )}>
                  {fact.number}
                </h2>
                {!checkedIn && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Fingerprint size={120} className="text-white/20 animate-pulse" strokeWidth={1} />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-[1px] bg-accent" />
                    <span className="text-xs font-mono text-accent uppercase tracking-[0.3em] font-bold">
                      {fact.category} Sequence
                    </span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-serif italic text-white/90 leading-tight">
                    The {new Date().toLocaleDateString('en-US', { weekday: 'long' })} Oracle
                  </h3>
                </div>

                <AnimatePresence mode="wait">
                  {!checkedIn ? (
                    <motion.div 
                      key="lock-view"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <p className="text-white/40 text-lg md:text-xl font-light leading-relaxed font-mono">
                        // SECURE_DATA_ENCRYPTED: {fact.number.toString(16).toUpperCase()}..AES256
                      </p>
                      <div className="p-6 border border-base/20 bg-base/5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3 text-base">
                          <ShieldCheck size={20} />
                          <span className="text-sm font-bold uppercase tracking-widest">Biometric Check-in Required</span>
                        </div>
                        <p className="text-xs text-white/40 leading-relaxed">
                          This frequency is restricted. Verify your identity on the Base chain to synchronize with the current numerical pattern.
                        </p>
                        <button 
                          onClick={onCheckIn}
                          disabled={isPending}
                          className="w-full flex items-center justify-center gap-3 py-4 bg-base hover:bg-base-dark text-white rounded-xl font-bold transition-all shadow-[0_0_30px_rgba(0,82,255,0.3)] active:scale-[0.98]"
                        >
                          {isPending ? <RefreshCcw className="animate-spin" /> : <Zap className="fill-current" size={18} />}
                          {isPending ? 'Propagating Signal...' : 'Authorize Transaction'}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="reveal-view"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      <p className="text-xl md:text-2xl font-light text-white leading-relaxed">
                        {fact.fact}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="glass-panel p-4 rounded-xl border-white/5">
                          <div className="text-[9px] font-mono text-white/30 uppercase mb-2">Entropy Logic</div>
                          <p className="text-xs text-white/60 leading-relaxed">{fact.reasoning}</p>
                        </div>
                        <div className="glass-panel p-4 rounded-xl border-accent/20 bg-accent/5">
                          <div className="text-[9px] font-mono text-accent uppercase mb-2">Network State</div>
                          <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase">
                            <ShieldCheck size={14} /> Synced
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Module */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-3xl p-8 space-y-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Oracle Log</span>
              <HardwareStatus />
            </div>
            
            <div className="space-y-4">
              {[7, 13, 22].map((n, i) => (
                <div key={n} className="flex items-center justify-between group p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-base/10 flex items-center justify-center font-mono text-base font-bold">
                      {n}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white/80">Calibration #{400 - i}</p>
                      <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">History_node_0{i+1}</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-white/20 group-hover:text-base transition-colors" />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-3xl bg-base relative overflow-hidden group shadow-[0_20px_40px_rgba(0,82,255,0.2)]"
          >
            <Cpu className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            <div className="relative z-10 space-y-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="text-white fill-current" size={20} />
              </div>
              <h4 className="text-lg font-display font-bold text-white">Base Neural Engine</h4>
              <p className="text-[11px] text-white/80 font-medium leading-relaxed">
                Gemini 3 Flash scales numerical intelligence across the Base ecosystem, revealing patterns invisible to civilian hardware.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { data: balance } = useBalance({ address });

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] p-6 text-white">
      <div className="flex items-center justify-between glass-panel p-2 pl-6 rounded-2xl max-w-7xl mx-auto border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-base rounded flex items-center justify-center shadow-[0_0_15px_rgba(0,82,255,0.5)]">
            <Layers className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-black text-sm uppercase tracking-widest">Oracle.Base</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-accent animate-ping" />
              <span className="text-[9px] font-mono text-accent uppercase tracking-tighter">Live Transmission</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 mr-4">
            <button className="text-[10px] font-mono text-white/40 uppercase hover:text-white transition-colors">Documentation</button>
            <button className="text-[10px] font-mono text-white/40 uppercase hover:text-white transition-colors">Security</button>
          </div>

          {!isConnected ? (
            <button 
              onClick={() => connect({ connector: connectors[0] })}
              className="px-6 py-2.5 bg-white text-black font-display font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-base hover:text-white transition-all shadow-xl active:scale-95"
            >
              Initialize Node
            </button>
          ) : (
            <div className="flex items-center gap-4 bg-[#07090D] p-1.5 pr-4 rounded-xl border border-white/5">
              <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hidden sm:block">
                <span className="text-[10px] font-mono text-white/30 mr-2 uppercase">Balance</span>
                <span className="text-xs font-bold text-white/90">
                  {balance ? `${parseFloat(formatEther(balance.value)).toFixed(4)}` : '0.0000'} <span className="text-[9px]">ETH</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-base/20 border border-base/30 flex items-center justify-center">
                  <Fingerprint className="text-base" size={16} />
                </div>
                <span className="text-xs font-mono font-bold text-white/80">
                  {address?.slice(0, 4)}...{address?.slice(-4)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const Layout = () => {
  const { isConnected } = useAccount();
  const [fact, setFact] = useState<DailyNumberFact | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const { sendTransaction, isPending } = useSendTransaction();

  useEffect(() => {
    getDailyNumberFact(new Date().toISOString().split('T')[0]).then(setFact);
  }, []);

  const handleCheckIn = async () => {
    if (!isConnected) return;
    try {
      const checkInData = "0x4b4c50" as `0x${string}`;
      await sendTransaction({
        to: '0x0000000000000000000000000000000000000000',
        value: BigInt(0),
        data: checkInData,
      });
      setCheckedIn(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="relative z-10 pt-32 min-h-screen">
      <Header />
      <OracleDisplay 
        fact={fact} 
        checkedIn={checkedIn} 
        onCheckIn={handleCheckIn}
        isPending={isPending}
      />
      
      {/* Decorative Navigation Rail */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-12 text-white/10">
        <div className="w-[1px] h-32 bg-gradient-to-t from-white/20 to-transparent" />
        <div className="flex flex-col gap-8">
          <Compass className="cursor-pointer hover:text-white transition-colors" size={20} />
          <Binary className="cursor-pointer hover:text-white transition-colors" size={20} />
          <Cpu className="cursor-pointer hover:text-white transition-colors" size={20} />
        </div>
        <div className="w-[1px] h-32 bg-gradient-to-b from-white/20 to-transparent" />
      </div>

      <footer className="relative z-10 p-12 mt-20 text-center border-t border-white/5 bg-[#07090D]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Zap className="text-base w-5 h-5" />
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em]">Cryptographic Oracle Protocol v1.4</span>
          </div>
          <div className="flex gap-8">
            <span className="text-[10px] font-mono text-white/20 uppercase hover:text-white transition-colors cursor-pointer">Protocol Status</span>
            <span className="text-[10px] font-mono text-white/20 uppercase hover:text-white transition-colors cursor-pointer">Network Registry</span>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default function App() {
  return (
    <WagmiProvider config={web3Config}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen selection:bg-accent selection:text-black">
          <Starfield />
          <Layout />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

