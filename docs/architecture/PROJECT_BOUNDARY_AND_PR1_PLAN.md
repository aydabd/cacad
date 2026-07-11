# Cacad ownership boundary and PR 1 plan

| Document status | Revision | Date       |
| --------------- | -------- | ---------- |
| Proposed plan   | P01      | 2026-07-11 |

## Purpose

Define how `aydabd/cacad` can provide reusable architecture-as-code capability
without duplicating or conflicting with
`aydabd/building-engineering-projects`, initially the Alnarpsgatan 34 pool
project.

This document plans the work. It does not approve PR 1, establish regulatory
compliance, or make generated geometry construction-ready.

## Current verdict

PR 1 is a useful synthetic proof of concept but is `NOT READY TO MERGE` in its
current form. It combines four concerns that need separate acceptance:

1. neutral domain schemas;
2. regulatory claims labelled as deterministic BBR compliance;
3. 2D and 3D generation engines;
4. CI publication of generated artifacts.

The regulatory thresholds and clause claims in PR 1 are not accepted project
evidence. Until verified against current authoritative sources, applicability,
exceptions, units, measurement methods, and named professional review, they
must be removed or converted into explicitly synthetic example rules.

## Repository ownership contract

| Concern          | `cacad` owns                                                                   | `building-engineering-projects` owns                                          |
| ---------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Domain contracts | Versioned, project-neutral schemas and JSON Schema                             | Project instances with source status and revision                             |
| Rules            | Generic rule engine, evidence schema, result states and synthetic tests        | Applicable requirements, clauses, interpretations and reviewer acceptance     |
| Geometry         | Project-neutral adapters, fixtures, deterministic generation and parity checks | Accepted project geometry, coordinates, levels and design decisions           |
| Formats          | DXF/SVG/GLB/IFC adapters and conformance reports                               | Registered project deliverables and source-file audits                        |
| Viewer           | Local/web inspection of layers, objects, properties, quantities and findings   | Project access, privacy, review records and issue status                      |
| Quantities       | Transparent derivation primitives and provenance contract                      | Project quantities, exclusions, supplier status and professional review       |
| CI               | Library tests, synthetic artifacts, compatibility matrix and releases          | Project admission gates, project generation and registered output validation  |
| Assurance        | Machine-readable evidence and verification-state mechanics                     | Discipline ownership, professional approvals and construction issue authority |

Neither repository may claim that schema validation, passing tests, geometry
round trips, or visual plausibility constitutes professional approval.

## Integration contract

Use a released, semantically versioned `cacad` package and/or CLI. Do not use a
Git submodule, copy source between repositories, or read the pool repository by
relative filesystem path.

The initial boundary shall contain:

- versioned JSON Schema for project-neutral objects, units, provenance,
  lifecycle status, revisions, evidence and findings;
- a stable CLI input/output contract suitable for non-Node consumers;
- synthetic conformance fixtures published with the contract;
- machine-readable compatibility and generator metadata;
- deterministic outputs with tool version and input digest;
- explicit `INFORMATION_MISSING`, `REVIEW_REQUIRED`, `PASS` and `FAIL` result
  states;
- a rule gate that prevents unsupported rules from returning `PASS` or `FAIL`;
- no property address, survey, pool dimensions, supplier selection or private
  project source files in `cacad` fixtures.

The pool repository shall pin an exact compatible `cacad` release and retain
its existing Python/ezdxf, IfcOpenShell, CadQuery and Trimesh validation stack.
Replacement of an existing generator requires an ADR and structural plus visual
parity evidence; adoption is not implied by PR 1.

## PR 1 disposition plan

### Keep for evaluation

- strict TypeScript configuration and locked dependency graph;
- Zod-based project-neutral data-shape validation;
- Vitest boundary and invalid-input tests;
- layered DXF and glTF generators as synthetic spikes;
- generated-artifact determinism as a test objective.

### Change before merge

- rename the bathroom and BBR-specific public API to neutral fixture/rule
  concepts, or explicitly isolate it under `examples/synthetic-bathroom`;
