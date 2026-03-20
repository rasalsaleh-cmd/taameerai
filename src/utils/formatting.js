function fPKR(n) {
  if (!n&&n!==0) return "—";
  if (n>=10000000) return `₨${(n/10000000).toFixed(2)} Cr`;
  if (n>=100000)   return `₨${(n/100000).toFixed(2)} L`;
  return `₨${Math.round(n).toLocaleString()}`;
}

function fDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"});
}

function addDays(dateStr, days) {
  const d = new Date(dateStr); d.setDate(d.getDate()+days);
  return d.toISOString().split("T")[0];
}

export { fPKR, fDate, addDays };