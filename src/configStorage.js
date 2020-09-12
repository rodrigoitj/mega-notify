export function setConfig(key, value) {
  var config = getConfig();
  config[key] = value;
  return localStorage.setItem("config", JSON.stringify(config));
}

export function getConfig(key, defaultVal = null) {
  const stored = localStorage.getItem("config");
  const config = JSON.parse(stored);
  const value = config?.hasOwnProperty(key) ? config[key] : defaultVal;
  return value;
}
