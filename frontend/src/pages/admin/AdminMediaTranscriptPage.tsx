import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileText, Film, Volume2, ArrowLeft, CheckCircle2, AlertCircle, 
  Upload, Save, Play, Pause, Plus, Trash2, Download, User
} from 'lucide-react';
import { mediaApi } from '../../services/mediaApi';
import { MediaAsset, MediaTranscript, TranscriptSegment } from '../../types/media';

export const AdminMediaTranscriptPage: React.FC = () => {
  const { mediaId } = useParams<{ mediaId: string }>();
  const [asset, setAsset] = useState<MediaAsset | null>(null);
  const [transcripts, setTranscripts] = useState<MediaTranscript[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<MediaTranscript | null>(null);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [reviewerNotes, setReviewerNotes] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // VTT/SRT Import State
  const [captionFile, setCaptionFile] = useState<File | null>(null);
  const [importLanguage, setImportLanguage] = useState<string>('en');

  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);

  const loadTranscripts = async (id: number) => {
    try {
      const data = await mediaApi.getTranscripts(id);
      setTranscripts(data);
      if (data.length > 0) {
        setSelectedTranscript(data[0]);
        setSegments(JSON.parse(JSON.stringify(data[0].segments || [])));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!mediaId) return;
    const id = parseInt(mediaId, 10);
    mediaApi.getMediaAsset(id).then(setAsset);
    loadTranscripts(id);
  }, [mediaId]);

  const handleSelectTranscript = (t: MediaTranscript) => {
    setSelectedTranscript(t);
    setSegments(JSON.parse(JSON.stringify(t.segments || [])));
  };

  const handleSegmentChange = (idx: number, field: keyof TranscriptSegment, value: any) => {
    const updated = [...segments];
    updated[idx] = { ...updated[idx], [field]: value };
    setSegments(updated);
  };

  const handleAddSegment = () => {
    const lastSeg = segments[segments.length - 1];
    const newStart = lastSeg ? lastSeg.end_time : 0;
    const newEnd = newStart + 5;
    const newSeg: TranscriptSegment = {
      segment_index: segments.length,
      start_time: newStart,
      end_time: newEnd,
      text: '',
      speaker_label: 'SPEAKER_1',
    };
    setSegments([...segments, newSeg]);
  };

  const handleDeleteSegment = (idx: number) => {
    const updated = segments.filter((_, i) => i !== idx).map((s, i) => ({
      ...s,
      segment_index: i,
    }));
    setSegments(updated);
  };

  const seekTo = (seconds: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = seconds;
      mediaRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSaveReview = async (action: 'APPROVE' | 'HUMAN_REVIEW' | 'REJECT') => {
    if (!asset || !selectedTranscript) return;

    // Validate timestamps
    for (let i = 0; i < segments.length; i++) {
      const s = segments[i];
      if (s.start_time < 0 || s.end_time <= s.start_time) {
        setMsg({
          ok: false,
          text: `Invalid timestamp in segment #${i + 1}: start must be >= 0 and end > start.`,
        });
        return;
      }
    }

    try {
      setSaving(true);
      setMsg(null);
      await mediaApi.reviewTranscript(asset.id, selectedTranscript.id, {
        action: action === 'APPROVE' ? 'APPROVE' : action === 'REJECT' ? 'REJECT' : 'REVIEW',
        segments,
        reviewer_notes: reviewerNotes || 'Curator transcript review',
      });
      setMsg({ ok: true, text: `Transcript successfully updated (${action})` });
      await loadTranscripts(asset.id);
    } catch (err: any) {
      setMsg({ ok: false, text: err.response?.data?.detail || 'Failed to save transcript review.' });
    } finally {
      setSaving(false);
    }
  };

  const handleImportCaptionFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset || !captionFile) return;

    try {
      setSaving(true);
      setMsg(null);
      const content = await captionFile.text();
      const format = captionFile.name.endsWith('.srt') ? 'SRT' : 'WEBVTT';

      await mediaApi.createTranscript(asset.id, {
        language: importLanguage,
        caption_format: format,
        raw_content: content,
        provider: 'CURATOR_IMPORT',
      });

      setCaptionFile(null);
      setMsg({ ok: true, text: `Successfully imported transcript from ${captionFile.name}` });
      await loadTranscripts(asset.id);
    } catch (err: any) {
      setMsg({ ok: false, text: err.response?.data?.detail || 'Failed to import caption file.' });
    } finally {
      setSaving(false);
    }
  };

  if (!asset) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading media asset details...
      </div>
    );
  }

  const streamUrl = mediaApi.getStreamUrl(asset.id);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-300 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/media"
            className="p-2 rounded-lg hover:bg-stone-200 text-stone-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-ink-900">
              Curator Transcript & Caption Review
            </h1>
            <p className="text-xs text-slate-600">
              {asset.title} • Accession #{asset.accession_number || asset.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-stone-100 text-slate-700 border border-stone-300 rounded-lg text-xs font-mono font-bold">
            Transcripts: {transcripts.length}
          </span>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between ${
          msg.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="font-bold">×</button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Media Player & Import Form */}
        <div className="lg:col-span-5 space-y-6">
          {/* Player Container */}
          <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-md border border-stone-300">
            {asset.media_type === 'VIDEO' ? (
              <video
                ref={mediaRef as any}
                src={streamUrl}
                poster={mediaApi.getPosterUrl(asset.id)}
                className="w-full aspect-video object-contain"
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                controls
              />
            ) : (
              <div className="p-8 text-center space-y-4">
                <Volume2 className="w-12 h-12 text-heritage-400 mx-auto" />
                <div className="font-serif font-bold text-white text-sm">{asset.title}</div>
                <audio
                  ref={mediaRef as any}
                  src={streamUrl}
                  className="w-full"
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  controls
                />
              </div>
            )}
            <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
              <span>Current Time: {currentTime.toFixed(2)}s</span>
              <span>Duration: {asset.duration_seconds ? `${asset.duration_seconds.toFixed(1)}s` : 'Unknown'}</span>
            </div>
          </div>

          {/* Import WebVTT / SRT Card */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-sm text-ink-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-heritage-600" />
              Import WebVTT / SRT File
            </h3>

            <form onSubmit={handleImportCaptionFile} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Caption File (.vtt, .srt)</label>
                <input
                  type="file"
                  accept=".vtt,.srt"
                  onChange={(e) => setCaptionFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Language</label>
                <select
                  value={importLanguage}
                  onChange={(e) => setImportLanguage(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs bg-white"
                >
                  <option value="en">English (en)</option>
                  <option value="hi">Hindi (hi)</option>
                  <option value="mr">Marathi (mr)</option>
                  <option value="ta">Tamil (ta)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!captionFile || saving}
                className="w-full py-2 bg-national-700 hover:bg-national-800 text-white rounded-lg text-xs font-semibold shadow disabled:opacity-50 transition"
              >
                {saving ? 'Importing...' : 'Upload & Parse Transcripts'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Transcript Versions & Segment Editor */}
        <div className="lg:col-span-7 space-y-6">
          {/* Transcript Version Switcher */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-mono font-bold text-slate-700">Versions:</span>
              {transcripts.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTranscript(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    selectedTranscript?.id === t.id
                      ? 'bg-national-700 text-white shadow-sm'
                      : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
                  }`}
                >
                  v{t.version} ({t.verification_status})
                </button>
              ))}
            </div>

            {selectedTranscript && (
              <span className="text-xs font-mono text-slate-500">
                Lang: <strong>{selectedTranscript.language}</strong>
              </span>
            )}
          </div>

          {/* Segment Editor */}
          {selectedTranscript ? (
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div>
                  <h3 className="font-serif font-bold text-base text-ink-900">
                    Segment Editor & Diarization
                  </h3>
                  <p className="text-xs text-slate-500">
                    Edit spoken text, fine-tune timestamps, and assign speaker diarization tags.
                  </p>
                </div>

                <button
                  onClick={handleAddSegment}
                  className="px-3 py-1.5 bg-heritage-100 hover:bg-heritage-200 text-heritage-900 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Segment
                </button>
              </div>

              {/* Segment List */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {segments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No segments exist in this transcript. Click &quot;Add Segment&quot; or import a VTT/SRT file.
                  </div>
                ) : (
                  segments.map((seg, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => seekTo(seg.start_time)}
                            className="p-1 bg-white hover:bg-heritage-100 rounded text-slate-700 border border-stone-300"
                            title="Play from this timestamp"
                          >
                            <Play className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold text-slate-700">#{idx + 1}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            <span>Start:</span>
                            <input
                              type="number"
                              step="0.1"
                              value={seg.start_time}
                              onChange={(e) => handleSegmentChange(idx, 'start_time', parseFloat(e.target.value) || 0)}
                              className="w-16 px-1.5 py-0.5 border border-stone-300 rounded text-right font-mono"
                            />
                            <span>s</span>
                          </div>

                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            <span>End:</span>
                            <input
                              type="number"
                              step="0.1"
                              value={seg.end_time}
                              onChange={(e) => handleSegmentChange(idx, 'end_time', parseFloat(e.target.value) || 0)}
                              className="w-16 px-1.5 py-0.5 border border-stone-300 rounded text-right font-mono"
                            />
                            <span>s</span>
                          </div>

                          <select
                            value={seg.speaker_label || 'SPEAKER_1'}
                            onChange={(e) => handleSegmentChange(idx, 'speaker_label', e.target.value)}
                            className="px-2 py-0.5 border border-stone-300 rounded text-[11px] font-mono bg-white"
                          >
                            <option value="SPEAKER_1">SPEAKER_1</option>
                            <option value="SPEAKER_2">SPEAKER_2</option>
                            <option value="INTERVIEWER">INTERVIEWER</option>
                            <option value="UNKNOWN">UNKNOWN</option>
                          </select>

                          <button
                            onClick={() => handleDeleteSegment(idx)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            title="Delete segment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={seg.text}
                        onChange={(e) => handleSegmentChange(idx, 'text', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-heritage-500"
                        placeholder="Spoken text in this segment..."
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Reviewer Notes & Action Buttons */}
              <div className="pt-4 border-t border-stone-200 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Curator Reviewer Notes
                  </label>
                  <input
                    type="text"
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="Audit note explaining edits or historical verification..."
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleSaveReview('REJECT')}
                    disabled={saving}
                    className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-semibold transition"
                  >
                    Reject Transcript
                  </button>

                  <button
                    onClick={() => handleSaveReview('HUMAN_REVIEW')}
                    disabled={saving}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-800 rounded-lg text-xs font-semibold transition"
                  >
                    Save Draft (Human Reviewed)
                  </button>

                  <button
                    onClick={() => handleSaveReview('APPROVE')}
                    disabled={saving}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow transition"
                  >
                    Approve for Exhibition
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-xs text-slate-500">
              Select or import a transcript to begin curator review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
