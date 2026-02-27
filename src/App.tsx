/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Lightbulb, 
  Beaker, 
  ChevronRight, 
  ArrowLeft, 
  Plus, 
  Home, 
  User, 
  Settings,
  Sparkles,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  FileText,
  Printer,
  Download,
  X,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Video,
  Upload,
  Wand2,
  Play
} from 'lucide-react';
import { UserProfile, Project, ProjectType, AgeBand } from './types';
import { PROJECT_TEMPLATES } from './constants';
import { getNextCoachMessage, generateProjectOutputs, generateImage, editImage, generateVideo } from './services/geminiService';

// --- Styles Helper ---

const getAgeStyles = (band: AgeBand = '9-11') => {
  const styles = {
    '6-8': {
      textBody: 'text-2xl font-medium',
      textHeader: 'text-5xl font-bold tracking-tight',
      textSub: 'text-xl',
      buttonPadding: 'px-10 py-6',
      buttonText: 'text-2xl',
      cardPadding: 'p-10',
      spacing: 'space-y-12',
      gap: 'gap-10',
      iconSize: 'w-12 h-12',
      inputPadding: 'p-8',
      inputText: 'text-2xl',
      rounded: 'rounded-[3rem]',
      border: 'border-4'
    },
    '9-11': {
      textBody: 'text-lg font-medium',
      textHeader: 'text-3xl font-bold',
      textSub: 'text-base',
      buttonPadding: 'px-6 py-4',
      buttonText: 'text-lg',
      cardPadding: 'p-6',
      spacing: 'space-y-6',
      gap: 'gap-6',
      iconSize: 'w-7 h-7',
      inputPadding: 'p-5',
      inputText: 'text-lg',
      rounded: 'rounded-3xl',
      border: 'border-2'
    },
    '12-14': {
      textBody: 'text-base font-normal',
      textHeader: 'text-2xl font-semibold',
      textSub: 'text-sm',
      buttonPadding: 'px-5 py-3',
      buttonText: 'text-base',
      cardPadding: 'p-5',
      spacing: 'space-y-4',
      gap: 'gap-4',
      iconSize: 'w-5 h-5',
      inputPadding: 'p-3',
      inputText: 'text-base',
      rounded: 'rounded-xl',
      border: 'border'
    }
  };
  return styles[band];
};

