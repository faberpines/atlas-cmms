import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const EXPECTED_PACKAGE = 'com.baybabyproduce.maintenance';
const errors = [];
const warnings = [];

let config;
try {
  config = JSON.parse(
    execFileSync('npx', ['expo', 'config', '--json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit']
    })
  );
} catch {
  errors.push('Expo configuration could not be evaluated.');
}

if (config) {
  if (config.android?.package !== EXPECTED_PACKAGE) {
    errors.push(`Android package must be ${EXPECTED_PACKAGE}.`);
  }

  const apiUrl = config.extra?.API_URL;
  if (!apiUrl) {
    errors.push('API_URL is missing.');
  } else if (!apiUrl.startsWith('https://')) {
    errors.push('API_URL must use HTTPS for a production Play Store build.');
  }

  if (!config.extra?.eas?.projectId) {
    warnings.push('EAS_PROJECT_ID is missing; run `npx eas init` before cloud builds.');
  }
}

const gradleProperties = readFileSync(
  resolve('android/gradle.properties'),
  'utf8'
);
if (!/^android\.targetSdkVersion=36$/m.test(gradleProperties)) {
  errors.push('The Android target SDK must be API 36.');
}
if (!/^android\.compileSdkVersion=36$/m.test(gradleProperties)) {
  errors.push('The Android compile SDK must be API 36.');
}

const googleServicesPath = resolve('android/app/google-services.json');
if (existsSync(googleServicesPath)) {
  const googleServices = JSON.parse(readFileSync(googleServicesPath, 'utf8'));
  const firebasePackages = (googleServices.client ?? []).map(
    (client) => client.client_info?.android_client_info?.package_name
  );
  if (!firebasePackages.includes(EXPECTED_PACKAGE)) {
    warnings.push(
      `The existing google-services.json is for ${firebasePackages.filter(Boolean).join(', ') || 'another app'}; remote push notifications are disabled until it is replaced.`
    );
  }
} else {
  warnings.push('No google-services.json is present; remote push notifications are disabled.');
}

for (const warning of warnings) console.warn(`WARN: ${warning}`);
for (const error of errors) console.error(`ERROR: ${error}`);

if (errors.length) {
  console.error(`\nPlay Store preflight failed with ${errors.length} blocking issue(s).`);
  process.exit(1);
}

console.log('\nPlay Store configuration preflight passed.');
