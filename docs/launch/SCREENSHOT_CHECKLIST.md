# Screenshot Checklist

## Required pages

- Home / landing (`/`)
- IoT Maker (`/iot-maker`)
- Source page (`/source`)
- Tutorials (`/tutorials`)
- Logs (`/logs`) — dashboard/logs stream surface

## Required evidence screenshots

1. Hero / README-aligned summary
   - App state is visible and route header renders.
   - Check: No control-only mode text.

2. 5-second demo capture
   - Show timeline starting at 0.0s and ending with verified memory candidate.
   - Check: Operator step appears in sequence.

3. Reflex Agent Loop
   - Validate Atlas → Scribe → Forge → Sentinel labels visible.
   - Check: Loop progression and event updates are readable.

4. Query Labs
   - Show provider and Supabase read paths.
   - Check: Mock and protected/sandbox state are labeled.

5. Logs panel
   - Show timestamped phase and status rows.
   - Check: Decision fields and operator gate are visible.

6. Proof Ledger
   - Show hash/evidence packet and chain target selection.
   - Check: No prompt or raw telemetry is shown in proof payload.

7. Source page
   - Show source category list and claim matrix link.
   - Check: Source URL and claim alignment are clear.

## File naming

- `zrt-iot-maker-home.png`
- `zrt-iot-maker-reflex-5s.gif`
- `zrt-iot-maker-query-lab.png`
- `zrt-iot-maker-logs.png`
- `zrt-iot-maker-proof-ledger.png`
- `zrt-iot-maker-source-page.png`

## Acceptance checks

- Each screenshot is readable at 1280x720 and 390x844.
- Route names match live paths.
- No production machine-control claim appears in any screenshot.
- One README-linked claim must be visible across source or logs panel.
