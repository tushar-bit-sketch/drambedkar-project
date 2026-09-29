import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Play, Pause, RotateCcw, ArrowRight, ArrowLeft, 
  ExternalLink, Clock, ShieldCheck, CheckCircle2, AlertTriangle, 
  BookOpen, Search, Cpu, Bot, Globe, Network, Film, Monitor, Shield,
  RefreshCw, CheckSquare, Square
} from 'lucide-react';
import { demoApi, DemoStageOverview, DemoStageDetail, DemoControlState } from '../../services/demoApi';

export const AdminDemoControlPage: React.FC = () => {
  const [stages, setStages] = useState<DemoStageOverview[]>([]);
  const [controlState, setControlState] = useState<DemoControlState | null>(null);
  const [currentStageDetail, setCurrentStageDetail] = useState<DemoStageDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Presentation Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [checkedPoints, setCheckedPoints] = useState<Record<string, boolean>>({});

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [stagesData, ctrlState] = await Promise.all([
        demoApi.getStages(),
        demoApi.getControlState().catch(() => ({
          active_stage_step: 1,
          total_stages: 10,
          demo_session_active: true,
          presentation_mode: 'INTERACTIVE_TOUR'
        }))
      ]);
      setStages(stagesData);
      setControlState(ctrlState);

      const activeStep = ctrlState.active_stage_step || 1;
      const targetStage = stagesData[activeStep - 1] || stagesData[0];
      if (targetStage) {
        const detail = await demoApi.getStageDetail(targetStage.stage_id);
        setCurrentStageDetail(detail);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize presentation control');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStepChange = async (direction: 'next' | 'prev' | 'reset') => {
    try {
      setLoading(true);
      const newCtrl = await demoApi.stepControl(direction);
      setControlState(newCtrl);
      const targetStage = stages[newCtrl.active_stage_step - 1];
      if (targetStage) {
        const detail = await demoApi.getStageDetail(targetStage.stage_id);
        setCurrentStageDetail(detail);
      }
      if (direction === 'reset') {
        setCheckedPoints({});
      }
    } catch (err: any) {
      setError(err.message || 'Step navigation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleJumpToStage = async (stage: DemoStageOverview) => {
    try {
      setLoading(true);
      const detail = await demoApi.getStageDetail(stage.stage_id);
      setCurrentStageDetail(detail);
      setControlState(prev => prev ? { ...prev, active_stage_step: stage.step } : null);
    } catch (err: any) {
      setError(err.message || 'Stage jump failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleTalkingPoint = (pointText: string) => {
    setCheckedPoints(prev => ({
      ...prev,
      [pointText]: !prev[pointText]
    }));
  };

  const currentStep = controlState?.active_stage_step || currentStageDetail?.step || 1;

  const getStageIcon = (stageId: string) => {
    switch (stageId) {
      case 'digital_archive': return BookOpen;
      case 'smart_search': return Search;
      case 'ocr_digitization': return Cpu;
      case 'ai_research_assistant': return Bot;
      case 'multilingual_access': return Globe;
      case 'knowledge_graph': return Network;
      case 'intelligent_timeline': return Clock;
      case 'audio_video_archive': return Film;
      case 'kiosk_experience': return Monitor;
      case 'security_preservation': return ShieldCheck;
      default: return Sparkles;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#102038] text-white p-6 rounded-xl shadow-md border-l-4 border-heritage-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-heritage-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>SIH 2024 Evaluation Control System</span>
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-wide">
              Archival Presentation Steering Console
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Curate live demonstration for jury evaluation. Track elapsed presentation time, review talking points, and orchestrate interactive platform workflows.
            </p>
          </div>

          {/* Presentation Timer Controls */}
          <div className="bg-slate-900/90 border border-heritage-500/40 rounded-lg p-3 flex items-center space-x-4">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Presentation Clock</div>
              <div className={`text-2xl font-mono font-bold ${timerSeconds > 480 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {formatTimer(timerSeconds)}
              </div>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setTimerActive(!timerActive)}
                className={`p-2 rounded font-medium text-xs transition ${
                  timerActive 
                    ? 'bg-amber-600/80 hover:bg-amber-600 text-white' 
                    : 'bg-emerald-600/80 hover:bg-emerald-600 text-white'
                }`}
                title={timerActive ? 'Pause Timer' : 'Start Timer'}
              >
                {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setTimerActive(false);
                  setTimerSeconds(0);
                }}
                className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleStepChange('prev')}
              disabled={loading || currentStep <= 1}
              className="flex items-center space-x-1 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40 text-xs font-semibold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Stage</span>
            </button>
            <button
              onClick={() => handleStepChange('next')}
              disabled={loading || currentStep >= stages.length}
              className="flex items-center space-x-1 px-4 py-1.5 rounded bg-heritage-500 hover:bg-heritage-600 text-slate-950 text-xs font-bold transition shadow"
            >
              <span>Next Stage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleStepChange('reset')}
              disabled={loading}
              className="flex items-center space-x-1 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Stage 1</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to={`/demo?stage=${currentStageDetail?.stage_id || 'digital_archive'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/40 text-xs font-semibold transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Public Demo Screen</span>
            </Link>
            <Link
              to="/system-status"
              className="flex items-center space-x-1 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-xs transition"
            >
              <Shield className="w-3.5 h-3.5 text-heritage-400" />
              <span>System Health</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-200 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Left Stage Navigator, Right Stage Controls & Talking Points */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 10 Stage Directory */}
        <div className="bg-white rounded-xl border border-stone-300 p-4 shadow-sm h-fit">
          <h2 className="font-serif font-bold text-base text-slate-900 mb-3 pb-2 border-b border-stone-200 flex items-center justify-between">
            <span>Demonstration Sequence</span>
            <span className="text-xs font-mono text-stone-500">{stages.length} Stages</span>
          </h2>

          <div className="space-y-2">
            {stages.map((stage) => {
              const Icon = getStageIcon(stage.stage_id);
              const isActive = currentStageDetail?.stage_id === stage.stage_id;
              const isPassed = stage.step < currentStep;

              return (
                <button
                  key={stage.stage_id}
                  onClick={() => handleJumpToStage(stage)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition flex items-start space-x-3 ${
                    isActive
                      ? 'bg-heritage-50 border-heritage-500 shadow-sm ring-1 ring-heritage-500'
                      : isPassed
                      ? 'bg-slate-50/70 border-stone-200 text-slate-700 hover:bg-stone-100'
                      : 'bg-white border-stone-200 text-slate-600 hover:bg-stone-50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                    isActive
                      ? 'bg-heritage-500 text-slate-950 font-mono'
                      : isPassed
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-stone-200 text-stone-600'
                  }`}>
                    {isPassed ? '✓' : stage.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold truncate ${isActive ? 'text-slate-950 font-bold' : 'text-slate-800'}`}>
                        {stage.title}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${
                        stage.capability_status === 'OPERATIONAL'
                          ? 'bg-emerald-100 text-emerald-800'
                          : stage.capability_status.includes('FALLBACK')
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {stage.capability_status === 'OPERATIONAL' ? 'OP' : 'FALLBACK'}
                      </span>
                    </div>
                    <p className="text-stone-500 text-[11px] truncate mt-0.5">
                      {stage.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Active Stage Curator Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          {currentStageDetail ? (
            <>
              {/* Active Stage Overview Card */}
              <div className="bg-white rounded-xl border border-stone-300 p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-heritage-100 text-heritage-800 flex items-center justify-center">
                      {React.createElement(getStageIcon(currentStageDetail.stage_id), { className: 'w-5 h-5' })}
                    </div>
                    <div>
                      <div className="text-xs font-mono text-heritage-700 font-semibold uppercase tracking-wider">
                        Stage {currentStageDetail.step} of {stages.length}
                      </div>
                      <h2 className="text-xl font-serif font-bold text-slate-900">
                        {currentStageDetail.title}
                      </h2>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                    currentStageDetail.status === 'OPERATIONAL'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {currentStageDetail.status}
                  </span>
                </div>

                {/* Problem vs Solution Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-lg text-xs">
                    <span className="font-bold text-red-900 block mb-1 uppercase tracking-wide">Archival Problem</span>
                    <p className="text-slate-700 leading-relaxed">{currentStageDetail.problem}</p>
                  </div>
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs">
                    <span className="font-bold text-emerald-900 block mb-1 uppercase tracking-wide">Engineering Solution</span>
                    <p className="text-slate-700 leading-relaxed">{currentStageDetail.solution}</p>
                  </div>
                </div>

                {/* Curator Talking Points Checklist */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-heritage-600" />
                    <span>Judge Evaluation Talking Points (Check off as presented)</span>
                  </h3>
                  <div className="space-y-2">
                    {currentStageDetail.talking_points.map((point, idx) => {
                      const isChecked = !!checkedPoints[point];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleTalkingPoint(point)}
                          className={`p-3 rounded-lg border text-xs cursor-pointer transition flex items-start space-x-3 ${
                            isChecked
                              ? 'bg-emerald-50/60 border-emerald-300 text-slate-700 line-through'
                              : 'bg-stone-50 border-stone-200 text-slate-800 hover:bg-stone-100'
                          }`}
                        >
                          <button
                            type="button"
                            className="mt-0.5 text-stone-500 hover:text-emerald-600 focus:outline-none flex-shrink-0"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4 text-stone-400" />
                            )}
                          </button>
                          <span className="leading-relaxed">{point}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Specific Stage Live Assets Inspector */}
              <div className="bg-white rounded-xl border border-stone-300 p-5 shadow-sm">
                <h3 className="font-serif font-bold text-slate-900 text-sm mb-3">
                  Verified Data & Live Assets for this Stage
                </h3>

                {currentStageDetail.sample_records && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono text-stone-500 uppercase">Sample Archival Records:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentStageDetail.sample_records.map((rec) => (
                        <div key={rec.archive_id} className="p-2.5 bg-stone-50 border border-stone-200 rounded text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-heritage-700 font-bold">{rec.archive_id}</span>
                            <span className="text-[10px] text-stone-500">{rec.year}</span>
                          </div>
                          <div className="font-semibold text-slate-800 truncate mt-0.5">{rec.title}</div>
                          <div className="text-[10px] text-emerald-700 font-mono mt-1">
                            ✓ {rec.verification_status} • SHA256: {rec.checksum?.substring(0, 8)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStageDetail.suggested_queries && (
                  <div className="space-y-2 mt-3">
                    <div className="text-[11px] font-mono text-stone-500 uppercase">Suggested Live Evaluation Queries:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentStageDetail.suggested_queries.map((q, idx) => (
                        <div key={idx} className="p-2 bg-stone-50 border border-stone-200 rounded text-xs">
                          <span className="font-semibold text-slate-900">"{q.query}"</span>
                          <p className="text-[11px] text-stone-600 mt-0.5">{q.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStageDetail.sample_questions && (
                  <div className="space-y-2 mt-3">
                    <div className="text-[11px] font-mono text-stone-500 uppercase">RAG Grounded Test Questions:</div>
                    <div className="space-y-1.5">
                      {currentStageDetail.sample_questions.map((sq, idx) => (
                        <div key={idx} className="p-2 bg-stone-50 border border-stone-200 rounded text-xs flex justify-between items-center">
                          <span className="text-slate-800">"{sq.question}"</span>
                          <span className="text-[10px] font-mono bg-stone-200 px-2 py-0.5 rounded text-stone-700 flex-shrink-0 ml-2">
                            Source: {sq.expected_source}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStageDetail.featured_entities && (
                  <div className="space-y-2 mt-3">
                    <div className="text-[11px] font-mono text-stone-500 uppercase">Knowledge Graph Key Entities:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {currentStageDetail.featured_entities.map((ent) => (
                        <span key={ent.name} className="px-2.5 py-1 bg-stone-100 border border-stone-200 text-slate-800 rounded text-xs font-mono">
                          {ent.name} <span className="text-stone-400">({ent.type})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {currentStageDetail.assets && (
                  <div className="space-y-2 mt-3">
                    <div className="text-[11px] font-mono text-stone-500 uppercase">Registered Audio/Video Masters:</div>
                    <div className="space-y-1.5">
                      {currentStageDetail.assets.map((ast) => (
                        <div key={ast.archive_id} className="p-2 bg-stone-50 border border-stone-200 rounded text-xs flex justify-between">
                          <span className="font-semibold text-slate-800">{ast.title}</span>
                          <span className="font-mono text-[11px] text-stone-500">{ast.archive_id} ({ast.media_type})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-stone-500 bg-white rounded-xl border border-stone-300">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-heritage-600 mb-2" />
              <span>Loading presentation stage details...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDemoControlPage;
