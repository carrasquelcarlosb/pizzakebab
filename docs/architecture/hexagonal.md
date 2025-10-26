# Hexagonal architecture overview

This project is converging toward a hexagonal (ports-and-adapters) architecture. This document explains how we slice the
code base, the responsibilities of each layer, and the conventions contributors should follow when adding new features.

## Domain layer

The domain layer is the center of the application. It captures the ubiquitous language of the product and is the only
place where business rules live.

- **Location**: `src/domain/<bounded-context>/`.
- **Contents**:
  - `entities/` and `value-objects/` describe the data structures and invariants that must hold true.
  - `use-cases/` contain orchestrators that expose a single entry point per business capability. Each use case returns a
    result object (success or failure) without leaking implementation details from infrastructure.
  - `services/` include domain services that coordinate behavior shared across multiple entities or value objects.
  - `ports/` declare the contracts (interfaces or abstract classes) that the domain requires for infrastructure
    interactions, such as persistence, HTTP APIs, queues, or telemetry.
- **Dependencies**: the domain layer is pure TypeScript/JavaScript. It must not import from `src/adapters`, `src/app`, or
  other framework-specific modules. Domain code can depend on shared utilities in `src/lib` when they are framework
  agnostic (e.g., type helpers or pure functions).

## Ports

Ports define the seams between the domain and the outside world. They are expressed as TypeScript interfaces and live
alongside the use cases that depend on them.

- **Incoming ports** describe how the outside world can trigger a use case. In practice these are the exported functions
  or classes within `use-cases/`.
- **Outgoing ports** capture the dependencies a use case needs (for example, repositories, event buses, or external API
  clients). Outgoing ports are defined under `ports/` and injected into the use case via constructor arguments or
  function parameters.
- **Testing guidance**: unit tests should mock outgoing ports, while integration tests should pair a use case with the
  real adapter implementation to verify wiring.

## Adapters

Adapters translate between the domain ports and concrete technologies.

- **Location**: `src/adapters/<technology>/<domain-context>/`.
  - Example: `src/adapters/http/orders/create-order.handler.ts` implements the HTTP transport for the `CreateOrder`
    use case.
- **Contents**: adapters wire transport or infrastructure concerns (HTTP handlers, background jobs, persistence
  repositories, third-party SDK clients) to the domain ports.
- **Rules**:
  - Adapters import domain use cases and ports, not the other way around.
  - Each adapter should expose a factory or wiring function that injects concrete dependencies into a use case. Keep the
    translation logic (request parsing, DTO mapping, error mapping) in the adapter layer.
  - Share infrastructure helpers (e.g., fetch wrappers) under `src/lib` or `src/services` if they remain technology
    specific.

## Directory conventions

```
src/
├── adapters/
│   └── <technology>/
│       └── <domain-context>/
├── domain/
│   └── <bounded-context>/
│       ├── entities/
│       ├── value-objects/
│       ├── use-cases/
│       ├── ports/
│       └── services/
├── app/               # Next.js routing surfaces (UI + server actions)
├── components/        # Pure UI components
├── data/              # Legacy data utilities pending migration
├── services/          # Shared framework-specific services pending migration
└── tests/             # Cross-cutting integration tests
```

- Name bounded contexts using product language (e.g., `orders`, `menu`, `kitchen`).
- Prefer colocating tests next to the implementation (`*.spec.ts` or `*.test.ts`). Framework-level integration tests can
  continue to live in `tests/` while modules are migrated.
- Group domain use cases by feature folder. Avoid large “god” services.

## Migration checklists

Use the following checklists to migrate existing modules into the hexagonal layout. Work incrementally: move one bounded
context at a time, ensuring all tests pass before continuing.

### UI routes (`src/app/`)

1. Identify the domain use case triggered by the route (form submission, page load, server action).
2. Create or update the corresponding use case under `src/domain/<context>/use-cases/`.
3. Ensure the use case exposes an incoming port that the route can call (usually a function or class method).
4. Wire the route or server action to the use case by importing it and providing the required adapters.
5. Extract request/response mapping logic into an adapter under `src/adapters/http/<context>/`.
6. Delete legacy business logic embedded in the route once the use case integration is verified by tests.

### Legacy services (`src/services/`)

1. Audit each service to determine whether it contains business rules (belongs in domain) or infrastructure logic (belongs
   in an adapter).
2. For business rules, move the logic into a new or existing domain service or use case. Replace the legacy module with a
   thin wrapper that delegates to the domain until callers are updated.
3. For infrastructure logic, model the dependency as an outgoing port and move the implementation into
   `src/adapters/<technology>/`.
4. Update all call sites to depend on the new port or use case entry point.
5. Remove the legacy service once all consumers use the hexagonal equivalent.

### Data utilities (`src/data/`)

1. Determine whether the module represents domain knowledge (entities, mappers) or low-level data fetching.
2. Move domain knowledge into `src/domain/<context>/entities/` or `value-objects/` as appropriate.
3. Express low-level data fetching as an outgoing port. Implement the port in an adapter (e.g., `src/adapters/http/`).
4. Update tests to target the domain use case while mocking the new port.
5. Delete or deprecate the original data utility once all references point to the new location.

### Tests (`tests/`)

1. Prefer colocated unit tests with the new domain use cases (`*.spec.ts`).
2. Keep or add integration tests under `tests/` to cover cross-cutting workflows that span multiple adapters.
3. Ensure tests import domain use cases and provide adapter stubs or factories rather than reaching into legacy services.
4. Update mocking and fixtures to align with the new port interfaces.

Following these conventions will keep the domain isolated, make adapters interchangeable, and simplify future migrations.
