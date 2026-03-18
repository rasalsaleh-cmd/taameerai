import { useState, useRef } from "react";

// ── VERIFIED LAHORE RATES Q1 2026 ─────────────────────────────
const DEFAULT_RATES = {
  cement_dg:      { name:"DG Cement (50kg bag)",    rate:1370, unit:"bag",   cat:"cement" },
  cement_lucky:   { name:"Lucky Cement (50kg bag)", rate:1310, unit:"bag",   cat:"cement" },
  cement_maple:   { name:"Maple Leaf (50kg bag)",   rate:1375, unit:"bag",   cat:"cement" },
  cement_fauji:   { name:"Fauji Cement (50kg bag)", rate:1360, unit:"bag",   cat:"cement" },
  steel_amreli:   { name:"Amreli Steel 60-Grade",   rate:242,  unit:"kg",    cat:"steel"  },
  steel_ittefaq:  { name:"Ittefaq Steel 60-Grade",  rate:240,  unit:"kg",    cat:"steel"  },
  steel_mughal:   { name:"Mughal Steel 60-Grade",   rate:244,  unit:"kg",    cat:"steel"  },
  bricks_a:       { name:"Bricks A-Class (Awwal)",  rate:19,   unit:"brick", cat:"bricks" },
  bricks_b:       { name:"Bricks B-Class",          rate:17,   unit:"brick", cat:"bricks" },
  sand_chenab:    { name:"Sand Chenab",              rate:75,   unit:"cft",   cat:"sand"   },
  sand_ravi:      { name:"Sand Ravi",                rate:35,   unit:"cft",   cat:"sand"   },
  crush_margalla: { name:"Crush Margalla",           rate:175,  unit:"cft",   cat:"crush"  },
  crush_sargodha: { name:"Crush Sargodha Bajri",    rate:155,  unit:"cft",   cat:"crush"  },
  labor_mason:    { name:"Mason (Raj Mistri)",       rate:2500, unit:"day",   cat:"labor"  },
  labor_helper:   { name:"Helper (Mazdoor)",         rate:1500, unit:"day",   cat:"labor"  },
  labor_steel:    { name:"Steel Fixer",              rate:2500, unit:"day",   cat:"labor"  },
  labor_plumber:  { name:"Plumber",                  rate:2800, unit:"day",   cat:"labor"  },
  labor_elec:     { name:"Electrician",              rate:3000, unit:"day",   cat:"labor"  },
  labor_painter:  { name:"Painter",                  rate:2200, unit:"day",   cat:"labor"  },
  labor_tile:     { name:"Tile Worker",              rate:2800, unit:"day",   cat:"labor"  },
};

const BUILD_TYPES = {
  residential_standard: { label:"Residential — Standard",       perSqFt:6800  },
  residential_premium:  { label:"Residential — Premium",        perSqFt:10000 },
  residential_luxury:   { label:"Residential — Luxury",         perSqFt:13500 },
  commercial_standard:  { label:"Commercial — Standard",        perSqFt:5200  },
  commercial_premium:   { label:"Commercial — Premium",         perSqFt:7500  },
  commercial_luxury:    { label:"Commercial — High-end",        perSqFt:10000 },
  grey_residential:     { label:"Grey Structure (Residential)", perSqFt:2875  },
  grey_commercial:      { label:"Grey Structure (Commercial)",  perSqFt:3500  },
};

const PHASES = [
  { key:"excavation", label:"Excavation & Foundation Digging", pct:0.03, days:12 },
  { key:"foundation", label:"Foundation & DPC",                pct:0.12, days:25 },
  { key:"grey",       label:"Grey Structure",                  pct:0.30, days:60 },
  { key:"electrical", label:"Electrical Roughing",             pct:0.08, days:15 },
  { key:"plumbing",   label:"Plumbing & Sewerage",             pct:0.07, days:12 },
  { key:"plastering", label:"Plastering & Rendering",          pct:0.08, days:20 },
  { key:"flooring",   label:"Flooring & Tiling",               pct:0.10, days:18 },
  { key:"woodwork",   label:"Woodwork",                        pct:0.08, days:20 },
  { key:"painting",   label:"Painting & Finishing",            pct:0.06, days:15 },
  { key:"fixtures",   label:"Fixtures & Fittings",             pct:0.05, days:10 },
  { key:"exterior",   label:"Exterior & Boundary Wall",        pct:0.03, days:10 },
];

// ── URDU TRANSLATIONS ─────────────────────────────────────────
const UR = {
  phases: {
    excavation: "کھدائی اور بنیاد کی کھدائی",
    foundation:  "بنیاد اور ڈی پی سی",
    grey:        "گرے اسٹرکچر",
    electrical:  "بجلی کا کام",
    plumbing:    "پلمبنگ اور نکاسی",
    plastering:  "پلستر اور رینڈرنگ",
    flooring:    "فرش اور ٹائلیں",
    woodwork:    "لکڑی کا کام",
    painting:    "پینٹ اور فنشنگ",
    fixtures:    "فٹنگز اور سامان",
    exterior:    "بیرونی دیوار اور گیٹ",
  },
  delayReasons: [
    "موسم (بارش/گرمی)",
    "مٹیریل کی کمی",
    "مٹیریل کی ترسیل میں تاخیر",
    "مزدور غیر حاضر",
    "مزدوروں کا جھگڑا",
    "معیار کا مسئلہ — دوبارہ کام کرنا ہوگا",
    "ڈرائنگ میں وضاحت درکار",
    "مالک نے تبدیلی مانگی",
    "ٹھیکیدار دستیاب نہیں",
    "معائنہ باقی ہے",
    "دیگر",
  ],
  expCats: {
    material:   "مٹیریل خریداری",
    labor:      "مزدوری کی ادائیگی",
    contractor: "ٹھیکیدار کی ادائیگی",
    misc:       "متفرق",
  },
  ui: {
    dailyLog:       "روزانہ سائٹ لاگ",
    activePhase:    "موجودہ مرحلہ",
    checklist:      "چیک لسٹ",
    yes:            "✓ ہاں",
    no:             "✗ نہیں",
    yesHint:        "ہاں = تصویر لینا ضروری ہے",
    noHint:         "نہیں = وجہ بتائیں",
    selectReason:   "وجہ منتخب کریں",
    addNote:        "اضافی نوٹ (اختیاری)",
    photoRequired:  "تصویر ضروری ہے",
    photoCaptured:  "✓ تصویر لی گئی",
    takePhoto:      "📸 تصویر لیں (ضروری)",
    changePhoto:    "📸 تصویر تبدیل کریں",
    complete:       "✓ مکمل",
    subtasksDone:   "تمام ذیلی کام مکمل کریں تاکہ ہاں کریں",
    logExpense:     "خرچہ درج کریں",
    category:       "قسم",
    amount:         "رقم (روپے)",
    description:    "تفصیل",
    receiptPhoto:   "رسید کی تصویر (ضروری)",
    submitLog:      "روزانہ لاگ جمع کریں",
    noItems:        "کوئی آئٹم نہیں۔ مالک چیک لسٹ میں اضافہ کر سکتا ہے۔",
    editChecklist:  "✏️ چیک لسٹ تبدیل کریں",
    items:          "آئٹمز",
    subTask:        "ذیلی کام",
    receiptCaptured:"✓ رسید محفوظ",
  },
  checklistItems: {
    // Excavation
    "Site clearing completed":                    "سائٹ کی صفائی مکمل",
    "Vegetation and debris removed":              "گھاس پھوس اور ملبہ ہٹا دیا گیا",
    "Old foundations broken if present":         "پرانی بنیادیں توڑ دی گئیں",
    "Excavation depth matches drawing specs":     "کھدائی کی گہرائی ڈرائنگ کے مطابق",
    "Depth measured at all corners":              "تمام کونوں پر گہرائی ناپی گئی",
    "Width matches footing dimensions":           "چوڑائی فوٹنگ کے مطابق",
    "Soil condition suitable — no water seepage": "مٹی کی حالت ٹھیک — پانی نہیں",
    "Excavation boundaries marked correctly":     "کھدائی کی حدود صحیح نشان زد",
    "Safety barriers placed around excavation":  "حفاظتی رکاوٹیں لگائی گئی ہیں",
    // Foundation
    "Footing dimensions match structural drawing":"فوٹنگ کی پیمائش ڈرائنگ کے مطابق",
    "Length verified":                            "لمبائی تصدیق شدہ",
    "Width verified":                             "چوڑائی تصدیق شدہ",
    "Depth verified":                             "گہرائی تصدیق شدہ",
    "Steel reinforcement placed per drawing":     "لوہے کی سریا ڈرائنگ کے مطابق",
    "Bar sizes correct (check drawing)":          "سریا کی موٹائی درست (ڈرائنگ دیکھیں)",
    "Spacing matches drawing specs":              "فاصلہ ڈرائنگ کے مطابق",
    "Cover maintained (min 50mm)":               "کور کم از کم ۵۰ ملی میٹر",
    "Laps and splices correct":                   "لیپ اور جوڑ درست",
    "Concrete mix ratio verified (1:2:4)":        "کنکریٹ مکس تناسب درست (1:2:4)",
    "DPC layer applied properly":                 "ڈی پی سی پرت صحیح لگائی گئی",
    "Curing being done regularly":               "کیورنگ باقاعدگی سے ہو رہی ہے",
    "Foundation level is uniform":               "بنیاد کی سطح یکساں",
    "Backfilling compacted properly":            "مٹی واپس صحیح طریقے سے بھری",
    "Plumber marked sewer line positions":       "پلمبر نے سیور لائنیں نشان زد کیں",
    // Grey
    "Column positions match structural drawing": "کالم کی جگہیں ڈرائنگ کے مطابق",
    "Grid lines set out correctly":              "گرڈ لائنیں صحیح نشان زد",
    "Column centres verified":                   "کالم کے مرکز تصدیق شدہ",
    "Column sizes match drawing":                "کالم کی سائز ڈرائنگ کے مطابق",
    "Steel bar sizes match specifications":      "سریا کی موٹائی مواصفات کے مطابق",
    "Main bars — correct diameter":              "مین سریا — درست قطر",
    "Stirrups — correct spacing":               "اسٹریپس — درست فاصلہ",
    "Cover blocks in place":                     "کور بلاک لگے ہوئے ہیں",
    "Brick alignment and plumb level checked":   "اینٹوں کی صف اور سیدھ جانچی گئی",
    "First course alignment verified":           "پہلی قطار کی صف تصدیق شدہ",
    "Intermediate courses plumb checked":        "درمیانی قطاریں سیدھ میں",
    "Corners plumb and square":                  "کونے سیدھے اور مربع",
    "Final course before lintel checked":        "لنٹل سے پہلے آخری قطار جانچی",
    "Lintels placed above all openings":         "تمام کھلوں پر لنٹل لگے ہیں",
    "Roof slab thickness matches drawing":       "چھت کی موٹائی ڈرائنگ کے مطابق",
    "Concrete vibrator used during pouring":     "ڈالنے کے وقت وائبریٹر استعمال ہوا",
    "Curing schedule being followed":            "کیورنگ کا شیڈول پورا ہو رہا ہے",
    "Window/door openings match drawing dimensions": "کھڑکی/دروازے کی جگہیں ڈرائنگ کے مطابق",
    // Electrical
    "Conduit pipes placed before plastering":    "پلستر سے پہلے نالیاں لگائی گئیں",
    "Conduit sizes correct":                     "نالیوں کی سائز درست",
    "No sharp bends in conduit":                 "نالیوں میں تیز موڑ نہیں",
    "All conduits secured to wall":              "تمام نالیاں دیوار سے لگی ہیں",
    "Switch/socket heights match plan":          "سوئچ/ساکٹ کی اونچائی پلان کے مطابق",
    "Main DB board position confirmed":          "مین ڈی بی بورڈ کی جگہ طے",
    "Wire gauge matches load calculations":      "تار کی موٹائی لوڈ کے مطابق",
    "Earthing system installed":                 "ارتھنگ نظام لگا دیا گیا",
    "Light point positions match drawing":       "بلب پوائنٹس ڈرائنگ کے مطابق",
    // Plumbing
    "Water supply lines pressure tested":        "پانی کی لائنوں کا پریشر ٹیسٹ",
    "Drainage slope is adequate":                "نکاسی کی ڈھلان کافی ہے",
    "Slope measured — min 1:80":                 "ڈھلان ناپی — کم از کم 1:80",
    "No low points or sags":                     "کوئی نیچا پوائنٹ نہیں",
    "Sewage pipe sizes match specifications":    "نکاسی پائپ سائز مواصفات کے مطابق",
    "Toilet rough-in positions match drawing":   "ٹائلٹ کی جگہیں ڈرائنگ کے مطابق",
    "All joints leak-tested":                    "تمام جوڑوں کا لیک ٹیسٹ",
    "Overhead tank connection done":             "اوپری ٹینک کا کنکشن ہو گیا",
    // Plastering
    "Wall surface cleaned before plaster":       "پلستر سے پہلے دیوار صاف",
    "Plaster mix ratio correct":                 "پلستر کا تناسب درست",
    "Plaster thickness uniform 12-15mm":         "پلستر کی موٹائی یکساں 12-15 ملی میٹر",
    "Corners are straight and plumb":            "کونے سیدھے اور ہموار",
    "Curing being done for 7+ days":             "7 یا زیادہ دن کیورنگ ہو رہی ہے",
    "No hollow sounds on tapping":               "ٹھونکنے پر کھوکھلی آواز نہیں",
    // Flooring
    "Floor level is uniform across rooms":       "فرش تمام کمروں میں ہموار",
    "Tile adhesive applied evenly":              "ٹائل چپکانے والا مادہ برابر لگا",
    "Tile cuts are clean at edges":              "ٹائلوں کے کنارے صاف کٹے",
    "Grout lines are uniform":                   "گراؤٹ کی لائنیں یکساں",
    "Slope towards floor drain correct":         "فرش کی ڈھلان ڈرین کی طرف درست",
    "No hollow tiles — tap test done":           "کوئی کھوکھلی ٹائل نہیں — ٹیسٹ ہوا",
    // Woodwork
    "Door frame dimensions match openings":      "دروازے کے فریم کھلوں کے مطابق",
    "Wood is properly seasoned/treated":         "لکڑی پکی اور ٹریٹڈ ہے",
    "Hinges and locks are quality branded":      "قبضے اور تالے برانڈڈ ہیں",
    "Kitchen cabinet dimensions match design":   "کچن کیبنٹ ڈیزائن کے مطابق",
    "All doors close properly without gaps":     "تمام دروازے بغیر خلا کے بند ہوتے ہیں",
    // Painting
    "Wall putty applied and sanded smooth":      "پٹی لگی اور ریگمال سے ہموار",
    "Primer coat applied before paint":          "پینٹ سے پہلے پرائمر لگا",
    "Minimum 2 coats of emulsion applied":       "کم از کم 2 کوٹ پینٹ",
    "Color matches approved sample":             "رنگ منظور شدہ نمونے کے مطابق",
    "No brush marks or drip lines":              "برش کے نشان یا دھاریاں نہیں",
    "Exterior weather-proof paint applied":      "باہر موسم روک پینٹ لگا",
    // Fixtures
    "Sanitary fittings are branded as agreed":   "سینیٹری فٹنگز طے شدہ برانڈ کی",
    "All taps/faucets tested for flow":          "تمام نل بہاؤ کے لیے ٹیسٹ",
    "Electrical switches/sockets working":       "بجلی کے سوئچ/ساکٹ کام کر رہے",
    "Light fixtures installed and tested":       "روشنی کے فٹنگز لگے اور ٹیسٹ شدہ",
    "Exhaust fans working":                      "ایگزاسٹ پنکھے کام کر رہے ہیں",
    // Exterior
    "Boundary wall height matches approved plan":"باؤنڈری وال اونچائی منظور شدہ پلان کے مطابق",
    "Gate dimensions and design confirmed":      "گیٹ کی سائز اور ڈیزائن طے",
    "Driveway level and slope correct":          "ڈرائیو وے کی سطح اور ڈھلان درست",
    "External drainage working":                 "بیرونی نکاسی کام کر رہی ہے",
    "Exterior paint/texture applied":            "بیرونی پینٹ/ٹیکسچر لگا دیا",
  },
};

const DELAY_REASONS = ["Weather (rain/heat)","Material shortage","Material delivery delayed","Labor absent","Labor dispute","Quality issue — rework needed","Drawing clarification needed","Owner requested change","Contractor not available","Inspection pending","Other"];

// ── ID GENERATORS ──────────────────────────────────────────────
let _id = 0;
function uid(prefix="id") { return `${prefix}_${++_id}_${Math.random().toString(36).slice(2,6)}`; }

// ── RICH CHECKLIST TEMPLATE ────────────────────────────────────
function mkItem(label, requirePhoto=true, subs=[]) {
  return { id:uid("item"), label, requirePhoto, subtasks: subs.map(s=>({id:uid("sub"), label:s.label, requirePhoto:s.photo||false})) };
}

