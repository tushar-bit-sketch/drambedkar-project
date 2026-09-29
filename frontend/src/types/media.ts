export type MediaType = 'AUDIO' | 'VIDEO' | 'IMAGE' | 'PHOTOGRAPH' | 'OTHER';
export type AccessLevel = 'PUBLIC' | 'RESEARCH_ONLY' | 'RESTRICTED' | 'PRIVATE' | 'RESEARCH' | 'CONFIDENTIAL';
export type DownloadPolicy = 'STREAM_ONLY' | 'DOWNLOAD_ALLOWED' | 'ADMIN_ONLY';
export type VerificationStatus = 'CATALOGUED' | 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'APPROVED' | 'HUMAN_REVIEWED';
export type TranscriptStatus = 'MACHINE_GENERATED' | 'UNDER_REVIEW' | 'HUMAN_REVIEWED' | 'APPROVED' | 'REJECTED';

export interface MediaVersion {
  id: number;
  media_id: number;
  version_number: number;
  derivative_type: string;
  file_path: string;
  mime_type: string;
  codec?: string;
  container?: string;
  resolution?: string;
  frame_rate?: number;
  bit_rate?: number;
  sample_rate?: number;
  channels?: number;
  duration?: number;
  file_size?: number;
  checksum_sha256?: string;
  created_at?: string;
}

export interface TranscriptSegment {
  id?: number;
  transcript_id?: number;
  sequence?: number;
  segment_index?: number;
  start_time: number;
  end_time: number;
  start_timestamp_str?: string;
  end_timestamp_str?: string;
  text: string;
  speaker_label: string;
  confidence?: number;
  verification_status?: string;
  source_reference?: string;
}

export interface MediaTranscript {
  id: number;
  media_id: number;
  version: number;
  language: string;
  source_type: string;
  status: string;
  verification_status?: string;
  model?: string;
  model_version?: string;
  processing_time_ms?: number;
  created_at?: string;
  reviewed_at?: string;
  approved_at?: string;
  segments: TranscriptSegment[];
}

export interface MediaCaption {
  id: number;
  media_id: number;
  transcript_id?: number;
  format: 'WEBVTT' | 'SRT';
  language: string;
  caption_text: string;
  verification_status: string;
  created_at?: string;
}

export interface MediaAsset {
  id: number;
  archive_id: string;
  accession_number?: string;
  title: string;
  subtitle?: string;
  description?: string;
  media_type: MediaType | string;
  format?: string;
  file_format?: string;
  mime_type: string;
  duration?: number;
  duration_seconds?: number;
  file_size: number;
  checksum_sha256: string;
  sha256_hash?: string;
  source_name: string;
  source_url?: string;
  source_identifier?: string;
  creator?: string;
  date?: string;
  date_recorded?: string;
  date_precision?: string;
  language?: string;
  original_language?: string;
  location?: string;
  collection_id?: number;
  rights?: string;
  license?: string;
  access_level: AccessLevel | string;
  download_policy?: DownloadPolicy | string;
  verification_status: VerificationStatus | string;
  archival_status?: string;
  is_demo_data?: boolean;
  original_filename: string;
  file_name?: string;
  storage_path?: string;
  thumbnail_path?: string;
  poster_path?: string;
  waveform_data_path?: string;
  historical_context?: string;
  original_medium?: string;
  custody_chain?: string;
  source_archive?: string;
  preservation_tier?: string;
  created_at?: string;
  updated_at?: string;
  versions?: MediaVersion[];
  transcripts?: MediaTranscript[];
  captions?: MediaCaption[];
}

export interface MediaCollection {
  id: number;
  name: string;
  slug: string;
  description?: string;
  cover_image_path?: string;
  access_level: AccessLevel;
  source?: string;
  verification_status: string;
  asset_count?: number;
  created_at?: string;
}

export interface MediaDiagnostics {
  ffmpeg: { installed: boolean; version?: string; path?: string };
  ffprobe: { installed: boolean; version?: string; path?: string };
  whisper: { installed: boolean; version?: string; path?: string };
  native_opencv: { installed: boolean; version?: string };
  native_pillow: { installed: boolean; version?: string };
  active_processor_strategy: string;
  message?: string;
}

export interface MediaProvenance {
  media_id: number;
  archive_id: string;
  title: string;
  original_filename: string;
  checksum_sha256: string;
  file_size: number;
  source_name: string;
  source_url?: string;
  source_identifier?: string;
  rights: string;
  archival_lineage: Array<{
    tier: string;
    [key: string]: any;
  }>;
  verification_status: string;
}

export interface TranscriptSearchResult {
  media_id: number;
  archive_id: string;
  media_title: string;
  media_type: string;
  segment_id: number;
  start_time: number;
  end_time: number;
  start_timestamp_str: string;
  end_timestamp_str: string;
  speaker_label: string;
  confidence: number;
  snippet: string;
  matching_text: string;
}
