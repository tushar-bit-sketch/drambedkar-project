import { 
  DocumentItem, Collection, TimelineEvent, MediaItem, 
  ResearchResponse, AdminMetrics, AuditLog, UserProfile,
  IntegrityResult, BatchImportReport, DocumentVersion,
  OCRJob, OCRPage, OCRBlock, OCRTextVersion, OCRReview,
  SearchResponse, SearchIndexStatus, SearchIndexJob,
  SearchEvaluationReport, SearchMode, SearchResultItem,
  ResearchAskRequest, ResearchAskResponse, ResearchConversationSummary,
  ResearchConversationDetail, ResearchMessageItem, CitationCard,
  TranslationItem, TranslationSideBySide, AudioDerivativeItem,
  SupportedLanguageItem, MultilingualDiagnostics,
  GraphEntityItem, GraphRelationshipItem, GraphNeighborsData,
  GraphStatsData, GraphStatusData, EntityMergeItem, ProvenanceChainData,
  AdminUserItem
} from '../types';
import archiveData from '../data/archiveData.json';
import { timelineEvents } from '../data/timelineEvents';

const archiveDocuments = archiveData.documents.map((document) => ({
  ...document,
  created_at: '',
  is_demo_data: false,
  is_deleted: false,
  checksum: undefined,
})) as unknown as DocumentItem[];
const archiveCollections = archiveData.collections.map((collection) => ({
  ...collection,
  document_count: archiveDocuments.filter((document) => document.collection_id === collection.id).length,
  is_deleted: false,
})) as Collection[];
const archiveTimeline = timelineEvents;
const archiveEntities = archiveData.entities.map((entity) => ({
  ...entity,
  alternate_names: typeof entity.alternate_names === 'string'
    ? entity.alternate_names.split(',').map((alias) => alias.trim()).filter(Boolean)
    : [],
  source_reference: entity.source_reference || undefined,
  access_level: 'PUBLIC' as const,
  verification_status: 'CATALOGUED' as const,
})) as unknown as GraphEntityItem[];
const archiveRelationships = archiveData.relationships.map((relationship) => ({
  ...relationship,
  verification_status: 'CATALOGUED' as const,
  provenance_type: 'CATALOGUED_RELATION' as const,
  confidence: 0,
  access_level: 'PUBLIC' as const,
})) as unknown as GraphRelationshipItem[];

