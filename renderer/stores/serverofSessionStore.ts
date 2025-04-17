import { create } from 'zustand';
import { AGE_FLAVOR } from '../utils/enum';

interface ServerOfSession {
  id: number; // server id
  type: AGE_FLAVOR;
  sessionId: string | null;
}

interface GraphOfServer {
  id: number; // server id
  graphPaths: string[]; // graph paths list
}

interface ServerOfSessionState {
  serverList: ServerOfSession[];
  serverGraphs: GraphOfServer[];
}

interface ServerActions {
  setServerList: (serverList: ServerOfSession[]) => void;
  addServerSession: (server: ServerOfSession) => void;
  removeServerSession: (serverId: number) => void;
  updateServerSession: (server: ServerOfSession) => void;
}

export type ServerOfSessionStore = ServerOfSessionState & ServerActions;

export const defaultServerState: ServerOfSessionState = {
  serverList: [],
  serverGraphs: [],
};

export const useServerOfSessionStore = create<ServerOfSessionStore>((set) => ({
  ...defaultServerState,
  setServerList: (serverList) => set({ serverList }),
  addServerSession: (server) =>
    set((state) => ({ serverList: [...state.serverList, server] })),
  removeServerSession: (serverId) =>
    set((state) => ({
      serverList: state.serverList.filter((server) => server.id !== serverId),
    })),
  updateServerSession: (server) =>
    set((state) => ({
      serverList: state.serverList.map((s) =>
        s.id === server.id ? server : s,
      ),
    })),
}));
