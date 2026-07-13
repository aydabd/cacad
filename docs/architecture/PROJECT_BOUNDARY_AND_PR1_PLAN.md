# Cacad ownership boundary and PR 1 plan

| Document status | Revision | Date       |
| --------------- | -------- | ---------- |
| Proposed plan   | P02      | 2026-07-13 |

## Purpose

Define how `aydabd/cacad` can provide reusable architecture-as-code capability
without duplicating or conflicting with
`aydabd/building-engineering-projects`, initially the Alnarpsgatan 34 pool
project.

This document plans the work. It does not approve PR 1, establish regulatory
compliance, or make generated geometry construction-ready.

For the broader product direction, phases, open source tool policy,
construction-project agent model and RunSpec decision path, see
[PRODUCT_VISION_AND_ROADMAP.md](PRODUCT_VISION_AND_ROADMAP.md).
That roadmap is also the source of truth for modular regulatory packs,
localization packs, CAD/BIM language and symbol rules, and follow-up
synchronization between phases.

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

## July 2026 foundation directive

Do not add new production features until the foundation below is accepted. The
near-term work is to make `cacad` cleanly extensible, not to claim real design
coverage for architecture, structure, piping, electrical, ventilation,
inspection or permit submission.

The repository may provide code and contracts for:

- project-neutral geometry, evidence, rule, protocol and finding schemas;
- deterministic 2D/3D/IFC/DXF/glTF adapter interfaces and synthetic fixtures;
- local viewers and reports that expose layers, object IDs, source status,
  provenance, quantities and unresolved findings;
- machine-readable rule packs that can only evaluate when evidence metadata is
  accepted for the jurisdiction, discipline, version and intended use;
- agent instructions that force source discovery, question capture and
  professional-review handoff instead of guessing.

The repository must not provide or imply:

- complete design authority for real construction;
- final engineering calculations or signed discipline responsibility;
- automatic permit readiness;
- latest-law compliance without retrieved authority evidence and review;
- acceptance of privately sourced project dimensions, loads, products or site
  constraints.

## Isolation check

`cacad` should remain isolated as a reusable package/CLI. It must not import
from, copy data from, or read files by relative path from any consuming project.
The only allowed integration is a released semver package, CLI binary, or typed
artifact contract that a consumer pins explicitly.

Current repository inspection shows no implementation dependency on
`building-engineering-projects`; cross-repository references are limited to
planning documents. That is acceptable for coordination, but tests and runtime
code must continue to use only synthetic fixtures.

## Realistic model and geometry foundation

TypeScript can own deterministic contracts, validation, metadata and many 2D/3D
adapters. Blender or other open source tools may be evaluated later for visual
inspection, conversion, clash review or rendering, but only through a controlled
adapter boundary. A rendered model is not evidence of geometric correctness.

Before any real-world geometry support, the foundation must define:

- coordinate systems, units, tolerances, origins, levels, rotations and handedness;
- object identity, layers, systems, spaces, storeys, assemblies and discipline
  ownership;
- provenance for every dimension, product, material, load, flow, cable,
  opening, clearance and derived quantity;
- independent conformance checks for DXF, SVG, glTF/GLB and any IFC output;
- round-trip drift reports, bounding boxes, collision/clash checks and quantity
  derivation traces;
- explicit status values such as `SYNTHETIC`, `PROPOSED`, `DERIVED`,
  `USER_CONFIRMED`, `VERIFIED`, `REVIEW_REQUIRED` and
  `REQUIRES_PROFESSIONAL_VERIFICATION`.

Any Blender, Three.js, IFC, OpenCascade, Speckle or other visualization path
must be documented with license, offline/privacy behavior, deterministic input
digest, output digest and validator evidence before it becomes part of the
supported contract.

## Regulatory and compliance foundation

`cacad` may host a generic compliance engine, but real rules must live as
evidence-backed rule packs. A rule pack is only valid for the jurisdiction,
discipline, source version, retrieved date, applicability statement and
reviewer acceptance recorded with it. Unsupported rules must return
`INFORMATION_MISSING` or `REVIEW_REQUIRED`, never `PASS` or `FAIL`.

The foundation needs an authority-source registry before any real compliance
checks are implemented. For Swedish projects, candidate source categories
include:

- Boverket rules, handbooks and transition guidance for building regulations;
- municipal detailed development plans, permit requirements and local
  decisions;
- Elsakerhetsverket regulations and guidance for electrical safety;
- SEK Svensk Elstandard standards references where applicable and licensed;
- Sakervatten and other applicable industry rules for water installations;
- Arbetsmiljoverket rules for work environment and construction site safety;
- MSB, Naturvardsverket, Lantmateriet, SGU, VA utility providers, network
  owners, fire authority and other authorities when the discipline requires it.

