/**
 * Centralized Query Key Factory
 * Provides consistent, type-safe query keys for React Query
 */

export const queryKeys = {
  // Tasks
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.tasks.lists(), filters] as const,
    details: () => [...queryKeys.tasks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
    byProject: (projectId: string) => [...queryKeys.tasks.all, 'project', projectId] as const,
    byAssignee: (userId: string) => [...queryKeys.tasks.all, 'assignee', userId] as const,
  },

  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.projects.lists(), filters] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
    byOrg: (orgId: string) => [...queryKeys.projects.all, 'org', orgId] as const,
  },

  // Timesheets
  timesheets: {
    all: ['timesheets'] as const,
    lists: () => [...queryKeys.timesheets.all, 'list'] as const,
    list: (userId?: string) => [...queryKeys.timesheets.lists(), userId] as const,
    withEntries: (userId?: string) => [...queryKeys.timesheets.all, 'with-entries', userId] as const,
    entries: (timesheetId: string) => [...queryKeys.timesheets.all, 'entries', timesheetId] as const,
    details: () => [...queryKeys.timesheets.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.timesheets.details(), id] as const,
  },

  // Time Logs
  timeLogs: {
    all: ['time-logs'] as const,
    lists: () => [...queryKeys.timeLogs.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.timeLogs.lists(), filters] as const,
    byUser: (userId: string) => [...queryKeys.timeLogs.all, 'user', userId] as const,
    byTask: (taskId: string) => [...queryKeys.timeLogs.all, 'task', taskId] as const,
  },

  // Employees/Profiles
  employees: {
    all: ['employees'] as const,
    lists: () => [...queryKeys.employees.all, 'list'] as const,
    list: (orgId?: string) => [...queryKeys.employees.lists(), orgId] as const,
    details: () => [...queryKeys.employees.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.employees.details(), id] as const,
    directory: (orgId?: string) => [...queryKeys.employees.all, 'directory', orgId] as const,
  },

  // Profiles
  profiles: {
    all: ['profiles'] as const,
    detail: (userId: string) => [...queryKeys.profiles.all, userId] as const,
    byOrg: (orgId: string) => [...queryKeys.profiles.all, 'org', orgId] as const,
  },

  // Organizations
  organizations: {
    all: ['organizations'] as const,
    detail: (id: string) => [...queryKeys.organizations.all, id] as const,
    current: () => [...queryKeys.organizations.all, 'current'] as const,
  },

  // Assessments
  assessments: {
    all: ['assessments'] as const,
    lists: () => [...queryKeys.assessments.all, 'list'] as const,
    list: (orgId?: string) => [...queryKeys.assessments.lists(), orgId] as const,
    detail: (id: string) => [...queryKeys.assessments.all, id] as const,
    questions: (assessmentId: string) => [...queryKeys.assessments.all, 'questions', assessmentId] as const,
    attempts: (userId?: string) => [...queryKeys.assessments.all, 'attempts', userId] as const,
    assignments: (userId?: string) => [...queryKeys.assessments.all, 'assignments', userId] as const,
  },

  // Training
  training: {
    all: ['training'] as const,
    sections: (orgId?: string) => [...queryKeys.training.all, 'sections', orgId] as const,
    videos: (sectionId?: string) => [...queryKeys.training.all, 'videos', sectionId] as const,
    progress: (userId: string) => [...queryKeys.training.all, 'progress', userId] as const,
  },

  // Coins
  coins: {
    all: ['coins'] as const,
    rates: (orgId?: string) => [...queryKeys.coins.all, 'rates', orgId] as const,
    transactions: (userId?: string) => [...queryKeys.coins.all, 'transactions', userId] as const,
    leaderboard: (period?: string) => [...queryKeys.coins.all, 'leaderboard', period] as const,
  },

  // Achievements
  achievements: {
    all: ['achievements'] as const,
    list: (orgId?: string) => [...queryKeys.achievements.all, 'list', orgId] as const,
    userAchievements: (userId: string) => [...queryKeys.achievements.all, 'user', userId] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: (userId?: string) => [...queryKeys.notifications.all, 'list', userId] as const,
    unread: (userId?: string) => [...queryKeys.notifications.all, 'unread', userId] as const,
  },

  // Announcements
  announcements: {
    all: ['announcements'] as const,
    list: (orgId?: string) => [...queryKeys.announcements.all, 'list', orgId] as const,
    detail: (id: string) => [...queryKeys.announcements.all, id] as const,
  },

  // Attendance
  attendance: {
    all: ['attendance'] as const,
    records: (userId?: string, date?: string) => [...queryKeys.attendance.all, 'records', userId, date] as const,
    settings: (orgId?: string) => [...queryKeys.attendance.all, 'settings', orgId] as const,
  },

  // Leave
  leave: {
    all: ['leave'] as const,
    requests: (userId?: string) => [...queryKeys.leave.all, 'requests', userId] as const,
    balances: (userId?: string) => [...queryKeys.leave.all, 'balances', userId] as const,
  },

  // Shifts
  shifts: {
    all: ['shifts'] as const,
    list: (orgId?: string) => [...queryKeys.shifts.all, 'list', orgId] as const,
    byUser: (userId: string) => [...queryKeys.shifts.all, 'user', userId] as const,
  },

  // Messages/Communication
  messages: {
    all: ['messages'] as const,
    channels: (orgId?: string) => [...queryKeys.messages.all, 'channels', orgId] as const,
    channelMessages: (channelId: string) => [...queryKeys.messages.all, 'channel', channelId] as const,
    direct: (userId: string) => [...queryKeys.messages.all, 'direct', userId] as const,
  },

  // Comments
  comments: {
    all: ['comments'] as const,
    byTask: (taskId: string) => [...queryKeys.comments.all, 'task', taskId] as const,
    byProject: (projectId: string) => [...queryKeys.comments.all, 'project', projectId] as const,
  },

  // Subtasks
  subtasks: {
    all: ['subtasks'] as const,
    byTask: (taskId: string) => [...queryKeys.subtasks.all, 'task', taskId] as const,
  },

  // Checklists
  checklists: {
    all: ['checklists'] as const,
    byTask: (taskId: string) => [...queryKeys.checklists.all, 'task', taskId] as const,
  },

  // Custom Fields
  customFields: {
    all: ['custom-fields'] as const,
    definitions: (orgId?: string) => [...queryKeys.customFields.all, 'definitions', orgId] as const,
    values: (taskId: string) => [...queryKeys.customFields.all, 'values', taskId] as const,
  },

  // Approvals
  approvals: {
    all: ['approvals'] as const,
    workflows: (orgId?: string) => [...queryKeys.approvals.all, 'workflows', orgId] as const,
    pending: (userId?: string) => [...queryKeys.approvals.all, 'pending', userId] as const,
  },

  // Expenses
  expenses: {
    all: ['expenses'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.expenses.all, 'list', filters] as const,
    categories: (orgId?: string) => [...queryKeys.expenses.all, 'categories', orgId] as const,
  },

  // Loans
  loans: {
    all: ['loans'] as const,
    list: (userId?: string) => [...queryKeys.loans.all, 'list', userId] as const,
  },

  // Documents
  documents: {
    all: ['documents'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.documents.all, 'list', filters] as const,
  },

  // Assets
  assets: {
    all: ['assets'] as const,
    list: (orgId?: string) => [...queryKeys.assets.all, 'list', orgId] as const,
    byUser: (userId: string) => [...queryKeys.assets.all, 'user', userId] as const,
  },
} as const;

// Type helper for query keys
export type QueryKeys = typeof queryKeys;
