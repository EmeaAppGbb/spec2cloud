module.exports = {
  default: {
    paths: ['specs/features/*.feature'],
    require: ['tests/features/step-definitions/**/*.ts', 'tests/features/support/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress', 'html:test-results/cucumber-report.html'],
    publishQuiet: true,
  },
};