- remove unverified BBR clause and compliance claims from code, tests,
  documentation, filenames and CI names;
- ensure synthetic threshold values cannot be mistaken for Swedish law;
- attach evidence metadata to every real rule and prevent unsupported rules
  from producing compliance outcomes;
- separate domain, rule-engine and format-adapter responsibilities;
- establish millimetres and coordinate conventions explicitly and test DXF
  units, layers, entities and extents with an independent reader;
- validate glTF structure with an independent validator and preserve stable
  object IDs and provenance;
- mark generated artifacts `SYNTHETIC / NOT FOR CONSTRUCTION`;
- reconcile the new workflow with existing provider-aware linting rather than
  creating a competing toolchain;
- use immutable GitHub Action references and least-privilege permissions;
- resolve the currently failing lint check before merge.

## Session-sized work packages

Each work package is suitable for a fresh agent session. End every session by
updating `NEXT_SESSION.md` with decisions, validation, commit and the exact next
entry gate.

### C01 — Evidence-backed PR 1 audit

Inspect every changed file and CI log in PR 1. Produce findings ordered by
severity, a dependency/license table, exact regulatory-claim inventory, and a
keep/change/remove disposition. Do not edit implementation code.

**Exit:** complete review record and a decided PR strategy: amend, split, or
replace.

### C02 — Architecture and ownership ADR

Create an ADR selecting the package/CLI boundary, neutral domain seams, format
adapter interfaces, fixture policy and integration versioning. Compare the
hybrid TypeScript/Python arrangement with TypeScript-only alternatives.

**Exit:** accepted proposed architecture and no duplicated project authority.

### C03 — Construction-design assurance skill

Create one canonical project skill plus thin platform discovery files for
Codex, Claude and GitHub Copilot. Encode evidence states, professional-review
boundaries, drawing/model status, and forbidden construction-readiness claims.

**Exit:** agent configuration tests prove all platforms resolve the same
canonical instructions without divergent copies.

### C04 — Neutral schemas and rule-result contract

Implement versioned Zod and JSON Schema contracts using synthetic fixtures.
Remove BBR-named production behavior. Add unsupported-evidence tests proving
that `PASS` and `FAIL` are impossible without accepted evidence metadata.

**Exit:** schema publication and compatibility tests pass.

### C05 — 2D adapter conformance

Generate synthetic layered SVG/DXF and independently validate units, layers,
entities, extents and stable IDs. Compare the TypeScript output with declared
reference fixtures; do not replace the pool Python pipeline.

**Exit:** deterministic conformance report and format-adapter ADR.

### C06 — 3D and viewer conformance

Validate synthetic glTF/GLB and evaluate IFC viewing boundaries. Implement
local inspection of object IDs, properties and statuses without cloud upload.

**Exit:** independent validation, licensing record and viewer ADR.

### C07 — Release and consumer contract

Publish a prerelease package/CLI with schemas and fixtures. Document exact
inputs, outputs, compatibility, provenance, error codes and security/privacy
limits.

**Exit:** a clean consumer can reproduce all synthetic artifacts from the lock
file and verify their digests.

### C08 — Pool integration spike

Only after C01–C07, add an ADR in the pool repository and consume an exact
prerelease using synthetic data first. Preserve all project evidence gates and
independent Python validation. Admit verified project data only through the
pool project's existing admission work package.

**Exit:** no copied code/data, reproducible contract tests, and explicit
construction-assurance verdict.

## Completion criteria

This coordination plan is complete when:

1. PR 1 has an evidence-backed disposition and green required checks;
2. `cacad` contains no unverified regulatory compliance claims;
3. repository ownership and versioned integration contracts are enforced;
4. cross-language conformance fixtures prevent geometry/schema drift;
5. agent instructions resolve to one assurance policy;
6. the pool project pins a reviewed release without surrendering its evidence
   or professional-verification gates.

No output covered by this plan is construction-ready.
