# Cacad product vision and roadmap

| Document status | Revision | Date       |
| --------------- | -------- | ---------- |
| Proposed plan   | P01      | 2026-07-13 |

## Purpose

Clarify what `cacad` is trying to become before more feature work is added.
The project goal is architecture-as-code and code-as-CAD: developers,
engineers and AI agents should be able to describe a building project as typed
inputs, generate coordinated CAD/BIM/design artifacts, run evidence-backed
checks, and produce review packages for humans, customers, authorities and
contractors.

This document is a roadmap. It does not approve any current output for real
construction, permit submission or contractor execution.

## Product north star

`cacad` should become a reusable open architecture-as-code toolkit for building
design workflows across both new and existing buildings. A future mature
version should support:

- issue-template or API intake for new construction, extension, renovation,
  redesign, change-of-use and existing-building audit projects;
- imported existing drawings, BIM/CAD files, scans, photos, measurements,
  inspection records and supplier documents with explicit source status;
- as-built model review that separates verified existing conditions from
  proposed changes and unknowns;
- agent-led clarification of missing site, client, regulatory and discipline
  inputs;
- typed project specifications, design decisions, evidence records and open
  questions;
- generated 2D drawings, 3D/BIM models, rendered previews and discipline
  layers;
- exports usable by common CAD/BIM tools such as AutoCAD-compatible DXF,
  FreeCAD/IFC-oriented workflows, Blender visualization, glTF/GLB previews and
  web viewers;
- architecture, structural, electrical, plumbing, ventilation, fire,
  accessibility, site/utilities and quantity-check workflows;
- regulatory-source discovery, applicability checks and compliance evidence;
- inspection and review protocols for design, permit, construction and handover
  phases;
- deterministic validation reports that show what passed, what failed, what is
  missing and what requires professional verification.

The project must be useful to engineers, but it must not pretend that an AI
agent or generated model replaces the professional and authority approvals that
real construction requires.

## Current reality

The repository currently contains a TypeScript proof of concept:

- Zod schemas for a synthetic bathroom-like input;
- synthetic example rules with unresolved BBR naming and threshold risk;
- deterministic DXF and glTF generation spikes;
- a CLI result envelope and CI pipeline;
- generic software PR-review agents and skills.

It does not yet contain:

- a complete building-project domain model;
- construction-project issue intake templates for new or existing buildings;
- discipline-specific design agents;
- evidence-backed regulatory rule packs;
- authority-source registries;
- country, municipality and language packs for regulatory applicability,
  drawing conventions, title blocks, symbols and report text;
- FreeCAD, Blender, IFC or AutoCAD-grade conformance workflows;
- professional-review protocol generation;
- executable RunSpec plans for this product.

It also does not yet contain reliable import, audit or correction workflows for
existing CAD/BIM material. Existing drawings and models must be treated as
evidence candidates, not truth, until source, revision, coordinate system,
measured verification and professional acceptance are recorded.

## Required implementation cleanup

Yes: the current implementation should be refactored before the roadmap moves
into real construction-project capabilities. The existing code is useful as a
spike, but it is shaped around one synthetic bathroom example and still exposes
BBR-named validation types. Carrying that structure forward would make the
future architecture harder to keep neutral, evidence-based and extensible.

Required cleanup before new feature work:

- quarantine or rename the bathroom proof of concept so it is clearly a
  synthetic fixture, not the product domain;
- remove `bbr` names from production APIs, tests, documentation and filenames
  unless they are moved into an explicit unsupported example namespace;
- split the current validator into schema parsing, synthetic rule execution and
  result mapping;
- introduce neutral domain terms before adding disciplines: project, space,
  object, system, layer, evidence, finding, protocol and artifact;
- make DXF and glTF generation use adapter interfaces rather than a bathroom
  type directly;
- keep CLI orchestration thin: parse input, call a workflow, write artifacts and
  emit a result envelope;
- add fixture policy and conformance tests that prove example rules cannot be
  mistaken for law;
