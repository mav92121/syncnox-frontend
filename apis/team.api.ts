import apiClient from "@/config/apiClient.config";
import { Team } from "@/types/team.type";

const url = "/team-members";

export const fetchTeams = async (params?: {
  status: string;
}): Promise<Team[]> => {
  const response = await apiClient.get<Team[]>(url, { params });
  return response.data;
};

export const createTeam = async (team: Team): Promise<Team> => {
  const response = await apiClient.post<Team>(url, team);
  return response.data;
};

export const updateTeam = async (team: Team): Promise<Team> => {
  const response = await apiClient.put<Team>(`${url}/${team.id}`, team);
  return response.data;
};

export const deleteTeam = async (teamId: number): Promise<void> => {
  await apiClient.delete(`${url}/${teamId}`);
};
