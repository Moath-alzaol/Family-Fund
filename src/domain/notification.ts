import type { RequestType } from '@/domain/types';
import { strings } from '@/i18n/strings';

export type NotificationKind = 'request_created' | 'request_approved' | 'request_rejected';

export interface NotificationCopyInput {
  kind: NotificationKind;
  requesterName: string;
  actorName?: string | null;
  requestType: RequestType;
  autoExecuted?: boolean;
}

export function notificationCopy(input: NotificationCopyInput) {
  const requestLabel = strings.requestTypes[input.requestType].label;

  switch (input.kind) {
    case 'request_created':
      return {
        title: input.autoExecuted
          ? strings.notifications.autoExecutedTitle
          : strings.notifications.createdTitle,
        body: input.autoExecuted
          ? strings.notifications.autoExecutedBody(input.requesterName, requestLabel)
          : strings.notifications.createdBody(input.requesterName, requestLabel),
      };
    case 'request_approved':
      return {
        title: strings.notifications.approvedTitle,
        body: strings.notifications.approvedBody(input.actorName ?? strings.notifications.adminFallback, requestLabel),
      };
    case 'request_rejected':
      return {
        title: strings.notifications.rejectedTitle,
        body: strings.notifications.rejectedBody(input.actorName ?? strings.notifications.adminFallback, requestLabel),
      };
  }
}
