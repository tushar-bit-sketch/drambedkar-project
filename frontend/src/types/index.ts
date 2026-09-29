export type DocumentType = 
  | 'BOOK'
  | 'WRITING'
  | 'SPEECH' 
  | 'MANUSCRIPT' 
  | 'DEBATE' 
  | 'PHOTOGRAPH'
  | 'HISTORICAL_RECORD'
  | 'ARCHIVAL_RECORD'
  | 'AUDIO'
  | 'VIDEO'
  | 'ESSAY' 
  | 'LETTER' 
  | 'GAZETTE'
  | 'ARTICLE'
  | 'REPORT'
  | 'ACT'
  | 'PERIODICAL'
  | 'LEGAL_BRIEF';

export type VerificationStatus = 
  | 'CATALOGUED'
  | 'UNVERIFIED'
  | 'UNDER_REVIEW'
  | 'VERIFIED' 
  | 'REJECTED'
  | 'PENDING_OCR' 
  | 'IN_REVIEW' 
  | 'DRAFT';

export type AccessLevel = 'PUBLIC' | 'RESTRICTED' | 'INTERNAL_ONLY';

export type DocumentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ARCHIVIST' 
  | 'RESEARCHER' 
  | 'REVIEWER' 
  | 'VISITOR';

export interface AdminUserItem {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  role: {
    id: number;
    name: string;
    description?: string;
  };
  created_at: string;
}

export interface Collection {
  id: number;
  title: string;
  slug: string;
  description: string;
  period?: string;
  date_range?: string;
  curator_notes?: string;
  thumbnail_url?: string;
  cover_image?: string;
  document_count?: number;
  status?: string;
  is_deleted?: boolean;
}

export interface DocumentMetadataEntry {
  id: number;
  key: string;
  value: string;
}

export interface ArchivalFile {
  id: number;
  filename: string;
  original_filename: string;
  file_size_bytes: number;
  mime_type: string;
  file_format: string;
  checksum: string;
  checksum_algorithm: string;
  storage_path: string;
  storage_layer: string;
  is_master: boolean;
  last_integrity_check?: string;
  integrity_status: string;
  created_at: string;
}

export interface DocumentVersion {
  id: number;
  document_id?: number;
  version_number: number;
  archival_file_id?: number;
  label?: string;
  change_summary?: string;
  is_current?: boolean;
  created_by?: number;
  file_path?: string;
  file_format?: string;
  file_size_bytes?: number;
  checksum?: string;
  created_at: string;
  archival_file?: ArchivalFile;
}

export interface Topic {
  id: number;
  name: string;
  slug: string;
}

export interface DocumentItem {
  id: number;
  archive_id: string;
  title: string;
  subtitle?: string;
  slug: string;
  document_type: DocumentType;
  creator?: string;
  author_name?: string;
  collection_id?: number;
  collection_title?: string;
  language_name?: string;
  language?: string;
  date?: string;
  date_created?: string;
  date_precision?: string;
  year?: number;
  date_approximate?: boolean;
  description?: string;
  source_name?: string;
  source_url?: string;
  source_identifier?: string;
  source_reference?: string;
  physical_location?: string;
  rights?: string;
  access_level?: AccessLevel;
  status?: DocumentStatus;
  checksum?: string;
  file_held?: boolean;
  verification_status: VerificationStatus;
  transcription_status?: string;
  vector_indexed?: boolean;
  thumbnail_url?: string;
  created_at: string;
  ocr_text?: string;
  is_demo_data?: boolean;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: number;
  metadata_entries?: DocumentMetadataEntry[];
  versions?: DocumentVersion[];
  archival_file?: ArchivalFile;
  topics?: Topic[];
}

export interface IntegrityResult {
  document_id: number;
  archive_id: string;
  checksum?: string;
  recorded_checksum?: string;
  computed_checksum?: string;
  integrity_status: 'VALID' | 'CORRUPTED' | 'MISSING_FILE' | 'NO_FILE_ATTACHED';
  verified_at?: string;
  message: string;
}

export interface BatchImportReport {
  total_processed: number;
  imported_count: number;
  duplicates_count: number;
  errors_count: number;
  duplicate_identifiers: string[];
  errors: string[];
}

export interface TimelineEvent {
  id: number;
  year: number;
  year_start?: number;
  exact_date?: string;
  date_precision?: 'EXACT_DAY' | 'MONTH' | 'YEAR' | 'DECADE' | 'APPROXIMATE' | 'UNKNOWN';
  start_date?: string;
  end_date?: string;
  title: string;
  description: string;
  category?: string;
  location?: string;
  image_url?: string;
  related_locations?: string;
  related_people?: string;
  document_id?: number;
  verification_status?: string;
  provenance_type?: string;
  confidence?: number;
  evidence_text?: string;
  is_demo_data?: boolean;
  sources?: Array<{ label: string; url: string }>;
}

