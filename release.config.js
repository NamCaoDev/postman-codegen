module.exports = {
    branches: ['main'],
    plugins: [
      // [
      //   "@semantic-release/commit-analyzer",
      //   {
      //     "preset": "conventionalcommits",
      //     "releaseRules": [
      //       { "type": "feat", "release": "minor" },
      //       { "type": "fix", "release": "patch" },
      //       { "type": "BREAKING CHANGE", "release": "major" },
      //       { "scope": "docs", "release": "patch" }
      //     ],
      //     "parserOpts": {
      //       "noteKeywords": ["BREAKING CHANGE", "BREAKING CHANGES"]
      //     }
      //   }
      // ], // analyzer follow tag PA
      '@semantic-release/release-notes-generator', // create changelog
      '@semantic-release/changelog', // insert CHANGELOG.md
      '@semantic-release/npm', // publish to NPM
      '@semantic-release/git', // commit again file package.json & changelog
      [
        "@semantic-release/git",
        {
          "assets": ["package.json", "package-lock.json", "CHANGELOG.md"]
        }
      ]
    ],
  };