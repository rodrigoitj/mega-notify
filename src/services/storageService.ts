export function setStorageAlerts(value: any): void {
  return localStorage.setItem('alerts', JSON.stringify(value));
}

export function getStorageAlerts(): any[] {
  const alerts = localStorage.getItem('alerts');
  return alerts ? JSON.parse(alerts) : [];
}

export function setConfig(key: string, value: any): void {
  const config = getConfigs();
  config[key] = value;
  return localStorage.setItem('config', JSON.stringify(config));
}
export function setConfigs(values: any): void {
  for (const key in values) {
    setConfig(key, values[key]);
  }
}
export function getConfigs(defaults = {}): any {
  const stored = localStorage.getItem('config');
  const values = stored ? JSON.parse(stored) : {};
  for (const key in defaults) {
    if (!Object.prototype.hasOwnProperty.call(values, key)) {
      values[key] = defaults[key];
    }
  }
  return values;
}

export function getConfig(key: string, defaultVal: any = null): any {
  const stored = localStorage.getItem('config');
  const config = stored ? JSON.parse(stored) : {};
  const value = Object.prototype.hasOwnProperty.call(config, key)
    ? config[key]
    : defaultVal;
  return value;
}

const storageService = {
  setStorageAlerts,
  getStorageAlerts,
  setConfig,
  getConfig,
};

export default storageService;