function localArchiveRequest<T>(endpoint: string, options?: RequestInit): T {
  const request = new URL(endpoint, 'https://static-archive.invalid');
  const path = request.pathname.replace(/^\/api\/v1/, '').replace(/\/+$/, '') || '/';
  const method = (options?.method || 'GET').toUpperCase();
  if (method !== 'GET') {
    throw new ApiError({
      code: 'STATIC_READ_ONLY',
      message: 'This Vercel deployment is a static, read-only archive. This action requires a trusted server.',
      subsystem: 'static-archive',
      retryable: false,
    });
  }

  const query = request.searchParams;
  const page = Math.max(1, Number(query.get('page') || 1));
  const pageSize = Math.min(100, Math.max(1, Number(query.get('page_size') || query.get('limit') || 20)));
  const paginate = <TItem>(items: TItem[]) => ({
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total: items.length,
    page,
    page_size: pageSize,
  });
  const matchesQuery = (value: unknown, terms: string[]) =>
    terms.every((term) => String(value || '').toLocaleLowerCase().includes(term));
  const terms = (query.get('q') || '').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);

  if (path === '/documents') {
    let items = archiveDocuments.filter((document) => {
      if (query.has('collection_id') && document.collection_id !== Number(query.get('collection_id'))) return false;
      if (query.has('document_type') && document.document_type !== query.get('document_type')) return false;
      if (query.has('year') && document.year !== Number(query.get('year'))) return false;
      if (query.has('year_from') && (document.year || 0) < Number(query.get('year_from'))) return false;
      if (query.has('year_to') && (document.year || 9999) > Number(query.get('year_to'))) return false;
      if (query.has('language') && document.language !== query.get('language')) return false;
      return matchesQuery(
        [document.title, document.archive_id, document.creator, document.source_reference, document.description].join(' '),
        terms,
      );
    });
    return { ...paginate(items), is_demo_data: false, disclaimer: archiveData.data_status } as T;
  }
  if (path.startsWith('/documents/')) {
    const identifier = decodeURIComponent(path.slice('/documents/'.length));
    const document = archiveDocuments.find((item) =>
      String(item.id) === identifier || item.slug === identifier || item.archive_id === identifier
    );
    if (!document) throw new ApiError({ code: 'NOT_FOUND', message: 'Catalogue record not found.', subsystem: 'catalog', retryable: false });
    return { ...document, metadata_entries: [], versions: [], archival_file: null } as T;
  }
  if (path === '/collections') return archiveCollections as T;
  if (path.startsWith('/collections/')) {
    const collection = archiveCollections.find((item) => String(item.id) === path.slice('/collections/'.length));
    if (!collection) throw new ApiError({ code: 'NOT_FOUND', message: 'Collection not found.', subsystem: 'catalog', retryable: false });
    return collection as T;
  }
  if (path === '/timeline') {
    const entityId = query.get('entity_id');
    const entity = entityId ? archiveEntities.find((item) => item.id === Number(entityId)) : undefined;
    const filtered = entityId
      ? archiveTimeline.filter((event) => entity && (event.related_people || '').includes(entity.canonical_name))
      : archiveTimeline;
    return filtered as T;
  }
  if (path === '/media') {
    return archiveData.media.map((item) => ({
      ...item,
      file_path: '',
      is_demo_data: false,
      file_held: false,
    })).filter((item) => !query.has('media_type') || item.media_type === query.get('media_type')) as T;
  }
  if (path === '/entities') {
    const filtered = archiveEntities.filter((entity) =>
      (!query.has('entity_type') || entity.entity_type.toUpperCase() === query.get('entity_type')?.toUpperCase())
      && matchesQuery(`${entity.canonical_name} ${entity.description || ''} ${entity.alternate_names || ''}`, terms)
    );
    return filtered.slice(Number(query.get('offset') || 0), Number(query.get('offset') || 0) + pageSize) as T;
  }
  if (path === '/graph/relationships') {
    let filtered = archiveRelationships;
    if (query.has('relationship_type')) filtered = filtered.filter((item) => item.relationship_type === query.get('relationship_type'));
    if (query.has('status')) filtered = filtered.filter((item) => item.verification_status === query.get('status'));
    const offset = Number(query.get('offset') || 0);
    return filtered.slice(offset, offset + pageSize).map(withRelationshipNames) as T;
  }
  if (path === '/graph/status') return {
    backend: 'static-json',
    is_operational: true,
    status: 'OPERATIONAL (STATIC)',
    entity_count: archiveEntities.length,
    relationship_count: archiveRelationships.length,
    details: 'Read-only metadata bundled with the frontend. No database or graph service is connected.',
  } as T;
  if (path === '/graph/stats') return {
    total_entities: archiveEntities.length,
    total_relationships: archiveRelationships.length,
    pending_relationships: 0,
    pending_entities: 0,
    entity_types: archiveEntities.reduce<Record<string, number>>((counts, item) => {
      counts[item.entity_type] = (counts[item.entity_type] || 0) + 1;
      return counts;
    }, {}),
    relationship_types: archiveRelationships.reduce<Record<string, number>>((counts, item) => {
      counts[item.relationship_type] = (counts[item.relationship_type] || 0) + 1;
      return counts;
    }, {}),
    backend: 'static-json',
  } as T;
  if (path.startsWith('/graph/neighbors/')) {
    const rootId = Number(path.split('/').pop());
    const edges = archiveRelationships.filter((item) => item.source_entity_id === rootId || item.target_entity_id === rootId);
    const ids = new Set([rootId, ...edges.flatMap((item) => [item.source_entity_id, item.target_entity_id])]);
    const nodes = archiveEntities.filter((item) => ids.has(item.id));
    return { root_id: rootId, depth: Number(query.get('depth') || 1), nodes, edges: edges.map(withRelationshipNames), total_nodes: nodes.length, total_edges: edges.length } as T;
  }
  if (path.startsWith('/entities/')) {
    const segments = path.split('/').filter(Boolean);
    const entityId = Number(segments[1]);
    const entity = archiveEntities.find((item) => item.id === entityId);
    if (segments.length === 2) {
      if (!entity) throw new ApiError({ code: 'NOT_FOUND', message: 'Entity not found.', subsystem: 'graph', retryable: false });
      return entity as T;
    }
    if (segments[2] === 'relationships') {
      const direction = query.get('direction') || 'BOTH';
      return archiveRelationships.filter((item) =>
        (direction !== 'IN' && item.source_entity_id === entityId)
        || (direction !== 'OUT' && item.target_entity_id === entityId)
      ).map(withRelationshipNames) as T;
    }
    if (segments[2] === 'timeline') return archiveTimeline.filter((event) =>
      (event.related_people || '').includes(entity?.canonical_name || '')
    ) as T;
  }
  if (path === '/search/unified') {
    const matchedDocuments = archiveDocuments.filter((item) => matchesQuery(`${item.title} ${item.archive_id} ${item.source_reference}`, terms)).slice(0, pageSize);
    const matchedEntities = archiveEntities.filter((item) => matchesQuery(`${item.canonical_name} ${item.description || ''}`, terms)).slice(0, pageSize);
    return {
      query: query.get('q') || '',
      documents: matchedDocuments,
      entities: matchedEntities,
      timeline_events: [],
      total_documents: matchedDocuments.length,
      total_entities: matchedEntities.length,
      total_timeline_events: 0,
    } as T;
  }
  if (path === '/health') return { status: 'ok', version: 'static', time: new Date().toISOString() } as T;
  if (path === '/status') return {
    timestamp: new Date().toISOString(),
    application: 'Ambedkar Digital Heritage Archive',
    phase: 'STATIC_FRONTEND',
    environment: 'Vercel static deployment',
    overall_status: 'OPERATIONAL (STATIC)',
    counts: {
      documents: archiveDocuments.length,
      collections: archiveCollections.length,
      timeline: archiveTimeline.length,
      entities: archiveEntities.length,
      relations: archiveRelationships.length,
      media: archiveData.media.length,
      ocr_jobs: 0,
      kiosks: 0,
    },
  } as T;

  throw new ApiError({
    code: 'SERVER_CAPABILITY_UNAVAILABLE',
    message: `“${path}” requires a server-side capability and is unavailable in this frontend-only deployment.`,
    subsystem: 'static-archive',
    retryable: false,
  });
}

