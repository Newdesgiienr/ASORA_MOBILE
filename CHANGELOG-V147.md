# V147 — battle rules and feedback

- Sandbox enemy HP/BP damage: normal 650/20, counter failure 850/35, unavoidable 750/25, assault 1000/40.
- Counter PERFECT uses 10% HP damage and 0 BP; GOOD uses 30% HP damage and 10 BP. Defense, reductions, curse and shields apply afterward. A fallen/broken counter actor cannot auto-attack.
- Ally damage = pattern damage / (1 + defense increase sum) * remaining-damage factor. These are trial values, not official CBT formulas. Enemy defense/fracture formula remains unconnected pending a specified enemy defense baseline.
- Shields overlay the existing HP bar using shield / max HP. They absorb HP damage, not BP. Existing durations and replacement (not additive) rules remain.
- Ally BP 100, no passive recovery. BREAK refills BP and disables the actor for the current and following round. Others may switch in; emergency substitution is AP-free and does not attack. If nobody acts, the round advances after 1.5s. BP is preserved on switches.
- Ally base critical chance 10%, critical damage 200%; buffs add percentage points. Direct and supported proc hits carry critical metadata to logs and orange/yellow numbers with brown outline and red/black CRITICAL label. Fixed damage procs retain their existing exclusions.
- Proc numbers are separated by at least 320ms per target. Charged base hits remain aligned to the last VFX; follow-up numbers retain spacing. Assault block has one base hit at clash, with real extra procs separately labeled/logged.
- Luna domain triggers on battle/ultimate/tag attack/special/defense skill use, not ordinary attacks. Removed Souka domain echo and its character/reader description.
- Ren curse application counter is independent for each enemy; seven applications trigger 595.2% proc damage.
- Offensive charge request intercepts blue immediately even when conditional coefficient is zero; accepted queued attacks cannot lose to the enemy timer. Buff-only skills do not intercept.
- Effect ledger shows Liria consumption/attack stacks, Doll activation, Nono innate defense, BREAK availability and gem buff details. Gem fill reflects active buffs; collection remains in resources. Current critical/defense/BP values appear below battle.
- PC and mobile regression suite covers new mechanics and previous multi-enemy, cooldown, reader pause/resume and replacement behavior.
