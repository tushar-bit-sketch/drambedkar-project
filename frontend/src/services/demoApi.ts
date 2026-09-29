/** Legacy demo controls are unavailable in the static, read-only deployment. */

export interface DemoStageOverview {
  step: number;
  stage_id: string;
  title: string;
  subtitle: string;
  capability_status: 'OPERATIONAL' | 'OPERATIONAL (FALLBACK)' | 'DEGRADED' | 'UNAVAILABLE' | 'NOT_CONFIGURED';
  summary: string;
}

export interface DemoStageDetail {
  step: number;
  stage_id: string;
  title: string;
  problem: string;
  solution: string;
  status: string;
  talking_points: string[];
  sample_records?: Array<{
    archive_id: string;
    title: string;
    document_type: string;
    year: number;
    checksum: string;
    verification_status: string;
  }>;
  suggested_queries?: Array<{
    query: string;
    description: string;
  }>;
  active_job?: {
    job_id: number;
    document_title: string;
    status: string;
    total_pages: number;
  };
  sample_questions?: Array<{
    question: string;
    grounded: boolean;
    expected_source: string;
  }>;
  featured_entities?: Array<{
    name: string;
    type: string;
    id: number;
  }>;
  sample_milestones?: Array<{
    title: string;
    year: number;
    date_str: string;
  }>;
  assets?: Array<{
    archive_id: string;
    title: string;
    media_type: string;
  }>;
}

export interface DemoControlState {
  active_stage_step: number;
  total_stages: number;
  demo_session_active: boolean;
  presentation_mode: string;
}

export interface SubsystemStatus {
  name: string;
  status: 'OPERATIONAL' | 'OPERATIONAL (FALLBACK)' | 'DEGRADED' | 'UNAVAILABLE' | 'NOT_CONFIGURED';
  provider: string;
  version: string;
  details: string;
}

export interface SystemStatusResponse {
  timestamp: string;
  application: string;
  phase: string;
  environment: string;
  overall_status: string;
  subsystems: Record<string, SubsystemStatus>;
}

const unavailable = (): never => {
  throw new Error('Demo controls require a server and are unavailable in the static deployment.');
};

export const demoApi = {
  getStages: async (): Promise<DemoStageOverview[]> => unavailable(),
  getStageDetail: async (_stageId: string): Promise<DemoStageDetail> => unavailable(),
  getControlState: async (): Promise<DemoControlState> => unavailable(),
  stepControl: async (_direction: 'next' | 'prev' | 'reset'): Promise<DemoControlState> => unavailable(),
  resetControl: async (): Promise<DemoControlState> => unavailable(),
  getSystemStatus: async (): Promise<SystemStatusResponse> => unavailable(),
};
