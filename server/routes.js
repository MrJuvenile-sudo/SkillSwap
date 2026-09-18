// server/routes.js - Auto-generated static route registry
// Generated at: 2026-09-18T18:33:38.028Z
// Do NOT edit directly; run "node scripts/generate_routes.mjs" to regenerate.

import handler_account_bookmarks from './api/account/bookmarks.js';
import handler_account_forgot_password from './api/account/forgot-password.js';
import handler_account_login from './api/account/login.js';
import handler_account_logout from './api/account/logout.js';
import handler_account_onboarding from './api/account/onboarding.js';
import handler_account_reset_password from './api/account/reset-password.js';
import handler_account_settings from './api/account/settings.js';
import handler_account_signup from './api/account/signup.js';
import handler_admin_analytics from './api/admin/analytics.js';
import handler_admin_categories from './api/admin/categories.js';
import handler_admin_community from './api/admin/community.js';
import handler_admin_exchanges from './api/admin/exchanges.js';
import handler_admin_index from './api/admin/index.js';
import handler_admin_logs from './api/admin/logs.js';
import handler_admin_notifications from './api/admin/notifications.js';
import handler_admin_reports from './api/admin/reports.js';
import handler_admin_resources from './api/admin/resources.js';
import handler_admin_reviews from './api/admin/reviews.js';
import handler_admin_settings from './api/admin/settings.js';
import handler_admin_skills from './api/admin/skills.js';
import handler_admin_users from './api/admin/users.js';
import handler_admin_verifications from './api/admin/verifications.js';
import handler_admin_workspaces from './api/admin/workspaces.js';
import handler_ai_chat from './api/ai/chat.js';
import handler_ai_feedback from './api/ai/feedback.js';
import handler_ai_history from './api/ai/history.js';
import handler_circles_index from './api/circles/index.js';
import handler_circles_join from './api/circles/join.js';
import handler_endorsements_index from './api/endorsements/index.js';
import handler_events_token from './api/events-token.js';
import handler_exchange_ai_decide from './api/exchange/ai-decide.js';
import handler_exchange_ai_teach_suggest from './api/exchange/ai-teach-suggest.js';
import handler_exchange_balance from './api/exchange/balance.js';
import handler_exchange_goals from './api/exchange/goals.js';
import handler_exchange_progress from './api/exchange/progress.js';
import handler_exchange_teaching_prefs from './api/exchange/teaching-prefs.js';
import handler_matches__id_ from './api/matches/[id].js';
import handler_matches_index from './api/matches/index.js';
import handler_messages_index from './api/messages/index.js';
import handler_notifications_index from './api/notifications/index.js';
import handler_posts from './api/posts.js';
import handler_problems_index from './api/problems/index.js';
import handler_profile from './api/profile.js';
import handler_public_profile from './api/public/profile.js';
import handler_reports_index from './api/reports/index.js';
import handler_requests__id__accept from './api/requests/[id]/accept.js';
import handler_requests__id__reject from './api/requests/[id]/reject.js';
import handler_requests_index from './api/requests/index.js';
import handler_resources__id_ from './api/resources/[id].js';
import handler_resources_download from './api/resources/download.js';
import handler_resources_index from './api/resources/index.js';
import handler_resources_my from './api/resources/my.js';
import handler_resources_requests from './api/resources/requests.js';
import handler_resources_saved from './api/resources/saved.js';
import handler_resources_upload from './api/resources/upload.js';
import handler_reviews_index from './api/reviews/index.js';
import handler_search from './api/search.js';
import handler_session from './api/session.js';
import handler_sessions_index from './api/sessions/index.js';
import handler_skills_directory from './api/skills/directory.js';
import handler_skills_index from './api/skills/index.js';
import handler_skills_user from './api/skills/user.js';
import handler_users_list from './api/users/list.js';
import handler_workspaces__id__goals from './api/workspaces/[id]/goals.js';
import handler_workspaces__id__index from './api/workspaces/[id]/index.js';
import handler_workspaces__id__tasks from './api/workspaces/[id]/tasks.js';
import handler_workspaces_index from './api/workspaces/index.js';

