import archiveData from '../data/archiveData.json';
import { MediaAsset, MediaDiagnostics, MediaProvenance, MediaTranscript, MediaCaption, MediaCollection, TranscriptSearchResult } from '../types/media';

const records = archiveData.media.map((item) => ({
  id: item.id,
  archive_id: '',
  title: item.title,
  description: item.description || undefined,
  media_type: item.media_type,
  format: item.format,
  mime_type: '',
  file_size: 0,
  checksum_sha256: '',
  source_name: 'Catalogue snapshot',
  date: item.date_recorded || undefined,
  location: item.location || undefined,
  access_level: 'PUBLIC',
  verification_status: 'CATALOGUED',
  is_demo_data: false,
  original_filename: '',
  file_path: '',
  file_held: false,
})) as MediaAsset[];

const unavailable = (feature: string): Error =>
  new Error(`${feature} is unavailable: this is a static, read-only frontend with no media server.`);

export const mediaApi = {
  getDiagnostics: async (): Promise<MediaDiagnostics> => ({
    ffmpeg: { installed: false },
    ffprobe: { installed: false },
    whisper: { installed: false },
    native_opencv: { installed: false },
    native_pillow: { installed: false },
    active_processor_strategy: 'unavailable',
    message: 'Static frontend: media processing services are not connected.',
  }),

  getMediaList: async (params?: { media_type?: string; collection_id?: number; access_level?: string; verification_status?: string; limit?: number; offset?: number }): Promise<MediaAsset[]> =>
    records
      .filter((item) => !params?.media_type || item.media_type === params.media_type)
      .slice(params?.offset || 0, (params?.offset || 0) + (params?.limit || records.length)),

  getMediaAsset: async (id: number): Promise<MediaAsset> => {
    const record = records.find((item) => item.id === id);
    if (!record) throw new Error('Media catalogue record not found.');
    return record;
  },

  updateMediaAsset: async (_id: number, _data: Partial<MediaAsset>): Promise<MediaAsset> => { throw unavailable('Media editing'); },
  uploadMediaMaster: async (_formData: FormData): Promise<MediaAsset> => { throw unavailable('Media upload'); },
  getStreamUrl: (_id: number, _versionId?: number): string => '',
  getDownloadUrl: (_id: number): string => '',
  getThumbnailUrl: (_id: number): string => '',
  getPosterUrl: (_id: number): string => '',
  getWaveform: async (_id: number): Promise<number[]> => { throw unavailable('Waveform generation'); },
  getTranscripts: async (_id: number): Promise<MediaTranscript[]> => [],
  createTranscript: async (_id: number, _data: any): Promise<MediaTranscript> => { throw unavailable('Transcript creation'); },
  reviewTranscript: async (_id: number, _transcriptId: number, _data: { action: string; segments?: any[]; reviewer_notes?: string }): Promise<MediaTranscript> => { throw unavailable('Transcript review'); },
  getCaptions: async (_id: number): Promise<MediaCaption[]> => [],
  getProvenance: async (id: number): Promise<MediaProvenance> => {
    const record = await mediaApi.getMediaAsset(id);
    return {
      media_id: id,
      archive_id: record.archive_id,
      title: record.title,
      original_filename: '',
      checksum_sha256: '',
      file_size: 0,
      source_name: 'Catalogue snapshot',
      rights: '',
      archival_lineage: [],
      verification_status: 'CATALOGUED',
    } as MediaProvenance;
  },
  searchMedia: async (query: string, mediaType?: string): Promise<MediaAsset[]> =>
    records.filter((item) =>
      (!mediaType || item.media_type === mediaType)
      && `${item.title} ${item.description || ''}`.toLowerCase().includes(query.toLowerCase()),
    ),
  searchTranscripts: async (_query: string): Promise<TranscriptSearchResult[]> => [],
  getCollections: async (): Promise<MediaCollection[]> => [],
  createCollection: async (_data: { name: string; description?: string; access_level?: string; source?: string }): Promise<MediaCollection> => { throw unavailable('Media collection editing'); },
  getKioskFeed: async (_mediaType?: string): Promise<MediaAsset[]> => records,
  runIntegrityCheck: async (_id: number): Promise<{ is_valid: boolean; status: string }> => { throw unavailable('File integrity verification'); },
  runBulkIntegrityAudit: async (): Promise<{
    audited_at: string;
    total_assets: number;
    intact_count: number;
    tampered_count: number;
    missing_count: number;
    records: Array<{ asset_id: number; title: string; expected_hash: string; computed_hash?: string; is_valid: boolean; status: string }>;
  }> => { throw unavailable('File integrity verification'); },
};