// --- Components ---

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false,
  loading = false,
  ageBand = '9-11'
}: any) => {
  const styles = getAgeStyles(ageBand);
  const variants: any = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg',
    secondary: `bg-white text-slate-700 ${styles.border} border-slate-200 hover:bg-slate-50`,
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    outline: `${styles.border} border-brand-600 text-brand-600 hover:bg-brand-50`
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled || loading}
      className={`${styles.buttonPadding} ${styles.buttonText} ${styles.rounded} font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : children}
    </button>
  );
};

const Card = ({ children, className = '', onClick, ageBand = '9-11' }: any) => {
  const styles = getAgeStyles(ageBand);
  return (
    <div 
      onClick={onClick}
      className={`bg-white ${styles.rounded} ${styles.cardPadding} shadow-sm ${styles.border} border-slate-100 ${onClick ? 'cursor-pointer card-hover' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

// --- Pages ---

const Onboarding = ({ onComplete }: { onComplete: (profile: any) => void }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: '',
    age_band: '9-11' as AgeBand,
    interests: [] as string[]
  });

  const styles = getAgeStyles(data.age_band);
  const interests = ['Space', 'Animals', 'Robots', 'Art', 'Nature', 'Magic', 'Sports', 'Cooking'];

  const next = () => setStep(s => s + 1);

  const finish = async () => {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const profile = await res.json();
    onComplete({ ...data, id: profile.id });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div 
            key="step0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8"
          >
            <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-12 h-12 text-brand-600" />
            </div>
            <h1 className="text-4xl">Welcome to WonderBuild!</h1>
            <p className="text-slate-600 text-lg">Every big idea starts small. Let's build something amazing together.</p>
            <Button onClick={next} className="w-full">Get Started <ChevronRight /></Button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`w-full ${styles.spacing}`}
          >
            <h2 className={styles.textHeader}>What's your name?</h2>
            <input 
              type="text" 
              value={data.name}
              onChange={e => setData({ ...data, name: e.target.value })}
              placeholder="Your nickname or first name"
              className={`w-full ${styles.inputPadding} ${styles.rounded} ${styles.border} border-slate-200 focus:border-brand-500 outline-none ${styles.inputText}`}
            />
            <Button onClick={next} disabled={!data.name} ageBand={data.age_band} className="w-full">Next</Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`w-full ${styles.spacing}`}
          >
            <h2 className={styles.textHeader}>How old are you?</h2>
            <div className={`grid ${styles.gap}`}>
              {(['6-8', '9-11', '12-14'] as AgeBand[]).map(band => (
                <button
                  key={band}
                  onClick={() => setData({ ...data, age_band: band })}
                  className={`${styles.inputPadding} ${styles.rounded} ${styles.border} text-left transition-all ${data.age_band === band ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="font-bold text-lg">Ages {band}</div>
                  <div className="text-slate-500 text-sm">
                    {band === '6-8' ? 'Simple & fun' : band === '9-11' ? 'Independent explorer' : 'Deep & creative'}
                  </div>
                </button>
              ))}
            </div>
            <Button onClick={next} ageBand={data.age_band} className="w-full">Next</Button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`w-full ${styles.spacing}`}
          >
            <h2 className={styles.textHeader}>What do you love?</h2>
            <div className={`grid grid-cols-2 ${styles.gap}`}>
              {interests.map(interest => (
                <button
                  key={interest}
                  onClick={() => {
                    const newInterests = data.interests.includes(interest)
                      ? data.interests.filter(i => i !== interest)
                      : [...data.interests, interest];
                    setData({ ...data, interests: newInterests });
                  }}
                  className={`p-4 ${styles.rounded} ${styles.border} transition-all ${data.interests.includes(interest) ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  {interest}
                </button>
              ))}
            </div>
            <Button onClick={finish} ageBand={data.age_band} className="w-full">Finish!</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Dashboard = ({ profile, onStartProject, onResumeProject }: any) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const styles = getAgeStyles(profile.age_band);

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(setProjects);
  }, []);

  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <div className="pb-24">
      <header className="p-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className={styles.textHeader}>Hi, {profile.name}! 👋</h1>
          <p className={`${styles.textSub} text-slate-500`}>What will you build today?</p>
        </div>
        <div className={`${styles.iconSize} bg-brand-100 ${styles.rounded} flex items-center justify-center`}>
          <User className="w-3/5 h-3/5 text-brand-600" />
        </div>
      </header>

      <main className={`p-6 ${styles.spacing} max-w-2xl mx-auto`}>
        {activeProjects.length > 0 && (
          <section className={styles.spacing}>
            <h2 className={`${styles.textBody} font-bold flex items-center gap-2`}><Clock className={styles.iconSize} /> Keep Going</h2>
            <div className={`grid ${styles.gap}`}>
              {activeProjects.map(p => (
                <Card key={p.id} ageBand={profile.age_band} onClick={() => onResumeProject(p)} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{p.title || 'Untitled Project'}</h3>
                    <p className="text-slate-500 text-sm capitalize">{p.type} Builder</p>
                  </div>
                  <ChevronRight className="text-slate-300" />
                </Card>
              ))}
            </div>
          </section>
        )}

        <section className={styles.spacing}>
          <h2 className={`${styles.textBody} font-bold flex items-center gap-2`}><Plus className={styles.iconSize} /> Start Something New</h2>
          <div className={`grid ${styles.gap}`}>
            {PROJECT_TEMPLATES.map(t => (
              <Card key={t.id} ageBand={profile.age_band} onClick={() => onStartProject(t.id)} className="flex gap-4 items-start">
                <div className={`${styles.iconSize} bg-brand-50 ${styles.rounded} flex items-center justify-center shrink-0`}>
                  {t.id === 'story' && <BookOpen className="text-brand-600" />}
                  {t.id === 'invention' && <Lightbulb className="text-brand-600" />}
                  {t.id === 'science' && <Beaker className="text-brand-600" />}
                </div>
                <div>
                  <h3 className="font-bold">{t.name}</h3>
                  <p className={`${styles.textSub} text-slate-500 leading-relaxed`}>{t.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {completedProjects.length > 0 && (
          <section className={styles.spacing}>
            <h2 className={`${styles.textBody} font-bold flex items-center gap-2`}><CheckCircle2 className={styles.iconSize} /> Your Creations</h2>
            <div className={`grid grid-cols-2 ${styles.gap}`}>
              {completedProjects.map(p => (
                <Card key={p.id} ageBand={profile.age_band} onClick={() => onResumeProject(p)} className="p-4">
                  <h3 className="font-bold text-sm truncate">{p.title}</h3>
                  <p className="text-slate-500 text-xs capitalize">{p.type}</p>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 flex justify-around items-center z-10">
        <button className="flex flex-col items-center gap-1 text-brand-600">
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold">Projects</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-bold">Settings</span>
        </button>
      </nav>
    </div>
  );
};

const Workspace = ({ project, profile, onBack }: { project: Project, profile: UserProfile, onBack: () => void }) => {
  const [currentProject, setCurrentProject] = useState<Project>(project);
  const [coachMessage, setCoachMessage] = useState<string>("");
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOutputs, setShowOutputs] = useState(project.status === 'completed');
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'coach' | 'studio'>('coach');
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const styles = getAgeStyles(profile.age_band);

  // Image Studio State
  const [studioImage, setStudioImage] = useState<string | null>(null);
  const [studioVideo, setStudioVideo] = useState<string | null>(null);
  const [studioPrompt, setStudioPrompt] = useState("");
  const [studioLoading, setStudioLoading] = useState(false);

  const template = PROJECT_TEMPLATES.find(t => t.id === currentProject.type)!;
  const currentStep = template.steps[currentProject.current_step];

  const saveProject = async (p: Partial<Project>) => {
    await fetch(`/api/projects/${currentProject.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
  };

  useEffect(() => {
    if (!project.brief[currentStep?.field] && !coachMessage) {
      setCoachMessage(currentStep?.question || "Let's get started!");
    }
  }, []);

  // Auto-save when navigating away
  useEffect(() => {
    return () => {
      saveProject({
        brief: currentProject.brief,
        current_step: currentProject.current_step,
        status: currentProject.status,
        outputs: currentProject.outputs,
        title: currentProject.title
      });
    };
  }, [currentProject]);

  const handleSend = async () => {
    if (!userInput.trim()) return;
    setLoading(true);

    // Save current state to undo stack
    const currentState = {
      brief: currentProject.brief,
      current_step: currentProject.current_step,
      status: currentProject.status,
      outputs: currentProject.outputs,
      coachMessage: coachMessage,
      title: currentProject.title
    };
    setUndoStack(prev => [...prev, currentState]);
    setRedoStack([]); // Clear redo stack on new action

    const updatedBrief = { ...currentProject.brief, [currentStep.field]: userInput };
    const nextStepIdx = currentProject.current_step + 1;
    const isFinished = nextStepIdx >= template.steps.length;

    let nextMessage = "";
    let outputs = currentProject.outputs;
    let finalBrief = { ...updatedBrief };

    if (isFinished) {
      outputs = await generateProjectOutputs(profile.age_band, currentProject.type, updatedBrief);
      nextMessage = "Wow! We finished your project brief. Look at what we created!";
    } else {
      const aiResult = await getNextCoachMessage(profile.age_band, currentProject.type, updatedBrief, userInput);
      nextMessage = aiResult.nextQuestion;
      // Merge any extracted facts into the brief
      finalBrief = { ...updatedBrief, ...aiResult.extractedFacts };
    }

    const updatedProject = {
      ...currentProject,
      brief: finalBrief,
      current_step: nextStepIdx,
      status: isFinished ? 'completed' : 'active' as const,
      outputs: outputs,
      title: finalBrief.title || currentProject.title
    };

    await saveProject({
      brief: updatedProject.brief,
      current_step: updatedProject.current_step,
      status: updatedProject.status,
      outputs: updatedProject.outputs,
      title: updatedProject.title
    });

    setCurrentProject(updatedProject);
    setCoachMessage(nextMessage);
    setUserInput("");
    setLoading(false);
    if (isFinished) setShowOutputs(true);
  };

  const handleUndo = async () => {
    if (undoStack.length === 0) return;

    const prevState = undoStack[undoStack.length - 1];
    const currentState = {
      brief: currentProject.brief,
      current_step: currentProject.current_step,
      status: currentProject.status,
      outputs: currentProject.outputs,
      coachMessage: coachMessage,
      title: currentProject.title
    };

    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, currentState]);

    await saveProject({
      brief: prevState.brief,
      current_step: prevState.current_step,
      status: prevState.status,
      outputs: prevState.outputs,
      title: prevState.title
    });

    setCurrentProject({
      ...currentProject,
      brief: prevState.brief,
      current_step: prevState.current_step,
      status: prevState.status,
      outputs: prevState.outputs,
      title: prevState.title
    });
    setCoachMessage(prevState.coachMessage);
    setShowOutputs(prevState.status === 'completed');
  };

  const handleRedo = async () => {
    if (redoStack.length === 0) return;

    const nextState = redoStack[redoStack.length - 1];
    const currentState = {
      brief: currentProject.brief,
      current_step: currentProject.current_step,
      status: currentProject.status,
      outputs: currentProject.outputs,
      coachMessage: coachMessage,
      title: currentProject.title
    };

    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, currentState]);

    await saveProject({
      brief: nextState.brief,
      current_step: nextState.current_step,
      status: nextState.status,
      outputs: nextState.outputs,
      title: nextState.title
    });

    setCurrentProject({
      ...currentProject,
      brief: nextState.brief,
      current_step: nextState.current_step,
      status: nextState.status,
      outputs: nextState.outputs,
      title: nextState.title
    });
    setCoachMessage(nextState.coachMessage);
    setShowOutputs(nextState.status === 'completed');
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudioImage(reader.result as string);
        setStudioVideo(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    if (!studioPrompt.trim()) return;
    setStudioLoading(true);
    const img = await generateImage(studioPrompt, profile.age_band);
    if (img) {
      setStudioImage(img);
      setStudioVideo(null);
    }
    setStudioLoading(false);
  };

  const handleEditImage = async () => {
    if (!studioImage || !studioPrompt.trim()) return;
    setStudioLoading(true);
    const img = await editImage(studioImage, studioPrompt, profile.age_band);
    if (img) {
      setStudioImage(img);
      setStudioVideo(null);
    }
    setStudioLoading(false);
  };

  const handleGenerateVideo = async () => {
    if (!studioImage) return;
    setStudioLoading(true);
    const vid = await generateVideo(studioImage, studioPrompt);
    if (vid) {
      setStudioVideo(vid);
    }
    setStudioLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="p-4 bg-white border-b border-slate-100 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className={styles.iconSize} />
        </button>
        <div>
          <h1 className={`${styles.textBody} font-bold`}>{currentProject.title || template.name}</h1>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-500 transition-all duration-500" 
                style={{ width: `${(currentProject.current_step / template.steps.length) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Step {currentProject.current_step} of {template.steps.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button 
            onClick={handleUndo} 
            disabled={undoStack.length === 0 || loading}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-30"
            title="Undo"
          >
            <Undo2 className={styles.iconSize} />
          </button>
          <button 
            onClick={handleRedo} 
            disabled={redoStack.length === 0 || loading}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-30"
            title="Redo"
          >
            <Redo2 className={styles.iconSize} />
          </button>
        </div>
      </header>

      <main className={`flex-1 p-6 flex flex-col ${styles.gap} max-w-2xl mx-auto w-full`}>
        <div className="flex gap-2 mb-2">
          <button 
            onClick={() => setActiveTab('coach')}
            className={`flex-1 py-2 ${styles.rounded} font-bold transition-all ${activeTab === 'coach' ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100'}`}
          >
            Coach
          </button>
          <button 
            onClick={() => setActiveTab('studio')}
            className={`flex-1 py-2 ${styles.rounded} font-bold transition-all ${activeTab === 'studio' ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100'}`}
          >
            Image Studio
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'studio' ? (
            <motion.div 
              key="studio"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={styles.spacing}
            >
              <Card ageBand={profile.age_band} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className={styles.textBody}>Visualizer</h2>
                  <label className="cursor-pointer p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                    <Upload className="w-5 h-5 text-slate-600" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>

                <div className={`aspect-square bg-slate-50 ${styles.rounded} ${styles.border} border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group`}>
                  {studioVideo ? (
                    <video src={studioVideo} controls autoPlay loop className="w-full h-full object-cover" />
                  ) : studioImage ? (
                    <img src={studioImage} alt="Studio" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-slate-400 p-8">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p className={styles.textSub}>Upload or generate an image for your project!</p>
                    </div>
                  )}
                  {studioLoading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <textarea 
                    value={studioPrompt}
                    onChange={e => setStudioPrompt(e.target.value)}
                    placeholder="Describe what you want to see..."
                    className={`w-full ${styles.inputPadding} ${styles.rounded} bg-slate-50 ${styles.border} border-slate-200 focus:border-brand-500 outline-none resize-none h-24`}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={studioImage ? handleEditImage : handleGenerateImage} 
                      loading={studioLoading}
                      ageBand={profile.age_band}
                    >
                      <Wand2 className={styles.iconSize} /> {studioImage ? 'Edit' : 'Create'}
                    </Button>
                    <Button 
                      onClick={handleGenerateVideo} 
                      disabled={!studioImage}
                      loading={studioLoading}
                      variant="secondary"
                      ageBand={profile.age_band}
                    >
                      <Play className={styles.iconSize} /> Animate
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : showOutputs ? (
            <motion.div 
              key="outputs"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={styles.spacing}
            >
              <div className={`bg-brand-600 text-white p-8 ${styles.rounded} ${styles.border} border-brand-500 shadow-xl relative overflow-hidden`}>
                <Sparkles className="absolute top-4 right-4 w-12 h-12 opacity-20" />
                <h2 className={styles.textHeader}>Project Complete!</h2>
                <p className={`${styles.textBody} opacity-90`}>You did it, {profile.name}! Here is your finished project.</p>
              </div>

              {Object.entries(currentProject.outputs).map(([key, value]: any) => (
                <Card key={key} ageBand={profile.age_band} className="space-y-2">
                  <h3 className="text-brand-600 uppercase text-xs font-bold tracking-widest">{key.replace(/_/g, ' ')}</h3>
                  <div className={`${styles.textBody} text-slate-700 leading-relaxed whitespace-pre-wrap`}>
                    {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                  </div>
                </Card>
              ))}

              <Button onClick={() => setShowOutputs(false)} variant="secondary" ageBand={profile.age_band} className="w-full">
                Back to Coach
              </Button>

              <Button onClick={() => setShowDetails(true)} variant="outline" ageBand={profile.age_band} className="w-full">
                <FileText className={styles.iconSize} /> View Project Details
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex-1 flex flex-col ${styles.gap}`}
            >
              <div className={`flex ${styles.gap} items-start`}>
                <div className={`${styles.iconSize} bg-brand-600 ${styles.rounded} flex items-center justify-center shrink-0 shadow-lg shadow-brand-200`}>
                  <Sparkles className="w-3/5 h-3/5 text-white" />
                </div>
                <div className={`bg-white ${styles.cardPadding} ${styles.rounded} rounded-tl-none shadow-sm ${styles.border} border-slate-100 flex-1`}>
                  <p className={`text-slate-800 ${styles.textBody} leading-relaxed`}>{coachMessage}</p>
                </div>
              </div>

              {loading && (
                <div className="flex gap-2 p-4">
                  <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {!showOutputs && (
        <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0">
          <div className="max-w-2xl mx-auto flex gap-2">
            <input 
              type="text"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your answer here..."
              className={`flex-1 ${styles.inputPadding} ${styles.rounded} ${styles.inputText} bg-slate-50 ${styles.border} border-slate-200 focus:border-brand-500 outline-none`}
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={!userInput.trim()} loading={loading} ageBand={profile.age_band}>
              Send
            </Button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ${styles.rounded} shadow-2xl`}
            >
              <header className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className={`${styles.iconSize} bg-brand-100 rounded-full flex items-center justify-center`}>
                    <FileText className="w-3/5 h-3/5 text-brand-600" />
                  </div>
                  <h2 className={styles.textHeader}>Project Details</h2>
                </div>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 print:p-0">
                <div id="printable-content" className="space-y-8">
                  <section className="space-y-4">
                    <h3 className={`${styles.textBody} font-bold border-b border-slate-100 pb-2`}>Project Brief</h3>
                    <div className="grid gap-4">
                      {Object.entries(currentProject.brief).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{key}</span>
                          <p className={`${styles.textSub} text-slate-700`}>{value as string}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className={`${styles.textBody} font-bold border-b border-slate-100 pb-2`}>Final Outputs</h3>
                    <div className="grid gap-4">
                      {Object.entries(currentProject.outputs).map(([key, value]: any) => (
                        <div key={key} className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                          <div className={`${styles.textSub} text-slate-700 whitespace-pre-wrap`}>
                            {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              <footer className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                <Button 
                  onClick={() => window.print()} 
                  variant="secondary" 
                  ageBand={profile.age_band}
                  className="flex-1"
                >
                  <Printer className={styles.iconSize} /> Print
                </Button>
                <Button 
                  onClick={() => {
                    const data = JSON.stringify({
                      title: currentProject.title,
                      type: currentProject.type,
                      brief: currentProject.brief,
                      outputs: currentProject.outputs
                    }, null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${currentProject.title || 'project'}.json`;
                    a.click();
                  }} 
                  variant="secondary" 
                  ageBand={profile.age_band}
                  className="flex-1"
                >
                  <Download className={styles.iconSize} /> Export
                </Button>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'workspace'>('dashboard');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      });
  }, []);

  const startProject = async (type: ProjectType) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile_id: profile?.id,
        type,
        title: '',
        brief: {}
      })
    });
    const data = await res.json();
    const project = await fetch(`/api/projects/${data.id}`).then(r => r.json());
    setActiveProject(project);
    setView('workspace');
  };

  const resumeProject = (project: Project) => {
    setActiveProject(project);
    setView('workspace');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50">
      <div className="text-center space-y-4">
        <Sparkles className="w-12 h-12 text-brand-600 animate-pulse mx-auto" />
        <p className="text-brand-700 font-bold">Loading WonderBuild...</p>
      </div>
    </div>
  );

  if (!profile) return <Onboarding onComplete={setProfile} />;

  return (
    <div className="min-h-screen bg-slate-50">
      {view === 'dashboard' ? (
        <Dashboard 
          profile={profile} 
          onStartProject={startProject}
          onResumeProject={resumeProject}
        />
      ) : (
        activeProject && (
          <Workspace 
            project={activeProject} 
            profile={profile}
            onBack={() => setView('dashboard')} 
          />
        )
      )}
    </div>
  );
}
