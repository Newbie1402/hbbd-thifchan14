const base = (import.meta.env.VITE_MEMORIES_API_BASE_URL || '/api').replace(/\/$/, '');
let csrf = '';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (init.method && init.method !== 'GET' && csrf) headers.set('X-CSRF-Token', csrf);
  const response = await fetch(`${base}${path}`, { ...init, headers, credentials: 'include' });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || `Request failed (${response.status}).`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const adminApi = {
  async login(username: string, password: string) { const result = await request<{ csrf: string }>('/admin/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }); csrf = result.csrf; },
  async me() { const result = await request<{ authenticated: boolean; csrf?: string }>('/admin/auth/me'); csrf = result.csrf || ''; return result.authenticated; },
  logout: () => request<void>('/admin/auth/logout', { method: 'POST' }),
  images: () => request<{ items: AdminImage[]; total: number; duplicateFilenameOrders?: number[] }>('/admin/images'),
  upload(files: File[], onProgress?: (percent: number) => void) { const data = new FormData(); files.forEach(file => data.append('images', file)); return new Promise<{ uploaded: number }>((resolve, reject) => { const xhr = new XMLHttpRequest(); xhr.open('POST', `${base}/admin/images/upload`); xhr.withCredentials = true; if (csrf) xhr.setRequestHeader('X-CSRF-Token', csrf); xhr.upload.onprogress = event => { if (event.lengthComputable) onProgress?.(Math.round(event.loaded / event.total * 100)); }; xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText) as { uploaded: number }); else { try { reject(new Error((JSON.parse(xhr.responseText) as { error?: string }).error || `Request failed (${xhr.status}).`)); } catch (error) { reject(error); } } }; xhr.onerror = () => reject(new Error('Upload failed. Check your connection and try again.')); xhr.onabort = () => reject(new Error('Upload was cancelled.')); xhr.send(data); }); },
  replace(id: string, file: File) { const data = new FormData(); data.append('image', file); return request<{ ok: boolean }>(`/admin/images/${encodeURIComponent(id)}/replace`, { method: 'POST', body: data }); },
  patch: (id: string, value: Partial<Pick<AdminImage, 'caption' | 'alt' | 'visible' | 'sortOrder'>>) => request<void>(`/admin/images/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(value) }),
  order: (orderedIds: string[]) => request<void>('/admin/images/order', { method: 'PUT', body: JSON.stringify({ orderedIds }) }),
  resetOrder: () => request<void>('/admin/images/order/reset-to-filenames', { method: 'POST' }),
  remove: (id: string) => request<void>(`/admin/images/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  sync: () => request<{ total: number }>('/admin/images/sync', { method: 'POST' }),
  settings: () => request<SiteSettings>('/admin/site-settings'),
  saveSettings: (settings: SiteSettings) => request<SiteSettings>('/admin/site-settings', { method: 'PUT', body: JSON.stringify(settings) }),
};

export interface AdminImage { id: string; sortOrder: number; src: string; width: number; height: number; alt: string; caption: string; filename: string; visible: boolean; missing: boolean; filenameIndex: number | null }
export interface SiteSettings { publicBaseUrl: string; shareTitle: string; shareDescription: string; shareEnabled: boolean }
