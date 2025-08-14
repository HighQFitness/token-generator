import { register } from '@tokens-studio/sd-transforms';
import StyleDictionary from 'style-dictionary';

// will register them on StyleDictionary object
// that is installed as a dependency of this package.
register(StyleDictionary);

const sd = new StyleDictionary({
  // make sure to have source match your token files!
  // be careful about accidentally matching your package.json or similar files that are not tokens
  source: ['tokens/**/*.json'],
  preprocessors: ['tokens-studio'], // <-- since 0.16.0 this must be explicit
  platforms: {
    compose: {
      transformGroup: 'compose', // <-- apply the tokens-studio transformGroup to apply all transforms
      transforms: ['name/camel'], // <-- add a token name transform for generating token names, default is camel
      buildPath: 'build/compose/',
      files: [
        {
          destination: 'DesignTokens.kt',
          format: 'compose/object',
          options: {
            className: "DesignTokens",
            packageName: "com.test"
          }
        },
      ],
      options: {
        outputReferences: true,
      }
    },
  },
});

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();