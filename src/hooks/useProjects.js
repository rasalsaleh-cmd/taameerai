/**
 * useProjects.js — SiteOS Data Hook
 * ALL Supabase database operations live here.
 * Components never call Supabase directly — they use this hook.
 * Naming convention: snake_case throughout (matches database).
 */

import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        phases:project_phases(
          *,
          checklist_items:phase_checklist_items(*)
        ),
        expenses(*),
        change_orders(*),
        timeline_edits(*),
        checklist_logs(*)
      `)
      .order("created_at", { ascending: false });

    if (error) { setError(error.message); }
    else { setProjects(data || []); }
    setLoading(false);
  }

  // ─── Create a new project with phases ──────────────────────
  async function createProject(projectData, phasesData) {
    const { data: newProject, error: projectError } = await supabase
      .from("projects")
      .insert({
        name:           projectData.name,
        client:         projectData.client,
        location:       projectData.location,
        type:           projectData.type,
        total_area:     projectData.total_area,
        floors:         projectData.floors,
        start_date:     projectData.start_date,
        contract_value: projectData.contract_value,
        status:         "active",
        current_phase:  phasesData[0]?.key || "excavation",
        source:         projectData.source || "manual",
      })
      .select()
      .single();

    if (projectError) throw projectError;

    if (phasesData?.length > 0) {
      const { error: phasesError } = await supabase
        .from("project_phases")
        .insert(phasesData.map((p) => ({
          project_id:   newProject.id,
          key:          p.key,
          label:        p.label,
          budget:       p.budget || 0,
          spent:        0,
          progress:     0,
          status:       "pending",
          expected_end: p.expected_end || null,
        })));
      if (phasesError) throw phasesError;
    }

    await fetchProjects();
    return newProject;
  }

  // ─── Update a project ──────────────────────────────────────
  async function updateProject(project_id, updates) {
    const { error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", project_id);
    if (error) throw error;
    await fetchProjects();
  }

  // ─── Update a phase or sub-phase ───────────────────────────
  async function updatePhase(phase_id, updates) {
    const { error } = await supabase
      .from("project_phases")
      .update(updates)
      .eq("id", phase_id);
    if (error) throw error;
    await fetchProjects();
  }

  // ─── Add a top-level phase ─────────────────────────────────
  async function addPhase(project_id, phaseData) {
    const { error } = await supabase
      .from("project_phases")
      .insert({
        project_id:      project_id,
        key:             phaseData.key,
        label:           phaseData.label,
        budget:          phaseData.budget || 0,
        spent:           0,
        progress:        0,
        status:          "pending",
        expected_end:    phaseData.expected_end || null,
        parent_phase_id: null,
        sort_order:      phaseData.sort_order || 0,
      });
    if (error) throw error;
    await fetchProjects();
  }

  // ─── Add a sub-phase under a parent phase ──────────────────
  async function addSubPhase(project_id, parent_phase_id, phaseData) {
    const { error } = await supabase
      .from("project_phases")
      .insert({
        project_id:      project_id,
        key:             phaseData.key,
        label:           phaseData.label,
        budget:          phaseData.budget || 0,
        spent:           0,
        progress:        0,
        status:          "pending",
        expected_end:    phaseData.expected_end || null,
        parent_phase_id: parent_phase_id,
        sort_order:      phaseData.sort_order || 0,
      });
    if (error) throw error;
    await fetchProjects();
  }

  // ─── Delete a phase or sub-phase ───────────────────────────
  async function deletePhase(phase_id) {
    const { error } = await supabase
      .from("project_phases")
      .delete()
      .eq("id", phase_id);
    if (error) throw error;
    await fetchProjects();
  }

  // ─── Add checklist item to a phase/sub-phase ───────────────
  async function addChecklistItem(phase_id, item, photo_required = false) {
    const { error } = await supabase
      .from("phase_checklist_items")
      .insert({ phase_id, item, photo_required, sort_order: 0 });
    if (error) throw error;
    await fetchProjects();
  }

  // ─── Delete a checklist item ───────────────────────────────
  async function deleteChecklistItem(item_id) {
    const { error } = await supabase
      .from("phase_checklist_items")
      .delete()
      .eq("id", item_id);
    if (error) throw error;
    await fetchProjects();
  }

  // ─── Log an expense ────────────────────────────────────────
  async function logExpense(project_id, expenseData) {
    const { error } = await supabase
      .from("expenses")
      .insert({
        project_id:   project_id,
        phase:        expenseData.phase,
        category:     expenseData.category,
        description:  expenseData.description,
        amount:       expenseData.amount,
        receipt:      expenseData.receipt || null,
        date:         expenseData.date || new Date().toISOString().split("T")[0],
      });
    if (error) throw error;
    await fetchProjects();
  }

  // ─── Submit a supervisor daily log ─────────────────────────
  async function submitDailyLog(project_id, logData, items) {
    const { data: log, error: logError } = await supabase
      .from("phase_logs")
      .insert({
        project_id:      project_id,
        phase_id:        logData.phase_id || null,
        completion_rate: logData.completion_rate || 0,
        notes:           logData.notes || null,
        log_date:        new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (logError) throw logError;

    if (items?.length > 0) {
      const { error: itemsError } = await supabase
        .from("phase_log_items")
        .insert(items.map((item) => ({
          log_id:            log.id,
          checklist_item_id: item.checklist_item_id || null,
          item_label:        item.item,
          status:            item.status,
          photo:             item.photo || null,
          reason:            item.reason || null,
          note:              item.note || null,
        })));
      if (itemsError) throw itemsError;
    }

    await fetchProjects();
    return log;
  }

  // ─── Log a material delivery ───────────────────────────────
  async function logMaterialDelivery(project_id, deliveryData) {
    const { error } = await supabase
      .from("expenses")
      .insert({
        project_id:   project_id,
        phase:        deliveryData.phase,
        category:     "material",
        description:  `DELIVERY: ${deliveryData.materialType} — ${deliveryData.quantity} ${deliveryData.unit} from ${deliveryData.supplier}`,
        amount:       deliveryData.amount || 0,
        receipt:      deliveryData.photo || null,
        date:         new Date().toISOString().split("T")[0],
      });
    if (error) throw error;
    await fetchProjects();
  }

  // ─── Submit a change order ─────────────────────────────────
  async function submitChangeOrder(project_id, coData) {
    const { error } = await supabase
      .from("change_orders")
      .insert({
        project_id:  project_id,
        phase:       coData.phase,
        type:        coData.type,
        description: coData.description,
        amount:      coData.amount || 0,
        reason:      coData.reason,
        date:        new Date().toISOString().split("T")[0],
      });
    if (error) throw error;
    await fetchProjects();
  }

  // ─── Submit a timeline edit ────────────────────────────────
  async function submitTimelineEdit(project_id, tleData) {
    const { error } = await supabase
      .from("timeline_edits")
      .insert({
        project_id: project_id,
        phase:      tleData.phase,
        new_date:   tleData.new_date,
        reason:     tleData.reason,
        date:       new Date().toISOString().split("T")[0],
      });
    if (error) throw error;
    await fetchProjects();
  }

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    updatePhase,
    addPhase,
    addSubPhase,
    deletePhase,
    addChecklistItem,
    deleteChecklistItem,
    logExpense,
    submitDailyLog,
    logMaterialDelivery,
    submitChangeOrder,
    submitTimelineEdit,
  };
}