The registry must store the canonical URL or document identifier, publisher,
jurisdiction, discipline, version/date, retrieval timestamp, checksum where
possible, access/licensing limits, applicability notes, supersession status and
reviewer decision. Agent output must cite registry entries and record open
questions when current sources cannot be retrieved or interpreted.

## Agent and skill foundation

Future specialist agents should be separated by responsibility and forbidden
from issuing construction-ready conclusions alone. Planned agent families:

- source-discovery agent: finds current authority, municipal, supplier and
  standard references and records licensing/access limits;
- applicability agent: determines whether a source applies to the project,
  discipline, building type, date, scope and jurisdiction;
- geometry agent: checks units, layers, levels, object IDs, collisions,
  clearances and quantity traces;
- discipline agents: architecture, structure, electrical, plumbing, ventilation,
  fire, accessibility, geotechnical and site/utilities, each constrained to
  draft checks and question capture;
- protocol agent: creates inspection and review protocol templates with status,
  revision, evidence links, responsible role and unresolved items;
- assurance coordinator: merges findings, blocks unsupported compliance
  outcomes and prepares material for named professional review.

Each agent must have a canonical skill with allowed inputs, denied claims,
required evidence states, output schema, validation commands and escalation
rules. Agents must search for current sources, record uncertainty and add
questions instead of filling gaps.

## Inspection protocol foundation

`cacad` can define protocol schemas and generate draft protocol packages, but
the consuming project owns the actual inspection record and signatures.
Protocol levels should be modeled separately, for example:

- design-input completeness protocol;
- authority-source and applicability protocol;
- discipline design-review protocol;
- geometry/model conformance protocol;
- clash and coordination protocol;
- permit-submission readiness protocol;
- construction-stage inspection protocol;
- final inspection and handover protocol.

Every protocol item must include discipline, requirement source, evidence,
inspection method, status, responsible role, reviewer, date, revision, open
questions and whether professional verification is still required.

## RunSpec evaluation path

`aydabd/runspec` is a strong candidate for replacing markdown-only planning
with typed executable specifications and verification gates. It should be
evaluated in a separate architecture spike before adoption.

The evaluation must compare RunSpec with Spec Kit/OpenSpec-style workflows for:

- typed requirements, scenarios, quality gates and agent task boundaries;
- generated task JSON with allowed and denied files;
- evidence generation under deterministic directories;
- compatibility with `cacad`'s provider-aware Makefile and npm scripts;
- ability to model regulatory-source registries, geometry contracts and
  professional-review gates without embedding unverified legal thresholds.

RunSpec adoption must not create a monorepo dependency on `aydabd/runspec` by
relative path. If accepted, consume a released CLI/package or vendor only a
reviewed generated artifact contract with an ADR.

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

### C09 — Foundation capability map

Create a non-implementation capability map for geometry, disciplines,
regulatory sources, protocols, agents and evidence states. Confirm what belongs
in `cacad`, what belongs in consuming projects, and what requires professional
or licensed-source ownership.

**Exit:** accepted foundation map, no new runtime feature code, and explicit
non-goals for construction-ready output.

### C10 — Authority-source registry design

Design the generic source registry and rule-pack evidence contract. Include
Swedish authority categories as examples, but do not encode thresholds or
clause interpretations until sources are retrieved, licensed if needed, and
reviewed.

**Exit:** schema/ADR plan for source records, retrieval evidence,
applicability, supersession and unsupported-rule behavior.

### C11 — Agent and protocol architecture

Design the separated specialist agents, canonical skills and protocol schemas
for source discovery, applicability, geometry, discipline review and assurance
coordination.

**Exit:** agent boundaries prevent guessing, unsupported compliance outcomes
and construction-ready claims.

### C12 — RunSpec architecture spike

Evaluate `aydabd/runspec` as the executable specification and plan engine for
`cacad`, compared with Spec Kit/OpenSpec-style markdown flows.

**Exit:** ADR recommending adopt, defer or reject; no relative-path dependency
and no conflict with existing provider-aware commands.

## Completion criteria

This coordination plan is complete when:

1. PR 1 has an evidence-backed disposition and green required checks;
2. `cacad` contains no unverified regulatory compliance claims;
3. repository ownership and versioned integration contracts are enforced;
4. cross-language conformance fixtures prevent geometry/schema drift;
5. agent instructions resolve to one assurance policy;
6. the pool project pins a reviewed release without surrendering its evidence
   or professional-verification gates.
7. future compliance, protocol and agent work starts from source registries,
   typed evidence and professional-review boundaries rather than hardcoded
   assumptions.

No output covered by this plan is construction-ready.
