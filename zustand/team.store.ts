import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Team } from "@/types/team.type";
import { fetchTeams } from "@/apis/team.api";

interface TeamStore {
  teams: Team[];
  activeTeams: Team[] | null;
  isLoading: boolean;
  error: string | null;
  fetchTeams: () => Promise<void>;
  initializeTeams: () => Promise<void>;
  deleteTeam: (teamId: number) => void;
  upsertTeam: (team: Team, existingId?: number) => void;
  hasFetched: boolean;
}

export const useTeamStore = create(
  devtools(
    immer<TeamStore>((set, get) => ({
      teams: [],
      activeTeams: [],
      isLoading: false,
      error: null,
      hasFetched: false,

      fetchTeams: async () => {
        set({ isLoading: true });
        try {
          const teams = await fetchTeams();
          const activeTeams = await fetchTeams({ status: "active" });
          set({ teams });
          set({ hasFetched: true });
        } catch (error) {
          set({ error: error as string });
        } finally {
          set({ isLoading: false });
        }
      },

      deleteTeam: (teamId: number) => {
        set((state) => {
          state.teams = state.teams.filter((team) => team.id !== teamId);
        });
      },

      upsertTeam: (team: Team, existingId?: number) => {
        set((state) => {
          if (existingId) {
            // Update existing team
            const index = state.teams.findIndex((t) => t.id === existingId);
            if (index !== -1) {
              state.teams[index] = team;
            }
          } else {
            // Add new team
            state.teams.push(team);
          }
        });
      },

      initializeTeams: async () => {
        const { hasFetched, isLoading } = get();
        if (hasFetched || isLoading) return;
        await get().fetchTeams();
      },
    }))
  )
);
