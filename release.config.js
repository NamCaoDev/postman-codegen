module.exports = {
    branches: ['main'],
    plugins: [
      '@semantic-release/release-notes-generator', // create changelog
      '@semantic-release/changelog', // insert CHANGELOG.md
      '@semantic-release/npm', // publish to NPM
      [
        "@semantic-release/git",
        {
          "assets": ["CHANGELOG.md", "package.json"],
          "message": "chore(release): ${nextRelease.version} [skip ci]"
        }
      ],
       "@semantic-release/github"
    ],
  };