'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { showToast } from '@/components/ui/Toast';
import { useUser } from './UserContext';

export type WorkspaceRole = 'Owner' | 'Admin' | 'Member' | 'Viewer';

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  avatar?: string;
  joinedAt: string;
  status: 'online' | 'offline';
  lastActive?: string;
}

export interface PendingInvite {
  id: string;
  workspaceId: string;
  workspaceName: string;
  ownerName: string;
  email: string;
  role: WorkspaceRole;
  message?: string;
  sentAt: string;
}

export interface AppNotification {
  id: string;
  type: 'invite' | 'system' | 'billing' | 'insight';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  plan: 'Free' | 'Pro' | 'Max';
  ownerId: string;
  members: WorkspaceMember[];
  createdAt: string;
  slug: string;
  purpose?: string;
  teamSize?: string;
  theme?: 'Midnight' | 'Graphite' | 'Frost' | 'Purple Noir' | 'OLED Black';
  style?: 'AI' | 'Manual';
  goals?: string[];
  isPublic?: boolean;
  accentColor?: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoading: boolean;
  setActiveWorkspace: (id: string) => void;
  createWorkspace: (data: Partial<Workspace>) => Promise<void>;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  inviteMember: (workspaceId: string, email: string, role: WorkspaceRole, message?: string) => Promise<void>;
  removeMember: (workspaceId: string, memberId: string) => Promise<void>;
  updateMemberRole: (workspaceId: string, memberId: string, role: WorkspaceRole) => Promise<void>;
  currentUserRole: WorkspaceRole;
  pendingInvites: PendingInvite[];
  notifications: AppNotification[];
  acceptInvite: (inviteId: string) => Promise<void>;
  declineInvite: (inviteId: string) => Promise<void>;
  clearNotification: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const STORAGE_KEY = 'creatortracker_workspaces';
const ACTIVE_WS_KEY = 'creatortracker_active_workspace';
const INVITES_KEY = 'creatortracker_pending_invites';
const NOTIFS_KEY = 'creatortracker_notifications';

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const savedWorkspaces = localStorage.getItem(STORAGE_KEY);
    const savedActiveId = localStorage.getItem(ACTIVE_WS_KEY);
    const savedInvites = localStorage.getItem(INVITES_KEY);
    const savedNotifs = localStorage.getItem(NOTIFS_KEY);

    if (savedWorkspaces) {
      try {
        setWorkspaces(JSON.parse(savedWorkspaces));
      } catch (e) {
        console.error('Failed to parse workspaces', e);
      }
    }

    if (savedActiveId) {
      setActiveWorkspaceId(savedActiveId);
    }

    if (savedInvites) {
      try { setPendingInvites(JSON.parse(savedInvites)); } catch (e) {}
    }

    if (savedNotifs) {
      try { setNotifications(JSON.parse(savedNotifs)); } catch (e) {}
    }
    
