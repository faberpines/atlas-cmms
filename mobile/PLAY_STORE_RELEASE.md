# Google Play release handoff

The Android app is branded **Bay Baby Maintenance** and uses the permanent
application ID `com.baybabyproduce.maintenance`.

## Before the first build

1. Put the production API behind HTTPS and set `API_URL` in `.env`. Production
   builds intentionally block cleartext HTTP; debug builds permit it for local
   development.
2. Run `npx eas init` with the Expo account that will own the app, then copy the
   resulting project ID to `EAS_PROJECT_ID` in `.env`.
3. If remote push notifications are needed, register
   `com.baybabyproduce.maintenance` as a new Android app in the Bay Baby Firebase
   project. Download its `google-services.json`, replace the ignored file at
   `android/app/google-services.json`, restore the Google Services plugin line at
   the bottom of `android/app/build.gradle`, and set `GOOGLE_SERVICES_JSON`.
4. Run `npm run store:check` and `npm run typecheck`.

## Build the artifacts

- Testable APK: `npm run build:android:preview`
- Play Store AAB: `npm run build:android:production`

EAS will prompt to create or select an Android upload key. Keep that key under
the company-owned Expo/Google accounts. The production profile emits an Android
App Bundle (`.aab`), the format expected by Google Play.

## Play Console checklist

- Create a Play Console app named **Bay Baby Maintenance** with package ID
  `com.baybabyproduce.maintenance`.
- Enroll in Play App Signing and upload the production AAB to Internal testing
  first.
- Complete App access with a reviewer test account if login is required.
- Complete Data safety for account details, work orders, photos/files, audio,
  diagnostics, and push tokens according to the production configuration.
- Publish a privacy-policy URL and an account/data-deletion URL or in-app flow.
- Supply a 512×512 store icon, 1024×500 feature graphic, phone screenshots,
  short description, and full description.
- Test login, camera/barcode scan, NFC, attachments, audio, notifications, and
  deep links on the internal track before production rollout.

Increase both `android.versionCode` in `app.config.ts` and `versionCode` in
`android/app/build.gradle` for every Play Store update.