- keep all real regulatory, permit, inspection and construction-ready language
  out of implementation until source registry and professional-review gates
  exist.

The refactor should be conservative. Do not add Blender, FreeCAD, IFC,
discipline agents, real compliance rules or issue templates during cleanup.
The outcome should be a neutral foundation that still reproduces the synthetic
artifacts while making the spike easy to replace or delete.

CI/CD and existing provider-aware pipelines should stay as they are during this
cleanup. Do not redesign workflow files, release automation or provider setup
unless a separate ADR proves the change is necessary for the accepted phase.

## Non-negotiable boundary

The desired product can prepare a complete review package, but it cannot declare
that a design is accepted for government permits, inspection, construction or
contractor execution unless the required external evidence is recorded.

Every real project output must distinguish:

- `SYNTHETIC`: demonstration fixture only;
- `PROPOSED`: generated design proposal;
- `DERIVED`: calculated from recorded inputs;
- `USER_CONFIRMED`: confirmed by a user but not independently verified;
- `VERIFIED`: tied to accepted source evidence;
- `REVIEW_REQUIRED`: needs named discipline review;
- `REQUIRES_PROFESSIONAL_VERIFICATION`: cannot be accepted by software alone.

No generated drawing, rendered view, schema validation, test pass, clash result,
quantity report or AI review is construction-ready by itself.

## Recommended planning model

Use markdown for human-readable roadmap and governance while the project is
still clarifying boundaries. Do not create many scattered markdown plans for
requirements once the product model stabilizes.

Recommended path:

1. keep this roadmap and the PR boundary plan as the short-term source of truth;
2. run a dedicated RunSpec architecture spike;
3. if accepted, move product capabilities, scenarios, gates, agent policies and
   PR plans into typed executable RunSpec definitions;
4. keep markdown only for onboarding, safety policy, human summaries and
   generated reports.

RunSpec is likely a better long-term fit than markdown-only Spec Kit/OpenSpec
style planning because this project needs machine-testable gates, agent task
boundaries, evidence output and deterministic acceptance checks. Adoption still
requires an ADR and must use a released CLI/package rather than a relative path
to `aydabd/runspec`.

## Modularity model

Every future capability should be built as a replaceable module with a typed
contract, fixtures, validators and clear ownership. Avoid one pipeline that
knows every discipline, country, format and workflow.

Required module boundaries:

- domain contracts: project, site, building, space, object, system, layer,
  evidence, finding, protocol and artifact;
- regulatory packs: country, region, municipality, authority source,
  applicability, rule pack and accepted interpretation;
- localization packs: language, terminology, report templates, title blocks,
  symbol catalogs, units and discipline labels;
- discipline packs: architecture, structure, electrical, plumbing, ventilation,
  fire, accessibility, geotechnical, site/utilities and quantities;
- format adapters: DXF, SVG/PDF, glTF/GLB, IFC and future CAD/BIM exchange
  formats;
- viewer adapters: local web viewer, rendered previews and discipline/layer
  inspection;
- agent packs: intake, source discovery, applicability, discipline review,
  geometry coordination, protocols and assurance;
- protocol packs: design input, applicability, model conformance, permit,
  tender, construction inspection and handover.

Each module must declare:

- supported jurisdictions, languages, disciplines, formats and phases;
- inputs, outputs, source-status requirements and denied claims;
- conformance tests and synthetic fixtures;
- dependency/license record;
- version and compatibility with other modules.

Modules may depend upward only through typed contracts. A Swedish rule pack, for
example, may use the generic rule-engine contract, but the generic engine must
not import Swedish-specific rules, terms or symbols.

## Regulatory and localization model

Regulatory compliance must be country and local-jurisdiction aware. The system
should support Sweden as the first example, but it must not bake Swedish rules,
language or symbols into the generic core.

Every jurisdiction pack must identify:

- country, region, municipality and authority scope;
- legal/regulatory source, publisher, version/date and retrieval evidence;
- applicability criteria for building type, project phase, existing/new work,
  change of use and discipline;