function withRelationshipNames(relationship: GraphRelationshipItem): GraphRelationshipItem {
  const source = archiveEntities.find((entity) => entity.id === relationship.source_entity_id);
  const target = archiveEntities.find((entity) => entity.id === relationship.target_entity_id);
  return {
    ...relationship,
    source_entity_name: source?.canonical_name,
    source_entity_type: source?.entity_type,
    target_entity_name: target?.canonical_name,
    target_entity_type: target?.entity_type,
  };
}

export interface ApiErrorInfo {
  code: string;
  message: string;
  subsystem: string;
  retryable: boolean;
  httpStatus?: number;
}

export class ApiError extends Error {
  code: string;
  subsystem: string;
  retryable: boolean;
  httpStatus?: number;

  constructor(info: ApiErrorInfo) {
    super(info.message);
    this.name = 'ApiError';
    this.code = info.code;
    this.subsystem = info.subsystem;
    this.retryable = info.retryable;
    this.httpStatus = info.httpStatus;
  }
}

/**
 * Browser-side catalogue adapter. Server-owned operations reject as unavailable.
 */
export async function apiRequest<T>(
  endpointOrUrl: string,
  options?: RequestInit,
  subsystem = 'general'
): Promise<T> {
  return localArchiveRequest<T>(endpointOrUrl, options);
}

