# Bay Baby Maintenance Android App

This is the native React Native/Expo client for the Bay Baby Produce CMMS. It
supports work orders, assets, inspections, parts, locations, requests, barcode
and NFC scanning, attachments, audio, and notifications.

**And please star the repo**.

**Screenshot**:

<img src="https://i.ibb.co/B39dVjC/Screenshot-20230320-110652.jpg" width="300"/>
<img src="https://i.ibb.co/NWSfcpq/Screenshot-20230320-111216.jpg" width="300"/>

## Start/run
```shell
npm run android
```

## Configuration

Set these environment variables in the command line or creating a `.env` file

| Name       | Required | Description         | Default Value |
|------------|----------|---------------------|---------------|
| API_URL | Yes | Public **HTTPS** CMMS API URL | (empty) |
| EAS_PROJECT_ID | For cloud builds | Company-owned Expo project ID | (empty) |
| GOOGLE_SERVICES_JSON | For remote push | Bay Baby Firebase Android config | (empty) |

## Build
### Setup

Copy `.env.example` to `.env`, set the production API URL, create a
company-owned [Expo](https://expo.dev) project with `npx eas init`, and run:

```shell
npm run store:check
npm run typecheck
```

### Generate builds

```shell
npm run build:android:preview     # installable APK
npm run build:android:production  # Play Store AAB
```

See [PLAY_STORE_RELEASE.md](PLAY_STORE_RELEASE.md) for Firebase, signing, Play
Console, privacy, and release requirements.
## Getting help

If you have questions, concerns, bug reports, etc, please file an issue in this repository's Issue Tracker or send an
email at ibracool99@gmail.com.

## Getting involved

You can contribute in different ways. Sending feedback on features, fixing certain bugs, implementing new features, etc.
Instructions on _how_ to contribute can be found in [CONTRIBUTING](CONTRIBUTING.md).