export interface MediaItem {
  id: number;
  title: string;
  media_type: 'AUDIO' | 'VIDEO' | 'PHOTOGRAPH';
  format: string;
  duration_seconds?: number;
  file_path: string;
  thumbnail_url?: string;
  description?: string;
  date_recorded?: string;
  location?: string;
  verification_status: string;
  is_demo_data?: boolean;
}

export interface ResearchCitation {
  document_id: number;
  archive_id: string;
  document_title: string;
  page: number;
  collection: string;
  date: string;
  excerpt: string;
}

export interface ResearchResponse {
  query: string;
  disclaimer: string;
  is_live_rag: boolean;
  answer: string;
  sources: ResearchCitation[];
}

export interface AdminMetrics {
  total_documents: number;
  pending_ocr: number;
  pending_review: number;
  verified_documents: number;
  media_items: number;
  languages_count: number;
  storage_mb: number;
  recent_activity_count: number;
  disclaimer: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: {
    id: number;
    name: UserRole;
    description?: string;
  };
  is_active: boolean;
}

// Phase 3 OCR Digitization Types
export type OCRJobStatus = 'QUEUED' | 'PROCESSING' | 'REVIEW_REQUIRED' | 'COMPLETED' | 'FAILED';
export type OCRConfidenceCategory = 'HIGH' | 'MEDIUM' | 'LOW';
export type OCRPageStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REVIEW_REQUIRED' | 'APPROVED' | 'REJECTED';

