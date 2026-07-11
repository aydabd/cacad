# cacad

[![Lint](https://github.com/aydabd/cacad/actions/workflows/lint.yml/badge.svg)](https://github.com/aydabd/cacad/actions/workflows/lint.yml)

TypeScript Architecture-as-Code toolkit that validates synthetic bathroom inputs
and generates deterministic DXF and glTF artifacts.

This repository is for reusable CAD contracts, generators, and synthetic rule
evaluation. It is not construction-ready engineering output.

## What it does

- Validates bathroom input shape with Zod
- Applies synthetic example rule checks (demonstration only)
- Generates 2D DXF plans and 3D glTF models
- Produces deterministic artifacts in CI
- Exposes a CLI contract for non-Node consumers

## Quickstart

```bash
make install
make build

# Run the CLI on the provided synthetic fixture
npm run cli -- --input examples/synthetic-bathroom.json --out-dir artifacts --prefix demo
```

Outputs:

- `artifacts/demo.dxf`
- `artifacts/demo.gltf`
- `artifacts/report.json` (unless overridden with `--report`)

## CLI contract

Command:

```bash
cacad --input <path> [--out-dir <dir>] [--prefix <name>] [--report <path>]
```

Status model in the JSON report/stdout:

- `PASS`
- `FAIL`
- `INFORMATION_MISSING`
- `REVIEW_REQUIRED`

For full field-level contract details, see
[docs/usage/cli-contract.md](docs/usage/cli-contract.md).

## Development commands

```bash
make build
make test
npm run coverage
LINT_MODE=check make lint
```

## CI

The CAD pipeline workflow:

1. installs dependencies
2. runs tests
3. builds TypeScript
4. generates synthetic CAD artifacts
5. uploads artifacts

Workflow file:
[.github/workflows/cad-pipeline.yml](.github/workflows/cad-pipeline.yml).

## Project boundaries

Architecture and ownership boundary:
[docs/architecture/PROJECT_BOUNDARY_AND_PR1_PLAN.md](docs/architecture/PROJECT_BOUNDARY_AND_PR1_PLAN.md).

## Security

See [SECURITY.md](SECURITY.md).

## License

See [LICENSE](LICENSE).
