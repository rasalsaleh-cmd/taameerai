function getTimelineStatus(p) {
  const ap=p.phases.find(ph=>ph.status==="active"); if(!ap) return "on_track";
  const daysLeft=Math.round((new Date(ap.expectedEnd)-new Date())/(1000*60*60*24));
  if (daysLeft<0) return "overdue";
  if (daysLeft<7&&(ap.progress||0)<60) return "at_risk";
  return "on_track";
}

function getBudgetStatus(p) {
  const sp=(p.expenses||[]).reduce((s,e)=>s+e.amount,0);
  const pct=sp/p.contract_value;
  return pct>1?"over":pct>0.85?"watch":"ok";
}

export { getTimelineStatus, getBudgetStatus };