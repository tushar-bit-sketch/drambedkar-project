/**
 * Kiosk API Client for Phase 9 Kiosk Hardware, Deployment, and Security.
 * Manages device registration, telemetry heartbeats, configuration, maintenance,
 * and security status audits.
 */

export interface KioskDeviceItem {
  id: number;
  device_uuid: string;
  device_name: string;
  institution: string;
  location: string;
  kiosk_type: string;
  status: 'ONLINE' | 'STALE' | 'OFFLINE' | 'MAINTENANCE' | 'DISABLED' | 'ERROR';
  maintenance_mode: boolean;
  enabled: boolean;
  software_version?: string;
  configuration_version?: number;
  registered_at?: string;
  last_seen_at?: string;
}

export interface KioskSummary {
  total: number;
  online: number;
  stale: number;
  offline: number;
  maintenance: number;
  disabled: number;
  error: number;
}

export interface KioskListResponse {
  summary: KioskSummary;
  kiosks: KioskDeviceItem[];
}

export interface KioskRegisterPayload {
  device_name: string;
  institution?: string;
  location?: string;
  kiosk_type?: string;
  hardware_fingerprint?: string;
}

export interface KioskRegisterResponse {
  id: number;
  device_uuid: string;
  device_name: string;
  institution: string;
  location: string;
  kiosk_type: string;
  status: string;
  raw_device_key: string;
  registered_at: string;
  notice: string;
}

export interface KioskDetailResponse extends KioskDeviceItem {
  capabilities: Record<string, any>;
  configuration: {
    idle_timeout_seconds: number;
    warning_timeout_seconds: number;
    home_route: string;
    default_language: string;
    maintenance_message: string;
  };
  recent_heartbeats: Array<{
    timestamp: string;
    status: string;
    cpu_percent?: number;
    ram_percent?: number;
    disk_percent?: number;
    app_health: string;
    db_health: string;
  }>;
}

export interface KioskConfigUpdatePayload {
  idle_timeout_seconds?: number;
  warning_timeout_seconds?: number;
  home_route?: string;
  default_language?: string;
  available_languages?: string[];
  accessibility_high_contrast?: boolean;
  accessibility_font_scale?: string;
  maintenance_message?: string;
}

export interface SecurityStatusResponse {
  timestamp: string;
  authentication: {
    algorithm: string;
    access_token_expire_minutes: number;
    secret_key_status: string;
  };
  cors: {
    status: string;
    allowed_origins_count: number;
  };
  security_headers: {
    status: string;
    csp_enabled: boolean;
    x_frame_options: string;
    x_content_type_options: string;
  };
  rate_limiting: {
    status: string;
  };
  tls: {
    status: string;
    message: string;
  };
  storage_vault: {
    status: string;
    read_only_masters_enforced: boolean;
  };
  database: {
    status: string;
  };
  kiosk_infrastructure: {
    device_authentication_enforced: boolean;
    device_token_separation: boolean;
  };
}

export interface HardwareCapabilityReport {
  timestamp: string;
  system: {
    platform: string;
    os: string;
    processor: string;
    cpu_cores: number;
    ram_gb: number;
  };
  hardware: {
    display: string;
    touchscreen: string;
    keyboard: string;
    mouse: string;
    speaker: string;
    microphone: string;
    camera: string;
    printer_nfc_qr: string;
  };
  infrastructure: {
    docker: string;
    docker_compose: string;
    postgresql_service: string;
    sqlite_fallback: string;
    nginx_caddy: string;
    tls: string;
  };
  runtime_status: string;
}

const unavailable = (): never => {
  throw new Error('Kiosk administration requires a server and is unavailable in the static deployment.');
};

export const kioskApi = {
  listKiosks: async (): Promise<KioskListResponse> => unavailable(),
  getKioskDetail: async (_kioskId: number): Promise<KioskDetailResponse> => unavailable(),
  registerKiosk: async (_payload: KioskRegisterPayload): Promise<KioskRegisterResponse> => unavailable(),
  updateKioskConfig: async (_kioskId: number, _config: KioskConfigUpdatePayload): Promise<any> => unavailable(),
  rotateKioskKey: async (_kioskId: number): Promise<{ status: string; raw_device_key: string; notice: string }> => unavailable(),
  toggleMaintenance: async (_kioskId: number, _enabled: boolean, _reason?: string): Promise<any> => unavailable(),
  disableKiosk: async (_kioskId: number): Promise<any> => unavailable(),
  getSecurityStatus: async (): Promise<SecurityStatusResponse> => unavailable(),
  getHardwareReport: async (): Promise<HardwareCapabilityReport> => unavailable(),
  getHealthDependencies: async (): Promise<any> => unavailable(),
  sendHeartbeat: async (_deviceKey: string, _telemetry: any): Promise<any> => unavailable(),
  getDeviceConfig: async (_deviceKey: string): Promise<any> => unavailable(),
};
