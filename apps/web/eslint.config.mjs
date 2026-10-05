// Solo templates HTML: TS y JS los cubre Biome.
import angular from 'angular-eslint'
import tseslint from 'typescript-eslint'

export default tseslint.config({
  files: ['**/*.html'],
  extends: [...angular.configs.templateRecommended],
})
