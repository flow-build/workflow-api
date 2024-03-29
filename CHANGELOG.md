## [2.32.0](https://github.com/flow-build/workflow/compare/v2.31.2...v2.32.0) (2023-08-17)


### Features

* adds knex pool connection configs ([0bf2a3d](https://github.com/flow-build/workflow/commit/0bf2a3d5e3b5e31f56ae5d9a5cc4d9b8ba6718b9))

## [2.31.2](https://github.com/flow-build/workflow/compare/v2.31.1...v2.31.2) (2023-08-16)


### Bug Fixes

* updates engine version to 2.32.1 to remove unecessary bp validation ([dbf1d33](https://github.com/flow-build/workflow/commit/dbf1d336ee1cd97913d051309d87d20198c0bc55))

## [2.31.1](https://github.com/flow-build/workflow/compare/v2.31.0...v2.31.1) (2023-06-20)


### Bug Fixes

* fix typo on filename casing ([0a299c5](https://github.com/flow-build/workflow/commit/0a299c5bad9c69c2d93642a081b727964abe8219))

## [2.31.0](https://github.com/flow-build/workflow/compare/v2.30.0...v2.31.0) (2023-06-20)


### Features

* add graphQL custom node ([c9a7a3c](https://github.com/flow-build/workflow/commit/c9a7a3ced1d40dd1da1f2ab9b19fd7d93042ae9c))


### Bug Fixes

* fix typos ([97d1e60](https://github.com/flow-build/workflow/commit/97d1e60e665721334ed43acf846220f32e557ba7))

## [2.30.0](https://github.com/flow-build/workflow/compare/v2.29.0...v2.30.0) (2023-05-25)


### Features

* add /cockpit/envs routes ([73a71d1](https://github.com/flow-build/workflow/commit/73a71d1fd11660acb819f2cca3ddf1f87c62f761))
* update engine to add blueprint _extract and node extract properties ([aad7342](https://github.com/flow-build/workflow/commit/aad73427dea90637a8dd68dd9f1016f7f7522979))
* update engine to add process_id on GET /cockpit/processes/:id/execution ([7f0f979](https://github.com/flow-build/workflow/commit/7f0f979a785799628b5f86c965c11e527b45ad41))


### Bug Fixes

* adjust GET /cockpit/envs to return only table variables ([152fb5d](https://github.com/flow-build/workflow/commit/152fb5d723b9ebaf55f635976d4e965e3c4cc402))

## [2.29.0](https://github.com/flow-build/workflow/compare/v2.28.0...v2.29.0) (2023-05-24)


### Features

* changes topic used to publish KAFKA beacon message ([2560683](https://github.com/flow-build/workflow/commit/256068380446b8060e21130f5df6c8d499a1e9b6))
* sets KAFKA_NAMESPACE var to name topic on beacon ([16872b8](https://github.com/flow-build/workflow/commit/16872b8cd00baeb94329494b682de0b0cc3d5dec))

## [2.28.0](https://github.com/flow-build/workflow/compare/v2.27.0...v2.28.0) (2023-05-24)


### Features

* adds extra data on state message to brokers ([3a9df7a](https://github.com/flow-build/workflow/commit/3a9df7a60c74d4516f0be73f7a94becd10e49c43))
* adjustment to always send all process ids available ([42ecdfa](https://github.com/flow-build/workflow/commit/42ecdfa01e81f96a35e1ef13f58a0b2c3a9b783a))

## [2.27.0](https://github.com/flow-build/workflow/compare/v2.26.0...v2.27.0) (2023-05-18)


### Features

* adds /connection/beacon route and its controller ([3553dd3](https://github.com/flow-build/workflow/commit/3553dd3383ce63fe58a05cb22a56e871a9b3cffa))
* adds error detailing failure in case of broker not enabled ([7f876d8](https://github.com/flow-build/workflow/commit/7f876d8d99c526b2be8a5a7088725f1324e0b858))
* moves /connection route to cockpit and adds optional 'token' data ([7a2e1af](https://github.com/flow-build/workflow/commit/7a2e1af9f9dd45cfeb85d7e4e075afd12bee2cb5))
* sets default topic name if namespace is not set ([886f300](https://github.com/flow-build/workflow/commit/886f300e70f149d36f6b848ec446554eb59242f3))
* updates beacon route behavior and responses ([5124554](https://github.com/flow-build/workflow/commit/5124554037ec9e468b51f1238af2c5b63bf82c6e))


### Bug Fixes

* adjust mqtt topics ([5dbcd59](https://github.com/flow-build/workflow/commit/5dbcd591952703835073abc38a5a8802434a1c59))
* gets engine_id from @flowbuild/engine utility ([f1422c9](https://github.com/flow-build/workflow/commit/f1422c99bcef0250aabb5cb9d1b5d30f25345634))

## [2.26.0](https://github.com/flow-build/workflow/compare/v2.25.1...v2.26.0) (2023-05-16)


### Features

* update engine to abort & expire process keep bag on state ([0e6ad4c](https://github.com/flow-build/workflow/commit/0e6ad4cf4dcafc51712d4e13d77ab773da6c41bd))

## [2.25.1](https://github.com/flow-build/workflow/compare/v2.25.0...v2.25.1) (2023-05-10)


### Bug Fixes

* updates '@flowbuild/nodejs-diagram-builder' package version ([3f2570c](https://github.com/flow-build/workflow/commit/3f2570c97aa94e9dbdfe5467801a5f137fac4406))

## [2.25.0](https://github.com/flow-build/workflow/compare/v2.24.0...v2.25.0) (2023-05-09)


### Features

* adds historyExecution route on cockpit router ([5a85236](https://github.com/flow-build/workflow/commit/5a85236411855d5523ebfea96267a36420dcbec5))
* adds new routes to fetch state execution context ([c7db792](https://github.com/flow-build/workflow/commit/c7db7920f869b736802869457d5f024d4add9c5e))
* updates fetchProcessHistory controller to add fromStep query parameter ([afa6b44](https://github.com/flow-build/workflow/commit/afa6b4466890f729331df6925746b32cc4297704))


### Bug Fixes

* changes endpoint, overwriting old '/execution' route ([8d54b04](https://github.com/flow-build/workflow/commit/8d54b043d0c2ff4352989f3098d023a791063db3))
* removes export from unexisting name ([95e89d7](https://github.com/flow-build/workflow/commit/95e89d74e31692f4605c93910fd683402d9e25a4))

## [2.24.0](https://github.com/flow-build/workflow/compare/v2.23.1...v2.24.0) (2023-04-28)


### Features

* add the workflow name in the response when a blueprint is published ([d6e12be](https://github.com/flow-build/workflow/commit/d6e12be0492f4fdf2fa2fd93fb4c074b0f021ca7))

## [2.23.1](https://github.com/flow-build/workflow/compare/v2.23.0...v2.23.1) (2023-04-28)


### Bug Fixes

* **middlewares:** add by default all token keys to extData ([4560b98](https://github.com/flow-build/workflow/commit/4560b98eb61c056a23cafd6000503891752dbd93))

## [2.23.0](https://github.com/flow-build/workflow/compare/v2.22.4...v2.23.0) (2023-04-26)


### Features

* adds new listener for EventNode notifications and adjust topic names ([1125f75](https://github.com/flow-build/workflow/commit/1125f75dbe434ddda9ae11ff3826b67006a2557d))
* adds trigger event emition ([511b790](https://github.com/flow-build/workflow/commit/511b7909bf4c9da0afc9e73e9244d95dc1e2065f))
* separates workflow publishing and sets all workflows to be published ([14444c4](https://github.com/flow-build/workflow/commit/14444c4779866198cc1cb8041f9a52c29b4eff3f))
* updates engine version ([acf526e](https://github.com/flow-build/workflow/commit/acf526e0ff0110037bfcf117063f2534409e2ed5))
* updates topic name creation ([5c5f52b](https://github.com/flow-build/workflow/commit/5c5f52bbd6f5ce37d70b3a8d0571358ac3a7df02))
* updates workflow creation controller to emit event ([24d2732](https://github.com/flow-build/workflow/commit/24d27320f93c6413fff1b81b874917febdbd8199))

## [2.22.4](https://github.com/flow-build/workflow/compare/v2.22.3...v2.22.4) (2023-03-29)


### Bug Fixes

* update engine to adjust continue process ([c0c5b1e](https://github.com/flow-build/workflow/commit/c0c5b1e1b552f0c585481380ef7fdc4f67e40fde))

## [2.22.3](https://github.com/flow-build/workflow/compare/v2.22.2...v2.22.3) (2023-03-29)


### Bug Fixes

* adjust option to send message only on creation ([2ce757a](https://github.com/flow-build/workflow/commit/2ce757a7985ca3464e4f71d149027046fb40d84a))
* set broker default to MQTT ([856975a](https://github.com/flow-build/workflow/commit/856975a4a1b63dfad139347ebf4f60f14389d2f0))

## [2.22.2](https://github.com/flow-build/workflow/compare/v2.22.1...v2.22.2) (2023-03-28)


### Bug Fixes

* change implementation to kafkajs ([b86da37](https://github.com/flow-build/workflow/commit/b86da37b950f1d9eb99b590f50234a501402963d))

## [2.22.1](https://github.com/flow-build/workflow/compare/v2.22.0...v2.22.1) (2023-03-28)


### Bug Fixes

* add option to choose status to listen on engineListener ([b8a1651](https://github.com/flow-build/workflow/commit/b8a16517d95adba480bc640201d86652d192bc17))
* enable activityManagerListener to send message only on creation ([b59c5af](https://github.com/flow-build/workflow/commit/b59c5af77a2bd1c96b51a3f97b3cb385fba1e94a))

## [2.22.0](https://github.com/flow-build/workflow/compare/v2.21.3...v2.22.0) (2023-03-27)


### Features

* add kafka broker and publish node ([9728c1a](https://github.com/flow-build/workflow/commit/9728c1a5e99b2ec05cff6ed24510ac68ac67b02f))

## [2.21.3](https://github.com/flow-build/workflow/compare/v2.21.2...v2.21.3) (2023-03-25)


### Bug Fixes

* :card_file_box: add ssl property to prod knex config ([68c781c](https://github.com/flow-build/workflow/commit/68c781cab76a6f62343ab7e28e254470d3784598))

## [2.21.2](https://github.com/flow-build/workflow/compare/v2.21.1...v2.21.2) (2023-03-25)


### Bug Fixes

* add option to choose status to listen on engineListener ([99affbb](https://github.com/flow-build/workflow/commit/99affbbe0beded0af0e2fa8e3244540700835595))

## [2.21.1](https://github.com/flow-build/workflow/compare/v2.21.0...v2.21.1) (2023-03-24)


### Bug Fixes

* update engine to allow disabling timer batch ([86f2abd](https://github.com/flow-build/workflow/commit/86f2abdb4b77c602cbdec9d936aa5600c9ae236f))

## [2.21.0](https://github.com/flow-build/workflow/compare/v2.20.2...v2.21.0) (2023-03-21)


### Features

* add expireActivityManager method ([75f6196](https://github.com/flow-build/workflow/commit/75f619690b815b08573f3a8d2fecf6a116c20170))
* add expireProcess ([821274d](https://github.com/flow-build/workflow/commit/821274dce90ee9bd3e9c71450559551b3d14d938))

## [2.20.2](https://github.com/flow-build/workflow/compare/v2.20.1...v2.20.2) (2023-03-16)


### Bug Fixes

* adjust mqtt topic key ([e916dbd](https://github.com/flow-build/workflow/commit/e916dbd2b55e602755675d5e55a0fb55ed91b0dd))

## [2.20.1](https://github.com/flow-build/workflow/compare/v2.20.0...v2.20.1) (2023-03-15)


### Bug Fixes

* adjust app start from nodemon to node ([10012c1](https://github.com/flow-build/workflow/commit/10012c11abd4e629876f628a523f282073aeafca))
* pin app port to 3000 ([b5ca7fa](https://github.com/flow-build/workflow/commit/b5ca7fa0efa32d99f1d5498f11effea15dfa6444))

## [2.20.0](https://github.com/flow-build/workflow/compare/v2.19.0...v2.20.0) (2023-03-14)


### Features

* add optional rabbitmq service ([96b9f31](https://github.com/flow-build/workflow/commit/96b9f31a7d042eee3062db1c1b3efa6214bc9b8f))
* update engine to 2.22.2 ([5f337ec](https://github.com/flow-build/workflow/commit/5f337ece88f9b24e8769f64d0cf12b5eecd864ff))

## [2.19.0](https://github.com/flow-build/workflow/compare/v2.18.0...v2.19.0) (2023-03-08)


### Features

* :sparkles: add process tree to process state listener ([f73a307](https://github.com/flow-build/workflow/commit/f73a3075dfb22cc4bd7687b12df3950052a40929))
* **controllers:** :sparkles: add get process tree route to cockpit ([a38b38a](https://github.com/flow-build/workflow/commit/a38b38ad0e58375339099fad98ba34d9d31174a4))


### Bug Fixes

* **controllers:** update function signature ([110e654](https://github.com/flow-build/workflow/commit/110e6543b4dc0a2614de03695986cb0641a55045))

## [2.18.0](https://github.com/flow-build/workflow/compare/v2.17.0...v2.18.0) (2023-02-23)


### Features

* :sparkles: add timers information to healthcheck ([334f39e](https://github.com/flow-build/workflow/commit/334f39e2cf0529fec45f421f0212128e9e70434e))
* :sparkles: allow the definition of a namespace to topics ([09758ae](https://github.com/flow-build/workflow/commit/09758ae7ebe34f7d0b120dfa0bf92c3efe02ae52))
* :sparkles: allow to set diferent jwt key, algorithm and payload structure ([881246c](https://github.com/flow-build/workflow/commit/881246cb650f4d28b0fda01d2f0b6301ee9dbd8c))
* adds newrelic no server.js ([752301c](https://github.com/flow-build/workflow/commit/752301cbd1c54a023b7f7b736aa12cc79f1af6a7))

## [2.17.0](https://github.com/flow-build/workflow/compare/v2.16.3...v2.17.0) (2023-02-17)


### Features

* add possibility to get nested objects on dictionary ([42dd74d](https://github.com/flow-build/workflow/commit/42dd74d30ac7e56a5f2a820d2fd90d9932ddfddd))
* adds warn logs to http node ([714e031](https://github.com/flow-build/workflow/commit/714e031b645132fb2990d270d626a36ef942af8f))

## [2.16.3](https://github.com/flow-build/workflow/compare/v2.16.2...v2.16.3) (2023-01-30)


### Bug Fixes

* add username and password to mqtt broker connection ([80cb4a5](https://github.com/flow-build/workflow/commit/80cb4a5065a9c79263a3bf25552318fde054b60f))

## [2.16.2](https://github.com/flow-build/workflow/compare/v2.16.1...v2.16.2) (2023-01-27)


### Bug Fixes

* **tests:** :white_check_mark: Fix unstable tests ([eee8e9e](https://github.com/flow-build/workflow/commit/eee8e9ec3f3c619d9d4c578391d75a4e1290b712))

## [2.16.1](https://github.com/flow-build/workflow/compare/v2.16.0...v2.16.1) (2023-01-24)


### Bug Fixes

* updates package versions to solve sec issues ([a53100e](https://github.com/flow-build/workflow/commit/a53100ed697f23c97c57884977c3f360f3bdfe85))

## [2.16.0](https://github.com/flow-build/workflow/compare/v2.15.0...v2.16.0) (2022-12-28)


### Features

* rewrite return value ([b4a7511](https://github.com/flow-build/workflow/commit/b4a7511766bb945e512cb6be280453cad74cafed))


### Bug Fixes

* adjust unsorted insertion ([be4cf7d](https://github.com/flow-build/workflow/commit/be4cf7dd8d7a20afbbf620f7e10cb6ffa08c3b80))
* adjust unsorted insertion on filter data ([d1ab825](https://github.com/flow-build/workflow/commit/d1ab82530558365a30431dd28003f445fadf2fb2))
* remove unecessary spaces ([6a735e1](https://github.com/flow-build/workflow/commit/6a735e1e39fc7d318dfe3d4b976fd121c1ca3ecb))

## [2.15.0](https://github.com/flow-build/workflow/compare/v2.14.1...v2.15.0) (2022-12-28)


### Features

* adjust to receive primary data set ([40dde72](https://github.com/flow-build/workflow/commit/40dde72fd61ffebe0d5aeb94eef752e955106c04))

## [2.14.1](https://github.com/flow-build/workflow/compare/v2.14.0...v2.14.1) (2022-12-26)


### Bug Fixes

* add useSsl to node schema ([a082d35](https://github.com/flow-build/workflow/commit/a082d3522bf4f797f8d0d5ab3a2c0eb67c010187))
* adds useSsl parameter to grpc node ([80e6c6c](https://github.com/flow-build/workflow/commit/80e6c6cb0fa7eb543fdba7ce4405d65c0c6cb574))

## [2.14.0](https://github.com/flow-build/workflow/compare/v2.13.0...v2.14.0) (2022-12-21)


### Features

* adds grpc custom node ([d872db2](https://github.com/flow-build/workflow/commit/d872db25acce90eb5934a94edb37ff88f485fc47))

## [2.13.0](https://github.com/flow-build/workflow/compare/v2.12.0...v2.13.0) (2022-12-13)


### Features

* add custom node filter data ([0558025](https://github.com/flow-build/workflow/commit/0558025cf961345d7559a448eff0c0305c6f8cf5))
* change function to filter data and generate n result by n keys ([2d28c18](https://github.com/flow-build/workflow/commit/2d28c18dbce2d612030ba8cb2a41a2bf6250fb32))


### Bug Fixes

* add data, values and key to required list ([b5a22bd](https://github.com/flow-build/workflow/commit/b5a22bd3d5f8856dddc4fc1da14465cacf5fe75e))
* add required variables ([b13d46a](https://github.com/flow-build/workflow/commit/b13d46a4f41b25b0553bf04946b4e9a0cffca9a5))
* adjust required for get schema ([fd4580e](https://github.com/flow-build/workflow/commit/fd4580e5b27198098e2b4fe8feb6cb7fa2b032eb))
* adjust required variables ([18cd2d1](https://github.com/flow-build/workflow/commit/18cd2d187bf9854ad440dc6746024198f9033abc))
* adjust schema ([c21e733](https://github.com/flow-build/workflow/commit/c21e733f1e35ebc2417236f6ada624ff587b8ddc))
* change logger info ([d29be9c](https://github.com/flow-build/workflow/commit/d29be9c138e341241b364a833448c2d28ad22bfa))
* fix schema ref ([e14485a](https://github.com/flow-build/workflow/commit/e14485a505b1f44dcb05645206a30e052e98faa5))
* fix schema validate, add check typeOf values and fix call to validate schema ([97620cf](https://github.com/flow-build/workflow/commit/97620cf07988270db63fb914749d47354fd91867))
* remove type items from primary_keys validateExecutionData ([f4d7ea5](https://github.com/flow-build/workflow/commit/f4d7ea5aeb48e00f9b681659b799a5f9ee01c1d8))
* resolve duplication on schema ([4419aa4](https://github.com/flow-build/workflow/commit/4419aa4e785c7afae134fa9d553d85f134d98bae))

## [2.12.0](https://github.com/flow-build/workflow/compare/v2.11.0...v2.12.0) (2022-12-13)


### Features

* add deepCompare customNode ([ea68abd](https://github.com/flow-build/workflow/commit/ea68abdc042390b4ee576356467620298929c136))
* import deepCompareNode ([514bece](https://github.com/flow-build/workflow/commit/514becec3e168b9ffed55141fe4a38bda5c2e024))

## [2.11.0](https://github.com/flow-build/workflow/compare/v2.10.1...v2.11.0) (2022-12-05)


### Features

* add customNode remapData ([adb9573](https://github.com/flow-build/workflow/commit/adb957316c9570d6a9ea32b5ed9e978566f3c10f))
* add new validationExecutionData method ([e061043](https://github.com/flow-build/workflow/commit/e061043267a36a2e3fda4adc941aa2bef051e549))
* include dot notation & rename properties ([f49f1e9](https://github.com/flow-build/workflow/commit/f49f1e9766514d5645d1b6ec9d8e1aa9111b96d5))


### Bug Fixes

* adjust schema validation ([092e058](https://github.com/flow-build/workflow/commit/092e0583d079b4ffffb4194934818179e4a4b6c0))

## [2.10.1](https://github.com/flow-build/workflow/compare/v2.10.0...v2.10.1) (2022-10-08)


### Bug Fixes

* update first time contributor action ([77a5d4e](https://github.com/flow-build/workflow/commit/77a5d4e9ac997869cad06c13ac4179d9aa4cdfb1))

## [2.10.0](https://github.com/flow-build/workflow/compare/v2.9.0...v2.10.0) (2022-10-08)


### Features

* **FKIW-11:** criação das rotas de workflow referentes ao cockpitRouter ([6f13974](https://github.com/flow-build/workflow/commit/6f139749343965f3b491bca11e88b31b1ac9528f))
* **FLOW-10:** Construção das rotas dos endpoints no yaml de acordo com as especificações do código respectivo. Adequação das tags e responses ([878d1e0](https://github.com/flow-build/workflow/commit/878d1e0d98df72ab88ae50ae6ead8c7b0bd75af3))
* **FLOW-10:** organização das rotas em blocos e organização das rotas de acordo com o mainRouter ([d0db4be](https://github.com/flow-build/workflow/commit/d0db4be54c58da6719a6cf9d0ee915d767c531e8))
* **FLOW-11:** adequação das tags de acordo com os correspondentes outputs ([d319aef](https://github.com/flow-build/workflow/commit/d319aefbf71af154641acb89752035de0c02c576))
* **FLOW-11:** adequação das tags de acordo com os correspondentes outputs ([5f3bf04](https://github.com/flow-build/workflow/commit/5f3bf04e3ad6dc15d50a43a0025f43986abec541))
* **FLOW-11:** criação da rota /activities/available do mainRouter.js ([aa7ee40](https://github.com/flow-build/workflow/commit/aa7ee40d3075d2731acbd0eabeed4d8bfd2783f6))
* **FLOW-11:** criação da rota /activity_manager/{activity_manager_id}/commit do mainRouter.js ([0b8b91f](https://github.com/flow-build/workflow/commit/0b8b91f5eadc135f1c6fe41ed7bd98fcfb7ad2bd))
* **FLOW-11:** criação da rota /indexer do mainRouter.js ([f83a4a4](https://github.com/flow-build/workflow/commit/f83a4a4ec01775584b1d94076e79ba1a72c3a4ee))
* **FLOW-11:** criação da rota /indexer/{id} do mainRouter.js ([dcde768](https://github.com/flow-build/workflow/commit/dcde7681194132fe386ef7d0e33953424ed11c73))
* **FLOW-11:** criação da rota /indexer/entity/{id} do mainRouter.js ([05fbb8b](https://github.com/flow-build/workflow/commit/05fbb8b3721b079d20ad00bbba54c74213c34651))
* **FLOW-11:** criação da rota /indexer/entity/type/{type} do mainRouter.js ([a0c4f57](https://github.com/flow-build/workflow/commit/a0c4f57eecb6c5ce0c48ecc97c8c6630174142d2))
* **FLOW-11:** criação da rota /indexer/process/{id} do mainRouter.js ([44bf9a6](https://github.com/flow-build/workflow/commit/44bf9a65c35444f58810d31315b705d5e98e0250))
* **FLOW-11:** criação da rota /process/{process_id}/continue do mainRouter.js ([1c08c88](https://github.com/flow-build/workflow/commit/1c08c884974a30c2527a6aa8faaec23a9118def0))
* **FLOW-11:** criação da rota /states/{id} do mainRouter ([23d5e37](https://github.com/flow-build/workflow/commit/23d5e37caa4003508816f4b3b1bd03d1372f03c7))
* **FLOW-11:** criação da rota /states/{id}/execution do mainRouter.js ([bf2b89e](https://github.com/flow-build/workflow/commit/bf2b89e34d26ba805887e3d9e3acea8617eabe38))
* **FLOW-11:** criação da rota /states/{id}/spec do mainRouter.js ([aa657c0](https://github.com/flow-build/workflow/commit/aa657c07fd6cf7f06aa9ac8974ee37e8b875e851))
* **FLOW-11:** criação da rota /states/process/{id} do mainRouter.js ([baadcee](https://github.com/flow-build/workflow/commit/baadceef49ecea9a50c6ce6d1422d273724d3c09))
* **FLOW-11:** criação das rotas /workflows/diagram e /workflows/diagram/convert do mainRouter.js ([054b1b7](https://github.com/flow-build/workflow/commit/054b1b7f6898c492fa1d494f355e023ca030152b))
* **FLOW-11:** criação das rotas referentes ao cockpitRouter ([16980de](https://github.com/flow-build/workflow/commit/16980ded2c39f774a7f91f3ae9822201aa154e2a))
* **FLOW-11:** criação das rotas swagger e healthcheck do freeRouter ([7058cda](https://github.com/flow-build/workflow/commit/7058cdab99878996556501e6110d29e87785e641))


### Bug Fixes

* fix eval to active openTelemetry ([4c903fc](https://github.com/flow-build/workflow/commit/4c903fcc195cdb17eb3f41935a9a7f35ee4ad0fa))
* **FLOW-9:** formatação final do documento em versão de teste ([aa4bb7a](https://github.com/flow-build/workflow/commit/aa4bb7a9f0892ea3f6b65470858fb4eb609de16b))

## [2.9.0](https://github.com/flow-build/workflow/compare/v2.8.0...v2.9.0) (2022-10-08)


### Features

* :chart_with_upwards_trend: adds OTEL tracing ([7267a6b](https://github.com/flow-build/workflow/commit/7267a6b606ad55c97dc70a05346fde9248ab315b))

## [2.8.0](https://github.com/flow-build/workflow/compare/v2.7.2...v2.8.0) (2022-10-07)


### Features

* add environment variables for basicAuth node keys ([70d02c0](https://github.com/flow-build/workflow/commit/70d02c0d62c37e87e6f4836f2d04b16679861d47))

## [2.7.2](https://github.com/flow-build/workflow/compare/v2.7.1...v2.7.2) (2022-09-24)


### Bug Fixes

* **controllers:** :bug: fix format response when state is not found ([91ddaca](https://github.com/flow-build/workflow/commit/91ddaca6144094f541c13798715dd21d94562614))
* **controllers:** :bug: fix when state id was not found ([52acd23](https://github.com/flow-build/workflow/commit/52acd2397cc79645c98ea59e7b3fb3ece844e3ab))
* **controllers:** :bug: re-add the workflow version to list workflows ([977cb7a](https://github.com/flow-build/workflow/commit/977cb7aeeb808d4d016cff99e97deba77876b378))

## [2.7.1](https://github.com/flow-build/workflow/compare/v2.7.0...v2.7.1) (2022-09-23)


### Bug Fixes

* **controllers:** :bug: handle exception when node is not found ([d8a1b63](https://github.com/flow-build/workflow/commit/d8a1b63d4975c33574160e49d8408cc0ac7ef26b))

## [2.7.0](https://github.com/flow-build/workflow/compare/v2.6.3...v2.7.0) (2022-09-19)


### Features

* add basic auth http node ([3d911bf](https://github.com/flow-build/workflow/commit/3d911bff146b0ba2822a33f3c23a66b4d243bf6e))


### Bug Fixes

* adjust route schema to accept $ functions ([03e93d8](https://github.com/flow-build/workflow/commit/03e93d882c11ebf9cc8cf54a8657939e5a0d38c4))

## [2.6.3](https://github.com/flow-build/workflow/compare/v2.6.2...v2.6.3) (2022-09-18)


### Bug Fixes

* activity manager tests ([3237b08](https://github.com/flow-build/workflow/commit/3237b08be181cd499524c7777f657cf5846b103c))
* fix cockpit processes router ([78cb23f](https://github.com/flow-build/workflow/commit/78cb23f0effde24dce0cc18a3b8be8590ffbd802))
* fix cockpit workflow ([e6a478a](https://github.com/flow-build/workflow/commit/e6a478a435c5e365295447eb75fe78b5e04999da))

## [2.6.2](https://github.com/flow-build/workflow/compare/v2.6.1...v2.6.2) (2022-09-15)


### Bug Fixes

* fix result on startProcess node ([d55c62e](https://github.com/flow-build/workflow/commit/d55c62ea31837dc9ab5960e08e19ed6b9d845375))

## [2.6.1](https://github.com/flow-build/workflow/compare/v2.6.0...v2.6.1) (2022-09-14)


### Bug Fixes

* update engine to 2.16.1 ([b130f40](https://github.com/flow-build/workflow/commit/b130f406b2d4c714550ad4c7f7902567c62ed343))

## [2.6.0](https://github.com/flow-build/workflow/compare/v2.5.5...v2.6.0) (2022-09-06)


### Features

* add list and fetch node ([8086bc3](https://github.com/flow-build/workflow/commit/8086bc3ebfdf02c33c1fe88f2cf5736267b9b048))

## [2.5.5](https://github.com/flow-build/workflow/compare/v2.5.4...v2.5.5) (2022-09-06)


### Bug Fixes

* **routers:** remove testMapper ([df8d9d6](https://github.com/flow-build/workflow/commit/df8d9d64513ff2239208bd8cb127de4d9086cd82))

## [2.4.1](https://github.com/flow-build/workflow/compare/v2.4.0...v2.4.1) (2022-09-06)


### Bug Fixes

* force type toLowerCase ([89cf583](https://github.com/flow-build/workflow/commit/89cf5837f0291f2db3bae8d001490240ad97af86))

## [2.4.0](https://github.com/flow-build/workflow/compare/v2.3.0...v2.4.0) (2022-09-02)


### Features

* add version and latest in workflow and process calls ([54eb73b](https://github.com/flow-build/workflow/commit/54eb73b24f523bc72a6caa027f11c3e08d0a27c1))
* **routers:** :sparkles: add state execution and state spec routes ([cc50480](https://github.com/flow-build/workflow/commit/cc50480343501b1bc07ab00a5b02116edc07c28d))


### Bug Fixes

* :bug: fix activity schema validation ([891bc8a](https://github.com/flow-build/workflow/commit/891bc8a8f5ce396aa8400228f96e3687f7c67cfa))
* adds configuration to healthcheck ([ec16925](https://github.com/flow-build/workflow/commit/ec16925c166134652399973a149a21ad6f2a5aaa))

## [2.5.2] (2022-08-29)

* **healtcheck**: add configuration to response payload

## [2.5.1] (2022-08-29)

* **validators**: fix activity schema validation on validate and create workflow

## [2.5.0] (2022-08-28)


### Features

* **routers:** adds get state execution route to check the prepared execution data resolved to that state
* **routers:** adds get state spec route to get the node spec of that state

## [2.4.0] (2022-08-21)


### Features

* **routers:** adds to the get process route a property whether the workflow is the latest version.

## [2.3.0](https://github.com/flow-build/workflow/compare/v2.2.0...v2.3.0) (2022-06-07)


### Features

* **routers:** adds continue route ([dc7e729](https://github.com/flow-build/workflow/commit/dc7e729d0d3d066dc5f8af570bcd1f9dff30b22e))


### Bug Fixes

* :pencil2: use instead of user ([6226715](https://github.com/flow-build/workflow/commit/6226715f1dd6375d2ded33dcddc1e92f7440943f))
* **utils:** deal when activityManager is empty ([f019708](https://github.com/flow-build/workflow/commit/f019708b29fa34398b53a8e59827740c66b19242))

## [2.2.0](https://github.com/flow-build/workflow/compare/v2.1.2...v2.2.0) (2022-06-02)


### Features

* :lock: add koa helmet ([fbc6cb1](https://github.com/flow-build/workflow/commit/fbc6cb122ab56c597d3d058233be570e12637f23))

## [2.1.0](https://github.com/flow-build/workflow/compare/v2.0.0...v2.1.0) (2022-05-30)


### Features

* :hammer: add export script ([f50f9ee](https://github.com/flow-build/workflow/commit/f50f9ee9c9bcffb1d34d965d363de5d753350693))
* add createUuid node ([b12c968](https://github.com/flow-build/workflow/commit/b12c968a55af2957b594353498a1e9313f730990))
* add fetch state routes ([4a956e1](https://github.com/flow-build/workflow/commit/4a956e1efc6ef8fc05f61d519769888591cf2927))
* add mqtt ([d9b05b9](https://github.com/flow-build/workflow/commit/d9b05b904bc60e552d9ea52a41e03886a0fb48a1))
* add session to actor_data ([d4f7ff8](https://github.com/flow-build/workflow/commit/d4f7ff82d1c8a6cb2acab6af1f567286bc16cd06))
* add userAgent and IP middleware ([94ca1af](https://github.com/flow-build/workflow/commit/94ca1af4266db9f49b6604112f669374bb38fe1c))
* add userAgent middleware ([2da0ca1](https://github.com/flow-build/workflow/commit/2da0ca125c2aaf5453925a0597462df8d2161b02))
* adds tokenizeNode ([a498727](https://github.com/flow-build/workflow/commit/a49872720268fae539a4ee3cf7271dda3f768335))
* adds validateSchemaNode ([6c39b30](https://github.com/flow-build/workflow/commit/6c39b30c5400c84e723865ba710e256e8f0f3018))
* **controllers:** :sparkles: add sessionId to token ([8a31d01](https://github.com/flow-build/workflow/commit/8a31d01d1cbd3d30d832cdbec890dfd21c39f972))
* **controllers:** add buildBlueprint controller ([59eb8f0](https://github.com/flow-build/workflow/commit/59eb8f045642995261f11d7740822c0e5ca44be9))
* **controllers:** add processStatus at response ([7c1417f](https://github.com/flow-build/workflow/commit/7c1417f7f3878948422fb2295ea785c55865bc79))
* **controllers:** add wf version @ createProcess ([7db49ee](https://github.com/flow-build/workflow/commit/7db49ee59d5ab76bf7bfbaa2dc51d668f8be1dde))
* convert claims to array ([bb4b896](https://github.com/flow-build/workflow/commit/bb4b89655e8429b083167330bffbe1a6ae0ae1f1))
* **nodes:** add tokenize and validateSchema ([41d3c2c](https://github.com/flow-build/workflow/commit/41d3c2c73f80bb81c2ef85059b9fcfd3a17f3ade))
* publish states and logs to mqtt ([7e7f013](https://github.com/flow-build/workflow/commit/7e7f0131f657828b71d8926ce4ea57b0641333d6))
* restore features for mqtt ([60142d4](https://github.com/flow-build/workflow/commit/60142d4e612250f398c0bdcd3c147989a0c1dd98))
* **routers:** add convert route ([977cc6b](https://github.com/flow-build/workflow/commit/977cc6b11b2e1988d5913a514dea44d69e0ea9a0))
* **routers:** add route to find states by parameters ([136d02a](https://github.com/flow-build/workflow/commit/136d02ac5115da2b3631c0ec76a9cb90decf9c6f))
* **routers:** add route to list processes with filters ([9f43c45](https://github.com/flow-build/workflow/commit/9f43c452a0250d779c2e78334a494efeb21d59e7))
* **services:** send message to actor and session topic ([9dd28de](https://github.com/flow-build/workflow/commit/9dd28def1fd3f39de50654f4416951bbaac4a4c6))
* update diagram router to refactored diagram-builder ([8e13bbd](https://github.com/flow-build/workflow/commit/8e13bbd9942ad133bb9ea927a4cc03b951503672))
* **utils:** :bento: add index nodes ([3f0ef76](https://github.com/flow-build/workflow/commit/3f0ef7647a240538627a044a8404c9f20b8d41cd))
* **validators:** add environment validator at saveWorkflow ([750711e](https://github.com/flow-build/workflow/commit/750711e8c2fe4a508b4c44a495b7dcd6b4d8270d))


### Bug Fixes

* :fire: remove env file ([65afb54](https://github.com/flow-build/workflow/commit/65afb54ba66380bf6079cb2095a15ce1d5c3d557))
* add crypto at start ([8d313e9](https://github.com/flow-build/workflow/commit/8d313e93f02382e6f1de8e22627e47bc70d4dfe0))
* **controllers:** add filters to fetch available ([a6b5609](https://github.com/flow-build/workflow/commit/a6b5609444d3461fbdd007990eb75a1a71e10fca))
* **controllers:** message type ([ec9116f](https://github.com/flow-build/workflow/commit/ec9116ff602f9f7f7924b3134a63a8f2f55f0015))
* fix command ([92c399d](https://github.com/flow-build/workflow/commit/92c399d4d3f10d20cc8692c7c69da337931d6058))
* fix docker-compose ([66bcc67](https://github.com/flow-build/workflow/commit/66bcc677bb15f10b7d9faec8d8120ce8f887a40d))
* fix dockerLocal migrations ([108c777](https://github.com/flow-build/workflow/commit/108c777eb776ac2a015aafe1b4ba034777bd605a))
* fix id validation ([0a9c222](https://github.com/flow-build/workflow/commit/0a9c22204ed9ea4032168a6cb2d5c8d9650640f3))
* fix knexfile ([cf9df96](https://github.com/flow-build/workflow/commit/cf9df96295827581e80783f832888f48a7b54b41))
* fix pr-validation action ([ee95102](https://github.com/flow-build/workflow/commit/ee951023008d20a10f52c6696f03c13316091c84))
* **mqtt:** change host @ env.docker ([526674c](https://github.com/flow-build/workflow/commit/526674cde8a38742f01b0f1f96570bc82a61916d))
* **routers:** :pencil2: fix healthcheck ([89ade8d](https://github.com/flow-build/workflow/commit/89ade8d5078361a14b0055dc57b30ac48daf2cea))
* **routers:** :pencil2: typo @ healthcheck ([6c27fe5](https://github.com/flow-build/workflow/commit/6c27fe5a36b0b0b0396f6d48a68d1ce91df4e878))
* typo ([09f8b2e](https://github.com/flow-build/workflow/commit/09f8b2ea8909cf3da333b3af214b6a28619d41e8))
* typo ([5c57f02](https://github.com/flow-build/workflow/commit/5c57f027747d96a61e4f614478b6de7383194de5))
* typo @ healthcheck ([6f859eb](https://github.com/flow-build/workflow/commit/6f859eb3f21d2151c8e2dee5d3ce0b8b9d6e9f00))
* update healthcheck in caso mqtt is off ([195fa39](https://github.com/flow-build/workflow/commit/195fa397f30c8a611e80a3c8a9bc0df7d02d99e2))
* use main db, not test ([6a42ebb](https://github.com/flow-build/workflow/commit/6a42ebbbaa669a6f49a98c59d7f8e4bef8974946))
* **validators:** allow lane rule to be $js ([0ca97e9](https://github.com/flow-build/workflow/commit/0ca97e9807562ee5bacf05deeb8ba2c7feef55e2))
* **validators:** fix required fields at SubProcessNode ([5bd45a1](https://github.com/flow-build/workflow/commit/5bd45a18e94b3325cca99679a8178ee14efc4c39))
* **validators:** fix validation of customNodes ([93bc305](https://github.com/flow-build/workflow/commit/93bc305bbced200ab9234e374696d08eeccb6cc9))
* **validators:** handle when a systemTask node has no category ([b2ec5e4](https://github.com/flow-build/workflow/commit/b2ec5e4d0e740c6a5dd5c724b7dbf258c8fb8322))
* **validators:** timer timeout validator ([5ff8bfe](https://github.com/flow-build/workflow/commit/5ff8bfef82f324b50674e4f0b772be0529502827))

## [2.0.0](https://github.com/flow-build/workflow/compare/v1.0.1...v2.0.0) (2021-03-01)


### ⚠ BREAKING CHANGES

* update to version 2.0

### Bug Fixes

* update to version 2.0 ([66391c4](https://github.com/flow-build/workflow/commit/66391c4ecf8249d6692613c35aa17e85ab753de1))

### [1.0.1](https://github.com/flow-build/workflow/compare/v1.0.0...v1.0.1) (2020-04-06)


### Bug Fixes

* change license project ([49fd08f](https://github.com/flow-build/workflow/commit/49fd08f838cd03a30463268bf9aafedf3804860c))

## 1.0.0 (2020-03-30)


### ⚠ BREAKING CHANGES

* reset version for flowbuild

### Bug Fixes

* reset version for flowbuild ([7db937a](https://github.com/flow-build/workflow/commit/7db937a9c0da5e8a0ba2ffab82c7299da0975ecc))
