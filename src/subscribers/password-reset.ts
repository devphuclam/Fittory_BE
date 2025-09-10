// src/subscribers/password-reset.ts
import { SubscriberArgs, type SubscriberConfig } from '@medusajs/medusa';
import { Modules } from '@medusajs/framework/utils';
import nodemailer from 'nodemailer';

function joinUrl(base: string, path: string) {
  return (
    String(base).replace(/\/+$/, '') + '/' + String(path).replace(/^\/+/, '')
  );
}

export default async function resetPasswordTokenHandler({
  event: {
    data: { entity_id: email, token, actor_type },
  },
  container,
}: SubscriberArgs<{ entity_id: string; token: string; actor_type: string }>) {
  const notificationModuleService = container.resolve(Modules.NOTIFICATION);
  const config = container.resolve('configModule');

  const webPrefix =
    config.admin.storefrontUrl ||
    process.env.MEDUSA_APP_URL ||
    'http://localhost:8081';

  const appScheme = process.env.MEDUSA_APP_SCHEME || 'fittory://';

  // Build web reset URL
  const resetUrlWeb = joinUrl(
    webPrefix,
    `/reset-password?token=${encodeURIComponent(
      token
    )}&email=${encodeURIComponent(email)}`
  );

  // Build app reset URL
  const appPath = `reset-password?token=${encodeURIComponent(
    token
  )}&email=${encodeURIComponent(email)}`;

  let resetUrlApp: string;

  if (process.env.NODE_ENV === 'development') {
    // 👉 Dùng Expo Go deeplink
    // nhớ thay IP = IP local của bạn
    const expoPrefix = `exp://192.168.68.25:8081/--/`;
    resetUrlApp = expoPrefix + appPath;
  } else {
    // 👉 Khi build app thật
    resetUrlApp = String(appScheme).replace(/:\/+$/, '://') + appPath;
  }

  // Save notification
  await notificationModuleService.createNotifications({
    to: email,
    channel: 'email',
    template: 'password-reset',
    data: {
      reset_url: resetUrlWeb,
      reset_url_app: resetUrlApp,
    },
  });

  // Send mail via MailDev (DEV only)
  try {
    if (process.env.NODE_ENV === 'development') {
      const transporter = nodemailer.createTransport({
        host: process.env.MAILDEV_HOST || 'localhost',
        port: Number(process.env.MAILDEV_PORT || 1025),
        secure: false,
      });

      const mailFrom = process.env.MAIL_FROM || 'no-reply@fittory.app';

      const html = `
        <p>Hello,</p>
        <p>Reset your password with one of these:</p>
        <p><a href="${resetUrlWeb}">Web link</a></p>
        <p><a href="${resetUrlApp}">Open in app (Expo)</a></p>
        <p><a href="">${resetUrlApp}</a></p>
      `;

      await transporter.sendMail({
        from: mailFrom,
        to: email,
        subject: 'Fittory — Reset your password (DEV)',
        text: `Reset: ${resetUrlWeb}\nApp: ${resetUrlApp}`,
        html,
      });

      console.info(`[password-reset] dev email sent to ${email}`);
    }
  } catch (err) {
    console.warn('[password-reset] mail send failed', err);
  }
}

export const config: SubscriberConfig = {
  event: 'auth.password_reset',
};
