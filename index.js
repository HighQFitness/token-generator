import { register } from '@tokens-studio/sd-transforms';
import StyleDictionary from 'style-dictionary';
import fs from 'fs';
import path from 'path';

// will register them on StyleDictionary object
// that is installed as a dependency of this package.
register(StyleDictionary);

// Define token types and their corresponding file names
const tokenTypes = {
  color: 'Colors',
  strokesAndShadows: 'StrokesAndShadows', // This will include border, boxShadow, and opacity
  typography: 'Typography', // This will include typography, textCase, and textDecoration
  spaces: 'Spaces' // This will include dimension and number
};

// Create separate Style Dictionary instances for each token type
const platforms = {};

Object.entries(tokenTypes).forEach(([type, className]) => {
  // Compose platforms
  platforms[`compose_${type}`] = {
    transformGroup: type === 'typography' ? 'tokens-studio' : 'compose',
    transforms: type === 'typography' ? ['ts/typography/compose/shorthand', 'name/camel'] : ['name/camel'],
    buildPath: `build/compose/${type}/`,
    files: [
      {
        destination: `${className}.kt`,
        format: 'compose/object',
        options: {
          className: className,
          packageName: "com.test"
        }
      },
    ],
    options: {
      outputReferences: true,
    }
  };

  // iOS platforms
  platforms[`ios_${type}`] = {
    transformGroup: 'ios',
    buildPath: `build/ios/${type}/`,
    files: [
      {
        destination: `${className}.swift`,
        format: 'ios-swift/enum.swift',
        options: {
          className: className
        }
      }
    ],
    options: {
      outputReferences: true,
    }
  };
});

const sd = new StyleDictionary({
  source: ['tokens/**/*.json'],
  preprocessors: ['tokens-studio'],
  platforms: platforms,
});

// Custom filters to separate tokens by type
Object.entries(tokenTypes).forEach(([type, className]) => {
  if (type === 'typography') {
    // Special filter for typography that includes typography, textCase, and textDecoration
    sd.registerFilter({
      name: `filterByType_${type}`,
      filter: (token) => token.type === 'typography' || token.type === 'textCase' || token.type === 'textDecoration'
    });
  } else if (type === 'strokesAndShadows') {
    // Special filter for strokesAndShadows that includes border, boxShadow, and opacity
    sd.registerFilter({
      name: `filterByType_${type}`,
      filter: (token) => token.type === 'border' || token.type === 'boxShadow' || token.type === 'opacity'
    });
  } else if (type === 'spaces') {
    // Special filter for spaces that includes dimension and number
    sd.registerFilter({
      name: `filterByType_${type}`,
      filter: (token) => token.type === 'dimension' || token.type === 'number'
    });
  } else {
    sd.registerFilter({
      name: `filterByType_${type}`,
      filter: (token) => token.type === type
    });
  }
});

// Apply filters to each platform
Object.entries(tokenTypes).forEach(([type, className]) => {
  // Apply to Compose platforms
  const composePlatformName = `compose_${type}`;
  if (sd.platforms[composePlatformName]) {
    sd.platforms[composePlatformName].files[0].filter = `filterByType_${type}`;
  }
  
  // Apply to iOS platforms
  const iosPlatformName = `ios_${type}`;
  if (sd.platforms[iosPlatformName]) {
    sd.platforms[iosPlatformName].files[0].filter = `filterByType_${type}`;
  }
});

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();