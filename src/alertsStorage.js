export function setStorageAlerts(value) {
  return localStorage.setItem("alerts", JSON.stringify(value));
}

export function getStorageAlerts() {
  const alerts = localStorage.getItem("alerts");
  return alerts ? JSON.parse(alerts) : [];
}