    setIsLoading(false);
    setMounted(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
    localStorage.setItem(INVITES_KEY, JSON.stringify(pendingInvites));
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifications));
    if (activeWorkspaceId) {
      localStorage.setItem(ACTIVE_WS_KEY, activeWorkspaceId);
    }
  }, [workspaces, activeWorkspaceId, pendingInvites, notifications, mounted]);

  // Initial Seeding if empty and user exists
  useEffect(() => {
    if (mounted && workspaces.length === 0 && user) {
      const defaultWs: Workspace = {
        id: 'ws-default',
        name: 'Personal Workspace',
        description: 'My private workspace.',
        plan: 'Pro',
        ownerId: user.id,
        slug: 'personal-workspace',
        createdAt: new Date().toISOString(),
        members: [
          {
            id: user.id,
            name: user.name,
            email: user.email,
            role: 'Owner',
            status: 'online',
            joinedAt: new Date().toISOString(),
          }
        ]
      };
      setWorkspaces([defaultWs]);
      setActiveWorkspaceId(defaultWs.id);
    }
  }, [mounted, workspaces.length, user]);

  const activeWorkspace = (workspaces && workspaces.length > 0) 
    ? (workspaces.find(ws => ws.id === activeWorkspaceId) || workspaces[0]) 
    : null;

  const currentUserRole: WorkspaceRole = activeWorkspace?.members 
    ? (activeWorkspace.members.find(m => m.email === user?.email)?.role || 'Viewer')
    : 'Viewer';

  const createWorkspace = async (data: Partial<Workspace>) => {
    if (!user) return;
    const name = data.name || 'New Workspace';
    const newWs: Workspace = {
      id: `ws-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: data.description || '',
      plan: 'Free',
      ownerId: user.id,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date().toISOString(),
      members: [
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'Owner',
          status: 'online',
          joinedAt: new Date().toISOString(),
        }
      ],
      ...data
    };
    setWorkspaces(prev => [...prev, newWs]);
    setActiveWorkspaceId(newWs.id);
    showToast({ type: 'success', title: 'Workspace Created', description: `"${name}" is ready.` });
  };

  const updateWorkspace = async (id: string, updates: Partial<Workspace>) => {
    setWorkspaces(prev => prev.map(ws => ws.id === id ? { ...ws, ...updates } : ws));
    showToast({ type: 'success', title: 'Workspace Updated', description: 'Changes saved successfully.' });
  };

  const deleteWorkspace = async (id: string) => {
    if (workspaces.length <= 1) {
      showToast({ type: 'error', title: 'Cannot Delete', description: 'You must have at least one workspace.' });
      return;
    }
    setWorkspaces(prev => prev.filter(ws => ws.id !== id));
    if (activeWorkspaceId === id) {
      const remaining = workspaces.filter(ws => ws.id !== id);
      setActiveWorkspaceId(remaining[0]?.id || null);
    }
    showToast({ type: 'success', title: 'Workspace Deleted', description: 'Workspace has been removed.' });
  };

  const setActiveWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
  };

  const inviteMember = async (workspaceId: string, email: string, role: WorkspaceRole, message?: string) => {
    const ws = workspaces.find(w => w.id === workspaceId);
    if (!ws) return;

    // Simulation logic: Only allow emails from known domains
    const knownDomains = ['creatortracker.app', 'example.com', 'gmail.com', 'outlook.com', 'creativelabs.io'];
    const domain = email.split('@')[1];
    
    if (!knownDomains.includes(domain)) {
       showToast({ type: 'error', title: 'User Not Found', description: 'No CreatorTracker account found with this email.' });
       return;
    }

    const newInvite: PendingInvite = {
      id: `inv-${Math.random().toString(36).substr(2, 9)}`,
      workspaceId,
      workspaceName: ws.name,
      ownerName: user?.name || 'Admin',
      email,
      role,
      message,
      sentAt: new Date().toISOString(),
    };

    setPendingInvites(prev => [...prev, newInvite]);
    
    const newNotif: AppNotification = {
      id: `ntf-${Math.random().toString(36).substr(2, 9)}`,
      type: 'invite',
      title: 'Workspace Invitation',
      message: `You've been invited to join ${ws.name} as a ${role}.`,
      timestamp: new Date().toISOString(),
      read: false,
      data: { inviteId: newInvite.id }
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast({ type: 'success', title: 'Invitation Sent', description: `Invite sent to ${email}.` });
  };

  const acceptInvite = async (inviteId: string) => {
    const invite = pendingInvites.find(inv => inv.id === inviteId);
    if (!invite || !user) return;

    const newMember: WorkspaceMember = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: invite.role,
      status: 'online',
      joinedAt: new Date().toISOString(),
      avatar: user.avatar,
    };

    setWorkspaces(prev => prev.map(ws => {
      if (ws.id === invite.workspaceId) {
        return { ...ws, members: [...ws.members, newMember] };
      }
      return ws;
    }));

    setPendingInvites(prev => prev.filter(inv => inv.id !== inviteId));
    setNotifications(prev => prev.filter(n => n.data?.inviteId !== inviteId));

    showToast({ type: 'success', title: 'Invite Accepted', description: `You joined ${invite.workspaceName}.` });
    setActiveWorkspaceId(invite.workspaceId);
  };

  const declineInvite = async (inviteId: string) => {
    setPendingInvites(prev => prev.filter(inv => inv.id !== inviteId));
    setNotifications(prev => prev.filter(n => n.data?.inviteId !== inviteId));
    showToast({ type: 'info', title: 'Invite Declined', description: 'The invitation has been removed.' });
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeMember = async (workspaceId: string, memberId: string) => {
    setWorkspaces(prev => prev.map(ws => {
      if (ws.id === workspaceId) {
        const member = ws.members.find(m => m.id === memberId);
        if (member?.role === 'Owner') {
          showToast({ type: 'error', title: 'Cannot Remove Owner', description: 'Workspace owner cannot be removed.' });
          return ws;
        }
        return { ...ws, members: ws.members.filter(m => m.id !== memberId) };
      }
      return ws;
    }));
    showToast({ type: 'success', title: 'Member Removed', description: 'Member has been removed from workspace.' });
  };

  const updateMemberRole = async (workspaceId: string, memberId: string, role: WorkspaceRole) => {
    setWorkspaces(prev => prev.map(ws => {
      if (ws.id === workspaceId) {
        return {
          ...ws,
          members: ws.members.map(m => m.id === memberId ? { ...m, role } : m)
        };
      }
      return ws;
    }));
    showToast({ type: 'success', title: 'Role Updated', description: 'Member role has been updated.' });
  };

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      activeWorkspace,
      isLoading,
      setActiveWorkspace,
      createWorkspace,
      updateWorkspace,
      deleteWorkspace,
      inviteMember,
      removeMember,
      updateMemberRole,
      currentUserRole,
      pendingInvites,
      notifications,
      acceptInvite,
      declineInvite,
      clearNotification,
      markAllNotificationsRead
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
