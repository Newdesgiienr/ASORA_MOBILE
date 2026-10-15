# V139 — damage rules and enemy roster

- Selection screen: single enemy or three enemies (one field opponent, two reserves). Each starts at HP 100 / BP 200.
- Individual HP, BP and effects persist through replacement. Whole-field damage hits living reserves without reducing reserve BP. Dead reserves are skipped.
- AoE scope follows the provided V54 skill descriptions: Koyomi skill/ultimate/tag; Sigrid skill/ultimate; Luna ultimate/tag; Souka ultimate; Canon charge 2/ultimate only with a primary cherry mark. Other skills remain single-target.
- Enemy replacement waits for death audio, then 650 ms gap, then 900 ms entrance with swapOnly audio. No automatic entrance attack. Combat inputs and progression pause during replacement. Final victory sequence runs only after all enemies die.
- HP uses skill coefficient / 100; ordinary attack base remains 2. Attack/critical/skill bonuses remain. Strike modifies BP, not HP.
- BP damage retains action weights 10/20/30/10, multiplied by role strike (breaker 2, other roles 1) and strike buffs. BP maximum/recovery is 200.
- Moa fracture consumption adds unmodified 5 damage, separately displayed 280 ms after the base hit; redundant damage explanation log removed.
- Ultimate is gated by AP/CT/action state, not US. US accounting remains for existing character mechanics.
- Plunder uses 15 percentage points: actor crit +0.15 and target crit -0.15 clamped at zero. Test mannequin base crit remains 0; no invented base stats. Defense-based fracture mitigation remains deferred pending a formula.
- Upper effect ledger includes Greek fire, time trace, plush, curse application progress, gems and light. Greek fire starts at 3; existing Akina refill/CT behavior is preserved.

Validation: Node VM tests cover single/multi HP/BP, conditional AoE, independent statuses, death audio wait, replacement locks, round-end DoT replacement, reset safety, CT-only ultimate, plunder, and resources. Existing mobile touch/charge/audio, ultimate and effect readiness regression tests pass. Physical Safari and visual browser verification are not performed (browser executable download failed).
