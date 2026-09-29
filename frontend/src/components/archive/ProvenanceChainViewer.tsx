import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, FileText, GitCommit, Eye, Layers, 
  Landmark, ArrowRight, CheckCircle2, AlertTriangle, ExternalLink, X
} from 'lucide-react';
import { ProvenanceChainData } from '../../types';
import { apiService } from '../../services/api';

interface ProvenanceChainViewerProps {
  relationshipId: number;
  onClose?: () => void;
  onOpenDocument?: (docId: number) => void;
}

export const ProvenanceChainViewer: React.FC<ProvenanceChainViewerProps> = ({
  relationshipId,
  onClose,
  onOpenDocument
}) => {
  const [data, setData] = useState<ProvenanceChainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiService.getRelationshipProvenance(relationshipId)
      .then(res => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err.message || 'Failed to resolve provenance chain');
          setLoading(false);
        }
      });

    return () => { mounted = false; };
  }, [relationshipId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-ink-600 font-mono space-y-2">
        <div className="archival-loading-bar max-w-xs mx-auto mb-2" />
        <p className="text-xs uppercase font-bold">[ Resolving unbroken archival provenance chain... ]</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-danger-bg border-2 border-oxblood text-danger-text text-xs font-mono space-y-1">
        <p className="font-bold flex items-center gap-1.5 uppercase">
          <AlertTriangle className="w-4 h-4 text-oxblood" /> [ Provenance Resolution Error ]
        </p>
        <p className="font-editorial italic">{error || 'Record unavailable'}</p>
      </div>
    );
  }

  const rel = data.relationship;

  return (
    <div className="bg-[#FAF6EE] border-2 border-ink p-5 shadow-letterpress space-y-5">
      <div className="flex items-center justify-between border-b-2 border-ink pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-oxblood" />
          <h3 className="font-serif font-black text-sm uppercase tracking-wide text-ink">
            Unbroken Archival Provenance Trail
          </h3>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="text-ink-500 hover:text-oxblood p-1"
            aria-label="Close provenance drawer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Claim Summary Badge */}
      <div className="bg-newsprint-100 border border-ink/40 p-3 space-y-1.5 shadow-letterpress-sm">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[10px] text-oxblood font-bold uppercase tracking-wider">
            [ HISTORICAL CLAIM / RELATIONSHIP ]
          </span>
          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
            data.verification_status === 'APPROVED' || data.verification_status === 'VERIFIED'
              ? 'bg-verified-bg text-verified-text border-verified-border'
              : 'bg-fallback-bg text-fallback-text border-fallback-border'
          }`}>
            [{data.verification_status}]
          </span>
        </div>
        <p className="font-serif font-bold text-sm text-ink">
          {rel?.source_entity_name} <span className="text-oxblood font-mono text-xs uppercase px-1.5 py-0.5 bg-newsprint-200 border border-ink/30 font-bold">[{rel?.relationship_type}]</span> {rel?.target_entity_name}
        </p>
        {rel?.evidence_text && (
          <p className="text-xs text-ink-700 italic bg-white p-2 border border-ink/20 font-editorial">
            "{rel.evidence_text}"
          </p>
        )}
        <div className="flex items-center gap-2 text-[11px] font-mono text-ink-600 pt-1">
          <span>Classification: <strong className="text-ink font-bold">{data.provenance_classification}</strong></span>
          <span>•</span>
          <span>Confidence: <strong className="text-ink font-bold">{rel?.confidence_label || `${Math.round((rel?.confidence || 1) * 100)}%`}</strong></span>
        </div>
      </div>

      {/* The 6-Step Visual Archival Stepper */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-mono uppercase tracking-wider text-ink-600 font-bold border-b border-ink/15 pb-1">
          Lineage Steps to Primary Custodian
        </h4>

        <div className="space-y-2 text-xs font-mono">
          {/* Step 1: Physical Archival Repository */}
          <div className="flex items-start gap-3 bg-white p-2.5 border border-ink/40 shadow-letterpress-sm">
            <div className="w-5 h-5 bg-ink text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
              1
            </div>
            <div className="flex-1">
              <p className="font-bold text-ink flex items-center gap-1.5 uppercase text-[11px]">
                <Landmark className="w-3.5 h-3.5 text-oxblood" />
                Physical Custodian / Primary Source
              </p>
              <p className="text-ink-700 text-[11px] font-editorial italic">
                {data.physical_source?.source || data.document?.source_institution || 'Institutional Heritage Archives of India'}
              </p>
              {data.physical_source?.collection_name && (
                <p className="text-[10px] text-oxblood font-mono font-bold mt-0.5">Collection: {data.physical_source.collection_name}</p>
              )}
            </div>
          </div>

          {/* Step 2: Archival Master Document */}
          <div className="flex items-start gap-3 bg-white p-2.5 border border-ink/40 shadow-letterpress-sm">
            <div className="w-5 h-5 bg-ink text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
              2
            </div>
            <div className="flex-1">
              <p className="font-bold text-ink flex items-center gap-1.5 uppercase text-[11px]">
                <FileText className="w-3.5 h-3.5 text-oxblood" />
                Archival Master Record
              </p>
              <p className="text-ink font-serif font-bold text-sm">
                {data.document?.title || 'Cataloged Historical Document'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-[10px] bg-newsprint-200 text-oxblood px-1.5 py-0.2 border border-ink/30 font-bold">
                  {data.document?.archive_id || 'ID Verified'}
                </span>
                {data.document?.id && onOpenDocument && (
                  <button
                    onClick={() => onOpenDocument(data.document!.id)}
                    className="text-[11px] text-oxblood hover:text-ink flex items-center gap-1 font-bold uppercase transition"
                  >
                    [ View Document <ExternalLink className="w-3 h-3" /> ]
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Step 3: Document Version */}
          <div className="flex items-start gap-3 bg-white p-2.5 border border-ink/40 shadow-letterpress-sm">
            <div className="w-5 h-5 bg-ink text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
              3
            </div>
            <div className="flex-1">
              <p className="font-bold text-ink flex items-center gap-1.5 uppercase text-[11px]">
                <GitCommit className="w-3.5 h-3.5 text-oxblood" />
                Immutable Document Version #{data.document_version?.version_number || 1}
              </p>
              <p className="text-ink-600 text-[11px] font-editorial italic">
                {data.document_version?.change_summary || 'Preserved versioned archival master.'}
              </p>
            </div>
          </div>

          {/* Step 4: OCR Page / Folio */}
          <div className="flex items-start gap-3 bg-white p-2.5 border border-ink/40 shadow-letterpress-sm">
            <div className="w-5 h-5 bg-ink text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
              4
            </div>
            <div className="flex-1">
              <p className="font-bold text-ink flex items-center gap-1.5 uppercase text-[11px]">
                <Eye className="w-3.5 h-3.5 text-oxblood" />
                OCR Folio / Page #{data.ocr_page?.page_number || 1}
              </p>
              <p className="text-ink-700 text-[11px]">
                Transcription Status: <strong className="text-verified-text font-bold">[{data.ocr_page?.review_status || 'VERIFIED'}]</strong>
              </p>
            </div>
          </div>

          {/* Step 5: Search Chunk Passage */}
          <div className="flex items-start gap-3 bg-white p-2.5 border border-ink/40 shadow-letterpress-sm">
            <div className="w-5 h-5 bg-ink text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
              5
            </div>
            <div className="flex-1">
              <p className="font-bold text-ink flex items-center gap-1.5 uppercase text-[11px]">
                <Layers className="w-3.5 h-3.5 text-oxblood" />
                Discrete Evidence Passage #{data.search_chunk?.chunk_index || 0}
              </p>
              <p className="text-ink-600 text-[11px] font-editorial italic">
                Anchors relational proposition with verified exact text quotation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
