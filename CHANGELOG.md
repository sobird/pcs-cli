# Changelog

## [1.7.1](https://github.com/sobird/pcs-cli/compare/v1.7.0...v1.7.1) (2026-03-04)


### Bug Fixes

* error: Multiple versions of pnpm specified ([0c1a424](https://github.com/sobird/pcs-cli/commit/0c1a424f88210dd91115154fe04d5a0cbbb261e6))

## [1.7.0](https://github.com/sobird/pcs-cli/compare/v1.6.1...v1.7.0) (2026-03-04)


### Features

* **eslint:** upgrade eslint-config-sobird to v1.0 ([942748e](https://github.com/sobird/pcs-cli/commit/942748e6a30b8a7e711b633d16d5ed4505e00c2d))


### Bug Fixes

* @commander-js/extra-typings ambient module setup ([b1e7cb1](https://github.com/sobird/pcs-cli/commit/b1e7cb15ebbe8624889d1940d764a21eb1082bb0))
* cliui v9 need declare module 'cliui' types ([b9b4715](https://github.com/sobird/pcs-cli/commit/b9b47150e64fb5e438405bbba175491447b127b0))
* npm run lint:fix ([78a92f8](https://github.com/sobird/pcs-cli/commit/78a92f87d0e55e3fcf25487a4048a502c5d679a7))
* upgrade eslint-config-sobird to v1.0 ([1b9a074](https://github.com/sobird/pcs-cli/commit/1b9a0749cc43480c5bffc593e9167c8b1396f11d))

## [1.6.1](https://github.com/sobird/pcs-cli/compare/v1.6.0...v1.6.1) (2026-02-24)


### Bug Fixes

* program.exitOverride(); try catch error keep silent ([c2a4840](https://github.com/sobird/pcs-cli/commit/c2a4840bbaffb9fa971a1df09f44fb93cd3e263d))

## [1.6.0](https://github.com/sobird/pcs-cli/compare/v1.5.0...v1.6.0) (2026-02-24)


### Features

* do not use tsconfig paths ([16c2115](https://github.com/sobird/pcs-cli/commit/16c2115f0a49834d30f30927bf54d39608ab1d68))
* using tsup instead of rollup & add src dir ([94f59ba](https://github.com/sobird/pcs-cli/commit/94f59ba1feeb741821690a4afb4510e7b4908834))


### Bug Fixes

* createSuperFile need resolve path ([3f88b0e](https://github.com/sobird/pcs-cli/commit/3f88b0ec4a95e714cf27454d2a2a820b2612ddc2))
* upload file need resolve path ([3f24482](https://github.com/sobird/pcs-cli/commit/3f2448299e9679de2593b6e8cfa446b62726a467))

## [1.5.0](https://github.com/sobird/pcs-cli/compare/v1.4.0...v1.5.0) (2026-01-11)


### Features

* support ImplicitGrant when not enter a secret ([80f5dcf](https://github.com/sobird/pcs-cli/commit/80f5dcf5848b5fef065e3f9b0e4276bb98378e3c))


### Bug Fixes

* if it is not initialized, the command is not allowed to be used ([25f6536](https://github.com/sobird/pcs-cli/commit/25f65369d428c118793acdc8e830d6d31c53a93e))

## [1.4.0](https://github.com/sobird/pcs-cli/compare/v1.3.2...v1.4.0) (2025-12-31)


### Features

* add release-please workflow ([ad78865](https://github.com/sobird/pcs-cli/commit/ad78865a726c9d0b68fefddf2bfbdc453e41a708))
* pcs cmd refactor ([131d368](https://github.com/sobird/pcs-cli/commit/131d368d120b27a92c1957175a44610bdbb32d43))
* use pnpm & tsx ([d7f4251](https://github.com/sobird/pcs-cli/commit/d7f42514e7f0f36fe1de5fab180661ed58ac492a))


### Bug Fixes

* add tsx devDeps ([84ba153](https://github.com/sobird/pcs-cli/commit/84ba1532005251b6abca1980a0c167230aff6657))
* deps vulnerabilities ([f01c7a1](https://github.com/sobird/pcs-cli/commit/f01c7a195fe81cec5dac299edc8064a56b1f9bdd))
* enable trusted publishing for npm packages ([5ee33fe](https://github.com/sobird/pcs-cli/commit/5ee33fec678feb15befb4d6b5a1a6c3d6b611f82))
* publish workflows Set up pnpm need before Set up Node.js ([5551a74](https://github.com/sobird/pcs-cli/commit/5551a741d6ef22037ae56f40b53a589f447bdc53))
* reconfig NODE_AUTH_TOKEN ([551a7fc](https://github.com/sobird/pcs-cli/commit/551a7fcc99f1523373d9a9299438438950d974f4))
* remove package-lock=false npmrc ([1512901](https://github.com/sobird/pcs-cli/commit/151290172758af9592794262b5cd73da8d699de5))
* test it ([0c038af](https://github.com/sobird/pcs-cli/commit/0c038af3fd16d2320e143d818b2f0f98230d30e1))
* test workflow ([b06c589](https://github.com/sobird/pcs-cli/commit/b06c589066bf8d24130616664a8128258cd66972))
* update upload file ([6f260fc](https://github.com/sobird/pcs-cli/commit/6f260fc2589d1a551fa3b8feae2c72b00755ac09))


### Performance Improvements

* 优化代码 ([98392cc](https://github.com/sobird/pcs-cli/commit/98392ccca47d05d71f6c399ed8322dacba621912))

## [1.3.2](https://github.com/sobird/pcs-cli/compare/v1.3.1...v1.3.2) (2025-12-31)


### Bug Fixes

* test it ([0c038af](https://github.com/sobird/pcs-cli/commit/0c038af3fd16d2320e143d818b2f0f98230d30e1))

## [1.3.1](https://github.com/sobird/pcs-cli/compare/v1.3.0...v1.3.1) (2025-12-30)


### Bug Fixes

* test workflow ([b06c589](https://github.com/sobird/pcs-cli/commit/b06c589066bf8d24130616664a8128258cd66972))

## [1.3.0](https://github.com/sobird/pcs-cli/compare/v1.2.5...v1.3.0) (2025-12-30)


### Features

* add release-please workflow ([ad78865](https://github.com/sobird/pcs-cli/commit/ad78865a726c9d0b68fefddf2bfbdc453e41a708))
* pcs cmd refactor ([131d368](https://github.com/sobird/pcs-cli/commit/131d368d120b27a92c1957175a44610bdbb32d43))
* use pnpm & tsx ([d7f4251](https://github.com/sobird/pcs-cli/commit/d7f42514e7f0f36fe1de5fab180661ed58ac492a))


### Bug Fixes

* add tsx devDeps ([84ba153](https://github.com/sobird/pcs-cli/commit/84ba1532005251b6abca1980a0c167230aff6657))
* deps vulnerabilities ([f01c7a1](https://github.com/sobird/pcs-cli/commit/f01c7a195fe81cec5dac299edc8064a56b1f9bdd))
* enable trusted publishing for npm packages ([5ee33fe](https://github.com/sobird/pcs-cli/commit/5ee33fec678feb15befb4d6b5a1a6c3d6b611f82))
* publish workflows Set up pnpm need before Set up Node.js ([5551a74](https://github.com/sobird/pcs-cli/commit/5551a741d6ef22037ae56f40b53a589f447bdc53))
* reconfig NODE_AUTH_TOKEN ([551a7fc](https://github.com/sobird/pcs-cli/commit/551a7fcc99f1523373d9a9299438438950d974f4))
* remove package-lock=false npmrc ([1512901](https://github.com/sobird/pcs-cli/commit/151290172758af9592794262b5cd73da8d699de5))


### Performance Improvements

* 优化代码 ([98392cc](https://github.com/sobird/pcs-cli/commit/98392ccca47d05d71f6c399ed8322dacba621912))

## [1.2.5](https://github.com/sobird/pcs-cli/compare/v1.2.4...v1.2.5) (2025-12-30)


### Bug Fixes

* enable trusted publishing for npm packages ([5ee33fe](https://github.com/sobird/pcs-cli/commit/5ee33fec678feb15befb4d6b5a1a6c3d6b611f82))

## [1.2.4](https://github.com/sobird/pcs-cli/compare/v1.2.3...v1.2.4) (2025-12-30)


### Bug Fixes

* reconfig NODE_AUTH_TOKEN ([551a7fc](https://github.com/sobird/pcs-cli/commit/551a7fcc99f1523373d9a9299438438950d974f4))

## [1.2.3](https://github.com/sobird/pcs-cli/compare/v1.2.2...v1.2.3) (2025-12-30)


### Bug Fixes

* add tsx devDeps ([84ba153](https://github.com/sobird/pcs-cli/commit/84ba1532005251b6abca1980a0c167230aff6657))

## [1.2.2](https://github.com/sobird/pcs-cli/compare/v1.2.1...v1.2.2) (2025-12-30)


### Bug Fixes

* deps vulnerabilities ([f01c7a1](https://github.com/sobird/pcs-cli/commit/f01c7a195fe81cec5dac299edc8064a56b1f9bdd))
* remove package-lock=false npmrc ([1512901](https://github.com/sobird/pcs-cli/commit/151290172758af9592794262b5cd73da8d699de5))

## [1.2.1](https://github.com/sobird/pcs-cli/compare/v1.2.0...v1.2.1) (2025-12-30)


### Bug Fixes

* publish workflows Set up pnpm need before Set up Node.js ([5551a74](https://github.com/sobird/pcs-cli/commit/5551a741d6ef22037ae56f40b53a589f447bdc53))

## [1.2.0](https://github.com/sobird/pcs-cli/compare/v1.1.0...v1.2.0) (2025-12-30)


### Features

* pcs cmd refactor ([131d368](https://github.com/sobird/pcs-cli/commit/131d368d120b27a92c1957175a44610bdbb32d43))
* use pnpm & tsx ([d7f4251](https://github.com/sobird/pcs-cli/commit/d7f42514e7f0f36fe1de5fab180661ed58ac492a))


### Performance Improvements

* 优化代码 ([98392cc](https://github.com/sobird/pcs-cli/commit/98392ccca47d05d71f6c399ed8322dacba621912))

## [1.1.0](https://github.com/sobird/pcs-cli/compare/v1.0.0...v1.1.0) (2024-04-18)


### Features

* add release-please workflow ([ad78865](https://github.com/sobird/pcs-cli/commit/ad78865a726c9d0b68fefddf2bfbdc453e41a708))

## 1.0.0 (2024-04-17)


### Features

* add release-please workflow ([ad78865](https://github.com/sobird/pcs-cli/commit/ad78865a726c9d0b68fefddf2bfbdc453e41a708))