- whether source text may be stored, summarized or only referenced because of
  license limits;
- accepted language for drawings, reports, protocols and authority packages;
- professional roles or reviewers required for acceptance;
- supersession and transition rules when regulations change.

Every CAD/BIM localization pack must identify:

- drawing language, terminology and abbreviations;
- units, decimal conventions, paper sizes, scale conventions and title blocks;
- layer naming, discipline naming, object classification and status colors;
- symbol catalogs for architecture, electrical, plumbing, ventilation, fire,
  accessibility and site/utilities;
- required legends, notes, revision tables and stamps;
- export expectations for CAD/BIM consumers, authorities and contractors.

Do not invent symbols, abbreviations or drawing conventions. If a local source
or accepted office standard is unavailable, output must use `INFORMATION_MISSING`
or `REVIEW_REQUIRED` and record an open question.

## Open source tool policy

Prefer mature open source tools with broad communities, stable formats and
independent validators. A dependency candidate must be reviewed for:

- license compatibility and redistribution limits;
- active maintenance and community size;
- format coverage and standards alignment;
- deterministic CLI or library behavior;
- offline/local operation and privacy;
- ability to preserve object IDs, layers, metadata and units;
- independent validation or round-trip inspection;
- long-term replaceability through adapter interfaces.

Candidate categories to evaluate:

| Area                | Candidate direction                                                | Notes                                                               |
| ------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Core language       | TypeScript                                                         | Strong for schemas, CLI, agents, web viewers and RunSpec alignment. |
| 2D exchange         | DXF plus SVG/PDF reports                                           | Needs independent reader validation and layer/unit conformance.     |
| BIM exchange        | IFC                                                                | Prefer open standards; validate with independent IFC tooling.       |
| Parametric modeling | FreeCAD/OpenCascade/CadQuery-style boundary                        | Evaluate maturity, automation stability and licensing.              |
| Rendering/preview   | Blender, Three.js, glTF/GLB                                        | Rendering is for inspection and communication, not proof.           |
| Web visualization   | Three.js or model-viewer-style local viewer                        | Must expose metadata, findings and source status, not only visuals. |
| Geometry validation | Independent parsers, round-trip checks, clash/clearance validators | Avoid relying only on the generator that produced the output.       |
| Rule execution      | Typed rule engine plus source registry                             | Unsupported rules must never produce compliance pass/fail.          |
| Localization        | Typed language, symbol and title-block packs                       | Must be jurisdiction/office specific and evidence-backed.           |

Small or weakly maintained packages may be used only behind replaceable
adapters and only after documenting why mature alternatives are not sufficient.
If no credible package exists, implement the minimal required adapter in this
repository with focused tests and conformance fixtures.

## Target agent system

The future agent kit should be purpose-built for construction projects, not
only PR review. Planned agents:

- project-intake orchestrator: reads issue/API input and creates missing-value
  questions;
- source-discovery agent: finds current authority, municipal, supplier and
  standards sources;
- applicability agent: records which sources apply to the project and why;
- localization agent: identifies required language, terminology, CAD/BIM
  symbols, layer naming, title blocks and report conventions for the selected
  jurisdiction or office standard;
- architecture agent: creates and checks space, layout and drawing proposals;
- structure agent: prepares draft structural requirements and review packages;
- electrical agent: checks electrical inputs, zones, loads and review needs;
- plumbing agent: checks water, drainage, wet-room and supplier requirements;
- ventilation agent: checks airflow, equipment and coordination needs;
- fire/accessibility/site agents: handle their discipline-specific evidence;
- geometry coordinator: validates units, layers, levels, object IDs, clashes,
  clearances, quantities and format conformance;
- protocol agent: generates inspection/review protocol drafts;
- assurance coordinator: blocks unsupported claims and prepares professional
  review handoff.

Every agent must have a canonical skill, strict input/output schema, allowed
files, denied claims, required sources and validation commands.

## Construction project intake

Add issue templates only after the foundation map is accepted. The first
template should follow the `property-investment-analyzer` pattern: collect what
the user knows, allow unknowns, and require confirmations about evidence and
non-construction status.

