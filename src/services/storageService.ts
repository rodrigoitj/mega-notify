export function setStorageAlerts(value: any): void {
  return localStorage.setItem('alerts', JSON.stringify(value));
}

export function getStorageAlerts(): any[] {
  const alerts = localStorage.getItem('alerts');
  return alerts ? JSON.parse(alerts) : [];
}

export function getConfigs(): any {
  const stored = localStorage.getItem('config');
  return stored ? JSON.parse(stored) : {};
}

export function setConfig(key: string, value: any): void {
  var config = getConfigs();
  config[key] = value;
  return localStorage.setItem('config', JSON.stringify(config));
}

export function getConfig(key: string, defaultVal: any = null): any {
  const stored = localStorage.getItem('config');
  const config = stored ? JSON.parse(stored) : {};
  const value = config.hasOwnProperty(key) ? config[key] : defaultVal;
  return value;
}

const storageService = {
  setStorageAlerts,
  getStorageAlerts,
  setConfig,
  getConfig,
};

export default storageService;