export const routes = [
  { path: '/api/exchange/ai-teach-suggest', handler: handler_exchange_ai_teach_suggest, file: 'exchange/ai-teach-suggest.js' },
  { path: '/api/account/forgot-password', handler: handler_account_forgot_password, file: 'account/forgot-password.js' },
  { path: '/api/exchange/teaching-prefs', handler: handler_exchange_teaching_prefs, file: 'exchange/teaching-prefs.js' },
  { path: '/api/account/reset-password', handler: handler_account_reset_password, file: 'account/reset-password.js' },
  { path: '/api/admin/notifications', handler: handler_admin_notifications, file: 'admin/notifications.js' },
  { path: '/api/admin/verifications', handler: handler_admin_verifications, file: 'admin/verifications.js' },
  { path: '/api/notifications/index', handler: handler_notifications_index, file: 'notifications/index.js' },
  { path: '/api/account/onboarding', handler: handler_account_onboarding, file: 'account/onboarding.js' },
  { path: '/api/endorsements/index', handler: handler_endorsements_index, file: 'endorsements/index.js' },
  { path: '/api/exchange/ai-decide', handler: handler_exchange_ai_decide, file: 'exchange/ai-decide.js' },
  { path: '/api/resources/download', handler: handler_resources_download, file: 'resources/download.js' },
  { path: '/api/resources/requests', handler: handler_resources_requests, file: 'resources/requests.js' },
  { path: '/api/account/bookmarks', handler: handler_account_bookmarks, file: 'account/bookmarks.js' },
  { path: '/api/exchange/progress', handler: handler_exchange_progress, file: 'exchange/progress.js' },
  { path: '/api/account/settings', handler: handler_account_settings, file: 'account/settings.js' },
  { path: '/api/admin/categories', handler: handler_admin_categories, file: 'admin/categories.js' },
  { path: '/api/admin/workspaces', handler: handler_admin_workspaces, file: 'admin/workspaces.js' },
  { path: '/api/exchange/balance', handler: handler_exchange_balance, file: 'exchange/balance.js' },
  { path: '/api/resources/upload', handler: handler_resources_upload, file: 'resources/upload.js' },
  { path: '/api/skills/directory', handler: handler_skills_directory, file: 'skills/directory.js' },
  { path: '/api/workspaces/index', handler: handler_workspaces_index, file: 'workspaces/index.js' },
  { path: '/api/admin/analytics', handler: handler_admin_analytics, file: 'admin/analytics.js' },
  { path: '/api/admin/community', handler: handler_admin_community, file: 'admin/community.js' },
  { path: '/api/admin/exchanges', handler: handler_admin_exchanges, file: 'admin/exchanges.js' },
  { path: '/api/admin/resources', handler: handler_admin_resources, file: 'admin/resources.js' },
  { path: '/api/resources/index', handler: handler_resources_index, file: 'resources/index.js' },
  { path: '/api/resources/saved', handler: handler_resources_saved, file: 'resources/saved.js' },
  { path: '/api/account/logout', handler: handler_account_logout, file: 'account/logout.js' },
  { path: '/api/account/signup', handler: handler_account_signup, file: 'account/signup.js' },
  { path: '/api/admin/settings', handler: handler_admin_settings, file: 'admin/settings.js' },
  { path: '/api/exchange/goals', handler: handler_exchange_goals, file: 'exchange/goals.js' },
  { path: '/api/messages/index', handler: handler_messages_index, file: 'messages/index.js' },
  { path: '/api/problems/index', handler: handler_problems_index, file: 'problems/index.js' },
  { path: '/api/public/profile', handler: handler_public_profile, file: 'public/profile.js' },
  { path: '/api/requests/index', handler: handler_requests_index, file: 'requests/index.js' },
  { path: '/api/sessions/index', handler: handler_sessions_index, file: 'sessions/index.js' },
  { path: '/api/account/login', handler: handler_account_login, file: 'account/login.js' },
  { path: '/api/admin/reports', handler: handler_admin_reports, file: 'admin/reports.js' },
  { path: '/api/admin/reviews', handler: handler_admin_reviews, file: 'admin/reviews.js' },
  { path: '/api/circles/index', handler: handler_circles_index, file: 'circles/index.js' },
  { path: '/api/matches/index', handler: handler_matches_index, file: 'matches/index.js' },
  { path: '/api/notifications', handler: handler_notifications_index, file: 'notifications/index.js' },
  { path: '/api/reports/index', handler: handler_reports_index, file: 'reports/index.js' },
  { path: '/api/reviews/index', handler: handler_reviews_index, file: 'reviews/index.js' },
  { path: '/api/admin/skills', handler: handler_admin_skills, file: 'admin/skills.js' },
  { path: '/api/circles/join', handler: handler_circles_join, file: 'circles/join.js' },
  { path: '/api/endorsements', handler: handler_endorsements_index, file: 'endorsements/index.js' },
  { path: '/api/events-token', handler: handler_events_token, file: 'events-token.js' },
  { path: '/api/resources/my', handler: handler_resources_my, file: 'resources/my.js' },
  { path: '/api/skills/index', handler: handler_skills_index, file: 'skills/index.js' },
  { path: '/api/admin/index', handler: handler_admin_index, file: 'admin/index.js' },
  { path: '/api/admin/users', handler: handler_admin_users, file: 'admin/users.js' },
  { path: '/api/ai/feedback', handler: handler_ai_feedback, file: 'ai/feedback.js' },
  { path: '/api/skills/user', handler: handler_skills_user, file: 'skills/user.js' },
  { path: '/api/admin/logs', handler: handler_admin_logs, file: 'admin/logs.js' },
  { path: '/api/ai/history', handler: handler_ai_history, file: 'ai/history.js' },
  { path: '/api/users/list', handler: handler_users_list, file: 'users/list.js' },
  { path: '/api/workspaces', handler: handler_workspaces_index, file: 'workspaces/index.js' },
  { path: '/api/resources', handler: handler_resources_index, file: 'resources/index.js' },
  { path: '/api/messages', handler: handler_messages_index, file: 'messages/index.js' },
  { path: '/api/problems', handler: handler_problems_index, file: 'problems/index.js' },
  { path: '/api/requests', handler: handler_requests_index, file: 'requests/index.js' },
  { path: '/api/sessions', handler: handler_sessions_index, file: 'sessions/index.js' },
  { path: '/api/ai/chat', handler: handler_ai_chat, file: 'ai/chat.js' },
  { path: '/api/circles', handler: handler_circles_index, file: 'circles/index.js' },
  { path: '/api/matches', handler: handler_matches_index, file: 'matches/index.js' },
  { path: '/api/profile', handler: handler_profile, file: 'profile.js' },
  { path: '/api/reports', handler: handler_reports_index, file: 'reports/index.js' },
  { path: '/api/reviews', handler: handler_reviews_index, file: 'reviews/index.js' },
  { path: '/api/session', handler: handler_session, file: 'session.js' },
  { path: '/api/search', handler: handler_search, file: 'search.js' },
  { path: '/api/skills', handler: handler_skills_index, file: 'skills/index.js' },
  { path: '/api/admin', handler: handler_admin_index, file: 'admin/index.js' },
  { path: '/api/posts', handler: handler_posts, file: 'posts.js' },
  { path: '/api/workspaces/:id/goals', handler: handler_workspaces__id__goals, file: 'workspaces/[id]/goals.js' },
  { path: '/api/workspaces/:id/index', handler: handler_workspaces__id__index, file: 'workspaces/[id]/index.js' },
  { path: '/api/workspaces/:id/tasks', handler: handler_workspaces__id__tasks, file: 'workspaces/[id]/tasks.js' },
  { path: '/api/requests/:id/accept', handler: handler_requests__id__accept, file: 'requests/[id]/accept.js' },
  { path: '/api/requests/:id/reject', handler: handler_requests__id__reject, file: 'requests/[id]/reject.js' },
  { path: '/api/workspaces/:id', handler: handler_workspaces__id__index, file: 'workspaces/[id]/index.js' },
  { path: '/api/resources/:id', handler: handler_resources__id_, file: 'resources/[id].js' },
  { path: '/api/matches/:id', handler: handler_matches__id_, file: 'matches/[id].js' }
];

export function registerRoutes(app) {
  for (const route of routes) {
    app.all(route.path, async (req, res, next) => {
      // For static routes, ensure exact path match so /api/resources doesn't swallow /api/resources/upload
      if (!route.path.includes(':')) {
        const cleanReqPath = req.path.replace(/\/$/, '');
        const cleanRoutePath = route.path.replace(/\/$/, '');
        if (cleanReqPath !== cleanRoutePath) {
          return next();
        }
      }
      try {
        await route.handler(req, res);
      } catch (err) {
        console.error(`Error in API endpoint ${req.method} ${route.path}:`, err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error in api endpoint' });
        }
      }
    });
  }
}
