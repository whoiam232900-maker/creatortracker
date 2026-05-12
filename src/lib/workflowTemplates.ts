import { generateId, WorkflowCheckpoint } from './store';

export interface WorkflowTemplate {
  id: string;
  name: string;
  checkpoints: string[];
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'tpl-youtube',
    name: 'YouTube Upload Flow',
    checkpoints: ['Scripting', 'A-Roll', 'B-Roll', 'Rough Cut', 'Sound Design', 'Color Grading', 'Thumbnail', 'Upload']
  },
  {
    id: 'tpl-agency',
    name: 'Agency Delivery',
    checkpoints: ['Client Brief', 'Asset Collection', 'First Draft', 'Internal Review', 'Client Revision 1', 'Final Export', 'Delivery']
  },
  {
    id: 'tpl-student',
    name: 'Student Workflow',
    checkpoints: ['Research', 'Outline', 'First Draft', 'Citations', 'Proofread', 'Submit']
  },
  {
    id: 'tpl-business',
    name: 'Business Operations',
    checkpoints: ['Weekly Review', 'Inbox Zero', 'Invoice Processing', 'Team Sync', 'Planning']
  },
  {
    id: 'tpl-editing',
    name: 'Editing Pipeline',
    checkpoints: ['Sync Audio/Video', 'Rough Cut', 'B-Roll/Graphics', 'Sound Mix', 'Color Grade', 'Client Review', 'Final Delivery']
  }
];

export function createWorkflowFromTemplate(template: WorkflowTemplate) {
  return {
    id: generateId('wf'),
    name: template.name,
    status: 'Pending' as const,
    timeLoggedMinutes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    checkpoints: template.checkpoints.map(c => ({
      id: generateId('chk'),
      label: c,
      isCompleted: false
    }))
  };
}