export interface OCRBlock {
  id: number;
  ocr_page_id: number;
  block_index: number;
  block_type: string;
  text: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OCRTextVersion {
  id: number;
  ocr_page_id: number;
  version_number: number;
  text: string;
  engine: string;
  language: string;
  change_summary?: string;
  created_by?: number;
  creator_name?: string;
  created_at: string;
}

export interface OCRReview {
  id: number;
  ocr_page_id: number;
  reviewer_id?: number;
  reviewer_name?: string;
  status: string;
  notes?: string;
  reviewed_at: string;
}

export interface OCRPage {
  id: number;
  ocr_job_id: number;
  page_number: number;
  width: number;
  height: number;
  dpi: number;
  raw_text?: string;
  cleaned_text?: string;
  confidence: number;
  confidence_category: OCRConfidenceCategory;
  is_low_confidence: boolean;
  processing_time_ms: number;
  status: OCRPageStatus;
  image_derivative_path?: string;
  original_page_image_path?: string;
  error?: string;
  created_at: string;
  blocks?: OCRBlock[];
  versions?: OCRTextVersion[];
  reviews?: OCRReview[];
}

export interface OCRJob {
  id: number;
  document_id: number;
  document_title?: string;
  engine: string;
  engine_version?: string;
  model_name?: string;
  language: string;
  preprocessing_config?: Record<string, any>;
  status: OCRJobStatus;
  total_pages: number;
  processed_pages: number;
  failed_pages: number;
  avg_confidence?: number;
  started_at?: string;
  completed_at?: string;
  error?: string;
  created_by?: number;
  created_at: string;
  updated_at?: string;
}

// ---------------------------------------------------------
// PHASE 4: Intelligent Semantic + Hybrid Search Types
// ---------------------------------------------------------

export type SearchMode = 'hybrid' | 'keyword' | 'semantic';

export interface SearchResultItem {
  chunk_id: number;
  chunk_sequence: number;
  page_number?: number | null;
  folio_number?: string | null;
  char_start: number;
  char_end: number;
  token_count: number;
  chunk_text: string;
  highlighted_snippet?: string | null;
  matched_terms: string[];
  transcription_layer: string;
  is_verified: boolean;
  document_id: number;
  archive_id: string;
  title: string;
  document_title: string;
  document_type: string;
  creator?: string | null;
  year?: number | null;
  language?: string | null;
  collection_id?: number | null;
  collection_title?: string | null;
  source_id?: string | null;
  source_name?: string | null;
  document_version_id?: number | null;
  ocr_page_id?: number | null;
  ocr_text_version_id?: number | null;
  verification_status: string;
  access_level: string;
  citation: string;
  retrieval_type: string; // KEYWORD | SEMANTIC | HYBRID
  score: number;
  keyword_rank?: number | null;
  keyword_score?: number | null;
  semantic_rank?: number | null;
  semantic_score?: number | null;
  rrf_score?: number | null;
  reranker_score?: number | null;
  is_reranked: boolean;
}

export interface SearchFacets {
  document_types: Record<string, number>;
  collections: Record<string, number>;
  languages: Record<string, number>;
  years: Record<string, number>;
  transcription_layers: Record<string, number>;
}

export interface SearchDiagnostics {
  mode: string;
  query: string;
  page: number;
  page_size: number;
  applied_filters: Record<string, any>;
  vector_backend: string;
  is_vector_production: boolean;
  keyword_count?: number | null;
  semantic_count?: number | null;
  semantic_diagnostics?: Record<string, any> | null;
  reranker_diagnostics?: Record<string, any> | null;
}

export interface SearchResponse {
  query?: string | null;
  mode: string;
  total: number;
  page: number;
  page_size: number;
  items: SearchResultItem[];
  facets: SearchFacets;
  diagnostics: SearchDiagnostics;
}

export interface SearchIndexJob {
  id: number;
  job_type: string;
  document_id?: number | null;
  status: string;
  total_chunks: number;
  indexed_chunks: number;
  failed_chunks: number;
  embedding_model?: string | null;
  embedding_dim?: number | null;
  created_at?: string | null;
  completed_at?: string | null;
  error?: string | null;
}

export interface SearchIndexStatus {
  total_documents: number;
  indexed_documents: number;
  total_chunks: number;
  indexed_chunks: number;
  vectorized_chunks: number;
  verified_chunks: number;
  vector_backend: string;
  is_vector_backend_production: boolean;
  embedding_model_name: string;
  embedding_model_status: string;
  embedding_dimension?: number | null;
  recent_jobs: SearchIndexJob[];
}

export interface SearchEvaluationReport {
  eval_timestamp: number;
  total_benchmark_queries: number;
  modes_evaluated: string[];
  vector_backend: string;
  is_vector_production: boolean;
  embedding_model_status: string;
  reranker_model_status: string;
  metrics_by_mode: Record<string, {
    mode: string;
    mrr: number;
    precision_at_1: number;
    precision_at_3: number;
    precision_at_5: number;
    avg_latency_ms: number;
    diagnostics?: any;
  }>;
  evaluation_notice: string;
}

// Phase 5 Source-Grounded Archival RAG Types

export interface CitationProvenanceChain {
  chunk_id?: number;
  ocr_page_id?: number;
  ocr_text_version_id?: number;
  document_version_id?: number;
  document_id?: number;
  archive_id?: string;
  layer?: string;
  is_verified?: boolean;
  chain_description?: string;
}

export interface CitationCard {
  source_index: number;
  chunk_id?: number;
  document_id?: number;
  archive_id?: string;
  document_title?: string;
  creator?: string;
  year?: number;
  page_number?: number;
  folio_number?: string;
  transcription_layer?: string;
  is_verified: boolean;
  citation_label?: string;
  snippet: string;
  provenance_chain?: CitationProvenanceChain;
}

export interface EvidenceSnippet {
  chunk_id?: number;
  document_id?: number;
  archive_id?: string;
  title?: string;
  page_number?: number;
  score?: number;
  snippet: string;
}

export interface ResearchAskRequest {
  query: string;
  conversation_id?: string;
  mode?: 'hybrid' | 'keyword' | 'semantic';
  filters?: Record<string, any>;
  target_language?: string;
}

export interface ResearchAskResponse {
  answer: string;
  conversation_id: string;
  message_id?: number;
  status: 'SUCCESS' | 'NO_EVIDENCE' | 'INSUFFICIENT_EVIDENCE' | 'LLM_UNAVAILABLE' | 'CITATION_VALIDATION_FAILED' | 'INVALID_QUERY' | 'RESEARCH_BACKEND_UNAVAILABLE' | 'BACKEND_NOT_CONFIGURED';
  grounded: boolean;
  citations: CitationCard[];
  retrieved_evidence: EvidenceSnippet[];
  diagnostics: Record<string, any>;
  audit_id?: number;
}

export interface ResearchMessageItem {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  status: string;
  grounded: boolean;
  evidence_count: number;
  citations?: CitationCard[];
  created_at: string;
}

export interface ResearchConversationSummary {
  conversation_id: string;
  title: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ResearchConversationDetail {
  conversation_id: string;
  title: string;
  created_at: string;
  messages: ResearchMessageItem[];
}

// ---------------------------------------------------------
// PHASE 6: Multilingual, Voice & Accessibility Types
// ---------------------------------------------------------

export type TranslationStatus = 'MACHINE_GENERATED' | 'UNDER_REVIEW' | 'HUMAN_REVIEWED' | 'APPROVED' | 'REJECTED';

export interface TranslationItem {
  id: number;
  document_id: number;
  document_version_id?: number | null;
  ocr_page_id?: number | null;
  ocr_text_version_id?: number | null;
  source_language: string;
  target_language: string;
  translated_title?: string | null;
  translated_text: string;
  translation_provider: string;
  translation_model?: string | null;
  model_version?: string | null;
  translation_version: number;
  status: TranslationStatus;
  reviewer_notes?: string | null;
  created_by?: number | null;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TranslationSideBySide {
  translation_id: number;
  document_id: number;
  document_title: string;
  ocr_page_id?: number | null;
  source_language: string;
  target_language: string;
  original_text: string;
  translated_text: string;
  translation_version: number;
  status: string;
  provider: string;
  model?: string | null;
  reviewer_notes?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  created_at?: string | null;
  is_machine_generated: boolean;
}

export interface AudioDerivativeItem {
  id: number;
  audio_id: string;
  document_id: number;
  document_version_id?: number | null;
  ocr_page_id?: number | null;
  translation_id?: number | null;
  source_text_version_id?: number | null;
  language: string;
  voice?: string | null;
  provider: string;
  duration_seconds: number;
  file_format: string;
  file_size_bytes: number;
  checksum: string;
  status: string;
  created_at: string;
}

export interface SupportedLanguageItem {
  code: string;
  name: string;
  native_name: string;
  is_ui_supported: boolean;
  is_translation_supported: boolean;
  is_tts_supported: boolean;
}

export interface MultilingualDiagnostics {
  active_phase: string;
  translation: Record<string, any>;
  tts: Record<string, any>;
  stt: Record<string, any>;
  supported_languages: SupportedLanguageItem[];
}

export interface GraphEntityItem {
  id: number;
  entity_type: string;
  canonical_name: string;
  alternate_names?: string[];
  aliases?: string[];
  description?: string;
  language?: string;
  verification_status: 'CATALOGUED' | 'VERIFIED' | 'PENDING_REVIEW' | 'REJECTED' | 'SUPERSEDED';
  source_reference?: string;
  birth_date?: string | null;
  death_date?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  date_precision?: string;
  location?: string | null;
  external_identifier?: string | null;
  access_level: 'PUBLIC' | 'RESTRICTED';
  created_at?: string;
  updated_at?: string;
}

export interface GraphRelationshipItem {
  id: number;
  source_entity_id: number;
  source_entity_name?: string;
  source_name?: string;
  source_entity_type?: string;
  relationship_type: string;
  relation_type?: string;
  target_entity_id: number;
  target_entity_name?: string;
  target_name?: string;
  target_entity_type?: string;
  verification_status: 'CATALOGUED' | 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED' | 'SUPERSEDED';
  provenance_type: 'CATALOGUED_RELATION' | 'EXPLICIT_SOURCE_RELATION' | 'MACHINE_EXTRACTED_RELATION' | 'MACHINE_INFERRED_RELATION' | 'HUMAN_VERIFIED_RELATION';
  confidence: number;
  confidence_label?: string;
  evidence_reference?: string | null;
  evidence_text?: string | null;
  source_document_id?: number | null;
  document_version_id?: number | null;
  ocr_text_version_id?: number | null;
  page_id?: number | null;
  chunk_id?: number | null;
  access_level: 'PUBLIC' | 'RESTRICTED';
  created_at?: string;
  reviewed_at?: string | null;
}

export interface GraphNeighborsData {
  root_id: number;
  depth: number;
  nodes: GraphEntityItem[];
  edges: GraphRelationshipItem[];
  total_nodes: number;
  total_edges: number;
}

export interface GraphStatsData {
  total_entities: number;
  total_relationships: number;
  pending_relationships: number;
  pending_entities: number;
  entity_types: Record<string, number>;
  relationship_types: Record<string, number>;
  backend: string;
}

export interface GraphStatusData {
  backend: string;
  is_operational: boolean;
  status: string;
  entity_count?: number;
  relationship_count?: number;
  details?: string;
  neo4j_uri?: string;
}

export interface EntityMergeItem {
  id: number;
  primary_entity_id: number;
  merged_entity_id: number;
  status: 'MATCH_CONFIRMED' | 'MATCH_REVIEW_REQUIRED' | 'MATCH_REJECTED';
  merge_reason?: string;
  created_at?: string;
}

export interface ProvenanceChainData {
  claim_id?: number;
  relationship?: GraphRelationshipItem;
  document?: {
    id: number;
    archive_id: string;
    title: string;
    document_type: string;
    verification_status: string;
    source_institution?: string;
  };
  document_version?: {
    id: number;
    version_number: number;
    change_summary?: string;
  };
  ocr_page?: {
    id: number;
    page_number: number;
    review_status: string;
    confidence_score: number;
  };
  ocr_text_version?: {
    id: number;
    version_number: number;
    engine: string;
    language: string;
  };
  search_chunk?: {
    id: number;
    chunk_index: number;
    token_count?: number;
  };
  physical_source?: {
    collection_name: string;
    source?: string;
    archive_reference: string;
  };
  verification_status: string;
  provenance_classification: string;
}