Recommended template sections:

- project location and jurisdiction;
- drawing/report language and local authority submission language;
- property or site identifier;
- building type, scope and phase;
- project mode: new build, extension, renovation, redesign, change of use,
  existing-condition audit, legalization/permit support, construction
  coordination or handover;
- intended output: concept, permit package, tender package, construction
  coordination or handover record;
- available source files and their status, including old drawings, BIM/CAD,
  surveys, scans, photos, inspection records, permits, product data and
  contractor markups;
- site measurements, survey, geotechnical, utilities and existing drawings;
- known deviations between drawings and observed/as-built conditions;
- parts of the existing building that may not be changed and parts proposed for
  demolition, alteration, extension or replacement;
- discipline scope: architecture, structure, electrical, plumbing,
  ventilation, fire, accessibility, landscape/site;
- target CAD/BIM formats and viewer needs;
- required CAD/BIM standards, symbols, title blocks, layer naming or office
  drawing conventions if known;
- authority sources already known;
- contractors, suppliers and required reviewer roles;
- explicit acknowledgement that generated output is not accepted for real use
  until required professional/authority approvals are recorded.

## Existing-building workflows

Existing projects need a different evidence path than greenfield design. The
system must first understand what already exists, how reliable the source
material is, and which parts are being changed.

Supported future workflow types:

- as-built audit: import drawings/models and compare them with verified site
  measurements, scans, photos and inspection records;
- renovation: redesign selected rooms, systems or finishes while preserving
  constraints from existing structure and services;
- extension: add new building volume or systems while checking connection
  points, loads, fire separation, accessibility, envelope and utilities;
- change of use: evaluate whether existing spaces and systems satisfy the
  requirements for a new use category;
- correction/legalization: document existing unapproved work, identify evidence
  gaps and prepare a review package for professional and authority handling;
- phased construction: split demolition, temporary works, permanent works,
  inspection and handover into traceable protocol stages.

Required model concepts:

- `EXISTING_VERIFIED`: existing condition confirmed by accepted evidence;
- `EXISTING_UNVERIFIED`: present in source material but not verified;
- `TO_RETAIN`: existing object/system intended to remain;
- `TO_DEMOLISH`: existing object/system proposed for removal;
- `TO_MODIFY`: existing object/system proposed for alteration;
- `NEW_PROPOSED`: new object/system introduced by the design;
- `TEMPORARY_WORK`: temporary construction-stage object, support or measure;
- `UNKNOWN_CONDITION`: concealed, inaccessible or contradictory condition.

Existing-building agents must never overwrite original imported files. They
should create derived overlays, issue lists, revised proposals, clash reports
and protocols that preserve the original source revision and digest.

## Follow-up synchronization

Plans must stay phased and synchronized. A higher-level decision should state
which later phases, modules, agents, protocols and tests it affects.

Every phase decision or ADR must record:

- decision ID, status, date and owner;
- affected modules and phases;
- downstream documents, plans, RunSpec definitions or generated reports that
  must be updated;
- migration impact for existing fixtures and consumer contracts;
- validation commands required after the update;
- next follow-up work package and entry gate.

When RunSpec is adopted, this synchronization should move into executable
planned commits, dependency graphs and verification gates. Until then,
`NEXT_SESSION.md` must be updated after every session with the exact next gate
and any affected follow-ups.

## Phased roadmap

### Phase 0 — Clarify and clean the proof of concept

Goal: remove ambiguity and stop the current synthetic spike from looking like
real compliance.

Deliverables:

- PR 1 evidence-backed audit;
- BBR/bathroom naming disposition;
- implementation cleanup gate for the current TypeScript spike;
- neutral module boundaries for contracts, rule execution, artifact adapters,
  CLI orchestration and synthetic fixtures;
- accepted product vision and ownership boundary;
- decision on whether to amend, split or replace the current PR;
- green lint/test baseline.

