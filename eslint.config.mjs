import Eslint from '@eslint/js';
import TsEslint from 'typescript-eslint';

import EslintPluginHapi from '@hapi/eslint-plugin';

const denylist = new Set([]);

const tsifyConfig = function (from) {

    const configs = from.map((source) => {

        const rules = {};
        const config = { ...source, rules };

        for (const rule in source.rules) {
            if (TsEslint.plugin.rules[rule] && !denylist.has(rule)) {
                rules[rule] = 'off';
                rules[`@typescript-eslint/${rule}`] = source.rules[rule];
            }
        }

        return config;
    });

    return configs;
};

export default TsEslint.config(
    Eslint.configs.recommended,
    TsEslint.configs.eslintRecommended,
    EslintPluginHapi.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module'
        }
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
        extends: [
            TsEslint.configs.base,
            ...tsifyConfig(EslintPluginHapi.configs.recommended)
        ],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            parserOptions: {
                projectService: true
            }
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',

            //'@typescript-eslint/member-delimiter-style': 'warn',
            //'@typescript-eslint/no-throw-literal': 'error',
            '@typescript-eslint/prefer-for-of': 'warn',
            //'@typescript-eslint/type-annotation-spacing': 'warn',
            '@typescript-eslint/unified-signatures': 'warn'
        }
    }
);
