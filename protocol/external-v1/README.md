# Snack external connection protocol · v1 schemas

Service-neutral JSON Schema draft 2020-12 contracts generated from Snack's protocol validation shapes. These are optional developer material, not an application backend and not a Condiment to install. No third-party service implementation or credential is bundled into Snack.

Start with [the connection guide](../../EXTERNAL-CONNECTIONS.md). All schemas have `snack-external:v1:*` identifiers. Register every schema before resolving references; do not fetch an unknown `$ref` from a network address. Pairing/session/binding schemas are common plumbing. Functional command/event/message capabilities are declared and discovered as needed.

Use your language's draft 2020-12 validator. Schema validation proves shape, not authentication, ownership, atomicity, delivery semantics or real effects. Your runtime tests must also prove grant checks, deduplication, replay/cursor integrity and revocation. No particular development language is required.

The host uses these same wire shapes with its existing shared API/MCP action harness. Discovery never replaces that registry with a limited subset.
