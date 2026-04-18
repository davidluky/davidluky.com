# lo_enemy_b4A — sprite_status

**Status:** no atlas generated; hypothesis — invisible trigger/spawner entity, not a rendered sprite.

## Evidence

- slot 9 @ f420 position bytes: `b14=0x00 b15=0x00 b0C=0x00 b0D=0x6D` — all pos bytes (x=0, y=109 from b0D) are effectively null or invariant. Catalogued rendered enemies (`lo_enemy_b20`, `lo_enemy_b5B`) have non-zero, state-varying pos bytes.
- OAM palette saturation at f420 (first frame b4A is active): only 4 palettes visible (pal=1 X, pal=2 BG/HUD, pal=4 `lo_enemy_b5B`, pal=7 `lo_enemy_b20`). No leftover palette where b4A's sprites could live.
- FSM state coverage: state=2 only across all 3 slot instances (slots 3/9/13) in the recon. 566-frame uninterrupted idle on slot 9 — no state cycle, no hurt reaction, no projectile emit.
- Identity fingerprint split: slots 9 & 13 carry `b15=0x00`; slot 3 (later in the trace) carries `b15=0xFA`. Same b12=0x4A, different b15 — may be two trigger variants sharing the type code.

## Interpretation

Rendered enemies (`b11=0x01` class) in Launch Octopus use palette rows 4 or 7 in the observed trace. `lo_enemy_b4A` occupies the 16-slot entity table but appears to contribute no visible OAM sprites: null pos bytes + no palette budget + no state cycling are consistent with a **spawner / scripted-event trigger** entity rather than a player-visible enemy. MMX1 commonly uses entity slots for off-screen spawn-control bookkeeping.

## Deferred

- Full capture with a longer-walking trace or a dedicated recon that crosses b4A's spawn points should either (a) confirm the trigger hypothesis by observing b4A toggle adjacent slots on/off, or (b) surface a 5th palette row if b4A is in fact rendered.
- No HP / sprites_ref / atlas.png produced. Downstream KB consumers should treat `lo_enemy_b4A` as behavior-only until the sprite gap is closed.

## Provenance

- Trace: `knowledge_base/mmx1/_phase7_runs/launch_octopus/recon`
- Evidence frame: `oam_f0420.bin`
- Analysis: Session 30 (2026-04-18), follow-up to Phase 7 P3.2 first recon.