Exit gate: no unverified regulatory claim can return `PASS` or `FAIL`, and no
public production API implies that the bathroom/BBR spike is the general
`cacad` domain.

### Phase 1 — Executable foundation

Goal: define testable contracts before adding real design features.

Deliverables:

- neutral domain schema for project, site, spaces, systems, layers, evidence,
  questions, findings and protocols;
- existing-condition schema for imported sources, original revisions, as-built
  status, retained/demolished/modified/new objects and unknown conditions;
- coordinate/unit/tolerance conventions;
- module contract conventions for regulatory packs, localization packs,
  discipline packs, format adapters, agent packs and protocol packs;
- CLI/API result envelopes;
- synthetic fixtures only;
- RunSpec adoption ADR and optional first executable plan.

Exit gate: schemas and plans can be validated without any real project data.

### Phase 2 — Geometry and CAD/BIM conformance

Goal: make generated artifacts inspectable, deterministic and independently
validated.

Deliverables:

- adapter interfaces for DXF, SVG/PDF, glTF/GLB and IFC;
- import/audit interfaces for existing CAD/BIM files that preserve originals
  and create derived overlays rather than mutating source files;
- local viewer that shows geometry, layers, object metadata, evidence status and
  findings;
- conformance reports for units, extents, layers, IDs, round-trip drift,
  collisions and quantities;
- as-built comparison reports for drawing/model versus verified measurement or
  scan evidence;
- open source tool ADRs for Blender, FreeCAD/OpenCascade and IFC workflows.

Exit gate: every generated artifact has an independent conformance report and
input/output digest.

### Phase 3 — Source registry and rule engine

Goal: support real regulatory workflows without hardcoded unsupported claims.

Deliverables:

- authority-source registry schema;
- source retrieval and supersession evidence;
- jurisdiction/discipline applicability records;
- country/local regulatory pack contract and Swedish example pack plan;
- generic rule-pack format;
- unsupported-rule behavior tests.

Exit gate: a rule cannot evaluate to compliance pass/fail unless source,
applicability and reviewer acceptance are present.

### Phase 4 — Discipline agents and protocols

Goal: separate AI responsibilities by discipline and protocol level.

Deliverables:

- construction-project issue templates;
- canonical skills and agents for intake, source discovery, applicability,
  localization, architecture, structure, electrical, plumbing, ventilation,
  fire, accessibility, geometry, protocols and assurance;
- existing-building agents for source import audit, as-built verification,
  renovation planning, extension planning, change-of-use review and phased work
  protocols;
- protocol schemas for design input, authority applicability, discipline review,
  model conformance, permit readiness, construction inspection and handover.

Exit gate: agents generate questions and review packages, not unsupported final
approval.

### Phase 5 — Review package generation

Goal: produce coordinated packages for customers, reviewers, authorities and
contractors.

Deliverables:

- deterministic document bundles;
- drawing/model registers;
- jurisdiction/language-specific drawing sheets, symbols, legends, title blocks
  and report text when accepted sources or office standards are available;
- evidence indexes;
- open questions and risk registers;
- discipline review status;
- permit/tender/construction/handover protocol drafts.

Exit gate: packages clearly state permitted use and remaining approvals.

### Phase 6 — Consumer project integration

Goal: allow real projects to consume released `cacad` contracts safely.

Deliverables:

- semver release and compatibility matrix;
- consumer contract tests;
- exact version pinning;
- no copied private data or relative-path source coupling;
- project-owned evidence admission gates.

Exit gate: a consumer project can reproduce artifacts and evidence while
retaining all professional and authority responsibility.

## Immediate next decisions

1. Finish C01: audit the current PR and remove or isolate regulatory claims.
2. Do the implementation cleanup gate: quarantine or rename the spike and split
   domain contracts, rule execution, artifact adapters and CLI orchestration.
3. Do C09: produce the foundation capability map from this roadmap.
4. Do C12 early: decide whether RunSpec becomes the executable planning layer.
5. Only then add construction-project issue templates and specialist agents.

Until those decisions are complete, do not add real building-design features.
