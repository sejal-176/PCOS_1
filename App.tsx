
import React, { useState, useEffect, useRef } from 'react';
import { User, PCOSAssessmentData, AssessmentResult, RiskLevel } from './types';
import { dbService } from './services/dbService';
import { analyzePCOSRisk } from './services/geminiService';
import AssessmentForm from './components/AssessmentForm';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'signup' | 'home' | 'test' | 'results' | 'history'>('landing');
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [currentResult, setCurrentResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loggedUser = dbService.getCurrentUser();
    if (loggedUser) {
      setUser(loggedUser);
      setView('home');
      setAssessments(dbService.getUserAssessments(loggedUser.id));
    }
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      audioRef.current.loop = true;
    }
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Audio play blocked", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const newUser: User = {
      id: `u_${Date.now()}`,
      name: name,
      email: formData.get('email') as string,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };
    dbService.saveUser(newUser);
    dbService.setCurrentUser(newUser);
    setUser(newUser);
    setView('home');
  };

  const handleRunTest = async (data: PCOSAssessmentData) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await analyzePCOSRisk(user.id, data);
      dbService.saveAssessment(result);
      setAssessments(prev => [result, ...prev]);
      setCurrentResult(result);
      setView('results');
    } catch (err) {
      alert("Error analyzing clinical data. Please check your inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsultDoctor = (specialty: string) => {
    window.open(`https://www.practo.com/search/doctors?q=[{"word":"${specialty}"}]`, '_blank');
  };

  const Sidebar = () => (
    <aside className="w-80 border-r border-pink-100 hidden lg:flex flex-col bg-white/80 backdrop-blur-xl sticky top-0 h-screen no-print overflow-y-auto">
      <div className="p-10">
        <div className="text-3xl font-black text-pink-600 tracking-tighter flex items-center gap-2">
          <span className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center text-white text-lg">P</span>
          GUARD<span className="text-gray-900 font-light">AI</span>
        </div>
      </div>
      
      <nav className="flex-1 px-6 space-y-2">
        {[
          { id: 'home', label: 'Dashboard', icon: '🏠' },
          { id: 'test', label: 'Start Test', icon: '🧪' },
          { id: 'history', label: 'My Reports', icon: '📂' },
        ].map(item => (
          <button 
            key={item.id} 
            onClick={() => setView(item.id as any)} 
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${view === item.id ? 'bg-pink-600 text-white shadow-lg shadow-pink-200 translate-x-1' : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-8 space-y-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl text-white shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-black uppercase tracking-widest opacity-80">Relaxation</span>
            <div className="flex space-x-1">
              {[1, 2, 3].map(i => <div key={i} className={`w-1 bg-white/50 rounded-full h-3 ${isPlaying ? 'animate-bounce' : ''}`} style={{animationDelay: `${i*0.1}s`}}></div>)}
            </div>
          </div>
          <button onClick={toggleMusic} className="w-full py-3 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-xl font-bold text-sm transition-all">
            {isPlaying ? '⏸ Pause Zen' : '▶ Play Zen'}
          </button>
        </div>

        <div className="bg-pink-50 p-6 rounded-3xl border border-pink-100 flex items-center gap-4">
          <img src={user?.avatar} className="w-12 h-12 rounded-xl bg-white shadow-sm" alt="Avatar" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-gray-900 truncate">{user?.name}</p>
            <button onClick={() => { dbService.setCurrentUser(null); setUser(null); setView('landing'); }} className="text-[10px] font-bold text-pink-600 uppercase tracking-wider">Logout</button>
          </div>
        </div>
      </div>
    </aside>
  );

  if (!user && view === 'landing') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white">
        <div className="max-w-4xl text-center space-y-12">
          <div className="inline-block px-6 py-2 bg-pink-50 text-pink-600 rounded-full text-xs font-black tracking-widest uppercase shadow-sm">
            AI-POWERED HORMONAL SCREENING
          </div>
          <h1 className="text-7xl lg:text-9xl font-black text-gray-900 tracking-tighter leading-none">
            Precision <br/> <span className="text-pink-600">PCOS Care.</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Instant, clinical-grade risk assessment using Random Forest Intelligence. 
          </p>
          <div className="pt-8">
            <button onClick={() => setView('signup')} className="bg-gray-900 text-white px-12 py-6 rounded-3xl font-black text-2xl shadow-2xl hover:bg-pink-600 transition-all active:scale-95">
              Start Free Assessment →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'signup') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-pink-50">
        <div className="bg-white p-12 lg:p-20 rounded-[3rem] shadow-2xl max-w-lg w-full text-center space-y-10 border border-pink-100">
          <h2 className="text-5xl font-black text-gray-900 tracking-tighter">Sign Up</h2>
          <form onSubmit={handleSignUp} className="space-y-5">
            <input required name="name" type="text" className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-pink-500 rounded-2xl outline-none font-bold text-lg" placeholder="Full Name" />
            <input required name="email" type="email" className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-pink-500 rounded-2xl outline-none font-bold text-lg" placeholder="Email Address" />
            <button type="submit" className="w-full bg-pink-600 text-white py-6 rounded-2xl font-black text-xl shadow-xl hover:bg-pink-700">Begin Diagnostics</button>
          </form>
          <button onClick={() => setView('landing')} className="text-gray-400 font-bold hover:text-gray-900">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50/50">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {view === 'home' && (
            <div className="animate-in fade-in duration-700 space-y-12">
              <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                  <h1 className="text-6xl font-black text-gray-900 tracking-tighter">Welcome, {user?.name.split(' ')[0]}</h1>
                  <p className="text-gray-500 text-lg font-medium mt-2">Hormonal health starts with awareness.</p>
                </div>
                <button onClick={() => setView('test')} className="bg-pink-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:bg-gray-900 transition-all">Start New Test</button>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Info Card 1: What is PCOS */}
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-pink-100 space-y-6">
                  <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-3xl">💡</div>
                  <h3 className="text-3xl font-black text-gray-900">What is PCOS?</h3>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    Polycystic Ovary Syndrome (PCOS) is a hormonal disorder common among women of reproductive age. It can cause enlarged ovaries with small cysts on the outer edges.
                  </p>
                  <ul className="space-y-3">
                    {['Irregular periods', 'Excess androgen levels', 'Polycystic ovaries'].map(item => (
                      <li key={item} className="flex items-center gap-3 font-bold text-gray-800 text-sm">
                        <span className="w-2 h-2 bg-pink-500 rounded-full"></span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Info Card 2: Awareness & Community */}
                <div className="bg-indigo-600 p-10 rounded-[3rem] shadow-xl text-white space-y-6 relative overflow-hidden group">
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-3xl font-black">Awareness Hub</h3>
                    <p className="text-indigo-100 font-medium">
                      Knowledge is the first step. Help others by sharing information or participating in awareness camps globally.
                    </p>
                    <button 
                      onClick={() => window.open('https://www.pcoschallenge.org', '_blank')}
                      className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-all"
                    >
                      Join Awareness Camp
                    </button>
                  </div>
                  <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-9xl">📣</span>
                  </div>
                </div>
              </div>

              {/* Past Reports Table Preview */}
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-pink-100">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-3xl font-black text-gray-900">Past Case Reports</h3>
                  <button onClick={() => setView('history')} className="text-pink-600 font-bold hover:underline">View All</button>
                </div>
                {assessments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-100">
                          <th className="pb-4">Date</th>
                          <th className="pb-4">Risk Level</th>
                          <th className="pb-4">Summary</th>
                          <th className="pb-4">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {assessments.slice(0, 3).map(res => (
                          <tr key={res.id} className="group hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => { setCurrentResult(res); setView('results'); }}>
                            <td className="py-6 font-bold text-gray-500 text-sm">{new Date(res.timestamp).toLocaleDateString()}</td>
                            <td className="py-6">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${res.riskLevel === 'HIGH' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>{res.riskLevel}</span>
                            </td>
                            <td className="py-6 font-bold text-gray-800 text-sm truncate max-w-[200px]">{res.summary}</td>
                            <td className="py-6 text-pink-600 font-black text-sm group-hover:translate-x-1 transition-transform">View →</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl text-gray-400 font-bold italic">No diagnostic history found. Run a test to begin.</div>
                )}
              </div>
            </div>
          )}

          {view === 'test' && (
            <div className="animate-in fade-in duration-700">
               <button onClick={() => setView('home')} className="mb-10 text-gray-400 font-bold hover:text-gray-900 flex items-center gap-2 group">
                 <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
               </button>
               <AssessmentForm onSubmit={handleRunTest} isLoading={isLoading} />
            </div>
          )}

          {view === 'results' && currentResult && (
            <div className="animate-in fade-in zoom-in duration-500 space-y-12 pb-20">
               <div className="flex justify-between items-center no-print">
                 <button onClick={() => setView('home')} className="text-gray-400 font-bold flex items-center gap-2">← Return Home</button>
                 <button onClick={() => window.print()} className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-pink-600 transition-all">Download / Print PDF</button>
               </div>

               <div className="bg-white rounded-[4rem] shadow-2xl border border-pink-100 overflow-hidden print-container">
                  <div className={`p-16 text-center ${currentResult.riskLevel === 'HIGH' ? 'bg-red-600' : 'bg-green-600'} text-white`}>
                    <p className="text-xs font-black uppercase tracking-[0.4em] opacity-80 mb-6">Medical Analysis Result</p>
                    <h2 className="text-9xl font-black italic tracking-tighter leading-none mb-8">{currentResult.riskLevel}</h2>
                    <p className="text-2xl font-bold max-w-3xl mx-auto">{currentResult.summary}</p>
                  </div>
                  
                  <div className="p-12 lg:p-20 space-y-16">
                    {/* INPUT VALUES SECTION - ALL VALUES FORCED TO BLACK FOR VISIBILITY */}
                    <section className="space-y-8">
                       <h3 className="text-3xl font-black text-black italic tracking-tighter border-b border-gray-100 pb-4">Clinical Data Breakdown</h3>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                         {[
                           { label: 'Patient Age', val: currentResult.inputs.age },
                           { label: 'BMI Index', val: currentResult.inputs.bmi },
                           { label: 'Cycle Status', val: currentResult.inputs.cycleStatus },
                           { label: 'FSH Level', val: currentResult.inputs.fsh },
                           { label: 'LH Level', val: currentResult.inputs.lh },
                           { label: 'AMH Score', val: currentResult.inputs.amh },
                           { label: 'Vitamin D3', val: currentResult.inputs.vitaminD3 },
                           { label: 'Acne Presence', val: currentResult.inputs.pimples ? 'Yes' : 'No' },
                           { label: 'Weight Gain', val: currentResult.inputs.weightGain ? 'Yes' : 'No' },
                           { label: 'Hirsutism', val: currentResult.inputs.hairGrowth ? 'Yes' : 'No' },
                           { label: 'Diet Habits', val: currentResult.inputs.fastFood ? 'Frequent Fast Food' : 'Balanced' },
                           { label: 'Exercise', val: currentResult.inputs.exercise ? 'Active' : 'Sedentary' },
                         ].map(item => (
                           <div key={item.label} className="p-5 bg-white border-2 border-gray-900 rounded-2xl shadow-sm">
                             <p className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-1">{item.label}</p>
                             <p className="text-xl font-black text-black">{item.val}</p>
                           </div>
                         ))}
                       </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                      <div className="space-y-8">
                        <h3 className="text-3xl font-black text-black tracking-tighter">Care Protocol</h3>
                        <div className="space-y-4">
                          {currentResult.recommendations.map((rec, i) => (
                            <div key={i} className="flex gap-4 p-6 bg-pink-50/50 rounded-3xl border-2 border-pink-100">
                              <span className="text-pink-600 font-black text-xl">#</span>
                              <p className="font-bold text-black text-lg">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-black p-12 rounded-[3rem] text-white space-y-8 shadow-2xl">
                        <h4 className="text-3xl font-black italic">Expert Summary</h4>
                        <p className="text-lg text-gray-300 leading-relaxed">
                          System analysis confirms a <span className="text-white font-bold">{(currentResult.confidence * 100).toFixed(0)}% algorithmic match</span> for standard PCOS clinical indicators. 
                        </p>
                        <div className="pt-4 no-print">
                          <button onClick={() => handleConsultDoctor('PCOS')} className="w-full bg-pink-600 py-6 rounded-2xl font-black text-xl hover:bg-white hover:text-black transition-all">Connect with Doctor</button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-10 border-t border-gray-100 text-center opacity-50 text-[10px] font-black text-black uppercase tracking-[0.5em]">
                      Patient ID: {currentResult.userId} • Verified Analysis • PCOS Guard AI
                    </div>
                  </div>
               </div>
            </div>
          )}

          {view === 'history' && (
            <div className="animate-in fade-in duration-700 space-y-10">
               <h2 className="text-6xl font-black text-gray-900 tracking-tighter">Diagnostic History</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {assessments.map(res => (
                    <div key={res.id} onClick={() => { setCurrentResult(res); setView('results'); }} className="bg-white p-8 rounded-[3rem] shadow-sm border border-pink-50 hover:shadow-2xl transition-all cursor-pointer group">
                      <div className="flex justify-between items-center mb-6">
                        <span className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase ${res.riskLevel === 'HIGH' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>{res.riskLevel}</span>
                        <span className="text-xs font-bold text-gray-400">{new Date(res.timestamp).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 line-clamp-2 mb-6 group-hover:text-pink-600 transition-colors leading-tight">{res.summary}</h3>
                      <div className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
                        <span>View Full Report</span>
                        <span>→</span>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
