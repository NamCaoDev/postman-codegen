module.exports = {
    branches: ['main'],
    plugins: [
      '@semantic-release/commit-analyzer',  // analyzer commit message
      '@semantic-release/release-notes-generator', // create changelog
      '@semantic-release/changelog', // insert CHANGELOG.md
      '@semantic-release/npm', // publish to NPM
      '@semantic-release/git', // commit again file package.json & changelog
    ],
  };