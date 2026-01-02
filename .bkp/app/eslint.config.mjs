import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  rules: {
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'max-len': ['error', { code: 88 }],
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/singleline-html-element-content-newline': [
      'error',
      {
        ignoreWhenNoAttributes: false,
        ignoreWhenEmpty: true,
      },
    ],
    'vue/multiline-html-element-content-newline': [
      'error',
      {
        ignoreWhenEmpty: true,
      },
    ],
    'vue/require-default-prop': 'off',
    '@stylistic/brace-style': [
      'error',
      '1tbs',
      { allowSingleLine: true },
    ],
  },
});
