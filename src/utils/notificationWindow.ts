import { notification } from 'antd';

function openWindowNotificationWithIcon(
  type: string,
  message: string,
  description: string,
) {
  notification[type]({
    message: message,
    description: description,
  });
}
export { openWindowNotificationWithIcon };
