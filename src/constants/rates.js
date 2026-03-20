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

export { DEFAULT_RATES, BUILD_TYPES };