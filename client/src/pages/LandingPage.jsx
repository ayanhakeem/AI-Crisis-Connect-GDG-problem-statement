import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, ArrowRight, Play, Radio, Shield, 
  Users, Activity, Bell, Smartphone, ChevronRight,
  Database, Globe, Lock, Hexagon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Nav = () => {
  const { user } = useAuth();
  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5 z-[100] px-6">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#F45B20] rounded-xl rotate-6 opacity-20" />
            <div className="absolute inset-0 bg-[#F45B20] rounded-xl -rotate-3 leading-none flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Radio className="w-6 h-6 text-white" />
            </div>
          </div>
          <span className="text-white font-bold text-xl tracking-tighter">Crisis<span className="text-[#F45B20]">Connect</span></span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-white/50 hover:text-white transition-colors text-sm font-medium">Features</a>
          <a href="#protocol" className="text-white/50 hover:text-white transition-colors text-sm font-medium">Protocol</a>
          <a href="#analytics" className="text-white/50 hover:text-white transition-colors text-sm font-medium">Analytics</a>
          <a href="#security" className="text-white/50 hover:text-white transition-colors text-sm font-medium">Security</a>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/dashboard" className="btn-primary py-2 px-5 text-sm">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="text-white/50 hover:text-white transition-colors text-sm font-medium">Login</Link>
              <Link to="/login" className="btn-primary py-2 px-5 text-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  };

  return (
    <div 
      className="perspective-1200 opacity-0 animate-fade-in-up" 
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="perspective-card p-8 h-full group"
      >
        <div className="w-14 h-14 bg-[#F45B20]/10 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#F45B20]/20">
          <Icon className="w-7 h-7 text-[#F45B20]" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const phoneRef = useRef(null);

  // If user is already logged in, skip landing page
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!phoneRef.current) return;
      const x = (window.innerWidth / 2 - e.clientX) / 50;
      const y = (window.innerHeight / 2 - e.clientY) / 50;
      phoneRef.current.style.transform = `rotateY(${-18 + x}deg) rotateX(${8 + y}deg)`;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      <Nav />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        {/* Glow Effects */}
        <div className="glow-pulse left-0 top-1/4" />
        <div className="glow-pulse right-[10%] bottom-0" style={{ opacity: 0.05 }} />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F45B20]/10 border border-[#F45B20]/20 mb-8 animate-fade-in-up">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F45B20] animate-pulse" />
              <span className="text-[#F45B20] text-xs font-bold uppercase tracking-wider">CrisisConnect Enterprise</span>
            </div>
            
            <h1 className="clash-headline text-6xl md:text-8xl mb-8 animate-fade-in-up">
              Emergency <br />
              <span className="text-white/20">Response</span> <br />
              Redefined.
            </h1>
            
            <p className="text-slate-400 text-lg md:text-xl max-w-xl mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Unite your hotel staff with real-time AI-driven protocols. Detect, coordinate, and resolve crises before they escalate.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/login" className="btn-primary text-base px-8 py-4 w-full sm:w-auto justify-center group">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="flex items-center gap-3 text-white font-semibold px-8 py-4 hover:bg-white/5 rounded-xl transition-all">
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-white" />
                </div>
                View Demo
              </button>
            </div>
          </div>

          {/* Right 3D Visual */}
          <div className="flex-1 perspective-1200 relative py-20 pointer-events-none lg:pointer-events-auto">
            <div 
              ref={phoneRef}
              className="relative w-72 h-[580px] bg-[#111] rounded-[40px] border-[8px] border-[#222] shadow-2xl mx-auto transition-transform duration-200 ease-out preserve-3d"
              style={{ transform: 'rotateY(-18deg) rotateX(8deg)' }}
            >
              {/* Phone Screen Rendering */}
              <div className="absolute inset-0.5 rounded-[32px] overflow-hidden bg-black flex flex-col">
                <img 
                  src="/hero_ui.png" 
                  alt="CrisisConnect Mobile App" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Badges */}
              <div className="badge-float top-1/4 -right-16 animate-float-sine flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-orange-400" />
                <span>Immediate Alert</span>
              </div>
              <div className="badge-float top-2/3 -left-16 animate-float-delayed flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>12 Staff Ready</span>
              </div>
              <div className="badge-float bottom-1/4 -right-12 animate-float-sine delay-700 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>AI Protocol Engine</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features & Security Grid */}
      <section id="security" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div id="protocol" className="text-center mb-20 opacity-0 animate-fade-in-up">
            <h2 className="clash-headline text-4xl md:text-6xl mb-6">Built for <span className="text-white/20">Critical</span> Operations.</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Elite hospitality demands elite response speed. Our platform is engineered to handle high-pressure scenarios with zero friction.</p>
          </div>

          <div id="analytics" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Zap}
              title="Predictive Protocols"
              description="Our system analyzes live situational data to generate step-by-step response instructions tailored to the crisis."
              delay={0.1}
            />
            <FeatureCard 
              icon={Smartphone}
              title="One-Tap Mobilization"
              description="Alert every responder in the building with a single tap. Instant push notifications and real-time socket delivery."
              delay={0.2}
            />
            <FeatureCard 
              icon={Shield}
              title="Secure Coordination"
              description="Encrypted real-time timeline for legal and management oversight. Preserve every action taken during a crisis."
              delay={0.3}
            />
            <FeatureCard 
              icon={Globe}
              title="Universal Coverage"
              description="Whether it's the kitchen, a guest suite, or the lobby, our floor-mapped protocols guide your team everywhere."
              delay={0.4}
            />
            <FeatureCard 
              icon={Database}
              title="Analytics Engine"
              description="Turn emergencies into insights. Analyze response times and department performance with visual data charts."
              delay={0.5}
            />
            <FeatureCard 
              icon={Lock}
              title="Enterprise Security"
              description="Role-based access controls ensure that critical commands are only handled by authorized hotel personnel."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative">
        <div className="glow-pulse left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" style={{ width: '600px', height: '600px' }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="clash-headline text-5xl md:text-7xl mb-10">
            Ready to <span className="text-[#F45B20]">Secure</span> <br /> 
            Your Property?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/login" className="btn-primary px-12 py-5 text-lg group">
              Start Your Protocol
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors pointer-events-none">
                <Activity className="w-6 h-6 text-slate-500" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors pointer-events-none">
                <Globe className="w-6 h-6 text-slate-500" />
              </div>
            </div>
          </div>
          <p className="text-slate-600 text-sm mt-12 font-medium tracking-tight">
            JOIN 200+ LUXURY HOTELS WORLDWIDE
          </p>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#F45B20] rounded-lg flex items-center justify-center">
               <Radio className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">CrisisConnect</span>
          </div>
          <p className="text-slate-600 text-sm">© 2024 CrisisConnect Enterprise. All rights reserved.</p>
          <div className="flex gap-8">
             <a href="#" className="text-slate-600 hover:text-white transition-colors text-xs">Privacy Policy</a>
             <a href="#" className="text-slate-600 hover:text-white transition-colors text-xs">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
