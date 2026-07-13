# Next-session handoff

| Document status | Revision | Date       |
| --------------- | -------- | ---------- |
| Active handoff  | P02      | 2026-07-13 |

## Current state

- PR 1 is open from `copilot/typescript-architecture-correction` into `main`.
- PR 1 contains a TypeScript/Zod/Vitest DXF/glTF proof of concept.
- Its lint check currently fails.
- Its BBR clause and threshold claims are not accepted regulatory evidence.
- No integration with `building-engineering-projects` is approved.
- The intended split is reusable neutral capability in `cacad` and all
  Alnarpsgatan evidence, geometry authority, approvals and issued deliverables
  in `building-engineering-projects`.
- The current repository is implementation-isolated from consuming projects;
  cross-repository references are planning/handoff only.
- Do not add feature code for real compliance, Blender/IFC workflows,
  discipline-specific engineering, inspection protocols or permit readiness
  until the foundation work packages are accepted.
- `runspec` is only a candidate for a future architecture spike; it is not yet
  an approved dependency or replacement workflow for `cacad`.
- `docs/architecture/PRODUCT_VISION_AND_ROADMAP.md` now defines the broader
  architecture-as-code/code-as-CAD product direction, phase plan, open source
  tool policy, future construction-project agents and issue-template approach.
  It covers both new construction and existing-building audit, renovation,
  extension, redesign, change-of-use and imported CAD/BIM workflows.
- The roadmap now requires modular regulatory, localization, discipline,
  format-adapter, agent and protocol packs. Country/local rules, CAD/BIM
  symbols, title blocks, terminology and report language must come from
  evidence-backed jurisdiction or office-standard packs, not the generic core.
- Existing CI/CD and provider-aware pipelines should remain unchanged unless a
  separate ADR approves a pipeline change for an accepted phase.

## Required reading

1. `AGENTS.md` and `.github/instructions/project.instructions.md`;
2. `docs/architecture/PROJECT_BOUNDARY_AND_PR1_PLAN.md`;
3. `docs/architecture/PRODUCT_VISION_AND_ROADMAP.md`;
4. PR 1 description, complete diff, review threads and CI logs;
5. in `building-engineering-projects`:
   `projects/alnarpsgatan-34-pool/00-project-management/ARCHITECTURE_AS_CODE_PLAN.md`;
6. in that repository: the construction-design assurance skill and pool
   verification gate.

## Exact next session

Execute **C01 — Evidence-backed PR 1 audit** first. Review only; do not merge PR
1 or edit its implementation. Confirm every regulatory statement against
current authoritative evidence or classify it as unsupported. Finish with an
explicit amend/split/replace recommendation.

After C01, execute **C09 — Foundation capability map** before any new feature
implementation. Use it to decide how `cacad` will support future geometry,
discipline, compliance, protocol and agent extensions for both new and existing
building projects without claiming real construction authority. C09 must include
module boundaries for regulatory packs, localization packs, discipline packs,
format adapters, agent packs and protocol packs.

Before C09 implementation planning, complete the implementation cleanup gate in
`PRODUCT_VISION_AND_ROADMAP.md`: quarantine or rename the bathroom/BBR spike,
separate schema parsing, synthetic rule execution, artifact adapters and CLI
orchestration, and keep the output behavior reproducible.

Use `PRODUCT_VISION_AND_ROADMAP.md` as the human-readable product north star.
Do not create construction-project issue templates, CAD/BIM tool integrations or
specialist design agents until C09 and C12 have explicit decisions.

## Mandatory handoff update

Record:

- completed work-package ID and commit;
- PR head SHA and files reviewed;
- findings and regulatory evidence status;
- CI commands/logs inspected and results;
- ADRs or decisions created;
- blockers and exact next work package;
- explicit statement that outputs are or are not construction-ready.
- whether any future source registry, protocol, agent or RunSpec decision was
  accepted, deferred or rejected.
- affected downstream phases/modules and the follow-up updates required to keep
  plans synchronized.