const BASE_TEMPLATES = {
  excavation: [
    mkItem("Site clearing completed", true, [{label:"Vegetation and debris removed",photo:true},{label:"Old foundations broken if present",photo:false}]),
    mkItem("Excavation depth matches drawing specs", true, [{label:"Depth measured at all corners",photo:true},{label:"Width matches footing dimensions",photo:false}]),
    mkItem("Soil condition suitable — no water seepage", true),
    mkItem("Excavation boundaries marked correctly", false),
    mkItem("Safety barriers placed around excavation", true),
  ],
  foundation: [
    mkItem("Footing dimensions match structural drawing", true, [{label:"Length verified",photo:false},{label:"Width verified",photo:false},{label:"Depth verified",photo:true}]),
    mkItem("Steel reinforcement placed per drawing", true, [{label:"Bar sizes correct (check drawing)",photo:true},{label:"Spacing matches drawing specs",photo:true},{label:"Cover maintained (min 50mm)",photo:false},{label:"Laps and splices correct",photo:false}]),
    mkItem("Concrete mix ratio verified (1:2:4)", false),
    mkItem("DPC layer applied properly", true),
    mkItem("Curing being done regularly", true),
    mkItem("Foundation level is uniform", true),
    mkItem("Backfilling compacted properly", false),
    mkItem("Plumber marked sewer line positions", false),
  ],
  grey: [
    mkItem("Column positions match structural drawing", true, [{label:"Grid lines set out correctly",photo:false},{label:"Column centres verified",photo:true},{label:"Column sizes match drawing",photo:false}]),
    mkItem("Steel bar sizes match specifications", true, [{label:"Main bars — correct diameter",photo:true},{label:"Stirrups — correct spacing",photo:true},{label:"Cover blocks in place",photo:false}]),
    mkItem("Brick alignment and plumb level checked", true, [{label:"First course alignment verified",photo:true},{label:"Intermediate courses plumb checked",photo:false},{label:"Corners plumb and square",photo:true},{label:"Final course before lintel checked",photo:false}]),
    mkItem("Lintels placed above all openings", true),
    mkItem("Roof slab thickness matches drawing", true),
    mkItem("Concrete vibrator used during pouring", false),
    mkItem("Curing schedule being followed", true),
    mkItem("Window/door openings match drawing dimensions", true),
  ],
  electrical: [
    mkItem("Conduit pipes placed before plastering", true, [{label:"Conduit sizes correct",photo:false},{label:"No sharp bends in conduit",photo:false},{label:"All conduits secured to wall",photo:true}]),
    mkItem("Switch/socket heights match plan", false),
    mkItem("Main DB board position confirmed", true),
    mkItem("Wire gauge matches load calculations", false),
    mkItem("Earthing system installed", true),
    mkItem("Light point positions match drawing", false),
  ],
  plumbing: [
    mkItem("Water supply lines pressure tested", true),
    mkItem("Drainage slope is adequate", true, [{label:"Slope measured — min 1:80",photo:false},{label:"No low points or sags",photo:false}]),
    mkItem("Sewage pipe sizes match specifications", false),
    mkItem("Toilet rough-in positions match drawing", true),
    mkItem("All joints leak-tested", true),
    mkItem("Overhead tank connection done", false),
  ],
  plastering: [
    mkItem("Wall surface cleaned before plaster", false),
    mkItem("Plaster mix ratio correct", false),
    mkItem("Plaster thickness uniform 12-15mm", true),
    mkItem("Corners are straight and plumb", true),
    mkItem("Curing being done for 7+ days", false),
    mkItem("No hollow sounds on tapping", true),
  ],
  flooring: [
    mkItem("Floor level is uniform across rooms", true),
    mkItem("Tile adhesive applied evenly", false),
    mkItem("Tile cuts are clean at edges", true),
    mkItem("Grout lines are uniform", true),
    mkItem("Slope towards floor drain correct", false),
    mkItem("No hollow tiles — tap test done", false),
  ],
  woodwork: [
    mkItem("Door frame dimensions match openings", true),
    mkItem("Wood is properly seasoned/treated", false),
    mkItem("Hinges and locks are quality branded", true),
    mkItem("Kitchen cabinet dimensions match design", true),
    mkItem("All doors close properly without gaps", true),
  ],
  painting: [
    mkItem("Wall putty applied and sanded smooth", true),
    mkItem("Primer coat applied before paint", false),
    mkItem("Minimum 2 coats of emulsion applied", true),
    mkItem("Color matches approved sample", true),
    mkItem("No brush marks or drip lines", true),
    mkItem("Exterior weather-proof paint applied", true),
  ],
  fixtures: [
    mkItem("Sanitary fittings are branded as agreed", true),
    mkItem("All taps/faucets tested for flow", true),
    mkItem("Electrical switches/sockets working", false),
    mkItem("Light fixtures installed and tested", true),
    mkItem("Exhaust fans working", false),
  ],
  exterior: [
    mkItem("Boundary wall height matches approved plan", true),
    mkItem("Gate dimensions and design confirmed", true),
    mkItem("Driveway level and slope correct", true),
    mkItem("External drainage working", false),
    mkItem("Exterior paint/texture applied", true),
  ],
};

// ── SEED DATA ──────────────────────────────────────────────────
function addDays(dateStr, days) {
  const d = new Date(dateStr); d.setDate(d.getDate()+days);
  return d.toISOString().split("T")[0];
}

const SEED = {
  id:"p1", name:"DHA Phase 6 — Residential Villa", client:"Mr. Arif Hussain",
  location:"DHA Phase 6, Lahore", type:"residential_premium", totalArea:4800, floors:2,
  startDate:"2026-01-15", contractValue:48000000, status:"active", currentPhase:"grey", source:"manual",
  phases: PHASES.map((p,i)=>({
    ...p, budget:Math.round(48000000*p.pct),
    spent: i<2?Math.round(48000000*p.pct*0.97):i===2?Math.round(48000000*p.pct*0.62):0,
    expectedEnd: addDays("2026-01-15", PHASES.slice(0,i+1).reduce((s,x)=>s+Math.round(x.days*1.3),0)),
    progress: i<2?100:i===2?62:0, status:i<2?"done":i===2?"active":"pending",
  })),
  checklistLogs:[
    { id:"cl1", date:"2026-03-14", phase:"grey", completionRate:88, items:[
      {item:"Column positions match structural drawing", status:"yes", photo:"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect width='200' height='150' fill='%23334155'/%3E%3Crect x='40' y='30' width='20' height='90' fill='%23C4A35A'/%3E%3Crect x='90' y='30' width='20' height='90' fill='%23C4A35A'/%3E%3Crect x='140' y='30' width='20' height='90' fill='%23C4A35A'/%3E%3Ctext x='100' y='145' text-anchor='middle' fill='%2394a3b8' font-size='10'%3EColumns Photo%3C/text%3E%3C/svg%3E"},
      {item:"Steel bar sizes match specifications", status:"yes", photo:"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect width='200' height='150' fill='%231e293b'/%3E%3Cline x1='20' y1='50' x2='180' y2='50' stroke='%23C4A35A' stroke-width='4'/%3E%3Cline x1='20' y1='75' x2='180' y2='75' stroke='%23C4A35A' stroke-width='4'/%3E%3Cline x1='20' y1='100' x2='180' y2='100' stroke='%23C4A35A' stroke-width='4'/%3E%3Ctext x='100' y='130' text-anchor='middle' fill='%2394a3b8' font-size='10'%3ESteel 16mm%3C/text%3E%3C/svg%3E"},
      {item:"Brick alignment and plumb level checked", status:"no", reason:"Quality issue — rework needed", note:"North wall 8mm deviation"},
    ]},
  ],
  expenses:[
    {id:"e1",date:"2026-01-20",phase:"excavation",cat:"material",desc:"Excavation machinery hire — 3 days",amount:45000,receipt:"seed"},
    {id:"e2",date:"2026-01-28",phase:"foundation",cat:"material",desc:"DG Cement — 800 bags",amount:1096000,receipt:"seed"},
    {id:"e3",date:"2026-02-05",phase:"foundation",cat:"material",desc:"Amreli Steel — 8 tons",amount:1936000,receipt:"seed"},
    {id:"e4",date:"2026-02-12",phase:"foundation",cat:"labor",   desc:"Foundation labor — 25 days crew",amount:275000,receipt:"seed"},
    {id:"e5",date:"2026-03-01",phase:"grey",      cat:"material",desc:"Bricks A-Class — 85,000 pcs",amount:1615000,receipt:"seed"},
    {id:"e6",date:"2026-03-10",phase:"grey",      cat:"labor",   desc:"Grey structure crew — 30 days",amount:480000,receipt:"seed"},
  ],
  changeOrders:[], timelineEdits:[],
};

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

