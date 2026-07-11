# CLI contract

## Scope

This CLI produces synthetic CAD artifacts from JSON input and emits a
machine-readable result envelope.

This contract does not represent legal or regulatory compliance evidence.

The published runtime schema exports are available from:

- `cacad/contracts/bathroom`
- `cacad/contracts/cli`
- `cacad/contracts`

## Command

```bash
cacad --input <path> [--out-dir <dir>] [--prefix <name>] [--report <path>]
```

## Options

- `--input` (required): path to JSON input file
- `--out-dir` (optional): output directory for generated artifacts, default `artifacts`
- `--prefix` (optional): output file prefix, default `bathroom`
- `--report` (optional): JSON report path, default `<out-dir>/report.json`
- `--help` (optional): prints help and exits with code `0`

## Exit codes

- `0`: successful generation (`status=PASS`) or help output
- `2`: validation, input, or runtime failure

## Result JSON envelope

```json
{
  "status": "PASS | FAIL | INFORMATION_MISSING | REVIEW_REQUIRED",
  "inputPath": "absolute-path-to-input",
  "output": {
    "dxfPath": "absolute-path-to-output.dxf",
    "gltfPath": "absolute-path-to-output.gltf"
  },
  "metadata": {
    "schemaVersion": "v0.1.0",
    "generator": "cacad-cli",
    "inputSha256": "hex-digest"
  },
  "errors": [
    {
      "code": "STRING_CODE",
      "message": "human readable message"
    }
  ]
}
```

`output` is present only when generation succeeds.

## Error codes

- `HELP`
- `CLI_ARGUMENT_ERROR`
- `INPUT_JSON_INVALID`
- `INPUT_SCHEMA_INVALID`
- `VALIDATION_RULES_FAILED`
- `UNEXPECTED_ERROR`

## Determinism notes

- Input digest (`metadata.inputSha256`) is calculated from raw input file content.
- Generated output paths are absolute in the report.
- The same input + tool version should produce deterministic artifact content.
