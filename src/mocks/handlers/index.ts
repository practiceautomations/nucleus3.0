import { handlers as loginHandler } from './login/handlers';
import { handlers as notificationsHandler } from './notification/handlers';

export const handlers = [notificationsHandler, loginHandler];