const RECEIPT_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect width='200' height='150' fill='%23f8f7f4'/%3E%3Crect x='20' y='15' width='160' height='120' rx='4' fill='white' stroke='%23ddd'/%3E%3Ctext x='100' y='38' text-anchor='middle' fill='%23333' font-size='11' font-weight='bold'%3ECASH RECEIPT%3C/text%3E%3Cline x1='30' y1='45' x2='170' y2='45' stroke='%23eee'/%3E%3Ctext x='35' y='62' fill='%23666' font-size='9'%3EItem: Construction Material%3C/text%3E%3Ctext x='35' y='76' fill='%23666' font-size='9'%3EDate: March 2026%3C/text%3E%3Cline x1='30' y1='100' x2='170' y2='100' stroke='%23eee'/%3E%3Ctext x='35' y='115' fill='%23333' font-size='10' font-weight='bold'%3ETotal: PKR XXXX%3C/text%3E%3C/svg%3E`;

// ══════════════════════════════════════════════════════════════
export default function App() {
  const [projects, setProjects]   = useState([SEED]);
  const [rates, setRates]         = useState(DEFAULT_RATES);
  const [view, setView]           = useState("dashboard");
  const [activeProject, setActiveProject] = useState(null);
  const [projectTab, setProjectTab] = useState("overview");
  const [role, setRole]           = useState("owner");

  // Drawings & 3D state
  const [projectDrawings, setProjectDrawings] = useState({ p1: null }); // projId -> {src, name, annotations:[]}
  const [annotations, setAnnotations] = useState({}); // projId -> [{id,x,y,note,author,date}]
  const [addingAnnotation, setAddingAnnotation] = useState(false);
  const [pendingPin, setPendingPin] = useState(null);
  const [pinNote, setPinNote] = useState("");
  const [selectedPin, setSelectedPin] = useState(null);
  const [roomData, setRoomData] = useState({}); // projId -> [{id,name,width,length,x,y,type}]
  const [analyzing3D, setAnalyzing3D] = useState(false);
  const [show3DShare, setShow3DShare] = useState(false);
  const drawingUploadRef = useRef(null);

  // Checklist state
  const [globalTemplates, setGlobalTemplates] = useState(BASE_TEMPLATES);
  const [projectChecklists, setProjectChecklists] = useState({});
  const [clEditorOpen, setClEditorOpen]   = useState(false);
  const [clEditorScope, setClEditorScope] = useState("global");
  const [clEditorPhase, setClEditorPhase] = useState("grey");
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemLabel, setEditingItemLabel] = useState("");
  const [editingSubKey, setEditingSubKey] = useState(null);
  const [editingSubLabel, setEditingSubLabel] = useState("");
  const [newItemLabel, setNewItemLabel]   = useState("");
  const [newSubLabel, setNewSubLabel]     = useState("");
  const [addingSubTo, setAddingSubTo]     = useState(null);

  // Quote state
  const [quoteStep, setQuoteStep] = useState(1);
  const [quoteForm, setQuoteForm] = useState({name:"",client:"",location:"",type:"residential_premium",area:"",floors:"2",notes:""});
  const [quoteDrawing, setQuoteDrawing]         = useState(null);
  const [quoteDrawingPreview, setQuoteDrawingPreview] = useState(null);
  const [analyzing, setAnalyzing]   = useState(false);
  const [aiResult, setAiResult]     = useState(null);
  const [generatedQuote, setGeneratedQuote] = useState(null);
  const drawingRef = useRef(null);

  // Language toggle (supervisor view)
  const [supLang, setSupLang] = useState("en"); // "en" | "ur"

  // Helper: translate with fallback
  function t(key) { return supLang==="ur" ? (UR.ui[key]||key) : key; }
  function tPhase(key) { return supLang==="ur" ? (UR.phases[key]||PHASES.find(p=>p.key===key)?.label||key) : (PHASES.find(p=>p.key===key)?.label||key); }
  function tItem(label) { return supLang==="ur" ? (UR.checklistItems[label]||label) : label; }
  function tReason(r, i) { return supLang==="ur" ? (UR.delayReasons[i]||r) : r; }
  function tCat(cat) { return supLang==="ur" ? (UR.expCats[cat]||cat) : cat; }

  // Supervisor state
  const [supPhase, setSupPhase]   = useState("grey");
  const [checkState, setCheckState] = useState({});
  const [expForm, setExpForm]     = useState({cat:"material",desc:"",amount:"",notes:""});
  const [expReceipt, setExpReceipt] = useState(null);
  const expReceiptRef = useRef(null);

  // Modals
  const [coForm, setCoForm]   = useState({phase:"grey",type:"rate_change",description:"",amount:"",reason:""});
  const [showCO, setShowCO]   = useState(false);
  const [showTLE, setShowTLE] = useState(false);
  const [tlePhase, setTlePhase]   = useState("");
  const [tleDate, setTleDate]     = useState("");
  const [tleReason, setTleReason] = useState("");

  // Rate edit
  const [editingRate, setEditingRate] = useState(null);
  const [rateEditVal, setRateEditVal] = useState("");

  // Lightbox
  const [lightbox, setLightbox] = useState(null);

  const proj = activeProject ? projects.find(p=>p.id===activeProject) : null;
  const totalSpent = proj ? (proj.expenses||[]).reduce((s,e)=>s+e.amount,0) : 0;
  const coTotal    = proj ? (proj.changeOrders||[]).reduce((s,c)=>s+(c.amount||0),0) : 0;
  const budgetLeft = proj ? proj.contractValue+coTotal-totalSpent : 0;

  function updProj(id, fn) { setProjects(prev=>prev.map(p=>p.id===id?fn(p):p)); }

  // ── CHECKLIST HELPERS ──────────────────────────────────────
  function getChecklist(phaseKey, projId) {
    return (projId&&projectChecklists[projId]?.[phaseKey]) || globalTemplates[phaseKey] || [];
  }
  function getEditorItems() {
    if (clEditorScope==="project"&&activeProject) {
      return projectChecklists[activeProject]?.[clEditorPhase]
        || (globalTemplates[clEditorPhase]||[]).map(i=>({...i,subtasks:[...(i.subtasks||[])]}));
    }
    return globalTemplates[clEditorPhase]||[];
  }
  function setEditorItems(items) {
    if (clEditorScope==="project"&&activeProject) {
      setProjectChecklists(prev=>({...prev,[activeProject]:{...(prev[activeProject]||{}),[clEditorPhase]:items}}));
    } else {
      setGlobalTemplates(prev=>({...prev,[clEditorPhase]:items}));
    }
  }
  const edItems = getEditorItems();

  function clAddItem() {
    if (!newItemLabel.trim()) return;
    setEditorItems([...edItems,{id:uid("item"),label:newItemLabel.trim(),requirePhoto:true,subtasks:[]}]);
    setNewItemLabel("");
  }
  function clRemoveItem(id) { setEditorItems(edItems.filter(i=>i.id!==id)); }
  function clToggleItemPhoto(id) { setEditorItems(edItems.map(i=>i.id===id?{...i,requirePhoto:!i.requirePhoto}:i)); }
  function clSaveItemLabel(id) {
    if (!editingItemLabel.trim()) return;
    setEditorItems(edItems.map(i=>i.id===id?{...i,label:editingItemLabel.trim()}:i));
    setEditingItemId(null);
  }
  function clAddSub(itemId) {
    if (!newSubLabel.trim()) return;
    setEditorItems(edItems.map(i=>i.id===itemId?{...i,subtasks:[...(i.subtasks||[]),{id:uid("sub"),label:newSubLabel.trim(),requirePhoto:false}]}:i));
    setNewSubLabel(""); setAddingSubTo(null);
  }
  function clRemoveSub(itemId,subId) { setEditorItems(edItems.map(i=>i.id===itemId?{...i,subtasks:(i.subtasks||[]).filter(s=>s.id!==subId)}:i)); }
  function clToggleSubPhoto(itemId,subId) { setEditorItems(edItems.map(i=>i.id===itemId?{...i,subtasks:(i.subtasks||[]).map(s=>s.id===subId?{...s,requirePhoto:!s.requirePhoto}:s)}:i)); }
  function clSaveSubLabel(itemId,subId) {
    if (!editingSubLabel.trim()) return;
    setEditorItems(edItems.map(i=>i.id===itemId?{...i,subtasks:(i.subtasks||[]).map(s=>s.id===subId?{...s,label:editingSubLabel.trim()}:s)}:i));
    setEditingSubKey(null);
  }
  function clResetToGlobal() {
    if (clEditorScope==="project"&&activeProject) {
      setProjectChecklists(prev=>{
        const u={...prev};
        if(u[activeProject]) delete u[activeProject][clEditorPhase];
        return u;
      });
    }
  }

  // ── DRAWING & 3D HELPERS ──────────────────────────────────
  function handleDrawingUpload(file) {
    if (!file || !activeProject) return;
    const r = new FileReader();
    r.onload = ev => setProjectDrawings(prev=>({...prev,[activeProject]:{src:ev.target.result,name:file.name}}));
    r.readAsDataURL(file);
  }

  function addAnnotationPin(e, containerRef) {
    if (!addingAnnotation || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPin({x, y});
  }

  function savePin() {
    if (!pendingPin || !pinNote.trim() || !activeProject) return;
    const pin = {id:"pin"+Date.now(), x:pendingPin.x, y:pendingPin.y, note:pinNote.trim(), author:"Owner", date:new Date().toISOString().split("T")[0]};
    setAnnotations(prev=>({...prev,[activeProject]:[...(prev[activeProject]||[]),pin]}));
    setPendingPin(null); setPinNote(""); setAddingAnnotation(false);
  }

  function deletePin(id) {
    setAnnotations(prev=>({...prev,[activeProject]:(prev[activeProject]||[]).filter(p=>p.id!==id)}));
    setSelectedPin(null);
  }

  async function extractRoomsFromDrawing() {
    const drawing = activeProject && projectDrawings[activeProject];
    if (!drawing) return;
    setAnalyzing3D(true);
    try {
      const b64 = drawing.src.split(",")[1];
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:`You are an architectural drawing analyzer. Extract room data for 3D visualization. Respond ONLY with valid JSON, no markdown:
{"rooms":[{"id":"r1","name":"Living Room","type":"living","widthFt":18,"lengthFt":22,"xPos":0,"yPos":0},{"id":"r2","name":"Master Bedroom","type":"bedroom","widthFt":16,"lengthFt":18,"xPos":20,"yPos":0}],"totalWidthFt":number,"totalLengthFt":number,"floors":number,"notes":"string"}
Types: living, bedroom, kitchen, bathroom, dining, garage, study, servant, stairs, store, corridor. Position rooms relative to each other using xPos/yPos as grid offsets in feet. Make positions realistic — rooms should be adjacent where logical.`,
          messages:[{role:"user",content:[
            {type:"image",source:{type:"base64",media_type:"image/jpeg",data:b64}},
            {type:"text",text:"Extract all rooms from this floor plan with realistic dimensions and positions for a Pakistani residential/commercial building. Make widthFt and lengthFt realistic (bedrooms 12-18ft, living 18-25ft, bathrooms 6-10ft, kitchen 10-14ft)."}
          ]}]
        })
      });
      const data = await res.json();
      const txt = data.content?.map(c=>c.text||"").join("")||"";
      const parsed = JSON.parse(txt.replace(/```json|```/g,"").trim());
      setRoomData(prev=>({...prev,[activeProject]:parsed.rooms}));
    } catch(e) {
      // Fallback demo rooms if AI fails
      setRoomData(prev=>({...prev,[activeProject]:[
        {id:"r1",name:"Living Room",  type:"living",  widthFt:20,lengthFt:24,xPos:0,  yPos:0  },
        {id:"r2",name:"Dining Room",  type:"dining",  widthFt:16,lengthFt:18,xPos:22, yPos:0  },
        {id:"r3",name:"Kitchen",      type:"kitchen", widthFt:14,lengthFt:16,xPos:40, yPos:0  },
        {id:"r4",name:"Master Bed",   type:"bedroom", widthFt:18,lengthFt:20,xPos:0,  yPos:26 },
        {id:"r5",name:"Bedroom 2",    type:"bedroom", widthFt:16,lengthFt:18,xPos:20, yPos:26 },
        {id:"r6",name:"Bedroom 3",    type:"bedroom", widthFt:14,lengthFt:16,xPos:38, yPos:26 },
        {id:"r7",name:"Master Bath",  type:"bathroom",widthFt:8, lengthFt:10,xPos:0,  yPos:48 },
        {id:"r8",name:"Bathroom",     type:"bathroom",widthFt:8, lengthFt:8, xPos:10, yPos:48 },
        {id:"r9",name:"Car Porch",    type:"garage",  widthFt:22,lengthFt:14,xPos:28, yPos:48 },
      ]}));
    }
    setAnalyzing3D(false);
  }

  function updateRoom(projId, roomId, field, value) {
    setRoomData(prev=>({...prev,[projId]:(prev[projId]||[]).map(r=>r.id===roomId?{...r,[field]:parseFloat(value)||0}:r)}));
  }

  // ── ANALYSIS ──────────────────────────────────────────────
  async function analyzeDrawing() {
    if (!quoteDrawingPreview) return;
    setAnalyzing(true);
    try {
      const b64=quoteDrawingPreview.split(",")[1];
      const mt=quoteDrawing?.type||"image/jpeg";
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,
          system:`Pakistani construction QS. Analyze drawings. Respond ONLY valid JSON no markdown: {"estimated_covered_area_sqft":number,"floors_detected":number,"rooms":[{"name":"string","sqft":number}],"doors":number,"windows":number,"bathrooms":number,"electrical_points":number,"has_basement":boolean,"special_features":["string"],"recommended_type":"residential_premium","confidence":"high|medium|low","notes":"string"}`,
          messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:mt,data:b64}},{type:"text",text:"Analyze this architectural drawing for a Lahore Pakistan construction project."}]}]
        })
      });
      const data=await res.json();
      const txt=data.content?.map(c=>c.text||"").join("")||"";
      const parsed=JSON.parse(txt.replace(/```json|```/g,"").trim());
      setAiResult(parsed);
      setQuoteForm(f=>({...f,area:String(parsed.estimated_covered_area_sqft||f.area),floors:String(parsed.floors_detected||f.floors),type:parsed.recommended_type||f.type}));
    } catch(e) { setAiResult({error:true,notes:"Could not read drawing. Enter details manually."}); }
    setAnalyzing(false);
  }

  function generateQuote() {
    const area=parseFloat(quoteForm.area)||0;
    const bt=BUILD_TYPES[quoteForm.type];
    const total=Math.round(area*bt.perSqFt);
    const flrs=parseInt(quoteForm.floors)||1;
    const phases=PHASES.map(p=>({...p,budget:Math.round(total*p.pct),days:Math.round(p.days*(flrs/1.5)),expectedEnd:addDays(new Date().toISOString().split("T")[0],PHASES.slice(0,PHASES.indexOf(p)+1).reduce((s,x)=>s+Math.round(x.days*(flrs/1.5)),0))}));
    setGeneratedQuote({id:"q_"+Date.now(),...quoteForm,area,bt,total,phases,flrs,validUntil:addDays(new Date().toISOString().split("T")[0],30),createdAt:new Date().toISOString().split("T")[0],aiData:aiResult,totalDays:phases.reduce((s,p)=>s+p.days,0)});
    setQuoteStep(4);
  }

  function convertToProject() {
    if (!generatedQuote) return;
    const np={
      id:"p_"+Date.now(),name:generatedQuote.name||"New Project",client:generatedQuote.client,
      location:generatedQuote.location,type:generatedQuote.type,totalArea:generatedQuote.area,
      floors:generatedQuote.flrs,startDate:new Date().toISOString().split("T")[0],
      contractValue:generatedQuote.total,status:"active",currentPhase:"excavation",
      source:quoteDrawingPreview?"ai":"manual",
      phases:generatedQuote.phases.map((p,i)=>({...p,spent:0,progress:0,status:i===0?"active":"pending",budget:p.budget})),
      checklistLogs:[],expenses:[],changeOrders:[],timelineEdits:[],
    };
    setProjects(prev=>[...prev,np]);
    setActiveProject(np.id); setView("project"); setProjectTab("overview");
    setQuoteStep(1); setGeneratedQuote(null); setAiResult(null);
    setQuoteDrawing(null); setQuoteDrawingPreview(null);
    setQuoteForm({name:"",client:"",location:"",type:"residential_premium",area:"",floors:"2",notes:""});
  }

  function handleDrawingFile(file) {
    if (!file) return;
    setQuoteDrawing(file);
    const r=new FileReader(); r.onload=ev=>setQuoteDrawingPreview(ev.target.result); r.readAsDataURL(file);
  }
  function handleCheckPhoto(itemId,file) {
    if (!file) return;
    const r=new FileReader(); r.onload=ev=>setCheckState(p=>({...p,[itemId]:{...p[itemId],photo:ev.target.result}})); r.readAsDataURL(file);
  }
  function handleReceiptPhoto(file) {
    if (!file) return;
    const r=new FileReader(); r.onload=ev=>setExpReceipt(ev.target.result); r.readAsDataURL(file);
  }

  function submitDailyLog() {
    const p=proj||projects[0]; if(!p) return;
    const checklist=getChecklist(supPhase,p.id);
    const items=checklist.map(item=>{
      const s=checkState[item.id]||{};
      return {item:item.label,status:s.val==="yes"?"yes":s.val==="no"?"no":"pending",photo:s.photo||null,reason:s.reason||null,note:s.note||""};
    });
    const done=items.filter(i=>i.status==="yes").length;
    const log={id:"cl"+Date.now(),date:new Date().toISOString().split("T")[0],phase:supPhase,completionRate:Math.round((done/(items.length||1))*100),items};
    let upd={...p,checklistLogs:[log,...(p.checklistLogs||[])]};
    if (expForm.desc&&expForm.amount) {
      const exp={id:"e"+Date.now(),date:new Date().toISOString().split("T")[0],phase:supPhase,cat:expForm.cat,desc:expForm.desc,amount:parseFloat(expForm.amount),receipt:expReceipt||RECEIPT_SVG};
      upd.expenses=[exp,...(p.expenses||[])];
    }
    setProjects(prev=>prev.map(x=>x.id===p.id?upd:x));
    setCheckState({}); setExpForm({cat:"material",desc:"",amount:"",notes:""}); setExpReceipt(null);
    setView("project"); setProjectTab("logs");
  }

  function submitCO() {
    if (!proj||!coForm.description||!coForm.amount) return;
    updProj(proj.id,p=>({...p,changeOrders:[...(p.changeOrders||[]),{id:"co"+Date.now(),date:new Date().toISOString().split("T")[0],...coForm,amount:parseFloat(coForm.amount)}]}));
    setCoForm({phase:"grey",type:"rate_change",description:"",amount:"",reason:""}); setShowCO(false);
  }
  function submitTLE() {
    if (!proj||!tlePhase||!tleDate||!tleReason) return;
    updProj(proj.id,p=>({...p,timelineEdits:[...(p.timelineEdits||[]),{id:"tle"+Date.now(),date:new Date().toISOString().split("T")[0],phase:tlePhase,newDate:tleDate,reason:tleReason}],phases:p.phases.map(ph=>ph.key===tlePhase?{...ph,expectedEnd:tleDate}:ph)}));
    setShowTLE(false); setTlePhase(""); setTleDate(""); setTleReason("");
  }

  function getTimelineStatus(p) {
    const ap=p.phases.find(ph=>ph.status==="active"); if(!ap) return "on_track";
    const daysLeft=Math.round((new Date(ap.expectedEnd)-new Date())/(1000*60*60*24));
    if (daysLeft<0) return "overdue";
    if (daysLeft<7&&(ap.progress||0)<60) return "at_risk";
    return "on_track";
  }
  function getBudgetStatus(p) {
    const sp=(p.expenses||[]).reduce((s,e)=>s+e.amount,0);
    const pct=sp/p.contractValue;
    return pct>1?"over":pct>0.85?"watch":"ok";
  }

  // ── CSS ────────────────────────────────────────────────────
  const css=`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&family=Literata:ital,wght@0,300;0,400;0,500;1,300&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    :root{--bg:#0E1117;--bg2:#151922;--bg3:#1C2230;--gold:#C4A35A;--gold2:#E8C878;--gdim:rgba(196,163,90,0.12);--text:#E8E3D8;--text2:#9A9488;--text3:#5A5650;--red:#E05858;--green:#58A878;--border:rgba(196,163,90,0.1);}
    body{background:var(--bg);color:var(--text);font-family:'Literata',Georgia,serif;}
    .mono{font-family:'DM Mono',monospace;} .syne{font-family:'Syne',sans-serif;}
    .app{display:flex;min-height:100vh;}
    .sidebar{width:220px;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0;position:sticky;top:0;height:100vh;overflow-y:auto;}
    .sb-logo{padding:20px 20px 14px;border-bottom:1px solid var(--border);}
    .sb-logo-t{font-family:'Syne',sans-serif;font-size:21px;font-weight:800;color:var(--gold);}
    .sb-logo-s{font-size:9px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;margin-top:2px;}
    .sb-nav{padding:12px 0;flex:1;}
    .sb-sec{font-size:9px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;padding:10px 20px 4px;}
    .sb-item{display:flex;align-items:center;gap:10px;padding:9px 20px;cursor:pointer;font-size:12px;color:var(--text2);transition:all 0.15s;border-left:2px solid transparent;}
    .sb-item:hover{color:var(--text);background:var(--gdim);}
    .sb-item.on{color:var(--gold);border-left-color:var(--gold);background:var(--gdim);}
    .sb-role{padding:14px 20px;border-top:1px solid var(--border);}
    .sb-role-l{font-size:9px;color:var(--text3);letter-spacing:1px;text-transform:uppercase;margin-bottom:7px;}
    .role-tog{display:flex;background:var(--bg3);border-radius:6px;padding:3px;gap:3px;}
    .role-btn{flex:1;padding:5px 4px;border-radius:4px;border:none;background:none;font-size:11px;cursor:pointer;color:var(--text2);font-family:'Syne',sans-serif;transition:all 0.15s;}
    .role-btn.on{background:var(--gold);color:#000;font-weight:700;}
    .main{flex:1;overflow-y:auto;display:flex;flex-direction:column;}
    .topbar{background:var(--bg2);border-bottom:1px solid var(--border);padding:10px 28px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;position:sticky;top:0;z-index:50;}
    .topbar-left{font-family:'Syne',sans-serif;font-size:12px;color:var(--text3);}
    .topbar-role{display:flex;background:var(--bg3);border-radius:6px;padding:3px;gap:3px;}
    .topbar-role-btn{padding:5px 12px;border-radius:4px;border:none;background:none;font-size:11px;cursor:pointer;color:var(--text2);font-family:'Syne',sans-serif;font-weight:600;transition:all 0.15s;}
    .topbar-role-btn.on{background:var(--gold);color:#000;}
    .page{padding:24px 28px;max-width:960px;flex:1;}
    .page-title{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:var(--text);margin-bottom:3px;}
    .page-sub{font-size:12px;color:var(--text2);margin-bottom:24px;}
    .back-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;background:none;border:1px solid rgba(196,163,90,0.2);border-radius:7px;color:var(--gold);font-family:'Syne',sans-serif;font-size:11px;font-weight:600;cursor:pointer;margin-bottom:16px;transition:all 0.15s;}
    .back-btn:hover{background:var(--gdim);}
    .card{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:18px;margin-bottom:14px;}
    .card-t{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;color:var(--gold);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:13px;}
    .stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;}
    .stat-box{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px;}
    .stat-v{font-family:'DM Mono',monospace;font-size:18px;font-weight:500;}
    .stat-l{font-size:9px;color:var(--text3);letter-spacing:1px;text-transform:uppercase;margin-top:3px;}
    .stat-d{font-size:10px;color:var(--text3);margin-top:2px;}
    .proj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;margin-bottom:18px;}
    .proj-card{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:18px;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden;}
    .proj-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--gold);opacity:0;}
    .proj-card:hover{border-color:rgba(196,163,90,0.3);transform:translateY(-2px);}
    .proj-card:hover::before{opacity:1;}
    .tag{padding:3px 7px;border-radius:4px;font-size:9px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;font-family:'Syne',sans-serif;}
    .tag-ok{background:rgba(88,168,120,0.12);color:#58A878;}
    .tag-warn{background:rgba(196,163,90,0.12);color:var(--gold);}
    .tag-over{background:rgba(224,88,88,0.12);color:var(--red);}
    .bar-bg{width:100%;height:5px;background:var(--bg3);border-radius:3px;overflow:hidden;}
    .bar{height:100%;border-radius:3px;transition:width 0.4s;}
    .bar-g{background:linear-gradient(90deg,#3A7A58,#58A878);}
    .bar-y{background:linear-gradient(90deg,#A88040,#C4A35A);}
    .bar-r{background:linear-gradient(90deg,#A83838,#E05858);}
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    .form-full{grid-column:1/-1;}
    .fl{font-size:10px;color:var(--text3);letter-spacing:0.5px;text-transform:uppercase;margin-bottom:5px;font-family:'Syne',sans-serif;}
    .fi,.fs{width:100%;background:var(--bg3);border:1px solid rgba(196,163,90,0.12);border-radius:7px;padding:9px 11px;color:var(--text);font-family:'Literata',serif;font-size:13px;outline:none;transition:border-color 0.2s;}
    .fi:focus,.fs:focus{border-color:var(--gold);}
    .fi::placeholder{color:var(--text3);}
    .fs option{background:var(--bg2);}
    .btn{padding:10px 20px;background:linear-gradient(135deg,#C4A35A,#A88040);border:none;border-radius:7px;color:#0E1117;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;letter-spacing:1px;cursor:pointer;transition:all 0.15s;}
    .btn:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(196,163,90,0.2);}
    .btn:disabled{opacity:0.4;cursor:not-allowed;transform:none;box-shadow:none;}
    .btn-ghost{padding:9px 16px;background:none;border:1px solid rgba(196,163,90,0.2);border-radius:7px;color:var(--gold);font-family:'Syne',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;}
    .btn-ghost:hover{background:var(--gdim);}
    .btn-sm{padding:6px 12px;font-size:11px;}
    .btn-danger{padding:4px 8px;background:rgba(224,88,88,0.08);border:none;border-radius:4px;color:var(--red);font-size:10px;cursor:pointer;font-family:'Syne',sans-serif;}
    .tab-row{display:flex;border-bottom:1px solid var(--border);margin-bottom:20px;}
    .ptab{padding:9px 16px;background:none;border:none;border-bottom:2px solid transparent;color:var(--text2);font-family:'Syne',sans-serif;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s;letter-spacing:0.5px;}
    .ptab.on{color:var(--gold);border-bottom-color:var(--gold);}
    .ptab:hover:not(.on){color:var(--text);}
    .data-row{display:flex;align-items:center;padding:10px 0;border-bottom:1px solid rgba(196,163,90,0.04);gap:10px;}
    .data-row:last-child{border-bottom:none;}
    .d-info{flex:1;min-width:0;}
    .d-name{font-size:13px;color:var(--text);}
    .d-meta{font-size:10px;color:var(--text2);margin-top:2px;}
    .d-val{font-family:'DM Mono',monospace;font-size:13px;color:var(--gold);flex-shrink:0;}
    .phase-row{display:flex;align-items:center;padding:11px 0;border-bottom:1px solid rgba(196,163,90,0.04);gap:10px;}
    .p-num{width:26px;height:26px;border-radius:5px;background:var(--gdim);display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:10px;font-weight:700;color:var(--gold);flex-shrink:0;}
    .p-info{flex:1;min-width:0;}
    .p-name{font-size:12px;color:var(--text);font-weight:500;}
    .p-meta{font-size:10px;color:var(--text3);margin-top:1px;}
    .chk-item{background:var(--bg3);border-radius:8px;padding:13px;margin-bottom:7px;border:1px solid var(--border);}
    .chk-q{font-size:13px;color:var(--text);margin-bottom:9px;line-height:1.4;}
    .chk-btns{display:flex;gap:7px;}
    .chk-btn{flex:1;padding:8px;border-radius:5px;border:1.5px solid rgba(196,163,90,0.1);background:none;color:var(--text3);font-family:'Syne',sans-serif;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s;}
    .chk-yes:hover:not(.on){border-color:#58A878;color:#58A878;}
    .chk-yes.on{border-color:#58A878;color:#58A878;background:rgba(88,168,120,0.1);}
    .chk-no:hover:not(.on){border-color:var(--red);color:var(--red);}
    .chk-no.on{border-color:var(--red);color:var(--red);background:rgba(224,88,88,0.08);}
    .reason-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px;}
    .r-chip{padding:3px 9px;border-radius:20px;border:1px solid rgba(224,88,88,0.2);background:none;color:#A86060;font-size:9px;cursor:pointer;font-family:'Syne',sans-serif;transition:all 0.15s;}
    .r-chip.on{background:rgba(224,88,88,0.1);border-color:var(--red);color:var(--red);}
    .photo-req{display:flex;align-items:center;gap:9px;margin-top:9px;}
    .photo-thumb{width:44px;height:44px;border-radius:5px;object-fit:cover;border:1px solid var(--border);cursor:pointer;}
    .photo-btn{padding:6px 11px;background:var(--gdim);border:1px solid rgba(196,163,90,0.2);border-radius:5px;color:var(--gold);font-size:10px;cursor:pointer;font-family:'Syne',sans-serif;}
    .phase-chips{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px;}
    .ph-chip{padding:5px 11px;border-radius:20px;border:1px solid var(--border);background:none;color:var(--text2);font-size:10px;cursor:pointer;font-family:'Syne',sans-serif;transition:all 0.15s;}
    .ph-chip.on{background:var(--gdim);border-color:var(--gold);color:var(--gold);}
    .upload-zone{border:2px dashed rgba(196,163,90,0.15);border-radius:9px;padding:32px 18px;text-align:center;cursor:pointer;transition:all 0.2s;}
    .upload-zone:hover{border-color:rgba(196,163,90,0.3);background:rgba(196,163,90,0.02);}
    .step-row{display:flex;gap:0;margin-bottom:24px;}
    .step{flex:1;padding:9px;text-align:center;font-family:'Syne',sans-serif;font-size:10px;font-weight:600;color:var(--text3);border-bottom:2px solid var(--bg3);}
    .step.done{color:var(--green);border-bottom-color:var(--green);}
    .step.active{color:var(--gold);border-bottom-color:var(--gold);}
    .ai-box{background:rgba(196,163,90,0.04);border:1px solid rgba(196,163,90,0.1);border-radius:7px;padding:14px;margin-bottom:12px;}
    .ai-row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(196,163,90,0.04);}
    .ai-row:last-child{border-bottom:none;}
    .ai-k{font-size:11px;color:var(--text3);}
    .ai-v{font-size:11px;font-family:'DM Mono',monospace;color:var(--text);}
    .rate-row{display:flex;align-items:center;padding:9px 0;border-bottom:1px solid rgba(196,163,90,0.04);gap:9px;}
    .rate-val{font-family:'DM Mono',monospace;font-size:12px;color:var(--gold);min-width:90px;text-align:right;}
    .rate-edited{color:var(--gold2);}
    .rate-edit-btn{padding:3px 9px;background:none;border:1px solid rgba(196,163,90,0.15);border-radius:4px;color:var(--text3);font-size:9px;cursor:pointer;font-family:'Syne',sans-serif;}
    .rate-edit-btn:hover{border-color:var(--gold);color:var(--gold);}
    .b-phase{margin-bottom:12px;}
    .b-ph-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;}
    .b-ph-n{font-size:12px;color:var(--text);}
    .b-ph-v{font-family:'DM Mono',monospace;font-size:10px;color:var(--text2);}
    .badge{display:inline-block;padding:2px 6px;border-radius:3px;font-size:8px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;font-family:'Syne',sans-serif;}
    .badge-ok{background:rgba(88,168,120,0.12);color:#58A878;}
    .badge-warn{background:rgba(196,163,90,0.12);color:var(--gold);}
    .badge-over{background:rgba(224,88,88,0.12);color:var(--red);}
    .badge-done{background:rgba(88,168,120,0.1);color:#58A878;}
    .badge-active{background:rgba(196,163,90,0.1);color:var(--gold);}
    .badge-pending{background:rgba(90,86,80,0.2);color:var(--text3);}
    .overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.88);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;}
    .modal{background:var(--bg2);border:1px solid var(--border);border-radius:11px;padding:24px;width:100%;max-width:540px;max-height:92vh;overflow-y:auto;}
    .modal-title{font-family:'Syne',sans-serif;font-size:17px;font-weight:700;color:var(--text);margin-bottom:18px;}
    .lightbox{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.97);z-index:300;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:16px;}
    .lightbox img{max-width:92vw;max-height:72vh;border-radius:7px;object-fit:contain;}
    .lb-close{position:absolute;top:14px;right:18px;background:none;border:none;color:var(--text);font-size:26px;cursor:pointer;}
    .report-box{background:white;color:#222;padding:28px;border-radius:7px;font-family:'Literata',serif;}
    .rep-hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #C4A35A;padding-bottom:14px;margin-bottom:18px;}
    .rep-row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f5f5f5;font-size:12px;}
    .rep-sec-t{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:#C4A35A;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;padding-bottom:3px;border-bottom:1px solid #eee;}
    .rep-photos{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px;}
    .tier-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;}
    .tier-c{background:var(--bg3);border:2px solid rgba(196,163,90,0.08);border-radius:7px;padding:10px 7px;text-align:center;cursor:pointer;transition:all 0.2s;}
    .tier-c.on{border-color:var(--gold);background:rgba(196,163,90,0.04);}
    .tier-c:hover:not(.on){border-color:rgba(196,163,90,0.25);}
    .empty-s{text-align:center;padding:40px 16px;color:var(--text3);}
    .sub-block{margin-top:8px;padding-left:10px;border-left:2px solid rgba(196,163,90,0.12);}
    .sub-item{background:var(--bg);border-radius:5px;padding:8px 10px;margin-bottom:6px;}
    .divider{border:none;border-top:1px solid var(--border);margin:16px 0;}
    .pulse{animation:pulse 1.5s infinite;}
    @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
    .fade-in{animation:fadeIn 0.25s ease;}
    @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
    @media(max-width:580px){.sidebar{display:none;}.page{padding:14px;}.stat-row{grid-template-columns:1fr 1fr;}.form-grid{grid-template-columns:1fr;}.tier-cards{grid-template-columns:1fr 1fr;}}
  `;

  // ── VIEWS ──────────────────────────────────────────────────

  function Dashboard() {
    const tc=projects.reduce((s,p)=>s+p.contractValue,0);
    const ts=projects.reduce((s,p)=>s+(p.expenses||[]).reduce((a,e)=>a+e.amount,0),0);
    return (
      <div className="page fade-in">
        <div className="page-title syne">Good morning — your overview</div>
        <div className="page-sub">TaameerAI · Lahore · {new Date().toLocaleDateString("en-PK",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
        <div className="stat-row">
          {[{v:projects.filter(p=>p.status==="active").length,l:"Active Projects",d:`${projects.length} total`,c:"var(--gold)"},
            {v:fPKR(tc),l:"Total Contract",d:"all projects",c:"var(--text)"},
            {v:fPKR(ts),l:"Total Spent",d:`${tc?Math.round(ts/tc*100):0}% of contract`,c:"var(--text)"},
            {v:fPKR(tc-ts),l:"Remaining",d:"all projects",c:"#58A878"},
          ].map((s,i)=>(
            <div key={i} className="stat-box">
              <div className="stat-v mono" style={{color:s.c}}>{s.v}</div>
              <div className="stat-l">{s.l}</div>
              <div className="stat-d">{s.d}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div className="card-t" style={{margin:0}}>Active Projects</div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn-ghost btn-sm" onClick={()=>{setView("quote");setQuoteStep(1);}}>+ New Quote</button>
            <button className="btn btn-sm" onClick={()=>setView("newproject")}>+ Import Project</button>
          </div>
        </div>
        <div className="proj-grid">
          {projects.map(p=>{
            const sp=(p.expenses||[]).reduce((s,e)=>s+e.amount,0);
            const pct=Math.round(sp/p.contractValue*100);
            const ap=p.phases.find(ph=>ph.status==="active");
            const ts=getTimelineStatus(p), bs=getBudgetStatus(p);
            return (
              <div key={p.id} className="proj-card" onClick={()=>{setActiveProject(p.id);setProjectTab("overview");setView("project");}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"var(--text)",marginBottom:3}}>{p.name}</div>
                <div style={{fontSize:11,color:"var(--text2)",marginBottom:10}}>{p.client} · {p.location}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                  <span className={`tag tag-${ts==="on_track"?"ok":ts==="at_risk"?"warn":"over"}`}>{ts==="on_track"?"On Track":ts==="at_risk"?"At Risk":"Overdue"}</span>
                  <span className={`tag tag-${bs==="ok"?"ok":bs==="watch"?"warn":"over"}`}>{bs==="ok"?"In Budget":bs==="watch"?"Watch":"Over"}</span>
                </div>
                <div style={{fontSize:10,color:"var(--text3)",marginBottom:7}}>Phase: <span style={{color:"var(--gold)"}}>{ap?.label||"Done"}</span>{ap?` · ${ap.progress||0}%`:""}</div>
                <div className="bar-bg"><div className={`bar ${pct>100?"bar-r":pct>85?"bar-y":"bar-g"}`} style={{width:`${Math.min(pct,100)}%`}}/></div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
                  <span style={{fontSize:9,color:"var(--text3)"}}>{fPKR(sp)} spent</span>
                  <span style={{fontSize:9,color:"var(--text3)"}}>{fPKR(p.contractValue)}</span>
                </div>
              </div>
            );
          })}
          <div className="proj-card" style={{border:"2px dashed rgba(196,163,90,0.15)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:150,gap:7}}
            onClick={()=>{setView("quote");setQuoteStep(1);}}>
            <div style={{fontSize:28,opacity:0.3}}>＋</div>
            <div style={{fontSize:11,color:"var(--text3)",fontFamily:"'Syne',sans-serif"}}>New Project</div>
          </div>
        </div>
        <div className="card">
          <div className="card-t">Recent Expenses</div>
          {projects.flatMap(p=>(p.expenses||[]).map(e=>({...e,pName:p.name}))).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,6).map(e=>(
            <div key={e.id} className="data-row">
              <span style={{fontSize:16}}>{e.cat==="material"?"🧱":e.cat==="labor"?"👷":e.cat==="contractor"?"📋":"📎"}</span>
              <div className="d-info"><div className="d-name">{e.desc}</div><div className="d-meta">{e.pName} · {fDate(e.date)}</div></div>
              <div className="d-val">{fPKR(e.amount)}</div>
            </div>
          ))}
          {projects.flatMap(p=>p.expenses||[]).length===0&&<div className="empty-s"><div style={{fontSize:36,opacity:0.3}}>📋</div><div style={{marginTop:10}}>No expenses yet</div></div>}
        </div>
      </div>
    );
  }

  function ProjectView() {
    if (!proj) return null;
    const ap=proj.phases.find(p=>p.status==="active");
    return (
      <div className="page fade-in">
        <button className="back-btn" onClick={()=>setView("dashboard")}>← Dashboard</button>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
          <div><div className="page-title syne">{proj.name}</div><div className="page-sub">{proj.client} · {proj.location}</div></div>
          <div style={{display:"flex",gap:7,marginTop:4}}>
            {role==="owner"&&<button className="btn-ghost btn-sm" onClick={()=>setShowCO(true)}>Change Order</button>}
            {role==="owner"&&<button className="btn-ghost btn-sm" onClick={()=>setShowTLE(true)}>Edit Timeline</button>}
            {role==="owner"&&<button className="btn-ghost btn-sm" onClick={()=>{setClEditorScope("project");setClEditorPhase(proj?.currentPhase||"grey");setClEditorOpen(true);}}>✏️ Checklists</button>}
            {role==="supervisor"&&<button className="btn btn-sm" onClick={()=>setView("supervisor")}>Open Today's Log</button>}
          </div>
        </div>
        <div className="tab-row" style={{overflowX:"auto"}}>
          {["overview","phases","budget","logs","drawings","3d","report"].map(t=>(
            <button key={t} className={`ptab ${projectTab===t?"on":""}`} onClick={()=>setProjectTab(t)}>
              {t==="3d"?"3D View":t==="drawings"?"Drawings":t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        {projectTab==="overview"&&(
          <>
            <div className="stat-row">
              {[{v:fPKR(proj.contractValue),l:"Contract",c:"var(--gold)"},{v:fPKR(totalSpent),l:"Spent",c:"var(--text)"},{v:fPKR(budgetLeft),l:budgetLeft>=0?"Remaining":"Over Budget",c:budgetLeft<0?"var(--red)":"#58A878"},{v:`${proj.phases.filter(p=>p.status==="done").length}/${proj.phases.length}`,l:"Phases Done",c:"var(--text)"}].map((s,i)=>(
                <div key={i} className="stat-box"><div className="stat-v mono" style={{color:s.c}}>{s.v}</div><div className="stat-l">{s.l}</div></div>
              ))}
            </div>
            <div className="card">
              <div className="card-t">Project Details</div>
              {[["Build Type",BUILD_TYPES[proj.type]?.label||proj.type],["Total Area",`${proj.totalArea?.toLocaleString()} sq ft`],["Floors",proj.floors],["Start Date",fDate(proj.startDate)],["Current Phase",ap?.label||"Complete"],["Source",proj.source==="ai"?"AI Drawing Analysis":"Manual Entry"]].map(([k,v])=>(
                <div key={k} className="data-row"><div className="d-info"><div className="d-meta">{k}</div><div className="d-name">{v}</div></div></div>
              ))}
            </div>
            {(proj.changeOrders||[]).length>0&&(
              <div className="card">
                <div className="card-t">Change Orders</div>
                {proj.changeOrders.map(co=>(
                  <div key={co.id} className="data-row">
                    <div className="d-info"><div className="d-name">{co.description}</div><div className="d-meta">{fDate(co.date)} · {co.type.replace("_"," ")} · {co.reason}</div></div>
                    <div className="d-val" style={{color:co.amount>0?"var(--red)":"#58A878"}}>{co.amount>0?"+":""}{fPKR(co.amount)}</div>
                  </div>
                ))}
              </div>
            )}
            {(proj.timelineEdits||[]).length>0&&(
              <div className="card">
                <div className="card-t">Timeline Edit Log</div>
                {proj.timelineEdits.map(e=>(
                  <div key={e.id} className="data-row">
                    <div className="d-info"><div className="d-name">{PHASES.find(p=>p.key===e.phase)?.label} → {fDate(e.newDate)}</div><div className="d-meta">{fDate(e.date)} · {e.reason}</div></div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {projectTab==="phases"&&(
          <div className="card">
            <div className="card-t">Phase Breakdown</div>
            {proj.phases.map((p,i)=>(
              <div key={p.key} className="phase-row">
                <div className="p-num">{i+1}</div>
                <div className="p-info">
                  <div className="p-name">{p.label}</div>
                  <div className="p-meta">Due: {fDate(p.expectedEnd)} · ~{p.days} days</div>
                  {p.status==="active"&&<div style={{marginTop:5}}><div className="bar-bg"><div className="bar bar-y" style={{width:`${p.progress||0}%`}}/></div><div style={{fontSize:9,color:"var(--text3)",marginTop:2}}>{p.progress||0}%</div></div>}
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div className="d-val">{fPKR(p.budget)}</div>
                  <span className={`badge badge-${p.status}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {projectTab==="budget"&&(
          <>
            <div className="card">
              <div className="card-t">Phase Budget vs Actual</div>
              {proj.phases.map(p=>{
                const ps=(proj.expenses||[]).filter(e=>e.phase===p.key).reduce((s,e)=>s+e.amount,0);
                const pct=p.budget>0?ps/p.budget:0;
                const st=pct>1?"over":pct>0.85?"warn":"ok";
                return (
                  <div key={p.key} className="b-phase">
                    <div className="b-ph-h">
                      <div style={{display:"flex",alignItems:"center",gap:7}}><span className="b-ph-n">{p.label.split("(")[0].trim()}</span>{ps>0&&<span className={`badge badge-${st}`}>{st==="ok"?"On Track":st==="warn"?"Watch":"Over!"}</span>}</div>
                      <span className="b-ph-v">{fPKR(ps)} / {fPKR(p.budget)}</span>
                    </div>
                    <div className="bar-bg"><div className={`bar bar-${st==="over"?"r":st==="warn"?"y":"g"}`} style={{width:`${Math.min(pct*100,100)}%`}}/></div>
                  </div>
                );
              })}
              <hr className="divider"/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13}}>Total Spent</span>
                <span className="mono" style={{fontSize:16,color:"var(--gold)",fontWeight:600}}>{fPKR(totalSpent)}</span>
              </div>
            </div>
            <div className="card">
              <div className="card-t">Expense Log</div>
              {(proj.expenses||[]).length===0&&<div className="empty-s"><div style={{fontSize:32,opacity:0.3}}>📎</div><div style={{marginTop:8}}>No expenses yet</div></div>}
              {(proj.expenses||[]).map(e=>(
                <div key={e.id} className="data-row">
                  <span style={{fontSize:15}}>{e.cat==="material"?"🧱":e.cat==="labor"?"👷":e.cat==="contractor"?"📋":"📎"}</span>
                  <div className="d-info"><div className="d-name">{e.desc}</div><div className="d-meta">{fDate(e.date)} · {PHASES.find(p=>p.key===e.phase)?.label}</div></div>
                  {e.receipt&&<img src={e.receipt==="seed"?RECEIPT_SVG:e.receipt} alt="r" style={{width:32,height:32,borderRadius:4,objectFit:"cover",cursor:"pointer",border:"1px solid var(--border)"}} onClick={()=>setLightbox(e.receipt==="seed"?RECEIPT_SVG:e.receipt)}/>}
                  <div className="d-val">{fPKR(e.amount)}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {projectTab==="logs"&&(
          <div className="card">
            <div className="card-t">Supervisor Check Logs</div>
            {(proj.checklistLogs||[]).length===0&&<div className="empty-s"><div style={{fontSize:32,opacity:0.3}}>✅</div><div style={{marginTop:8}}>No logs yet</div></div>}
            {(proj.checklistLogs||[]).map(log=>(
              <div key={log.id} style={{background:"var(--bg3)",borderRadius:7,padding:12,marginBottom:7,border:"1px solid var(--border)"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                  <div><span className="mono" style={{fontSize:11,color:"var(--gold)"}}>{log.date}</span><span style={{fontSize:10,color:"var(--text3)",marginLeft:10}}>{PHASES.find(p=>p.key===log.phase)?.label}</span></div>
                  <span className="mono" style={{fontSize:13,fontWeight:600,color:log.completionRate>=80?"#58A878":log.completionRate>=50?"var(--gold)":"var(--red)"}}>{log.completionRate}%</span>
                </div>
                <div className="bar-bg"><div className={`bar ${log.completionRate>=80?"bar-g":log.completionRate>=50?"bar-y":"bar-r"}`} style={{width:`${log.completionRate}%`}}/></div>
                <div style={{marginTop:7,display:"flex",flexWrap:"wrap",gap:5}}>
                  {log.items.filter(i=>i.status==="yes"&&i.photo).map((i,idx)=><img key={idx} src={i.photo} alt="" style={{width:36,height:36,borderRadius:3,objectFit:"cover",cursor:"pointer",border:"1px solid var(--border)"}} onClick={()=>setLightbox(i.photo)}/>)}
                  {log.items.filter(i=>i.status==="no").map((i,idx)=><span key={idx} style={{padding:"2px 7px",borderRadius:10,background:"rgba(224,88,88,0.08)",fontSize:8,color:"var(--red)"}}>✗ {i.reason||"No reason"}</span>)}
                </div>
              </div>
            ))}
          </div>
        )}

        {projectTab==="report"&&<ReportTab proj={proj} sp={totalSpent}/>}

        {projectTab==="drawings"&&<DrawingsTab projId={proj.id}/>}
        {projectTab==="3d"&&<ThreeDTab projId={proj.id}/>}
      </div>
    );
  }

  // ── ROOM TYPE COLORS ──────────────────────────────────────
  const ROOM_COLORS = {
    living:"#C4A35A", bedroom:"#6B8CAE", kitchen:"#8B6B4A", bathroom:"#4A8B7A",
    dining:"#A07040", garage:"#707070", study:"#7A6B8B", servant:"#8B8B6B",
    stairs:"#9B9B9B", store:"#7B8B7B", corridor:"#A0A090",
  };

  function DrawingsTab({projId}) {
    const drawing = projectDrawings[projId];
    const pins = annotations[projId] || [];
    const containerRef = useRef(null);
    const fileRef = useRef(null);

    return (
      <div>
        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div className="card-t" style={{margin:0}}>Architectural Drawing</div>
            <div style={{display:"flex",gap:7}}>
              {drawing && (
                <button className={`btn-ghost btn-sm ${addingAnnotation?"btn":""}`}
                  style={addingAnnotation?{background:"var(--gold)",color:"#000",border:"none"}:{}}
                  onClick={()=>{setAddingAnnotation(!addingAnnotation);setPendingPin(null);}}>
                  {addingAnnotation?"Cancel Pin":"📌 Add Note"}
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*,.pdf" style={{display:"none"}} onChange={e=>handleDrawingUpload(e.target.files[0])}/>
              <button className="btn-ghost btn-sm" onClick={()=>fileRef.current?.click()}>
                {drawing?"Replace Drawing":"Upload Drawing"}
              </button>
            </div>
          </div>

          {!drawing ? (
            <div className="upload-zone" onClick={()=>fileRef.current?.click()}>
              <div style={{fontSize:36,marginBottom:10,opacity:0.3}}>📋</div>
              <div style={{fontSize:12,color:"var(--text3)",lineHeight:1.6}}>
                <span style={{color:"var(--gold)"}}>Upload</span> the architectural drawing for this project<br/>
                It will be stored here permanently and can be annotated
              </div>
            </div>
          ) : (
            <>
              {addingAnnotation && (
                <div style={{padding:"8px 12px",background:"rgba(196,163,90,0.08)",borderRadius:6,marginBottom:10,fontSize:11,color:"var(--gold)"}}>
                  📌 Click anywhere on the drawing to drop a pin
                </div>
              )}
              <div ref={containerRef} style={{position:"relative",borderRadius:8,overflow:"hidden",border:"1px solid var(--border)",cursor:addingAnnotation?"crosshair":"default"}}
                onClick={e=>addingAnnotation&&addAnnotationPin(e,containerRef)}>
                <img src={drawing.src} alt="Drawing" style={{width:"100%",display:"block",background:"#080a09",objectFit:"contain",maxHeight:480}}/>

                {/* Existing pins */}
                {pins.map(pin=>(
                  <div key={pin.id} style={{position:"absolute",left:`${pin.x}%`,top:`${pin.y}%`,transform:"translate(-50%,-100%)",zIndex:10}}
                    onClick={e=>{e.stopPropagation();setSelectedPin(selectedPin?.id===pin.id?null:pin);}}>
                    <div style={{width:24,height:24,background:selectedPin?.id===pin.id?"var(--gold)":"var(--red)",borderRadius:"50% 50% 50% 0",transform:"rotate(-45deg)",border:"2px solid white",boxShadow:"0 2px 8px rgba(0,0,0,0.4)",cursor:"pointer"}}/>
                    {selectedPin?.id===pin.id&&(
                      <div style={{position:"absolute",bottom:"130%",left:"50%",transform:"translateX(-50%)",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:7,padding:"10px 12px",minWidth:200,zIndex:20,boxShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>
                        <div style={{fontSize:12,color:"var(--text)",marginBottom:5,lineHeight:1.4}}>{pin.note}</div>
                        <div style={{fontSize:9,color:"var(--text3)"}}>{pin.author} · {fDate(pin.date)}</div>
                        <button className="btn-danger" style={{marginTop:7,fontSize:9,padding:"2px 8px"}} onClick={()=>deletePin(pin.id)}>Remove</button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Pending pin */}
                {pendingPin&&(
                  <div style={{position:"absolute",left:`${pendingPin.x}%`,top:`${pendingPin.y}%`,transform:"translate(-50%,-100%)",zIndex:15}}>
                    <div style={{width:24,height:24,background:"var(--gold)",borderRadius:"50% 50% 50% 0",transform:"rotate(-45deg)",border:"2px solid white",animation:"pulse 1s infinite"}}/>
                  </div>
                )}
              </div>

              {/* Pin note input */}
              {pendingPin&&(
                <div style={{marginTop:10,display:"flex",gap:7}}>
                  <input className="fi" placeholder="Note for this location…" value={pinNote} onChange={e=>setPinNote(e.target.value)} onKeyDown={e=>e.key==="Enter"&&savePin()} style={{flex:1}}/>
                  <button className="btn btn-sm" onClick={savePin} disabled={!pinNote.trim()}>Save Pin</button>
                  <button className="btn-ghost btn-sm" onClick={()=>{setPendingPin(null);setPinNote("");}}>✕</button>
                </div>
              )}

              <div style={{marginTop:10,fontSize:10,color:"var(--text3)"}}>{drawing.name} · {pins.length} annotation{pins.length!==1?"s":""}</div>
            </>
          )}
        </div>

        {/* Annotations list */}
        {pins.length>0&&(
          <div className="card">
            <div className="card-t">Annotations ({pins.length})</div>
            {pins.map((pin,i)=>(
              <div key={pin.id} className="data-row">
                <div style={{width:22,height:22,background:"var(--red)",borderRadius:"50% 50% 50% 0",transform:"rotate(-45deg)",flexShrink:0,border:"1.5px solid rgba(255,255,255,0.2)"}}/>
                <div className="d-info">
                  <div className="d-name">{pin.note}</div>
                  <div className="d-meta">{pin.author} · {fDate(pin.date)}</div>
                </div>
                <button className="btn-danger" onClick={()=>deletePin(pin.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function ThreeDTab({projId}) {
    const proj = projects.find(p=>p.id===projId);
    const drawing = projectDrawings[projId];
    const rooms = roomData[projId] || [];
    const [view3D, setView3D] = useState("plan"); // plan | isometric
    const [editingRooms, setEditingRooms] = useState(false);
    const [rotX, setRotX] = useState(45);
    const [rotZ, setRotZ] = useState(30);
    const canvasRef = useRef(null);

    // Scale factor: feet to pixels
    const SCALE = 8;
    const WALL_H = 60; // isometric wall height px

    // Compute bounding box
    const maxX = rooms.reduce((m,r)=>Math.max(m,(r.xPos||0)+(r.widthFt||10)),0);
    const maxY = rooms.reduce((m,r)=>Math.max(m,(r.yPos||0)+(r.lengthFt||10)),0);
    const canvasW = Math.max(maxX*SCALE+60, 400);
    const canvasH = Math.max(maxY*SCALE+60, 300);

    // Isometric projection
    function isoX(fx,fy) { return (fx-fy)*Math.cos(Math.PI/6)*SCALE+canvasW/2; }
    function isoY(fx,fy,fz=0) { return (fx+fy)*Math.sin(Math.PI/6)*SCALE - fz*0.6 + 80; }

    return (
      <div>
        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div className="card-t" style={{margin:0}}>3D Floor Plan</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              <div style={{display:"flex",background:"var(--bg3)",borderRadius:6,padding:3,gap:3}}>
                <button style={{padding:"5px 10px",borderRadius:4,border:"none",background:view3D==="plan"?"var(--gold)":"none",color:view3D==="plan"?"#000":"var(--text2)",fontSize:11,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:600}} onClick={()=>setView3D("plan")}>Floor Plan</button>
                <button style={{padding:"5px 10px",borderRadius:4,border:"none",background:view3D==="isometric"?"var(--gold)":"none",color:view3D==="isometric"?"#000":"var(--text2)",fontSize:11,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:600}} onClick={()=>setView3D("isometric")}>3D View</button>
              </div>
              {rooms.length>0&&<button className="btn-ghost btn-sm" onClick={()=>setEditingRooms(!editingRooms)}>{editingRooms?"Done Editing":"✏️ Edit Rooms"}</button>}
            </div>
          </div>

          {!drawing&&rooms.length===0&&(
            <div className="empty-s">
              <div style={{fontSize:40,opacity:0.3}}>🏗️</div>
              <div style={{marginTop:10,fontSize:12,lineHeight:1.6}}>Upload a drawing in the Drawings tab first.<br/>Then generate the 3D model from it.</div>
            </div>
          )}

          {drawing&&rooms.length===0&&(
            <div style={{textAlign:"center",padding:"28px 16px"}}>
              <div style={{fontSize:36,marginBottom:12,opacity:0.4}}>🏗️</div>
              <p style={{fontSize:12,color:"var(--text2)",marginBottom:16,lineHeight:1.6}}>The AI will analyze your drawing and extract rooms with dimensions to generate the 3D model.</p>
              <button className="btn" onClick={extractRoomsFromDrawing} disabled={analyzing3D}>
                {analyzing3D?<span className="pulse">ANALYZING DRAWING…</span>:"GENERATE 3D FROM DRAWING"}
              </button>
            </div>
          )}

          {rooms.length>0&&(
            <>
              {/* SVG visualization */}
              <div style={{background:"#080a09",borderRadius:8,overflow:"auto",border:"1px solid var(--border)",marginBottom:14}}>
                {view3D==="plan"&&(
                  <svg width={canvasW} height={canvasH} style={{display:"block",minWidth:"100%"}}>
                    <defs>
                      <pattern id="grid" width={SCALE} height={SCALE} patternUnits="userSpaceOnUse">
                        <path d={`M ${SCALE} 0 L 0 0 0 ${SCALE}`} fill="none" stroke="rgba(196,163,90,0.06)" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)"/>
                    {rooms.map(r=>{
                      const x=(r.xPos||0)*SCALE+30;
                      const y=(r.yPos||0)*SCALE+30;
                      const w=(r.widthFt||10)*SCALE;
                      const h=(r.lengthFt||10)*SCALE;
                      const col=ROOM_COLORS[r.type]||"#888";
                      return (
                        <g key={r.id}>
                          <rect x={x} y={y} width={w} height={h} fill={col+"22"} stroke={col} strokeWidth="2" rx="1"/>
                          <text x={x+w/2} y={y+h/2-6} textAnchor="middle" fill={col} fontSize="10" fontFamily="'Syne',sans-serif" fontWeight="700">{r.name}</text>
                          <text x={x+w/2} y={y+h/2+8} textAnchor="middle" fill={col+"99"} fontSize="8" fontFamily="'DM Mono',monospace">{r.widthFt}×{r.lengthFt} ft</text>
                        </g>
                      );
                    })}
                  </svg>
                )}

                {view3D==="isometric"&&(
                  <svg width={canvasW+100} height={canvasH+WALL_H+60} style={{display:"block",minWidth:"100%"}}>
                    <rect width="100%" height="100%" fill="#080a09"/>
                    {/* Draw rooms back to front for correct overlap */}
                    {[...rooms].sort((a,b)=>(b.xPos||0)+(b.yPos||0)-(a.xPos||0)-(a.yPos||0)).map(r=>{
                      const x=r.xPos||0, y=r.yPos||0;
                      const w=r.widthFt||10, l=r.lengthFt||10;
                      const col=ROOM_COLORS[r.type]||"#888";
                      const wallH=WALL_H;
                      // 4 corners
                      const tl=[isoX(x,y),    isoY(x,y,wallH)];
                      const tr=[isoX(x+w,y),  isoY(x+w,y,wallH)];
                      const br=[isoX(x+w,y+l),isoY(x+w,y+l,wallH)];
                      const bl=[isoX(x,y+l),  isoY(x,y+l,wallH)];
                      // Floor corners
                      const ftl=[isoX(x,y),    isoY(x,y,0)];
                      const ftr=[isoX(x+w,y),  isoY(x+w,y,0)];
                      const fbr=[isoX(x+w,y+l),isoY(x+w,y+l,0)];
                      const fbl=[isoX(x,y+l),  isoY(x,y+l,0)];
                      const pts=p=>`${p[0]},${p[1]}`;
                      return (
                        <g key={r.id}>
                          {/* Left wall */}
                          <polygon points={`${pts(tl)} ${pts(bl)} ${pts(fbl)} ${pts(ftl)}`} fill={col+"44"} stroke={col+"88"} strokeWidth="1"/>
                          {/* Right wall */}
                          <polygon points={`${pts(tr)} ${pts(br)} ${pts(fbr)} ${pts(ftr)}`} fill={col+"33"} stroke={col+"88"} strokeWidth="1"/>
                          {/* Roof/floor */}
                          <polygon points={`${pts(tl)} ${pts(tr)} ${pts(br)} ${pts(bl)}`} fill={col+"66"} stroke={col} strokeWidth="1.5"/>
                          {/* Room label on roof */}
                          <text x={(tl[0]+tr[0]+br[0]+bl[0])/4} y={(tl[1]+tr[1]+br[1]+bl[1])/4+4}
                            textAnchor="middle" fill="white" fontSize="9" fontFamily="'Syne',sans-serif" fontWeight="700">{r.name}</text>
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>

              {/* Room legend */}
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                {rooms.map(r=>(
                  <span key={r.id} style={{padding:"3px 9px",borderRadius:12,background:ROOM_COLORS[r.type]+"22",border:`1px solid ${ROOM_COLORS[r.type]}44`,fontSize:10,color:ROOM_COLORS[r.type],fontFamily:"'Syne',sans-serif"}}>{r.name}</span>
                ))}
              </div>

              {/* Share button */}
              <div style={{display:"flex",gap:7}}>
                <button className="btn" onClick={()=>setShow3DShare(true)}>Share 3D with Client</button>
                <button className="btn-ghost" onClick={()=>{setRoomData(prev=>({...prev,[projId]:[]}));extractRoomsFromDrawing();}}>Regenerate</button>
              </div>
            </>
          )}
        </div>

        {/* Edit rooms table */}
        {editingRooms&&rooms.length>0&&(
          <div className="card">
            <div className="card-t">Edit Room Dimensions</div>
            <p style={{fontSize:11,color:"var(--text2)",marginBottom:12}}>Correct any dimensions the AI got wrong. Changes update the visualization instantly.</p>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr>
                    {["Room","Type","Width (ft)","Length (ft)"].map(h=><th key={h} style={{padding:"7px 10px",textAlign:"left",color:"var(--text3)",fontSize:10,letterSpacing:1,textTransform:"uppercase",fontFamily:"'Syne',sans-serif",borderBottom:"1px solid var(--border)"}}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(r=>(
                    <tr key={r.id}>
                      <td style={{padding:"7px 10px",color:"var(--text)"}}>{r.name}</td>
                      <td style={{padding:"7px 10px"}}>
                        <select className="fs" value={r.type} onChange={e=>updateRoom(projId,r.id,"type",e.target.value)} style={{padding:"4px 6px",fontSize:11,width:"auto"}}>
                          {Object.keys(ROOM_COLORS).map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                        </select>
                      </td>
                      <td style={{padding:"7px 10px"}}><input className="fi" type="number" value={r.widthFt} onChange={e=>updateRoom(projId,r.id,"widthFt",e.target.value)} style={{width:70,padding:"4px 6px"}}/></td>
                      <td style={{padding:"7px 10px"}}><input className="fi" type="number" value={r.lengthFt} onChange={e=>updateRoom(projId,r.id,"lengthFt",e.target.value)} style={{width:70,padding:"4px 6px"}}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3D Share modal */}
        {show3DShare&&(
          <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setShow3DShare(false);}}>
            <div className="modal" style={{textAlign:"center"}}>
              <div className="modal-title">Share 3D View with Client</div>
              <div style={{fontSize:48,marginBottom:16}}>🏗️</div>
              <p style={{fontSize:12,color:"var(--text2)",marginBottom:20,lineHeight:1.6}}>
                In the full product, this generates a unique shareable link your client can open on any device to interact with the 3D floor plan.
              </p>
              <div style={{background:"var(--bg3)",borderRadius:7,padding:12,marginBottom:20,fontFamily:"'DM Mono',monospace",fontSize:12,color:"var(--gold)",letterSpacing:1}}>
                taameer.ai/view/3d/{proj?.id || "project"}/abc123
              </div>
              <div style={{display:"flex",gap:7,justifyContent:"center"}}>
                <button className="btn" onClick={()=>setShow3DShare(false)}>Copy Link</button>
                <button className="btn-ghost" onClick={()=>setShow3DShare(false)}>Share via WhatsApp</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function ReportTab({proj,sp}) {
    const [opts,setOpts]=useState({photos:true,timeline:true,costs:false,co:true});
    const [note,setNote]=useState("");
    const [gen,setGen]=useState(false);
    const allPhotos=(proj.checklistLogs||[]).flatMap(l=>l.items.filter(i=>i.photo).map(i=>i.photo));
    return (
      <div>
        <div className="card">
          <div className="card-t">Report Settings</div>
          <p style={{fontSize:11,color:"var(--text2)",marginBottom:14,lineHeight:1.5}}>Select what to share with the client. Everything else stays internal.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
            {[["photos","📸 Site photos from checklist"],["timeline","📅 Phase progress & timeline"],["costs","💰 Cost summary (budget vs actual)"],["co","📋 Change orders summary"]].map(([k,label])=>(
              <label key={k} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
                <input type="checkbox" checked={opts[k]} onChange={e=>setOpts(o=>({...o,[k]:e.target.checked}))} style={{accentColor:"var(--gold)",width:15,height:15}}/>
                <span style={{fontSize:12,color:"var(--text)"}}>{label}</span>
              </label>
            ))}
          </div>
          <div style={{marginBottom:14}}><div className="fl">Note to Client</div><textarea className="fi" rows={2} placeholder="Grey structure progressing well…" value={note} onChange={e=>setNote(e.target.value)} style={{resize:"vertical"}}/></div>
          <button className="btn" onClick={()=>setGen(true)}>GENERATE REPORT</button>
        </div>
        {gen&&(
          <div className="card">
            <div className="card-t">Report Preview</div>
            <div className="report-box">
              <div className="rep-hdr">
                <div><div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:700,color:"#1a1a1a"}}>Your Construction Co.</div><div style={{fontSize:12,color:"#666",marginTop:3}}>Progress Report — {proj.name}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontWeight:700,color:"#C4A35A",fontSize:13,fontFamily:"'Syne',sans-serif"}}>TaameerAI</div><div style={{fontSize:11,color:"#999"}}>{fDate(new Date().toISOString().split("T")[0])}</div></div>
              </div>
              <div style={{marginBottom:16}}><div className="rep-sec-t">Project Overview</div>
                {[["Client",proj.client],["Location",proj.location],["Contract",fPKR(proj.contractValue)],["Start Date",fDate(proj.startDate)]].map(([k,v])=><div key={k} className="rep-row"><span style={{color:"#666"}}>{k}</span><span style={{fontWeight:600}}>{v}</span></div>)}
              </div>
              {opts.timeline&&<div style={{marginBottom:16}}><div className="rep-sec-t">Phase Progress</div>{proj.phases.map(p=><div key={p.key} className="rep-row"><span style={{color:"#666"}}>{p.label}</span><span style={{fontWeight:600,color:p.status==="done"?"#58A878":p.status==="active"?"#C4A35A":"#aaa"}}>{p.status==="done"?"✓ Complete":p.status==="active"?`${p.progress||0}% In Progress`:"Pending"}</span></div>)}</div>}
              {opts.costs&&<div style={{marginBottom:16}}><div className="rep-sec-t">Cost Summary</div><div className="rep-row"><span style={{color:"#666"}}>Contract</span><span style={{fontWeight:600}}>{fPKR(proj.contractValue)}</span></div><div className="rep-row"><span style={{color:"#666"}}>Spent</span><span style={{fontWeight:600}}>{fPKR(sp)}</span></div><div className="rep-row"><span style={{color:"#666"}}>Remaining</span><span style={{fontWeight:600,color:"#58A878"}}>{fPKR(proj.contractValue-sp)}</span></div></div>}
              {opts.co&&(proj.changeOrders||[]).length>0&&<div style={{marginBottom:16}}><div className="rep-sec-t">Change Orders</div>{proj.changeOrders.map(co=><div key={co.id} className="rep-row"><span style={{color:"#666"}}>{co.description}</span><span style={{fontWeight:600}}>{co.amount>0?"+":""}{fPKR(co.amount)}</span></div>)}</div>}
              {opts.photos&&allPhotos.length>0&&<div style={{marginBottom:16}}><div className="rep-sec-t">Site Photos</div><div className="rep-photos">{allPhotos.slice(0,6).map((ph,i)=><img key={i} src={ph} alt="" style={{width:"100%",aspectRatio:"4/3",objectFit:"cover",borderRadius:4,border:"1px solid #eee"}}/>)}</div></div>}
              {note&&<div><div className="rep-sec-t">Notes</div><p style={{fontSize:12,color:"#444",lineHeight:1.5}}>{note}</p></div>}
            </div>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button className="btn">Share via WhatsApp</button>
              <button className="btn-ghost">Download PDF</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function QuoteView() {
    const steps=["Drawing Upload","Project Details","Review Rates","Generated Quote"];
    return (
      <div className="page fade-in">
        <button className="back-btn" onClick={()=>setView("dashboard")}>← Dashboard</button>
        <div className="page-title syne">AI Quoting Engine</div>
        <div className="page-sub">Upload drawings for AI analysis, or enter details manually</div>
        <div className="step-row">{steps.map((s,i)=><div key={i} className={`step ${i<quoteStep-1?"done":i===quoteStep-1?"active":""}`}>{s}</div>)}</div>

        {quoteStep===1&&(
          <div className="card">
            <div className="card-t">Upload Architectural Drawing</div>
            <p style={{fontSize:11,color:"var(--text2)",marginBottom:14,lineHeight:1.5}}>Upload floor plan or structural drawing. AI will extract dimensions, rooms, and recommend a cost structure. Or skip to enter manually.</p>
            <input ref={drawingRef} type="file" accept="image/*,.pdf" style={{display:"none"}} onChange={e=>handleDrawingFile(e.target.files[0])}/>
            {!quoteDrawingPreview?(
              <div className="upload-zone" onClick={()=>drawingRef.current?.click()}>
                <div style={{fontSize:32,marginBottom:10,opacity:0.35}}>📋</div>
                <div style={{fontSize:12,color:"var(--text3)",lineHeight:1.6}}><span style={{color:"var(--gold)"}}>Tap to upload</span> floor plan or structural drawing<br/>JPG, PNG, or PDF</div>
              </div>
            ):(
              <>
                <div style={{position:"relative",borderRadius:9,overflow:"hidden",marginBottom:12,border:"1px solid var(--border)"}}>
                  <img src={quoteDrawingPreview} alt="" style={{width:"100%",maxHeight:260,objectFit:"contain",background:"#080a09"}}/>
                  <div style={{position:"absolute",top:8,right:8,background:"rgba(14,17,23,0.85)",padding:"2px 9px",borderRadius:20,fontSize:9,color:"var(--gold)"}}>{quoteDrawing?.name}</div>
                </div>
                {!aiResult&&<div style={{display:"flex",gap:7}}>
                  <button className="btn" style={{flex:1}} onClick={analyzeDrawing} disabled={analyzing}>{analyzing?<span className="pulse">ANALYZING…</span>:"ANALYZE WITH AI"}</button>
                  <button className="btn-ghost" onClick={()=>{setQuoteDrawing(null);setQuoteDrawingPreview(null);}}>Clear</button>
                </div>}
                {aiResult&&!aiResult.error&&(
                  <div style={{marginTop:12}}>
                    <div className="card-t">AI Analysis — <span style={{color:aiResult.confidence==="high"?"#58A878":"var(--gold)"}}>{aiResult.confidence} confidence</span></div>
                    <div className="ai-box">
                      {[["Covered Area",`${aiResult.estimated_covered_area_sqft?.toLocaleString()} sq ft`],["Floors",aiResult.floors_detected],["Rooms",`${aiResult.rooms?.length||0}`],["Doors/Windows",`${aiResult.doors}/${aiResult.windows}`],["Bathrooms",aiResult.bathrooms],["Elec Points",`~${aiResult.electrical_points}`],["Basement",aiResult.has_basement?"Yes":"No"],["Recommended",BUILD_TYPES[aiResult.recommended_type]?.label||aiResult.recommended_type]].map(([k,v])=><div key={k} className="ai-row"><span className="ai-k">{k}</span><span className="ai-v">{v}</span></div>)}
                    </div>
                    {aiResult.special_features?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>{aiResult.special_features.map((f,i)=><span key={i} style={{padding:"2px 9px",borderRadius:20,background:"var(--gdim)",fontSize:9,color:"var(--gold)"}}>{f}</span>)}</div>}
                    {aiResult.notes&&<p style={{fontSize:10,color:"var(--text3)",fontStyle:"italic",lineHeight:1.5}}>{aiResult.notes}</p>}
                  </div>
                )}
                {aiResult?.error&&<p style={{color:"var(--red)",fontSize:11,marginTop:8}}>{aiResult.notes}</p>}
              </>
            )}
            <div style={{marginTop:14}}><button className="btn" style={{width:"100%"}} onClick={()=>setQuoteStep(2)}>{quoteDrawingPreview&&aiResult?"Continue with AI Data →":"Enter Details Manually →"}</button></div>
          </div>
        )}

        {quoteStep===2&&(
          <div className="card">
            <div className="card-t">Project Details</div>
            <div className="form-grid">
              <div className="form-full"><div className="fl">Project Name</div><input className="fi" placeholder="e.g. DHA Phase 6 Villa" value={quoteForm.name} onChange={e=>setQuoteForm(f=>({...f,name:e.target.value}))}/></div>
              <div><div className="fl">Client Name</div><input className="fi" value={quoteForm.client} onChange={e=>setQuoteForm(f=>({...f,client:e.target.value}))}/></div>
              <div><div className="fl">Location</div><input className="fi" placeholder="DHA Phase 5, Lahore" value={quoteForm.location} onChange={e=>setQuoteForm(f=>({...f,location:e.target.value}))}/></div>
              <div><div className="fl">Build Type</div>
                <select className="fs" value={quoteForm.type} onChange={e=>setQuoteForm(f=>({...f,type:e.target.value}))}>
                  {Object.entries(BUILD_TYPES).map(([k,v])=><option key={k} value={k}>{v.label} — ₨{v.perSqFt.toLocaleString()}/sqft</option>)}
                </select>
              </div>
              <div><div className="fl">Covered Area (sq ft)</div><input className="fi" type="number" placeholder="e.g. 4800" value={quoteForm.area} onChange={e=>setQuoteForm(f=>({...f,area:e.target.value}))}/></div>
              <div><div className="fl">Floors</div>
                <select className="fs" value={quoteForm.floors} onChange={e=>setQuoteForm(f=>({...f,floors:e.target.value}))}>
                  <option value="1">Ground Only</option><option value="2">Ground + 1</option><option value="3">Ground + 2</option><option value="4">Ground + 3</option>
                </select>
              </div>
              <div className="form-full"><div className="fl">Notes</div><textarea className="fi" rows={2} placeholder="Basement, special features…" value={quoteForm.notes} onChange={e=>setQuoteForm(f=>({...f,notes:e.target.value}))} style={{resize:"vertical"}}/></div>
            </div>
            <div style={{display:"flex",gap:7,marginTop:14}}>
              <button className="btn-ghost" onClick={()=>setQuoteStep(1)}>← Back</button>
              <button className="btn" style={{flex:1}} disabled={!quoteForm.name||!quoteForm.area} onClick={()=>setQuoteStep(3)}>Review Rates →</button>
            </div>
          </div>
        )}

        {quoteStep===3&&(
          <div className="card">
            <div className="card-t">Review & Edit Rates</div>
            <p style={{fontSize:11,color:"var(--text2)",marginBottom:14,lineHeight:1.5}}>Current Lahore market rates Q1 2026. Edit any rate to reflect your supplier relationships.</p>
            {["cement","steel","bricks","sand","crush","labor"].map(cat=>(
              <div key={cat} style={{marginBottom:14}}>
                <div style={{fontSize:9,color:"var(--text3)",letterSpacing:1.5,textTransform:"uppercase",fontFamily:"'Syne',sans-serif",marginBottom:7,paddingBottom:5,borderBottom:"1px solid var(--border)"}}>{cat}</div>
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
            <div style={{display:"flex",gap:7,marginTop:14}}>
              <button className="btn-ghost" onClick={()=>setQuoteStep(2)}>← Back</button>
              <button className="btn" style={{flex:1}} onClick={generateQuote}>GENERATE QUOTE →</button>
            </div>
          </div>
        )}

        {quoteStep===4&&generatedQuote&&(
          <div className="fade-in">
            <div className="card" style={{border:"1px solid rgba(196,163,90,0.25)"}}>
              <div style={{textAlign:"center",padding:"18px 0 20px"}}>
                <div style={{fontSize:10,color:"var(--text3)",letterSpacing:2,textTransform:"uppercase",marginBottom:7}}>Total Estimated Cost</div>
                <div className="mono" style={{fontSize:36,fontWeight:600,color:"var(--gold)"}}>{fPKR(generatedQuote.total)}</div>
                <div style={{fontSize:11,color:"var(--text3)",marginTop:5}}>{generatedQuote.area?.toLocaleString()} sq ft · {generatedQuote.flrs} floor{generatedQuote.flrs>1?"s":""} · {generatedQuote.totalDays} days · Valid {fDate(generatedQuote.validUntil)}</div>
              </div>
              <div className="card-t">Phase Breakdown</div>
              {generatedQuote.phases.map((p,i)=>(
                <div key={p.key} className="phase-row">
                  <div className="p-num">{i+1}</div>
                  <div className="p-info"><div className="p-name">{p.label}</div><div className="p-meta">~{p.days} days · Due {fDate(p.expectedEnd)}</div></div>
                  <div className="d-val">{fPKR(p.budget)}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:7}}>
              <button className="btn-ghost" onClick={()=>setQuoteStep(1)}>Start Over</button>
              <button className="btn" style={{flex:1}} onClick={convertToProject}>CONVERT TO PROJECT →</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function SupervisorView() {
    const p=proj||projects[0];
    if (!p) return <div className="page"><div className="page-title syne">No Active Project</div></div>;
    const checklist=getChecklist(supPhase,p.id);
    const isUr=supLang==="ur";
    const urDir=isUr?{direction:"rtl",textAlign:"right",fontFamily:"'Noto Nastaliq Urdu','Noto Naskh Arabic',serif"}:{};
    return (
      <div className="page fade-in">
        <button className="back-btn" onClick={()=>setView(activeProject?"project":"dashboard")}>← {activeProject?"Project":"Dashboard"}</button>

        {/* Header row with lang toggle */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
          <div>
            <div className="page-title syne" style={isUr?{fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:20}:{}}>{isUr?UR.ui.dailyLog:"Daily Site Log"}</div>
            <div className="page-sub">{p.name} · {new Date().toLocaleDateString("en-PK",{weekday:"long",day:"numeric",month:"long"})}</div>
          </div>
          <div style={{display:"flex",gap:7,marginTop:4,flexShrink:0}}>
            {/* Language toggle */}
            <div style={{display:"flex",background:"var(--bg3)",borderRadius:6,padding:3,gap:3}}>
              <button style={{padding:"5px 10px",borderRadius:4,border:"none",background:!isUr?"var(--gold)":"none",color:!isUr?"#000":"var(--text2)",fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:600,cursor:"pointer"}} onClick={()=>setSupLang("en")}>EN</button>
              <button style={{padding:"5px 10px",borderRadius:4,border:"none",background:isUr?"var(--gold)":"none",color:isUr?"#000":"var(--text2)",fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:13,cursor:"pointer"}} onClick={()=>setSupLang("ur")}>اردو</button>
            </div>
            {role==="owner"&&<button className="btn-ghost btn-sm" onClick={()=>{setClEditorOpen(true);setClEditorPhase(supPhase);setClEditorScope("project");}}>{isUr?UR.ui.editChecklist:"✏️ Edit Checklist"}</button>}
          </div>
        </div>

        {/* Phase selector */}
        <div className="card">
          <div className="card-t" style={isUr?{...urDir,letterSpacing:0}:{}}>{isUr?UR.ui.activePhase:"Active Phase"}</div>
          <div className="phase-chips" style={isUr?{direction:"rtl"}:{}}>
            {PHASES.map(ph=>(
              <button key={ph.key} className={`ph-chip ${supPhase===ph.key?"on":""}`} onClick={()=>setSupPhase(ph.key)}
                style={isUr?{fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:13}:{}}>
                {isUr?UR.phases[ph.key]:ph.label.split("(")[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexDirection:isUr?"row-reverse":"row"}}>
            <div className="card-t" style={{margin:0,...(isUr?{letterSpacing:0,fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:14}:{})}}>{isUr?UR.ui.checklist:"Checklist"} — {tPhase(supPhase)}</div>
            <span style={{fontSize:9,color:"var(--text3)"}}>{checklist.length} {isUr?UR.ui.items:"items"}</span>
          </div>
          <p style={{fontSize:10,color:"var(--text3)",marginBottom:12,...urDir}}>{isUr?`${UR.ui.yesHint} · ${UR.ui.noHint}`:"Yes = take photo if required · No = select reason"}</p>

          {checklist.map((item,i)=>{
            const s=checkState[item.id]||{};
            const isYes=s.val==="yes", isNo=s.val==="no";
            const hasSubs=(item.subtasks||[]).length>0;
            const allSubsDone=!hasSubs||(item.subtasks||[]).every(sub=>{
              const ss=(s.subs||{})[sub.id]||{};
              return ss.val==="yes"&&(!sub.requirePhoto||ss.photo);
            });
            const fileRef=useRef(null);
            return (
              <div key={item.id} className="chk-item" style={isUr?{direction:"rtl"}:{}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7,flexDirection:isUr?"row-reverse":"row"}}>
                  <div className="chk-q" style={{margin:0,flex:1,...(isUr?{fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:15,lineHeight:1.8}:{})}}>{i+1}. {tItem(item.label)}</div>
                  <div style={{display:"flex",gap:3,marginLeft:isUr?0:7,marginRight:isUr?7:0,flexShrink:0}}>
                    {item.requirePhoto&&<span style={{fontSize:8,color:"var(--gold)",padding:"1px 5px",background:"var(--gdim)",borderRadius:8}}>📸</span>}
                    {hasSubs&&<span style={{fontSize:8,color:"var(--text3)",padding:"1px 5px",background:"var(--bg)",borderRadius:8}}>{item.subtasks.length} {isUr?UR.ui.subTask:"sub"}</span>}
                  </div>
                </div>

                {hasSubs&&(
                  <div className="sub-block" style={isUr?{borderLeft:"none",borderRight:"2px solid rgba(196,163,90,0.12)",paddingLeft:0,paddingRight:10}:{}}>
                    {(item.subtasks||[]).map((sub,si)=>{
                      const ss=(s.subs||{})[sub.id]||{};
                      const subYes=ss.val==="yes", subNo=ss.val==="no";
                      const subFileRef=useRef(null);
                      return (
                        <div key={sub.id} className="sub-item" style={isUr?{direction:"rtl"}:{}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,flexDirection:isUr?"row-reverse":"row"}}>
                            <span style={{fontSize:11,color:"var(--text2)",...(isUr?{fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:13}:{})}}>{i+1}.{si+1} {tItem(sub.label)}</span>
                            {sub.requirePhoto&&<span style={{fontSize:8,color:"var(--gold)"}}>📸</span>}
                          </div>
                          <div className="chk-btns" style={{gap:5,flexDirection:isUr?"row-reverse":"row"}}>
                            <button className={`chk-btn chk-yes ${subYes?"on":""}`} style={{padding:"5px",fontSize:isUr?14:10,...(isUr?{fontFamily:"'Noto Nastaliq Urdu',serif"}:{})}}
                              onClick={()=>setCheckState(prev=>({...prev,[item.id]:{...prev[item.id],subs:{...(prev[item.id]?.subs||{}),[sub.id]:{...((prev[item.id]?.subs||{})[sub.id]||{}),val:"yes"}}}}))}>
                              {isUr?UR.ui.yes:"✓ Yes"}</button>
                            <button className={`chk-btn chk-no ${subNo?"on":""}`} style={{padding:"5px",fontSize:isUr?14:10,...(isUr?{fontFamily:"'Noto Nastaliq Urdu',serif"}:{})}}
                              onClick={()=>setCheckState(prev=>({...prev,[item.id]:{...prev[item.id],subs:{...(prev[item.id]?.subs||{}),[sub.id]:{...((prev[item.id]?.subs||{})[sub.id]||{}),val:"no"}}}}))}>
                              {isUr?UR.ui.no:"✗ No"}</button>
                          </div>
                          {subYes&&sub.requirePhoto&&(
                            <div className="photo-req" style={{marginTop:5,flexDirection:isUr?"row-reverse":"row"}}>
                              <input ref={subFileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}}
                                onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setCheckState(prev=>({...prev,[item.id]:{...prev[item.id],subs:{...(prev[item.id]?.subs||{}),[sub.id]:{...((prev[item.id]?.subs||{})[sub.id]||{}),photo:ev.target.result}}}}));r.readAsDataURL(f);}}/>
                              {ss.photo?<img src={ss.photo} alt="" className="photo-thumb" onClick={()=>setLightbox(ss.photo)}/>:
                                <button className="photo-btn" style={isUr?{fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:13}:{}} onClick={()=>subFileRef.current?.click()}>📸 {isUr?"تصویر لیں":"Take Photo"}</button>}
                              {!ss.photo&&<span style={{fontSize:9,color:"var(--red)",...(isUr?{fontFamily:"'Noto Nastaliq Urdu',serif"}:{})}}>{isUr?UR.ui.photoRequired:"Required"}</span>}
                            </div>
                          )}
                          {subNo&&(
                            <div className="reason-chips" style={{marginTop:5,flexDirection:isUr?"row-reverse":"row",flexWrap:"wrap"}}>
                              {DELAY_REASONS.slice(0,6).map((r,ri)=><button key={r} className={`r-chip ${ss.reason===r?"on":""}`}
                                style={isUr?{fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:11}:{}}
                                onClick={()=>setCheckState(prev=>({...prev,[item.id]:{...prev[item.id],subs:{...(prev[item.id]?.subs||{}),[sub.id]:{...((prev[item.id]?.subs||{})[sub.id]||{}),reason:r}}}}))}>
                                {tReason(r,ri)}</button>)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {hasSubs&&!allSubsDone&&<div style={{fontSize:9,color:"var(--gold)",marginTop:3,...(isUr?{fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:11,textAlign:"right"}:{})}}>{isUr?UR.ui.subtasksDone:"Complete all sub-tasks to mark Yes"}</div>}
                  </div>
                )}

                <div className="chk-btns" style={{flexDirection:isUr?"row-reverse":"row"}}>
                  <button className={`chk-btn chk-yes ${isYes?"on":""}`}
                    style={{opacity:hasSubs&&!allSubsDone?0.4:1,...(isUr?{fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:15}:{})}}
                    disabled={hasSubs&&!allSubsDone}
                    onClick={()=>setCheckState(prev=>({...prev,[item.id]:{...prev[item.id],val:"yes"}}))}>{isUr?UR.ui.yes:"✓ Yes"}</button>
                  <button className={`chk-btn chk-no ${isNo?"on":""}`}
                    style={isUr?{fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:15}:{}}
                    onClick={()=>setCheckState(prev=>({...prev,[item.id]:{...prev[item.id],val:"no"}}))}>{isUr?UR.ui.no:"✗ No"}</button>
                </div>

                {isYes&&item.requirePhoto&&(
                  <div className="photo-req" style={{flexDirection:isUr?"row-reverse":"row"}}>
                    <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>handleCheckPhoto(item.id,e.target.files[0])}/>
                    {s.photo?<img src={s.photo} alt="" className="photo-thumb" onClick={()=>setLightbox(s.photo)}/>:
                      <button className="photo-btn" style={isUr?{fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:13}:{}} onClick={()=>fileRef.current?.click()}>{isUr?UR.ui.takePhoto:"📸 Take Photo (Required)"}</button>}
                    {s.photo&&<span style={{fontSize:10,color:"#58A878",...(isUr?{fontFamily:"'Noto Nastaliq Urdu',serif"}:{})}}>{isUr?UR.ui.photoCaptured:"✓ Captured"}</span>}
                    {!s.photo&&<span style={{fontSize:10,color:"var(--red)",...(isUr?{fontFamily:"'Noto Nastaliq Urdu',serif"}:{})}}>{isUr?UR.ui.photoRequired:"Photo required"}</span>}
                  </div>
                )}
                {isYes&&!item.requirePhoto&&<div style={{fontSize:9,color:"#58A878",marginTop:5,...(isUr?{fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:11,textAlign:"right"}:{})}}>{isUr?UR.ui.complete:"✓ Complete"}</div>}
                {isNo&&(
                  <div style={{marginTop:8}}>
                    <div style={{fontSize:9,color:"var(--text3)",marginBottom:5,...(isUr?{fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:11,textAlign:"right"}:{})}}>{isUr?UR.ui.selectReason:"SELECT REASON"}</div>
                    <div className="reason-chips" style={isUr?{flexDirection:"row-reverse",flexWrap:"wrap"}:{}}>
                      {DELAY_REASONS.map((r,ri)=><button key={r} className={`r-chip ${s.reason===r?"on":""}`}
                        style={isUr?{fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:11}:{}}
                        onClick={()=>setCheckState(prev=>({...prev,[item.id]:{...prev[item.id],reason:r}}))}>{tReason(r,ri)}</button>)}
                    </div>
                    <input className="fi" style={{marginTop:7,fontSize:11,...(isUr?{direction:"rtl",fontFamily:"'Noto Nastaliq Urdu',serif"}:{})}}
                      placeholder={isUr?UR.ui.addNote:"Additional notes…"} value={s.note||""}
                      onChange={e=>setCheckState(prev=>({...prev,[item.id]:{...prev[item.id],note:e.target.value}}))}/>
                  </div>
                )}
              </div>
            );
          })}
          {checklist.length===0&&<div className="empty-s"><div style={{fontSize:28,opacity:0.3}}>📋</div><div style={{marginTop:7,fontSize:12,...(isUr?urDir:{})}}>{isUr?UR.ui.noItems:"No items. Owner can add via Edit Checklist."}</div></div>}
        </div>

        {/* Expense */}
        <div className="card" style={isUr?{direction:"rtl"}:{}}>
          <div className="card-t" style={isUr?{letterSpacing:0,fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:14,textAlign:"right"}:{}}>{isUr?UR.ui.logExpense:"Log Expense"}</div>
          <div className="form-grid">
            <div>
              <div className="fl" style={isUr?{textAlign:"right",letterSpacing:0,fontFamily:"'Noto Nastaliq Urdu',serif"}:{}}>{isUr?UR.ui.category:"Category"}</div>
              <select className="fs" style={isUr?{direction:"rtl",fontFamily:"'Noto Nastaliq Urdu',serif"}:{}} value={expForm.cat} onChange={e=>setExpForm(f=>({...f,cat:e.target.value}))}>
                <option value="material">{isUr?UR.expCats.material:"Material Purchase"}</option>
                <option value="labor">{isUr?UR.expCats.labor:"Labor Payment"}</option>
                <option value="contractor">{isUr?UR.expCats.contractor:"Contractor Payment"}</option>
                <option value="misc">{isUr?UR.expCats.misc:"Miscellaneous"}</option>
              </select>
            </div>
            <div>
              <div className="fl" style={isUr?{textAlign:"right",letterSpacing:0,fontFamily:"'Noto Nastaliq Urdu',serif"}:{}}>{isUr?UR.ui.amount:"Amount (PKR)"}</div>
              <input className="fi" type="number" placeholder="0" value={expForm.amount} style={isUr?{direction:"rtl"}:{}} onChange={e=>setExpForm(f=>({...f,amount:e.target.value}))}/>
            </div>
            <div className="form-full">
              <div className="fl" style={isUr?{textAlign:"right",letterSpacing:0,fontFamily:"'Noto Nastaliq Urdu',serif"}:{}}>{isUr?UR.ui.description:"Description"}</div>
              <input className="fi" placeholder={isUr?"مثلاً: 200 بیگ ڈی جی سیمنٹ":"e.g. 200 bags DG Cement"} value={expForm.desc} style={isUr?{direction:"rtl",fontFamily:"'Noto Nastaliq Urdu',serif"}:{}} onChange={e=>setExpForm(f=>({...f,desc:e.target.value}))}/>
            </div>
          </div>
          <div style={{marginTop:11}}>
            <div className="fl" style={isUr?{textAlign:"right",letterSpacing:0,fontFamily:"'Noto Nastaliq Urdu',serif"}:{}}>{isUr?UR.ui.receiptPhoto:"Receipt Photo (Required)"}</div>
            <input ref={expReceiptRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>handleReceiptPhoto(e.target.files[0])}/>
            <div style={{display:"flex",alignItems:"center",gap:9,marginTop:5,flexDirection:isUr?"row-reverse":"row"}}>
              {expReceipt&&<img src={expReceipt} alt="" style={{width:56,height:56,borderRadius:5,objectFit:"cover",border:"1px solid var(--border)",cursor:"pointer"}} onClick={()=>setLightbox(expReceipt)}/>}
              <button className="photo-btn" style={isUr?{fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:13}:{}} onClick={()=>expReceiptRef.current?.click()}>
                {expReceipt?(isUr?UR.ui.changePhoto:"📸 Change"):(isUr?`📸 ${UR.ui.receiptPhoto}`:"📸 Photo of Receipt (Required)")}
              </button>
              {expReceipt&&<span style={{fontSize:10,color:"#58A878",...(isUr?{fontFamily:"'Noto Nastaliq Urdu',serif"}:{})}}>{isUr?UR.ui.receiptCaptured:"✓ Captured"}</span>}
            </div>
          </div>
        </div>
        <button className="btn" style={{width:"100%",...(isUr?{fontFamily:"'Noto Nastaliq Urdu',serif",fontSize:16,letterSpacing:0}:{})}}
          onClick={()=>{if(!proj)setActiveProject(projects[0].id);submitDailyLog();}}>
          {isUr?UR.ui.submitLog:"SUBMIT DAILY LOG"}
        </button>
      </div>
    );
  }

  function RatesView() {
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
  }

  function ChecklistTemplatesView() {
    return (
      <div className="page fade-in">
        <button className="back-btn" onClick={()=>setView("dashboard")}>← Dashboard</button>
        <div className="page-title syne">Checklist Templates</div>
        <div className="page-sub">Global templates apply to all projects. Per-project overrides take precedence.</div>
        <div className="card">
          <p style={{fontSize:11,color:"var(--text2)",marginBottom:14,lineHeight:1.5}}>Select a phase to view its global template. Click Edit to add, remove, or rename items and sub-tasks.</p>
          <div className="phase-chips" style={{marginBottom:14}}>
            {PHASES.map(p=><button key={p.key} className={`ph-chip ${clEditorPhase===p.key?"on":""}`} onClick={()=>setClEditorPhase(p.key)}>{p.label.split("(")[0].trim()}</button>)}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:11,color:"var(--text2)"}}>{globalTemplates[clEditorPhase]?.length||0} items in global template</span>
            <button className="btn btn-sm" onClick={()=>{setClEditorScope("global");setClEditorOpen(true);}}>✏️ Edit This Phase</button>
          </div>
          {(globalTemplates[clEditorPhase]||[]).map((item,i)=>(
            <div key={item.id} style={{padding:"8px 0",borderBottom:"1px solid rgba(196,163,90,0.04)"}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span className="mono" style={{fontSize:9,color:"var(--text3)",minWidth:18}}>{i+1}</span>
                <span style={{fontSize:12,color:"var(--text)",flex:1}}>{item.label}</span>
                {item.requirePhoto&&<span style={{fontSize:8,color:"var(--gold)",padding:"1px 5px",background:"var(--gdim)",borderRadius:8}}>📸</span>}
              </div>
              {(item.subtasks||[]).length>0&&(
                <div style={{paddingLeft:24,marginTop:3}}>
                  {item.subtasks.map((sub,si)=>(
                    <div key={sub.id} style={{display:"flex",alignItems:"center",gap:5,padding:"2px 0"}}>
                      <span style={{fontSize:8,color:"var(--text3)",minWidth:22}}>{i+1}.{si+1}</span>
                      <span style={{fontSize:10,color:"var(--text3)"}}>{sub.label}</span>
                      {sub.requirePhoto&&<span style={{fontSize:8,color:"var(--gold)"}}>📸</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {projects.length>0&&(
          <div className="card">
            <div className="card-t">Per-Project Overrides</div>
            {projects.map(p=>{
              const ov=projectChecklists[p.id];
              const ovPhases=ov?Object.keys(ov):[];
              return (
                <div key={p.id} className="data-row">
                  <div className="d-info">
                    <div className="d-name">{p.name}</div>
                    <div className="d-meta">{ovPhases.length>0?`Custom: ${ovPhases.map(k=>PHASES.find(ph=>ph.key===k)?.label.split("(")[0].trim()).join(", ")}`:"Using global templates"}</div>
                  </div>
                  <button className="btn-ghost btn-sm" onClick={()=>{setActiveProject(p.id);setClEditorScope("project");setClEditorOpen(true);}}>Edit</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function NewProjectView() {
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
  }

  // ── MODALS ─────────────────────────────────────────────────

  function ChecklistEditorModal() {
    const items=getEditorItems();
    const hasOverride=clEditorScope==="project"&&activeProject&&!!projectChecklists[activeProject]?.[clEditorPhase];
    return (
      <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setClEditorOpen(false);}}>
        <div className="modal" style={{maxWidth:600}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <div className="modal-title" style={{marginBottom:3}}>Edit Checklist</div>
              <div style={{fontSize:10,color:"var(--text3)"}}>{PHASES.find(p=>p.key===clEditorPhase)?.label}</div>
            </div>
            <button style={{background:"none",border:"none",color:"var(--text2)",fontSize:20,cursor:"pointer"}} onClick={()=>setClEditorOpen(false)}>✕</button>
          </div>

          {/* Scope toggle */}
          <div style={{display:"flex",gap:7,marginBottom:14}}>
            <button className="btn-ghost btn-sm" style={clEditorScope==="global"?{background:"var(--gold)",color:"#000",border:"none"}:{}} onClick={()=>setClEditorScope("global")}>Global Template</button>
            {activeProject&&<button className="btn-ghost btn-sm" style={clEditorScope==="project"?{background:"var(--gold)",color:"#000",border:"none"}:{}} onClick={()=>setClEditorScope("project")}>This Project Only</button>}
          </div>

          {/* Phase selector */}
          <div style={{marginBottom:14}}>
            <div className="fl" style={{marginBottom:5}}>Phase</div>
            <select className="fs" value={clEditorPhase} onChange={e=>setClEditorPhase(e.target.value)}>
              {PHASES.map(p=><option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </div>

          {clEditorScope==="project"&&!hasOverride&&<div style={{fontSize:10,color:"var(--text3)",marginBottom:10,padding:"7px 10px",background:"var(--bg3)",borderRadius:5}}>ℹ️ Currently using global template. Edits here create a project-specific override.</div>}
          {hasOverride&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,padding:"6px 10px",background:"rgba(196,163,90,0.05)",borderRadius:5}}>
            <span style={{fontSize:10,color:"var(--gold)"}}>✦ Project-specific checklist active</span>
            <button className="btn-danger" style={{fontSize:9,padding:"2px 7px"}} onClick={clResetToGlobal}>Reset to Global</button>
          </div>}

          <div style={{maxHeight:360,overflowY:"auto",paddingRight:3}}>
            {items.map((item,i)=>(
              <div key={item.id} style={{background:"var(--bg3)",borderRadius:7,padding:11,marginBottom:7,border:"1px solid var(--border)"}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
                  <span className="mono" style={{fontSize:10,color:"var(--text3)",minWidth:18}}>{i+1}.</span>
                  {editingItemId===item.id?(
                    <div style={{display:"flex",gap:5,flex:1}}>
                      <input className="fi" value={editingItemLabel} onChange={e=>setEditingItemLabel(e.target.value)} style={{flex:1,padding:"4px 7px",fontSize:11}} onKeyDown={e=>e.key==="Enter"&&clSaveItemLabel(item.id)}/>
                      <button className="btn btn-sm" onClick={()=>clSaveItemLabel(item.id)}>✓</button>
                      <button className="btn-ghost btn-sm" onClick={()=>setEditingItemId(null)}>✕</button>
                    </div>
                  ):(
                    <>
                      <span style={{flex:1,fontSize:11,color:"var(--text)",lineHeight:1.4}}>{item.label}</span>
                      <button className="rate-edit-btn" onClick={()=>{setEditingItemId(item.id);setEditingItemLabel(item.label);}}>Edit</button>
                      <button className="btn-danger" onClick={()=>clRemoveItem(item.id)}>✕</button>
                    </>
                  )}
                </div>
                <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",marginBottom:(item.subtasks||[]).length>0?7:0}}>
                  <input type="checkbox" checked={item.requirePhoto} onChange={()=>clToggleItemPhoto(item.id)} style={{accentColor:"var(--gold)"}}/>
                  <span style={{fontSize:10,color:"var(--text3)"}}>📸 Photo required</span>
                </label>
                {(item.subtasks||[]).length>0&&(
                  <div style={{paddingLeft:10,borderLeft:"2px solid rgba(196,163,90,0.1)",marginTop:6}}>
                    {item.subtasks.map((sub,si)=>(
                      <div key={sub.id} style={{display:"flex",alignItems:"center",gap:5,marginBottom:5,padding:"5px 7px",background:"var(--bg)",borderRadius:4}}>
                        <span className="mono" style={{fontSize:9,color:"var(--text3)",minWidth:26}}>{i+1}.{si+1}</span>
                        {editingSubKey===`${item.id}__${sub.id}`?(
                          <div style={{display:"flex",gap:4,flex:1}}>
                            <input className="fi" value={editingSubLabel} onChange={e=>setEditingSubLabel(e.target.value)} style={{flex:1,padding:"3px 6px",fontSize:10}} onKeyDown={e=>e.key==="Enter"&&clSaveSubLabel(item.id,sub.id)}/>
                            <button className="btn btn-sm" style={{padding:"3px 7px"}} onClick={()=>clSaveSubLabel(item.id,sub.id)}>✓</button>
                            <button className="btn-ghost btn-sm" style={{padding:"3px 7px"}} onClick={()=>setEditingSubKey(null)}>✕</button>
                          </div>
                        ):(
                          <>
                            <span style={{flex:1,fontSize:10,color:"var(--text2)"}}>{sub.label}</span>
                            <label style={{display:"flex",alignItems:"center",gap:3,cursor:"pointer",flexShrink:0}}>
                              <input type="checkbox" checked={sub.requirePhoto} onChange={()=>clToggleSubPhoto(item.id,sub.id)} style={{accentColor:"var(--gold)",width:11,height:11}}/>
                              <span style={{fontSize:8,color:"var(--text3)"}}>📸</span>
                            </label>
                            <button className="rate-edit-btn" style={{fontSize:8,padding:"2px 5px"}} onClick={()=>{setEditingSubKey(`${item.id}__${sub.id}`);setEditingSubLabel(sub.label);}}>Edit</button>
                            <button className="btn-danger" style={{padding:"2px 5px",fontSize:9}} onClick={()=>clRemoveSub(item.id,sub.id)}>✕</button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {addingSubTo===item.id?(
                  <div style={{display:"flex",gap:5,marginTop:7,paddingLeft:10}}>
                    <input className="fi" placeholder="Sub-task description…" value={newSubLabel} onChange={e=>setNewSubLabel(e.target.value)} style={{flex:1,padding:"5px 7px",fontSize:10}} onKeyDown={e=>e.key==="Enter"&&clAddSub(item.id)}/>
                    <button className="btn btn-sm" onClick={()=>clAddSub(item.id)}>Add</button>
                    <button className="btn-ghost btn-sm" onClick={()=>{setAddingSubTo(null);setNewSubLabel("");}}>✕</button>
                  </div>
                ):(
                  <button style={{marginTop:6,paddingLeft:10,background:"none",border:"none",color:"var(--text3)",fontSize:10,cursor:"pointer"}} onClick={()=>{setAddingSubTo(item.id);setNewSubLabel("");}}>+ Add sub-task</button>
                )}
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:7,marginTop:12}}>
            <input className="fi" placeholder="New checklist item…" value={newItemLabel} onChange={e=>setNewItemLabel(e.target.value)} style={{flex:1}} onKeyDown={e=>e.key==="Enter"&&clAddItem()}/>
            <button className="btn" onClick={clAddItem}>Add Item</button>
          </div>
          <div style={{marginTop:10,textAlign:"right"}}><button className="btn-ghost" onClick={()=>setClEditorOpen(false)}>Done</button></div>
        </div>
      </div>
    );
  }

  function ChangeOrderModal() {
    return (
      <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setShowCO(false);}}>
        <div className="modal">
          <div className="modal-title">Raise Change Order</div>
          <p style={{fontSize:11,color:"var(--text2)",marginBottom:14,lineHeight:1.5}}>Log a mid-project change. Original contract preserved — tracked as a delta.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div><div className="fl">Phase</div><select className="fs" value={coForm.phase} onChange={e=>setCoForm(f=>({...f,phase:e.target.value}))}>{PHASES.map(p=><option key={p.key} value={p.key}>{p.label}</option>)}</select></div>
            <div><div className="fl">Type</div>
              <select className="fs" value={coForm.type} onChange={e=>setCoForm(f=>({...f,type:e.target.value}))}>
                <option value="rate_change">Material Rate Change</option><option value="spec_change">Specification Change</option><option value="scope_add">Scope Addition</option><option value="scope_reduce">Scope Reduction</option>
              </select>
            </div>
            <div><div className="fl">Description</div><input className="fi" placeholder="e.g. Client upgraded to imported tiles" value={coForm.description} onChange={e=>setCoForm(f=>({...f,description:e.target.value}))}/></div>
            <div><div className="fl">Cost Impact (PKR) — negative for savings</div><input className="fi" type="number" placeholder="e.g. 450000" value={coForm.amount} onChange={e=>setCoForm(f=>({...f,amount:e.target.value}))}/></div>
            <div><div className="fl">Reason</div><input className="fi" placeholder="e.g. Client request on site visit" value={coForm.reason} onChange={e=>setCoForm(f=>({...f,reason:e.target.value}))}/></div>
          </div>
          <div style={{display:"flex",gap:7,marginTop:18}}>
            <button className="btn-ghost" onClick={()=>setShowCO(false)}>Cancel</button>
            <button className="btn" style={{flex:1}} disabled={!coForm.description||!coForm.amount} onClick={submitCO}>SAVE CHANGE ORDER</button>
          </div>
        </div>
      </div>
    );
  }

  function TimelineEditModal() {
    return (
      <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setShowTLE(false);}}>
        <div className="modal">
          <div className="modal-title">Edit Phase Timeline</div>
          <p style={{fontSize:11,color:"var(--text2)",marginBottom:14,lineHeight:1.5}}>Every change is logged with reason and timestamp. Original schedule always preserved.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div><div className="fl">Phase</div>
              <select className="fs" value={tlePhase} onChange={e=>setTlePhase(e.target.value)}>
                <option value="">Select phase…</option>
                {(proj?.phases||[]).map(p=><option key={p.key} value={p.key}>{p.label} (currently {fDate(p.expectedEnd)})</option>)}
              </select>
            </div>
            <div><div className="fl">New Expected Completion</div><input className="fi" type="date" value={tleDate} onChange={e=>setTleDate(e.target.value)}/></div>
            <div><div className="fl">Reason</div>
              <select className="fs" value={tleReason} onChange={e=>setTleReason(e.target.value)}>
                <option value="">Select reason…</option>
                {["Client request","Weather delay","Material delay","Labor shortage","Scope change","Foundation/soil issue","Ramadan/Eid holiday","Quality rework","Design clarification","Other"].map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:7,marginTop:18}}>
            <button className="btn-ghost" onClick={()=>setShowTLE(false)}>Cancel</button>
            <button className="btn" style={{flex:1}} disabled={!tlePhase||!tleDate||!tleReason} onClick={submitTLE}>SAVE TIMELINE EDIT</button>
          </div>
        </div>
      </div>
    );
  }

  // ── SIDEBAR + RENDER ───────────────────────────────────────
  const ownerNav=[
    {id:"dashboard",  icon:"◈", label:"Dashboard"},
    {id:"quote",      icon:"✦", label:"New Quote"},
    {id:"newproject", icon:"⊕", label:"Import Project"},
    {id:"rates",      icon:"◆", label:"Rate Database"},
    {id:"checklists", icon:"☑", label:"Checklist Templates"},
    {id:"supervisor", icon:"✅", label:"Site Log (Supervisor)"},
  ];
  const supNav=[
    {id:"supervisor", icon:"✅", label:"Daily Log"},
    {id:"project",    icon:"◉", label:"Project View"},
  ];
  const nav=role==="owner"?ownerNav:supNav;

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="sidebar">
          <div className="sb-logo">
            <div className="sb-logo-t syne">TAAMEER</div>
            <div className="sb-logo-s">Construction Intelligence</div>
          </div>
          <div className="sb-nav">
            <div className="sb-sec">Navigation</div>
            {nav.map(n=>(
              <div key={n.id} className={`sb-item ${view===n.id?"on":""}`} onClick={()=>setView(n.id)}>
                <span style={{fontSize:14,width:16,textAlign:"center"}}>{n.icon}</span>
                <span>{n.label}</span>
              </div>
            ))}
            {role==="owner"&&projects.length>0&&(
              <>
                <div className="sb-sec" style={{marginTop:6}}>Projects</div>
                {projects.map(p=>(
                  <div key={p.id} className={`sb-item ${view==="project"&&activeProject===p.id?"on":""}`}
                    onClick={()=>{setActiveProject(p.id);setProjectTab("overview");setView("project");}}>
                    <span style={{fontSize:7,width:16,textAlign:"center"}}>●</span>
                    <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:11}}>{p.name}</span>
                  </div>
                ))}
              </>
            )}
          </div>
          <div className="sb-role">
            <div className="sb-role-l">View Mode</div>
            <div className="role-tog">
              <button className={`role-btn ${role==="owner"?"on":""}`} onClick={()=>setRole("owner")}>Owner</button>
              <button className={`role-btn ${role==="supervisor"?"on":""}`} onClick={()=>setRole("supervisor")}>Supervisor</button>
            </div>
          </div>
        </div>

        <div className="main">
          <div className="topbar">
            <div className="topbar-left">
              {role==="owner" ? "👔 Owner Mode" : "👷 Supervisor Mode"}
              {proj && view==="project" && <span style={{marginLeft:12,color:"var(--text2)"}}>· {proj.name}</span>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              {role==="supervisor" && view!=="supervisor" && (
                <button className="btn-ghost btn-sm" onClick={()=>setView("supervisor")}>📋 Open Site Log</button>
              )}
              <div className="topbar-role">
                <button className={`topbar-role-btn ${role==="owner"?"on":""}`} onClick={()=>setRole("owner")}>Owner</button>
                <button className={`topbar-role-btn ${role==="supervisor"?"on":""}`} onClick={()=>setRole("supervisor")}>Supervisor</button>
              </div>
            </div>
          </div>
          {view==="dashboard"  && <Dashboard/>}
          {view==="project"    && <ProjectView/>}
          {view==="quote"      && <QuoteView/>}
          {view==="supervisor" && <SupervisorView/>}
          {view==="rates"      && <RatesView/>}
          {view==="newproject" && <NewProjectView/>}
          {view==="checklists" && <ChecklistTemplatesView/>}
        </div>
      </div>

      {showCO       && <ChangeOrderModal/>}
      {showTLE      && <TimelineEditModal/>}
      {clEditorOpen && <ChecklistEditorModal/>}

      {lightbox&&(
        <div className="lightbox" onClick={()=>setLightbox(null)}>
          <button className="lb-close" onClick={()=>setLightbox(null)}>✕</button>
          <img src={lightbox} alt=""/>
        </div>
      )}
    </>
  );
}
