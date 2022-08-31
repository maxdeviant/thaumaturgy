# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added `uuid` to `ManifesterOptions`
- Added `sequences` to `ManifesterOptions`

### Removed

- Removed `faker` from `ManifesterOptions`

## [0.8.0] - 2022-06-20

### Changed

- Updated `@faker-js/faker` to v7.2.0 ([@vcapretz](https://github.com/vcapretz) in [#5](https://github.com/maxdeviant/thaumaturge/pull/5))

## [0.7.0] - 2022-04-19

### Changed

- Manifesters now work off of the codec's type (`A`) as opposed to its output type (`O`)

## [0.6.0] - 2022-03-16

### Added

- Added support for auto-traversals to search for `Ref`s

### Removed

- Removed `defineTraversal`, as it is obviated by auto-traversals

## [0.5.0] - 2022-03-09

### Added

- Added support for traversals

## [0.4.3] - 2022-03-08

### Fixed

- Fixed persisting entity hierarchies when not using static identifiers

## [0.4.2] - 2022-03-06

### Changed

- Simplified the typing of entity codecs

## [0.4.1] - 2022-03-06

### Fixed

- Added support for more `io-ts` codecs

## [0.4.0] - 2022-03-06

### Changed

- Manifesters now take an options object instead of just the Faker instance

## [0.3.0] - 2022-03-06

### Added

- Added function-based API using a global `Realm`

### Changed

- Entity names are now enforced to be unique per `Realm`

## [0.2.0] - 2022-03-05

### Added

- Added support for persisting entity hierarchies

### Changed

- Changed output target to `ES6`
- Adjusted files included in distribution package

## [0.1.0] - 2022-03-05

### Added

- Initial release

[unreleased]: https://github.com/maxdeviant/thaumaturge/compare/v0.8.0...HEAD
[0.8.0]: https://github.com/maxdeviant/thaumaturge/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/maxdeviant/thaumaturge/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/maxdeviant/thaumaturge/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/maxdeviant/thaumaturge/compare/v0.4.3...v0.5.0
[0.4.3]: https://github.com/maxdeviant/thaumaturge/compare/v0.4.2...v0.4.3
[0.4.2]: https://github.com/maxdeviant/thaumaturge/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/maxdeviant/thaumaturge/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/maxdeviant/thaumaturge/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/maxdeviant/thaumaturge/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/maxdeviant/thaumaturge/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/maxdeviant/thaumaturge/compare/00fcbaa...v0.1.0
