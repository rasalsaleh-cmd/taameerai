/**
 * useProjects.js — SiteOS Data Hook
 * ALL Supabase database operations live here.
 * Components never call Supabase directly — they use this hook.
 * Supports phases, sub-phases, and per-phase checklists.
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
        changeOrders:change_orders(*),
        timelineEdits:timeline_edits(*),
        checklistLogs:checklist_logs(*)
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
        name:          projectData.name,
        client:        projectData.client,
        location:      projectData.location,
        type:          projectData.type,
        totalArea:     projectData.totalArea,
        floors:        projectData.floors,
        startDate:     projectData.startDate,
        contractValue: projectData.contractValue,
        status:        "active",
        currentPhase:  phasesData[0]?.key || "excavation",
        source:        projectData.source || "manual",
      })
      .select()
      .single();

    if (projectError) throw projectError;

    if (phasesData?.length > 0) {
      const { error: phasesError } = await supabase
        .from("project_phases")
        .insert(phasesData.map((p) => ({
          projectId:   newProject.id,
          key:         p.key,
          label:       p.label,
          budget:      p.budget || 0,
          spent:       0,
          progress:    0,
          status:      "pending",
          expectedEnd: p.expectedEnd || null,
        })));
      if (phasesError) throw phasesError;
    }

    await fetchProjects();
    return newProject;
  }

  // ─── Update a project ──────────────────────────────────────
  async function updateProject(projectId, updates) {
    const { error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", projectId);
    if (error) throw error;
    await fetchProjects();
  }

  // ─── Update a phase or sub-phase ───────────────────────────
  async function updatePhase(phaseId, updates) {
    const { error } = await supabase
      .from("project_phases")
      .update(updates)
      .eq("id", phaseId);
    if (error) throw error;
    await fetchProjects();
  }

  // ─── Add a top-level phase ─────────────────────────────────
  async function addPhase(projectId, phaseData) {
    const { error } = await supabase
      .from("project_phases")
      .insert({
        projectId:       projectId,
        key:             phaseData.key,
        label:           phaseData.label,
        budget:          phaseData.budget || 0,
        spent:           0,
        progress:        0,
        status:          "pending",
        expectedEnd:     phaseData.expectedEnd || null,
        parent_phase_id: null,
        sort_order:      phaseData.sort_order || 0,
      });
    if (error) throw error;
    await fetchProjects();
  }

  // ─── Add a sub-phase under a parent phase ──────────────────
  async function addSubPhase(projectId, parentPhaseId, phaseData) {
    const { error } = await supabase
      .from("project_phases")
      .insert({
        projectId:       projectId,
        key:             phaseData.key,
        label:           phaseData.label,
        budget:          phaseData.budget || 0,
        spent:           0,
        progress:        0,
        status:          "pending",
        expectedEnd:     phaseData.expectedEnd || null,
        parent_phase_id: parentPhaseId,
        sort_order:      phaseData.sort_order || 0,
      });
    if (error) throw error;
    await fetchProjects();
  }

  // ─── Delete a phase or sub-phase ───────────────────────────
  async function deletePhase(phaseId) {
    const { error } = await supabase
      .from("project_phases")
      .delete()
      .eq("id", phaseId);
    if (error) throw error;
    await fetchProjects();
  }

  // ─── Add checklist item to a phase/sub-phase ───────────────
  async function addChecklistItem(phaseId, item, photoRequired = false) {
    const { error } = await supabase
      .from("phase_checklist_items")
      .insert({
        phase_id:       phaseId,
        item:           item,
        photo_required: photoRequired,
        sort_order:     0,
      });
    if (error) throw error;
    await fetchProjects();
  }

  // ─── Delete a checklist item ───────────────────────────────
  async function deleteChecklistItem(itemId) {
    const { error } = await supabase
      .from("phase_checklist_items")
      .delete()
      .eq("id", itemId);
    if (error) throw error;
    await fetchProjects();
  }

  // ─── Log an expense ────────────────────────────────────────
  async function logExpense(projectId, expenseData) {
    const { error } = await supabase
      .from("expenses")
      .insert({
        projectId:   projectId,
        phase:       expenseData.phase,
        category:    expenseData.category,
        description: expenseData.description,
        amount:      expenseData.amount,
        receipt:     expenseData.receipt || null,
        date:        expenseData.date || new Date().toISOString().split("T")[0],
      });
    if (error) throw error;
    await fetchProjects();
  }

  // ─── Submit a supervisor daily log ─────────────────────────
  async function submitDailyLog(projectId, logData, items) {
    const { data: log, error: logError } = await supabase
      .from("phase_logs")
      .insert({
        project_id:      projectId,
        phase_id:        logData.phaseId || null,
        completion_rate: logData.completionRate || 0,
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
  async function logMaterialDelivery(projectId, deliveryData) {
    const { error } = await supabase
      .from("expenses")
      .insert({
        projectId:   projectId,
        phase:       deliveryData.phase,
        category:    "material",
        description: `DELIVERY: ${deliveryData.materialType} — ${deliveryData.quantity} ${deliveryData.unit} from ${deliveryData.supplier}`,
        amount:      deliveryData.amount || 0,
        receipt:     deliveryData.photo || null,
        date:        new Date().toISOString().split("T")[0],
      });
    if (error) throw error;
    await fetchProjects();
  }

  // ─── Submit a change order ─────────────────────────────────
  async function submitChangeOrder(projectId, coData) {
    const { error } = await supabase
      .from("change_orders")
      .insert({
        projectId:   projectId,
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
  async function submitTimelineEdit(projectId, tleData) {
    const { error } = await supabase
      .from("timeline_edits")
      .insert({
        projectId: projectId,
        phase:     tleData.phase,
        newDate:   tleData.newDate,
        reason:    tleData.reason,
        date:      new Date().toISOString().split("T")[0],
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