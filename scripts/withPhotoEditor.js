const fs = require('fs');
const path = require('path');
const {
  withDangerousMod,
  withAndroidManifest,
} = require('@expo/config-plugins');

// Function to modify the iOS Podfile properly inside the target block
function modifyPodfile(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile'
      );

      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf-8');

        const newPods = `
          pod 'SDWebImage', :modular_headers => true
          pod 'SDWebImageWebPCoder', :modular_headers => true
        `;

        // Ensure it's inside the target block
        const targetRegex = /target\s+['"]Checkbits['"]\s+do([\s\S]*?)end/;
        const match = podfileContent.match(targetRegex);

        if (match) {
          const targetBlock = match[0];

          if (!targetBlock.includes("pod 'SDWebImage'")) {
            const updatedTargetBlock = targetBlock.replace(
              /(use_react_native!\([\s\S]*?\))/,
              `$1\n${newPods}`
            );
            podfileContent = podfileContent.replace(
              targetBlock,
              updatedTargetBlock
            );
            fs.writeFileSync(podfilePath, podfileContent, 'utf-8');
          }
        }
      }

      return config;
    },
  ]);
}

// Function to modify AndroidManifest.xml
function addExtraActivityToApplication(androidManifest) {
  const { manifest } = androidManifest;

  if (!Array.isArray(manifest['application'])) {
    console.warn('withIntentActivity: No application array in manifest?');
    return androidManifest;
  }

  const application = manifest['application'].find(
    (item) => item.$['android:name'] === '.MainApplication'
  );

  if (!application) {
    console.warn('withIntentActivity: No .MainApplication?');
    return androidManifest;
  }

  application.$['tools:replace'] = 'android:allowBackup';

  return androidManifest;
}

// Main config plugin
module.exports = function withPhotoEditor(config) {
  config = modifyPodfile(config);

  config = withAndroidManifest(config, (config) => {
    config.modResults = addExtraActivityToApplication(config.modResults);
    return config;
  });

  return config;
};
