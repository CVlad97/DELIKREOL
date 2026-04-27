import { supabase } from '../lib/supabase';
import { getUserBalance, spendLoyaltyPoints } from './loyaltyService';

export type ProjectType = 'relay_hub' | 'dark_kitchen' | 'storage' | 'other';
export type ProjectStatus = 'draft' | 'active' | 'funded' | 'closed';
export type InvestmentMode = 'auto' | 'manual';

export interface InvestmentProject {
  id: string;
  title: string;
  description: string;
  project_type: ProjectType;
  target_points: number;
  collected_points: number;
  status: ProjectStatus;
  zone_label?: string;
  created_at: string;
  updated_at: string;
}

export interface InvestmentContribution {
  id: string;
  user_id: string;
  project_id: string;
  contribution_points: number;
  source: string;
  created_at: string;
  project?: InvestmentProject;
}

export interface InvestmentPreference {
  user_id: string;
  mode: InvestmentMode;
  auto_ratio: number;
  preferred_project_types: ProjectType[];
  updated_at: string;
}

export async function listActiveProjects(): Promise<InvestmentProject[]> {
  try {
    const { data, error } = await supabase
      .from('investment_projects')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error listing active projects:', error);
    return [];
  }
}

export async function listAllProjects(): Promise<InvestmentProject[]> {
  try {
    const { data, error } = await supabase
      .from('investment_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error listing all projects:', error);
    return [];
  }
}

export async function getProjectById(
  projectId: string
): Promise<InvestmentProject | null> {
  try {
    const { data, error } = await supabase
      .from('investment_projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting project:', error);
    return null;
  }
}

export async function createDemoContributionFromLoyalty(
  userId: string,
  projectId: string,
  points: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (points <= 0) {
      return { success: false, error: 'Le montant doit être supérieur à 0' };
    }

    const currentBalance = await getUserBalance(userId);

    if (currentBalance < points) {
      return {
        success: false,
        error: `Solde insuffisant. Vous avez ${currentBalance} points.`,
      };
    }

    const project = await getProjectById(projectId);
    if (!project) {
      return { success: false, error: 'Projet introuvable' };
    }

    if (project.status !== 'active') {
      return { success: false, error: 'Ce projet n\'est plus actif' };
    }

    const spendResult = await spendLoyaltyPoints(
      userId,
      points,
      `Contribution au projet: ${project.title}`
    );

    if (!spendResult.success) {
      return spendResult;
    }

    const { error: insertError } = await supabase
      .from('investment_contributions')
      .insert({
        user_id: userId,
        project_id: projectId,
        contribution_points: points,
        source: 'loyalty_points',
      });

    if (insertError) throw insertError;

    return { success: true };
  } catch (error: any) {
    console.error('Error creating contribution:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la contribution',
    };
  }
}

export async function getUserContributions(
  userId: string
): Promise<InvestmentContribution[]> {
  try {
    const { data, error } = await supabase
      .from('investment_contributions')
      .select('*, project:investment_projects(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user contributions:', error);
    return [];
  }
}

export async function getUserInvestmentPreference(
  userId: string
): Promise<InvestmentPreference | null> {
  try {
    const { data, error } = await supabase
      .from('investment_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting investment preference:', error);
    return null;
  }
}

export async function setUserInvestmentPreference(
  userId: string,
  input: {
    mode: InvestmentMode;
    autoRatio?: number;
    preferredProjectTypes?: ProjectType[];
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('investment_preferences').upsert({
      user_id: userId,
      mode: input.mode,
      auto_ratio: input.autoRatio ?? 0,
      preferred_project_types: input.preferredProjectTypes || [],
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error setting investment preference:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la sauvegarde des préférences',
    };
  }
}

export async function applyAutoInvestmentForUser(
  userId: string,
  newlyEarnedPoints: number
): Promise<{ success: boolean; invested: number; error?: string }> {
  try {
    const preference = await getUserInvestmentPreference(userId);

    if (!preference || preference.mode !== 'auto' || preference.auto_ratio === 0) {
      return { success: true, invested: 0 };
    }

    const pointsToInvest = Math.floor(newlyEarnedPoints * preference.auto_ratio);

    if (pointsToInvest <= 0) {
      return { success: true, invested: 0 };
    }

    let query = supabase
      .from('investment_projects')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (preference.preferred_project_types.length > 0) {
      query = query.in('project_type', preference.preferred_project_types);
    }

    const { data: projects, error } = await query.limit(1);

    if (error) throw error;

    if (!projects || projects.length === 0) {
      return { success: true, invested: 0 };
    }

    const targetProject = projects[0];

    const result = await createDemoContributionFromLoyalty(
      userId,
      targetProject.id,
      pointsToInvest
    );

    if (!result.success) {
      return {
        success: false,
        invested: 0,
        error: result.error,
      };
    }

    return {
      success: true,
      invested: pointsToInvest,
    };
  } catch (error: any) {
    console.error('Error applying auto investment:', error);
    return {
      success: false,
      invested: 0,
      error: error.message || 'Erreur lors de l\'investissement automatique',
    };
  }
}

export async function createProject(input: {
  title: string;
  description: string;
  project_type: ProjectType;
  target_points: number;
  zone_label?: string;
  status?: ProjectStatus;
}): Promise<{ success: boolean; projectId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('investment_projects')
      .insert({
        title: input.title,
        description: input.description,
        project_type: input.project_type,
        target_points: input.target_points,
        zone_label: input.zone_label,
        status: input.status || 'draft',
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      projectId: data.id,
    };
  } catch (error: any) {
    console.error('Error creating project:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la création du projet',
    };
  }
}

export async function updateProjectStatus(
  projectId: string,
  newStatus: ProjectStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('investment_projects')
      .update({ status: newStatus })
      .eq('id', projectId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error updating project status:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la mise à jour du statut',
    };
  }
}

export async function getProjectStats(): Promise<{
  totalPoints: number;
  totalProjects: number;
  activeProjects: number;
  totalContributors: number;
  byType: Record<ProjectType, number>;
}> {
  try {
    const [projectsRes, contributionsRes] = await Promise.all([
      supabase.from('investment_projects').select('project_type, collected_points, status'),
      supabase.from('investment_contributions').select('user_id'),
    ]);

    const projects = projectsRes.data || [];
    const contributions = contributionsRes.data || [];

    const uniqueContributors = new Set(contributions.map((c) => c.user_id)).size;

    const byType: Record<ProjectType, number> = {
      relay_hub: 0,
      dark_kitchen: 0,
      storage: 0,
      other: 0,
    };

    let totalPoints = 0;
    let activeProjects = 0;

    projects.forEach((p) => {
      totalPoints += Number(p.collected_points || 0);
      if (p.status === 'active') activeProjects++;
      byType[p.project_type as ProjectType] += Number(p.collected_points || 0);
    });

    return {
      totalPoints,
      totalProjects: projects.length,
      activeProjects,
      totalContributors: uniqueContributors,
      byType,
    };
  } catch (error) {
    console.error('Error getting project stats:', error);
    return {
      totalPoints: 0,
      totalProjects: 0,
      activeProjects: 0,
      totalContributors: 0,
      byType: { relay_hub: 0, dark_kitchen: 0, storage: 0, other: 0 },
    };
  }
}
