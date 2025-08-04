import js from '@eslint/js';
import globals from 'globals';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import css from '@eslint/css';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs}'],
        plugins: { js },
        languageOptions: { globals: globals.browser },
        rules: {
            'comma-dangle': ['error', 'never'],
            indent: ['error', 4],
            'no-tabs': 'error',
            'linebreak-style': ['error', 'unix'],
            semi: ['error', 'always'],
            quotes: ['error', 'single'],
            'max-len': ['error', { code: 80 }]
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
