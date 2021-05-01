export function setStorageAlerts(value) {
  return localStorage.setItem('alerts', JSON.stringify(value));
}

export function getStorageAlerts() {
  const alerts = localStorage.getItem('alerts');
  return alerts ? JSON.parse(alerts) : [];
}
export function setConfig(key, value) {
  var config = getConfig();
  config[key] = value;
  return localStorage.setItem('config', JSON.stringify(config));
}

export function getConfig(key, defaultVal = null) {
  const stored = localStorage.getItem('config');
  const config = JSON.parse(stored);
  const value = config?.hasOwnProperty(key)
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
