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
