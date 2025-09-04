// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        // @ts-ignore
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // 基础规则配置
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // 类型安全规则 - 默认配置（中等严格）
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // 代码质量规则
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    },
  },

  // 🟢 领域层 - 最严格的类型安全规则
  {
    files: ['src/**/domain/**/*.ts', 'src/**/domain/**/*.tsx'],
    rules: {
      // 严格禁止any类型
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',

      // 强制类型安全
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',

      // 业务逻辑规则
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-readonly': 'warn',
    },
  },

  // 🟡 应用层 - 严格的类型安全规则
  {
    files: ['src/**/application/**/*.ts', 'src/**/application/**/*.tsx'],
    rules: {
      // 严格禁止any类型
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',

      // 强制类型安全
      '@typescript-eslint/explicit-function-return-type': 'warn',

      // 允许一些灵活性
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },

  // 🟠 基础设施层 - 中等类型安全规则
  {
    files: ['src/**/infrastructure/**/*.ts', 'src/**/infrastructure/**/*.tsx'],
    rules: {
      // 允许any类型，但需要明确标记
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // 要求类型注释
      '@typescript-eslint/explicit-function-return-type': 'warn',

      // 允许更多灵活性
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // 🔴 第三方集成层 - 宽松的类型安全规则
  {
    files: [
      'src/**/third-party/**/*.ts',
      'src/**/adapters/**/*.ts',
      'src/**/external/**/*.ts',
    ],
    rules: {
      // 允许any类型，但需要注释说明
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // 要求注释说明
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
    },
  },

  // 🟣 测试文件 - 特殊规则
  {
    files: [
      'src/**/__tests__/**/*.ts',
      'src/**/__tests__/**/*.tsx',
      '**/*.test.ts',
      '**/*.spec.ts',
    ],
    rules: {
      // 测试文件允许更多灵活性 - 完全放开类型检查
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',

      // 测试特定规则
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/unbound-method': 'off',

      // 允许测试中的类型断言和操作
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',

      // 允许测试中的其他常见操作
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
    },
  },

  // 🔵 配置文件 - 特殊规则
  {
    files: [
      '**/*.config.ts',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/jest.config.*',
      '**/webpack.config.*',
    ],
    rules: {
      // 配置文件允许更多灵活性
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
);
