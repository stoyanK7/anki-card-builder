import js from '@eslint/js';
import globals from 'globals';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import css from '@eslint/css';
import { defineConfig, globalIgnores } from 'eslint/config';
import html from '@html-eslint/eslint-plugin';

export default defineConfig([
    globalIgnores(['package-lock.json']),
    {
        files: ['**/*.{js,mjs,cjs}'],
        plugins: { js },
        languageOptions: { globals: globals.browser },
        extends: ['js/recommended'],
        rules: {
            'comma-dangle': ['error', 'never'],
            'indent': ['error', 4],
            'no-tabs': 'error',
            'linebreak-style': ['error', 'unix'],
            'semi': ['error', 'always'],
            'quotes': ['error', 'single'],
            'max-len': ['warn', { code: 80 }],
            'eol-last': ['error', 'always'],
            'quote-props': ['error', 'consistent-as-needed'],
            'newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }],
            // Suggestions
            'arrow-body-style': ['error', 'as-needed'],
            'block-scoped-var': 'error',
            'camelcase': ['error', { properties: 'always' }],
            'capitalized-comments': ['error', 'always'],
            'complexity': ['error', { max: 10 }],
            'consistent-return': 'error',
            'curly': ['error', 'multi-line'],
            'eqeqeq': ['error', 'always'],
            'func-style': ['error', 'declaration'],
            'logical-assignment-operators': ['error', 'always'],
            'max-depth': ['warn', { max: 3 }]
        }
    },
    {
        files: ['src/shared/**/*.js'],
        rules: {
            // Shared code does not have 'export' statements.
            'no-unused-vars': 'off'
        }
    },
    /**
     * Content scripts do not use 'import' statements, but rather
     * the function is loaded before the script runs so they have access to it.
     */
    {
        files: [
            'src/content-scripts/deepl.js',
            'src/content-scripts/google-translate.js',
            'src/content-scripts/google-images.js',
            'src/content-scripts/wiktionary.js'
        ],
        languageOptions: {
            globals: {
                getStringFromXPath: 'readonly',
                getElementFromXPath: 'readonly',
                getAllElementsFromXPath: 'readonly'
            }
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
        extends: ['markdown/recommended'],
        rules: {
            // False positive on GitHub special alerts.
            'markdown/no-missing-label-refs': 'off'
        }
    },
    {
        ...html.configs['flat/recommended'],
        files: ['**/*.html'],
        rules: {
            ...html.configs['flat/recommended'].rules,
            '@html-eslint/attrs-newline': ['error', { ifAttrsMoreThan: 1 }]
        }
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
