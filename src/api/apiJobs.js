import supabaseClient from "@/utils/supabase";

// ===============================
// Fetch Jobs
// ===============================
export async function getJobs(token, filters = {}) {
  const { location, company_id, searchQuery } = filters;

  const supabase = supabaseClient(token);

  let query = supabase
    .from("jobs")
    .select("*, saved:saved_jobs(id), company:companies(name,logo_url)");

  if (location) query = query.eq("location", location);
  if (company_id) query = query.eq("company_id", company_id);
  if (searchQuery) query = query.ilike("title", `%${searchQuery}%`);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching Jobs:", error);
    return [];
  }

  return data;
}

// ===============================
// Fetch Saved Jobs
// ===============================
export async function getSavedJobs(token) {
  const supabase = supabaseClient(token);

  const { data, error } = await supabase
    .from("saved_jobs")
    .select("*, job:jobs(*, company:companies(name,logo_url))")
    .order("created_at", { ascending: false }); // ✅ latest first

  if (error) {
    console.error("Error fetching Saved Jobs:", error);
    return [];
  }

  // ✅ deduplicate by job_id in case DB has existing duplicates
  const seen = new Set();
  return data.filter((saved) => {
    if (seen.has(saved.job_id)) return false;
    seen.add(saved.job_id);
    return true;
  });
}

// ===============================
// Fetch Single Job
// ===============================
export async function getSingleJob(token, { job_id } = {}) {
  if (!job_id) {
    console.warn("getSingleJob called without job_id");
    return null;
  }

  const supabase = supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .select("*, company:companies(name,logo_url), applications:applications(*)")
    .eq("id", job_id)
    .single();

  if (error) {
    console.error("Error fetching Job:", error);
    return null;
  }

  return data;
}

// ===============================
// Save / Unsave Job
// ===============================
export async function saveJob(token, { alreadySaved } = {}, saveData) {
  if (!saveData || !saveData.job_id) {
    console.error("saveJob: saveData is missing or has no job_id", saveData);
    return null;
  }

  const supabase = supabaseClient(token);

  if (alreadySaved) {
    const { data, error } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("job_id", saveData.job_id)
      .eq("user_id", saveData.user_id); // ✅ also match user_id for safety

    if (error) {
      console.error("Error removing saved job:", error);
      return null;
    }

    return data;
  }

  // ✅ upsert instead of insert — prevents duplicates entirely
  const { data, error } = await supabase
    .from("saved_jobs")
    .upsert([saveData], { onConflict: "user_id,job_id" })
    .select();

  if (error) {
    console.error("Error saving job:", error);
    return null;
  }

  return data;
}

// ===============================
// Update Hiring Status
// ===============================
export async function updateHiringStatus(token, { job_id }, isOpen) {
  const supabase = supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .update({ isOpen })
    .eq("id", job_id)
    .select();

  if (error) {
    console.error("Error updating hiring status:", error);
    return null;
  }

  return data;
}

// ===============================
// Recruiter Jobs
// ===============================
export async function getMyJobs(token, { recruiter_id }) {
  const supabase = supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .select("*, company:companies(name,logo_url)")
    .eq("recruiter_id", recruiter_id);

  if (error) {
    console.error("Error fetching recruiter jobs:", error);
    return [];
  }

  return data;
}

// ===============================
// Delete Job
// ===============================
export async function deleteJob(token, { job_id }) {
  const supabase = supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", job_id)
    .select();

  if (error) {
    console.error("Error deleting job:", error);
    return null;
  }

  return data;
}

// ===============================
// Add New Job
// ===============================
export async function addNewJob(token, _, jobData) {
  const supabase = supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .insert([jobData])
    .select();

  if (error) {
    console.error("Error creating job:", error);
    throw new Error("Error Creating Job");
  }

  return data;
}

// ===============================
// Delete Saved Job
// ===============================
export async function deleteSavedJob(token, { jobId, userId }) {
  const supabase = supabaseClient(token);

  const { data, error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("id", jobId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting saved job:", error);
    return null;
  }

  return data;
}