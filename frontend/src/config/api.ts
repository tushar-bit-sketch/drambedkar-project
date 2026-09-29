/**
 * This build is a static browser application. There is no API server, so
 * server-owned files and actions are deliberately unavailable.
 */
export const API_BASE_URL = '';

export const isDemoMode = (): boolean => false;

export const getApiBaseUrl = (): string => '';

export const isBackendConfigured = (): boolean => false;

export const apiUrl = (path: string): string => path.startsWith('/') ? path : `/${path}`;

export const fileStreamUrl = (_identifier: string | number): string => '';
export const fileDownloadUrl = (_identifier: string | number): string => '';
export const audioStreamUrl = (_audioId: number | string): string => '';
export const mediaStreamUrl = (_mediaId: number | string): string => '';
export const derivativeUrl = (_relativePath: string): string => '';
