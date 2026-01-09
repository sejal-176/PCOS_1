
import { AssessmentResult, User } from '../types';

const USERS_KEY = 'pcos_app_users';
const CURRENT_USER_KEY = 'pcos_app_current_user';
const RESULTS_KEY = 'pcos_app_results';

export const dbService = {
  getUsers: (): User[] => JSON.parse(localStorage.getItem(USERS_KEY) || '[]'),
  
  saveUser: (user: User) => {
    const users = dbService.getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  setCurrentUser: (user: User | null) => {
    if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveAssessment: (result: AssessmentResult) => {
    const results = dbService.getAssessments();
    results.unshift(result);
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  },

  getAssessments: (): AssessmentResult[] => {
    const data = localStorage.getItem(RESULTS_KEY) || '[]';
    return JSON.parse(data);
  },

  getUserAssessments: (userId: string): AssessmentResult[] => {
    return dbService.getAssessments().filter(r => r.userId === userId);
  }
};
