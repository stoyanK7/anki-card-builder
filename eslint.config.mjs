import js from '@eslint/js';
import globals from 'globals';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import css from '@eslint/css';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
    globalIgnores(['package-lock.json']),
    {
        files: ['**/*.{js,mjs,cjs}'],
        plugins: { js },
        languageOptions: { globals: globals.browser },
        rules: {
            'comma-dangle': ['error', 'never'],
            'indent': ['error', 4],
            'no-tabs': 'error',
            'linebreak-style': ['error', 'unix'],
            'semi': ['error', 'always'],
            'quotes': ['error', 'single'],
            'max-len': ['warn', { code: 80 }],
            'quote-props': ['error', 'consistent-as-needed'],
            'newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }],
            // Suggestions
            'arrow-body-style': ['error', 'always'],
            'block-scoped-var': 'error',
            'camelcase': ['error', { properties: 'always' }],
            'capitalized-comments': ['error', 'always'],
            'complexity': ['error', { max: 10 }],
            'consistent-return': 'error',
            'curly': ['error', 'all'],
            'eqeqeq': ['error', 'always'],
            'func-style': ['error', 'declaration'],
            'logical-assignment-operators': ['error', 'always'],
            'max-depth': ['warn', { max: 3 }]
        }
    },
    {
        files: ['**/*.json'],
        plugins: { json },
        language: 'json/json',
        extends: ['json/recommended']
    },
    {
        files: ['**/*.md'],
        plugins: { markdown },
        language: 'markdown/gfm',
        extends: ['markdown/recommended']
    },
    {
        files: ['**/*.css'],
        plugins: { css },
        language: 'css/css',
        extends: ['css/recommended']
    },
    {
        languageOptions: {
            globals: {
                browser: 'readonly'
            }
        }
    }
]);