export const apiService = {
  async getDocuments(params?: {
    q?: string;
    collection_id?: number;
    document_type?: string;
    year?: number;
    verification_status?: string;
    page?: number;
    page_size?: number;
    limit?: number;
  }): Promise<{ total: number; items: DocumentItem[]; is_demo_data: boolean; disclaimer?: string }> {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.collection_id) query.append('collection_id', params.collection_id.toString());
    if (params?.document_type) query.append('document_type', params.document_type);
    if (params?.year) query.append('year', params.year.toString());
    if (params?.verification_status) query.append('verification_status', params.verification_status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.page_size) query.append('page_size', params.page_size.toString());
    else if (params?.limit) query.append('page_size', params.limit.toString());

    return apiRequest<{ total: number; items: DocumentItem[]; is_demo_data: boolean; disclaimer?: string }>(
      `/documents?${query.toString()}`,
      undefined,
      'catalog'
    );
  },

  async getDocumentById(idOrSlug: string | number): Promise<DocumentItem> {
    return apiRequest<DocumentItem>(
      `/documents/${encodeURIComponent(String(idOrSlug))}`,
      undefined,
      'catalog'
    );
  },

  async createDocument(formData: FormData): Promise<DocumentItem> {
    return apiRequest<DocumentItem>('/documents', { method: 'POST', body: formData }, 'catalog');
  },

  async uploadVersion(documentId: number, formData: FormData): Promise<DocumentVersion> {
    return apiRequest<DocumentVersion>(`/documents/${documentId}/versions`, { method: 'POST', body: formData }, 'catalog');
  },

  async verifyDocumentIntegrity(documentId: number): Promise<IntegrityResult> {
    return apiRequest<IntegrityResult>(
      `/documents/${documentId}/verify-integrity`,
      { method: 'POST' },
      'catalog'
    );
  },

  async updateVerificationStatus(
    documentId: number, 
    verification_status: string, 
    notes?: string
  ): Promise<DocumentItem> {
    return apiRequest<DocumentItem>(
      `/documents/${documentId}/verify`,
      {
        method: 'POST',
        body: JSON.stringify({ verification_status, notes })
      },
      'catalog'
    );
  },

  async softDeleteDocument(documentId: number, reason?: string): Promise<{ success: boolean; message: string; is_deleted: boolean }> {
    return apiRequest<{ success: boolean; message: string; is_deleted: boolean }>(
      `/documents/${documentId}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`,
      { method: 'DELETE' },
      'catalog'
    );
  },

  async restoreDocument(documentId: number): Promise<DocumentItem> {
    return apiRequest<DocumentItem>(
      `/documents/${documentId}/restore`,
      { method: 'POST' },
      'catalog'
    );
  },

  async searchArchive(params: {
    q: string;
    document_type?: string;
    collection_id?: number;
    year_from?: number;
    year_to?: number;
    language?: string;
    verification_status?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ total: number; items: DocumentItem[]; page: number; page_size: number }> {
    const query = new URLSearchParams();
    query.append('q', params.q);
    if (params.document_type) query.append('document_type', params.document_type);
    if (params.collection_id) query.append('collection_id', params.collection_id.toString());
    if (params.year_from) query.append('year_from', params.year_from.toString());
    if (params.year_to) query.append('year_to', params.year_to.toString());
    if (params.language) query.append('language', params.language);
    if (params.verification_status) query.append('verification_status', params.verification_status);
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());

    return apiRequest<{ total: number; items: DocumentItem[]; page: number; page_size: number }>(
      `/search?${query.toString()}`,
      undefined,
      'search'
    );
  },

  async importBatchJson(documents: any[]): Promise<BatchImportReport> {
    return apiRequest<BatchImportReport>(
      '/import/json',
      {
        method: 'POST',
        body: JSON.stringify({ documents })
      },
      'import'
    );
  },

  async importBatchCsv(formData: FormData): Promise<BatchImportReport> {
    return apiRequest<BatchImportReport>('/import/csv', { method: 'POST', body: formData }, 'import');
  },

  async getCollections(): Promise<Collection[]> {
    return apiRequest<Collection[]>('/collections', undefined, 'catalog');
  },

  async createCollection(data: {
    title: string;
    slug: string;
    description: string;
    period?: string;
    curator_notes?: string;
    cover_image?: string;
  }): Promise<Collection> {
    return apiRequest<Collection>(
      '/collections',
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      'catalog'
    );
  },

  async updateCollection(id: number, data: Partial<Collection>): Promise<Collection> {
    return apiRequest<Collection>(
      `/collections/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      },
      'catalog'
    );
  },

  async deleteCollection(id: number): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(
      `/collections/${id}`,
      { method: 'DELETE' },
      'catalog'
    );
  },

  getFileStreamUrl(filename: string): string {
    void filename;
    return '';
  },

  getFileDownloadUrl(filename: string): string {
    void filename;
    return '';
  },

  async getTimelineEvents(params?: { entity_id?: number }): Promise<TimelineEvent[]> {
    const query = params?.entity_id ? `?entity_id=${params.entity_id}` : '';
    return apiRequest<TimelineEvent[]>(`/timeline${query}`, undefined, 'timeline');
  },

  async getMediaItems(type?: 'AUDIO' | 'VIDEO' | 'PHOTOGRAPH'): Promise<MediaItem[]> {
    const url = type ? `/media?media_type=${type}` : `/media`;
    return apiRequest<MediaItem[]>(url, undefined, 'media');
  },

  async queryResearchAssistant(queryText: string): Promise<ResearchResponse> {
    return apiRequest<ResearchResponse>(
      '/research/query',
      {
        method: 'POST',
        body: JSON.stringify({ query: queryText })
      },
      'research'
    );
  },

  async askResearchAssistant(request: ResearchAskRequest): Promise<ResearchAskResponse> {
    return apiRequest<ResearchAskResponse>('/research/ask', {
      method: 'POST',
      body: JSON.stringify(request)
    }, 'research');
  },

  async listResearchConversations(): Promise<ResearchConversationSummary[]> {
    return apiRequest<ResearchConversationSummary[]>('/research/conversations', undefined, 'research');
  },

  async getResearchConversation(conversationId: string): Promise<ResearchConversationDetail> {
    return apiRequest<ResearchConversationDetail>(`/research/conversations/${encodeURIComponent(conversationId)}`, undefined, 'research');
  },

  async deleteResearchConversation(conversationId: string): Promise<void> {
    await apiRequest(`/research/conversations/${encodeURIComponent(conversationId)}`, { method: 'DELETE' }, 'research');
  },

  async getAdminMetrics(): Promise<AdminMetrics> {
    return apiRequest<AdminMetrics>('/admin/statistics', undefined, 'admin');
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return apiRequest<AuditLog[]>('/admin/audit-logs', undefined, 'admin');
  },

  async getAdminUsers(): Promise<AdminUserItem[]> {
    return apiRequest<AdminUserItem[]>('/admin/users', undefined, 'admin');
  },

  async createAdminUser(data: { email: string; full_name: string; password: string; role_name: string }): Promise<AdminUserItem> {
    return apiRequest<AdminUserItem>(
      '/admin/users',
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      'admin'
    );
  },

  async updateAdminUserStatus(userId: number, isActive: boolean): Promise<AdminUserItem> {
    return apiRequest<AdminUserItem>(
      `/admin/users/${userId}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ is_active: isActive })
      },
      'admin'
    );
  },

  async updateAdminUserRole(userId: number, roleName: string): Promise<AdminUserItem> {
    return apiRequest<AdminUserItem>(
      `/admin/users/${userId}/role`,
      {
        method: 'PUT',
        body: JSON.stringify({ role_name: roleName })
      },
      'admin'
    );
  },

  async checkHealth(): Promise<{ status: string; phase: string; database: string }> {
    return apiRequest('/health', undefined, 'system');
  },

  async getSystemStatus(): Promise<{
    timestamp: string;
    application: string;
    phase: string;
    environment: string;
    overall_status: string;
    counts?: {
      documents: number;
      collections: number;
      media: number;
      timeline: number;
      entities: number;
      relations: number;
      ocr_jobs: number;
      kiosks: number;
    };
    subsystems?: Record<string, {
      name: string;
      status: string;
      provider: string;
      version: string;
      details: string;
    }>;
  }> {
    return apiRequest('/status', undefined, 'system');
  },

  // --- PHASE 3 OCR DIGITIZATION METHODS ---
  async getOCRJobs(params?: { status?: string; skip?: number; limit?: number }): Promise<OCRJob[]> {
    const q = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') q.append('status', params.status);
    if (params?.skip) q.append('skip', params.skip.toString());
    if (params?.limit) q.append('limit', params.limit.toString());
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiRequest<OCRJob[]>(`/ocr/jobs${qs}`, undefined, 'ocr');
  },

  async getOCRJob(id: number): Promise<OCRJob> {
    return apiRequest<OCRJob>(`/ocr/jobs/${id}`, undefined, 'ocr');
  },

  async createOCRJob(data: {
    document_id: number;
    engine?: string;
    language?: string;
    preprocessing_config?: Record<string, any>;
  }): Promise<OCRJob> {
    return apiRequest<OCRJob>(
      '/ocr/jobs',
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      'ocr'
    );
  },

  async retryOCRJob(id: number): Promise<OCRJob> {
    return apiRequest<OCRJob>(
      `/ocr/jobs/${id}/retry`,
      { method: 'POST' },
      'ocr'
    );
  },

  async getOCRJobPages(jobId: number): Promise<OCRPage[]> {
    return apiRequest<OCRPage[]>(`/ocr/jobs/${jobId}/pages`, undefined, 'ocr');
  },

  async getOCRPage(pageId: number): Promise<OCRPage> {
    return apiRequest<OCRPage>(`/ocr/pages/${pageId}`, undefined, 'ocr');
  },

  async correctOCRPage(pageId: number, data: { text: string; change_summary?: string }): Promise<OCRPage> {
    return apiRequest<OCRPage>(
      `/ocr/pages/${pageId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data)
      },
      'ocr'
    );
  },

  async approveOCRPage(pageId: number, data?: { notes?: string }): Promise<OCRPage> {
    return apiRequest<OCRPage>(
      `/ocr/pages/${pageId}/approve`,
      {
        method: 'POST',
        body: JSON.stringify(data || {})
      },
      'ocr'
    );
  },

  async rejectOCRPage(pageId: number, data?: { notes?: string }): Promise<OCRPage> {
    return apiRequest<OCRPage>(
      `/ocr/pages/${pageId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify(data || {})
      },
      'ocr'
    );
  },

  async rerunOCRPage(pageId: number, data?: { engine?: string; language?: string; preprocessing_config?: Record<string, any> }): Promise<OCRPage> {
    return apiRequest<OCRPage>(
      `/ocr/pages/${pageId}/rerun`,
      {
        method: 'POST',
        body: JSON.stringify(data || {})
      },
      'ocr'
    );
  },

  getOCRPageDerivativeUrl(pageId: number): string {
    void pageId;
    return '';
  },

  getOCRPageOriginalImageUrl(pageId: number): string {
    void pageId;
    return '';
  },

  // ---------------------------------------------------------
  // Phase 4: Intelligent Semantic + Hybrid Search API Methods
  // ---------------------------------------------------------

  async searchUniversal(params: {
    q?: string;
    mode?: SearchMode;
    document_type?: string;
    collection_id?: number;
    language?: string;
    year?: number;
    year_from?: number;
    year_to?: number;
    source_name?: string;
    access_level?: string;
    page?: number;
    page_size?: number;
  }): Promise<SearchResponse> {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.mode) query.append('mode', params.mode);
    if (params.document_type) query.append('document_type', params.document_type);
    if (params.collection_id) query.append('collection_id', params.collection_id.toString());
    if (params.language) query.append('language', params.language);
    if (params.year) query.append('year', params.year.toString());
    if (params.year_from) query.append('year_from', params.year_from.toString());
    if (params.year_to) query.append('year_to', params.year_to.toString());
    if (params.source_name) query.append('source_name', params.source_name);
    if (params.access_level) query.append('access_level', params.access_level);
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());

    return apiRequest<SearchResponse>(`/search?${query.toString()}`, undefined, 'search');
  },

  async getSearchIndexStatus(): Promise<SearchIndexStatus> {
    return apiRequest<SearchIndexStatus>('/search/index/status', undefined, 'search');
  },

  async indexDocument(documentId: number): Promise<SearchIndexJob> {
    return apiRequest<SearchIndexJob>(
      `/search/index/document/${documentId}`,
      { method: 'POST' },
      'search'
    );
  },

  async reindexDocument(documentId: number): Promise<SearchIndexJob> {
    return apiRequest<SearchIndexJob>(
      `/search/index/reindex-document/${documentId}`,
      { method: 'POST' },
      'search'
    );
  },

  async rebuildSearchIndex(): Promise<{ status: string; total_documents: number; completed_documents: number; failed_documents: number }> {
    return apiRequest<{ status: string; total_documents: number; completed_documents: number; failed_documents: number }>(
      '/search/index/rebuild',
      { method: 'POST' },
      'search'
    );
  },

  async getSearchEvaluation(): Promise<SearchEvaluationReport> {
    return apiRequest<SearchEvaluationReport>('/search/evaluation', undefined, 'search');
  },

  // Phase 6: Translations
  async listTranslations(params?: { document_id?: number; language?: string; status?: string }): Promise<TranslationItem[]> {
    const query = new URLSearchParams();
    if (params?.document_id) query.append('document_id', params.document_id.toString());
    if (params?.language) query.append('language', params.language);
    if (params?.status) query.append('status', params.status);
    return apiRequest<TranslationItem[]>(`/translations?${query.toString()}`, undefined, 'translation');
  },

  async getDocumentTranslations(documentId: number): Promise<TranslationItem[]> {
    return apiRequest<TranslationItem[]>(`/translations/document/${documentId}`, undefined, 'translation');
  },

  async getTranslation(translationId: number): Promise<TranslationItem> {
    return apiRequest<TranslationItem>(`/translations/${translationId}`, undefined, 'translation');
  },

  async getTranslationSideBySide(translationId: number): Promise<TranslationSideBySide> {
    return apiRequest<TranslationSideBySide>(`/translations/${translationId}/side-by-side`, undefined, 'translation');
  },

  async generateTranslation(payload: {
    document_id: number;
    target_language: string;
    page_id?: number;
    provider?: string;
  }): Promise<TranslationItem> {
    return apiRequest<TranslationItem>(
      '/translations/generate',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      },
      'translation'
    );
  },

  async reviewTranslation(
    translationId: number,
    payload: { action: string; edited_text?: string; reviewer_notes?: string }
  ): Promise<TranslationItem> {
    return apiRequest<TranslationItem>(
      `/translations/${translationId}/review`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      },
      'translation'
    );
  },

  // Phase 6: Audio Narration & Voice
  async synthesizeAudio(payload: {
    document_id: number;
    translation_id?: number;
    page_id?: number;
    language?: string;
    voice?: string;
    provider?: string;
  }): Promise<AudioDerivativeItem> {
    return apiRequest<AudioDerivativeItem>(
      '/audio/synthesize',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      },
      'audio'
    );
  },

  async getDocumentAudios(documentId: number): Promise<AudioDerivativeItem[]> {
    return apiRequest<AudioDerivativeItem[]>(`/audio/document/${documentId}`, undefined, 'audio');
  },

  async getAudioMetadata(audioId: string): Promise<AudioDerivativeItem> {
    return apiRequest<AudioDerivativeItem>(`/audio/${audioId}`, undefined, 'audio');
  },

  async deleteAudio(audioId: string): Promise<void> {
    await apiRequest(`/audio/${audioId}`, { method: 'DELETE' }, 'audio');
  },

  async sendVoiceQuery(file: File, language?: string): Promise<{ query: string; detected_language: string; provider: string; validation_passed: boolean }> {
    void file;
    void language;
    return apiRequest('/audio/voice-query', { method: 'POST' }, 'audio');
  },

  // Phase 6: Languages & Diagnostics
  async getSupportedLanguages(): Promise<SupportedLanguageItem[]> {
    return apiRequest<SupportedLanguageItem[]>('/languages/supported', undefined, 'languages');
  },

  async getMultilingualDiagnostics(): Promise<MultilingualDiagnostics> {
    return apiRequest<MultilingualDiagnostics>('/languages/diagnostics', undefined, 'languages');
  },

  // ---------------------------------------------------------------------------
  // Phase 7: Knowledge Graph, Intelligent Timeline & Entity Relationships
  // ---------------------------------------------------------------------------

  async getGraphStatus(): Promise<GraphStatusData> {
    return apiRequest<GraphStatusData>('/graph/status', undefined, 'graph');
  },

  async getGraphStats(): Promise<GraphStatsData> {
    return apiRequest<GraphStatsData>('/graph/stats', undefined, 'graph');
  },

  async searchEntities(params?: { q?: string; entity_type?: string; status?: string; limit?: number; offset?: number }): Promise<GraphEntityItem[]> {
    const qParams = new URLSearchParams();
    if (params?.q) qParams.append('q', params.q);
    if (params?.entity_type) qParams.append('entity_type', params.entity_type);
    if (params?.status) qParams.append('status', params.status);
    if (params?.limit) qParams.append('limit', params.limit.toString());
    if (params?.offset) qParams.append('offset', params.offset.toString());

    return apiRequest<GraphEntityItem[]>(`/entities?${qParams.toString()}`, undefined, 'graph');
  },

  async getEntity(entityId: number): Promise<GraphEntityItem> {
    return apiRequest<GraphEntityItem>(`/entities/${entityId}`, undefined, 'graph');
  },

  async createEntity(data: Partial<GraphEntityItem>): Promise<GraphEntityItem> {
    return apiRequest<GraphEntityItem>(
      '/entities',
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      'graph'
    );
  },

  async updateEntity(entityId: number, data: Partial<GraphEntityItem>): Promise<GraphEntityItem> {
    return apiRequest<GraphEntityItem>(
      `/entities/${entityId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data)
      },
      'graph'
    );
  },

  async getEntityRelationships(entityId: number, direction: 'IN' | 'OUT' | 'BOTH' = 'BOTH'): Promise<GraphRelationshipItem[]> {
    return apiRequest<GraphRelationshipItem[]>(`/entities/${entityId}/relationships?direction=${direction}`, undefined, 'graph');
  },

  async getEntityTimeline(entityId: number): Promise<TimelineEvent[]> {
    return apiRequest<TimelineEvent[]>(`/entities/${entityId}/timeline`, undefined, 'graph');
  },

  async getGraphNeighbors(entityId: number, depth: number = 1, limit: number = 50): Promise<GraphNeighborsData> {
    return apiRequest<GraphNeighborsData>(`/graph/neighbors/${entityId}?depth=${depth}&limit=${limit}`, undefined, 'graph');
  },

  async getEntityNeighbors(entityId: number, depth: number = 1, limit: number = 50): Promise<GraphNeighborsData> {
    return this.getGraphNeighbors(entityId, depth, limit);
  },

  async getGraphPath(sourceId: number, targetId: number, maxDepth: number = 3): Promise<{ source_id: number; target_id: number; path: GraphEntityItem[]; path_length: number }> {
    return apiRequest<{ source_id: number; target_id: number; path: GraphEntityItem[]; path_length: number }>(
      `/graph/path?source_id=${sourceId}&target_id=${targetId}&max_depth=${maxDepth}`,
      undefined,
      'graph'
    );
  },

  async searchGraph(q: string, limit: number = 25): Promise<{ query: string; matched_entities: GraphEntityItem[]; sample_relationships: GraphRelationshipItem[] }> {
    return apiRequest<{ query: string; matched_entities: GraphEntityItem[]; sample_relationships: GraphRelationshipItem[] }>(
      `/graph/search?q=${encodeURIComponent(q)}&limit=${limit}`,
      undefined,
      'graph'
    );
  },

  async listRelationships(params?: { status?: string; relationship_type?: string; limit?: number; offset?: number }): Promise<GraphRelationshipItem[]> {
    const qParams = new URLSearchParams();
    if (params?.status) qParams.append('status', params.status);
    if (params?.relationship_type) qParams.append('relationship_type', params.relationship_type);
    if (params?.limit) qParams.append('limit', params.limit.toString());
    if (params?.offset) qParams.append('offset', params.offset.toString());

    return apiRequest<GraphRelationshipItem[]>(`/graph/relationships?${qParams.toString()}`, undefined, 'graph');
  },

  async createRelationship(data: Partial<GraphRelationshipItem>): Promise<GraphRelationshipItem> {
    return apiRequest<GraphRelationshipItem>(
      '/graph/relationships',
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      'graph'
    );
  },

  async approveRelationship(relId: number): Promise<GraphRelationshipItem> {
    return apiRequest<GraphRelationshipItem>(
      `/graph/relationships/${relId}/approve`,
      { method: 'POST' },
      'graph'
    );
  },

  async rejectRelationship(relId: number): Promise<GraphRelationshipItem> {
    return apiRequest<GraphRelationshipItem>(
      `/graph/relationships/${relId}/reject`,
      { method: 'POST' },
      'graph'
    );
  },

  async deleteRelationship(relId: number): Promise<void> {
    await apiRequest(`/graph/relationships/${relId}`, { method: 'DELETE' }, 'graph');
  },

  async triggerGraphExtraction(documentId: number, extractorType: 'deterministic' | 'rule_based' | 'llm' = 'deterministic'): Promise<{ document_id: number; extractor_type: string; entities_extracted: number; relationships_extracted: number; status: string }> {
    return apiRequest<{ document_id: number; extractor_type: string; entities_extracted: number; relationships_extracted: number; status: string }>(
      '/graph/extract',
      {
        method: 'POST',
        body: JSON.stringify({ document_id: documentId, extractor_type: extractorType })
      },
      'graph'
    );
  },

  async listDuplicateCandidates(): Promise<any[]> {
    return apiRequest<any[]>('/entities/duplicates/candidates', undefined, 'graph');
  },

  async proposeEntityMerge(primaryId: number, duplicateId: number, reason: string): Promise<EntityMergeItem> {
    return apiRequest<EntityMergeItem>(
      '/entities/merges',
      {
        method: 'POST',
        body: JSON.stringify({ primary_entity_id: primaryId, merged_entity_id: duplicateId, merge_reason: reason })
      },
      'graph'
    );
  },

  async reviewEntityMerge(mergeId: number, action: 'APPROVE' | 'REJECT'): Promise<EntityMergeItem> {
    return apiRequest<EntityMergeItem>(
      `/entities/merges/${mergeId}/review`,
      {
        method: 'POST',
        body: JSON.stringify({ action })
      },
      'graph'
    );
  },

  async createTimelineEvent(data: { title: string; description: string; date_str: string; category?: string; location?: string; document_id?: number }): Promise<TimelineEvent> {
    return apiRequest<TimelineEvent>(
      '/timeline',
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      'timeline'
    );
  },

  async generateTimelineCandidates(documentId: number): Promise<TimelineEvent[]> {
    return apiRequest<TimelineEvent[]>(
      '/timeline/candidates',
      {
        method: 'POST',
        body: JSON.stringify({ document_id: documentId })
      },
      'timeline'
    );
  },

  async approveTimelineEvent(eventId: number): Promise<TimelineEvent> {
    return apiRequest<TimelineEvent>(
      `/timeline/${eventId}/approve`,
      { method: 'POST' },
      'timeline'
    );
  },

  async rejectTimelineEvent(eventId: number): Promise<TimelineEvent> {
    return apiRequest<TimelineEvent>(
      `/timeline/${eventId}/reject`,
      { method: 'POST' },
      'timeline'
    );
  },

  async getRelationshipProvenance(relId: number): Promise<ProvenanceChainData> {
    return apiRequest<ProvenanceChainData>(`/provenance/relationship/${relId}`, undefined, 'graph');
  },

  async unifiedSearch(q: string, limit: number = 10): Promise<{ query: string; documents: any[]; entities: GraphEntityItem[]; timeline_events: any[]; total_documents: number; total_entities: number; total_timeline_events: number }> {
    return apiRequest<{ query: string; documents: any[]; entities: GraphEntityItem[]; timeline_events: any[]; total_documents: number; total_entities: number; total_timeline_events: number }>(
      `/search/unified?q=${encodeURIComponent(q)}&limit=${limit}`,
      undefined,
      'search'
    );
  }
};

export const archiveApi = apiService;
