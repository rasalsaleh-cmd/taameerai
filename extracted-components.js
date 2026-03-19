// EXTRACTED COMPONENTS - to be inserted before export default function App()
// Each component has been extracted to accept state and functions as props

const RatesView = ({rates, setRates, editingRate, setEditingRate, rateEditVal, setRateEditVal, setView, DEFAULT_RATES}) => {
  return (
    <div className="page fade-in">
      <button className="back-btn" onClick={()=>setView("dashboard")}>← Dashboard</button>
      <div className="page-title syne">Rate Database</div>
      <div className="page-sub">Lahore market rates Q1 2026 · Mapia.pk, Glorious Builders, Avenir Developments</div>
      <div className="card">
        <p style={{fontSize:11,color:"var(--text2)",marginBottom:14,lineHeight:1.5}}>Edit any rate to reflect your supplier relationships. Edited rates are highlighted and used in all future quotes.</p>
        {["cement","steel","bricks","sand","crush","labor"].map(cat=>(
          <div key={cat} style={{marginBottom:18}}>
            <div style={{fontSize:9,color:"var(--text3)",letterSpacing:1.5,textTransform:"uppercase",fontFamily:"'Syne',sans-serif",marginBottom:8,paddingBottom:5,borderBottom:"1px solid var(--border)"}}>{cat}</div>
            {Object.entries(rates).filter(([,v])=>v.cat===cat).map(([k,v])=>(
              <div key={k} className="rate-row">
                <div style={{flex:1,fontSize:11,color:"var(--text)"}}>{v.name}</div>
                {editingRate===k?(
                  <div style={{display:"flex",gap:5,alignItems:"center"}}>
                    <input className="fi" type="number" value={rateEditVal} onChange={e=>setRateEditVal(e.target.value)} style={{width:90,padding:"4px 7px"}}/>
                    <button className="btn btn-sm" onClick={()=>{setRates(r=>({...r,[k]:{...r[k],rate:parseFloat(rateEditVal)||r[k].rate}}));setEditingRate(null);}}>✓</button>
                    <button className="btn-ghost btn-sm" onClick={()=>setEditingRate(null)}>✕</button>
                  </div>
                ):(
                  <>
                    <span className={`rate-val ${v.rate!==DEFAULT_RATES[k]?.rate?"rate-edited":""}`}>₨{v.rate.toLocaleString()}/{v.unit}</span>
                    {v.rate!==DEFAULT_RATES[k]?.rate&&<span style={{fontSize:8,color:"var(--gold2)",marginRight:3}}>EDITED</span>}
                    <button className="rate-edit-btn" onClick={()=>{setEditingRate(k);setRateEditVal(String(v.rate));}}>Edit</button>
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const NewProjectView = ({projects, setProjects, setActiveProject, setView, setProjectTab, PHASES, BUILD_TYPES, addDays}) => {
  const [form,setForm]=useState({name:"",client:"",location:"",type:"residential_premium",area:"",floors:"2",contractValue:"",startDate:new Date().toISOString().split("T")[0],currentPhase:"foundation"});
  const [drawPrev,setDrawPrev]=useState(null);
  const fileRef=useRef(null);
  function create() {
    const np={
      id:"p_"+Date.now(),...form,
      totalArea:parseFloat(form.area)||0,floors:parseInt(form.floors)||1,
      contractValue:parseFloat(form.contractValue)||0,status:"active",
      source:drawPrev?"ai":"manual",
      phases:PHASES.map((p,i)=>{
        const ci=PHASES.findIndex(x=>x.key===form.currentPhase),idx=i;
        return {...p,budget:Math.round((parseFloat(form.contractValue)||0)*p.pct),spent:0,
          progress:idx<ci?100:idx===ci?50:0,status:idx<ci?"done":idx===ci?"active":"pending",
          expectedEnd:addDays(form.startDate,PHASES.slice(0,i+1).reduce((s,x)=>s+x.days,0))};
      }),
      checklistLogs:[],expenses:[],changeOrders:[],timelineEdits:[],
    };
    setProjects(prev=>[...prev,np]);
    setActiveProject(np.id); setView("project"); setProjectTab("overview");
  }
  return (
    <div className="page fade-in">
      <button className="back-btn" onClick={()=>setView("dashboard")}>← Dashboard</button>
      <div className="page-title syne">Import Ongoing Project</div>
      <div className="page-sub">Load an existing project — track forward from today</div>
      <div className="card">
        <div className="card-t">Upload Drawings (Optional)</div>
        <input ref={fileRef} type="file" accept="image/*,.pdf" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setDrawPrev(ev.target.result);r.readAsDataURL(f);}}/>
        {!drawPrev?(<div className="upload-zone" onClick={()=>fileRef.current?.click()}><div style={{fontSize:28,marginBottom:7,opacity:0.3}}>📋</div><div style={{fontSize:11,color:"var(--text3)"}}>Upload drawings (optional)</div></div>):(
          <div style={{position:"relative",borderRadius:7,overflow:"hidden",border:"1px solid var(--border)"}}>
            <img src={drawPrev} alt="" style={{width:"100%",maxHeight:180,objectFit:"contain",background:"#080a09"}}/>
            <button style={{position:"absolute",top:7,right:7,background:"rgba(0,0,0,0.7)",border:"none",color:"#fff",borderRadius:4,padding:"2px 7px",cursor:"pointer"}} onClick={()=>setDrawPrev(null)}>✕</button>
          </div>
        )}
      </div>
      <div className="card">
        <div className="card-t">Project Information</div>
        <div className="form-grid">
          <div className="form-full"><div className="fl">Project Name</div><input className="fi" placeholder="e.g. Gulberg Commercial Plaza" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div><div className="fl">Client Name</div><input className="fi" value={form.client} onChange={e=>setForm(f=>({...f,client:e.target.value}))}/></div>
          <div><div className="fl">Location</div><input className="fi" value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}/></div>
          <div><div className="fl">Build Type</div><select className="fs" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>{Object.entries(BUILD_TYPES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
          <div><div className="fl">Covered Area (sq ft)</div><input className="fi" type="number" value={form.area} onChange={e=>setForm(f=>({...f,area:e.target.value}))}/></div>
          <div><div className="fl">Contract Value (PKR)</div><input className="fi" type="number" placeholder="e.g. 48000000" value={form.contractValue} onChange={e=>setForm(f=>({...f,contractValue:e.target.value}))}/></div>
          <div><div className="fl">Start Date</div><input className="fi" type="date" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))}/></div>
          <div><div className="fl">Current Phase</div><select className="fs" value={form.currentPhase} onChange={e=>setForm(f=>({...f,currentPhase:e.target.value}))}>{PHASES.map(p=><option key={p.key} value={p.key}>{p.label}</option>)}</select></div>
        </div>
        <button className="btn" style={{marginTop:14,width:"100%"}} disabled={!form.name||!form.contractValue} onClick={create}>IMPORT PROJECT →</button>
      </div>
    </div>
  );
};
