let Optional/map = https://prelude.dhall-lang.org/v20.2.0/Optional/map

let tsconfig =
      https://raw.githubusercontent.com/maxdeviant/tsconfig/master/dhall-tsconfig.dhall

let baseTsConfig =
      https://raw.githubusercontent.com/maxdeviant/tsconfig/master/tsconfig.dhall

let updateCompilerOptions
    : tsconfig.CompilerOptions.Type → tsconfig.CompilerOptions.Type
    = λ(compilerOptions : tsconfig.CompilerOptions.Type) →
          compilerOptions
        ⫽ { declaration = Some True
          , stripInternal = Some True
          , esModuleInterop = Some True
          , module = Some tsconfig.ModuleOption.CommonJS
          , moduleResolution = Some tsconfig.ModuleResolutionOption.node
          , target = Some tsconfig.TargetOption.ES6
          , outDir = Some "lib"
          }

in    baseTsConfig
    ⫽ { compilerOptions =
          Optional/map
            tsconfig.CompilerOptions.Type
            tsconfig.CompilerOptions.Type
            updateCompilerOptions
            baseTsConfig.compilerOptions
      , include = Some [ "src" ]
      }
