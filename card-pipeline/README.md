# 1031F card image pipeline

Art director (Claude) -> generator (Leonardo) -> critic (Claude vision) -> retry loop -> publish.

## Setup
    pip install requests anthropic
    export LEONARDO_API_KEY=...
    export ANTHROPIC_API_KEY=...

## Run
    python pipeline.py --dry-run                       # check prompts, no Leonardo credits
    python pipeline.py --site ../ --only vortex-cannon # trial one card first
    python pipeline.py --site ../ --patch-html         # all 18 cards + rewrite <img src>

## Keeping the set consistent
1. Same model, size and base seed for every card (style.json).
2. One shared style bible appended to every prompt.
3. Pick your favorite result from the trial card, save it, and set
   `leonardo.style_reference_image` in style.json. Every later card then uses it as a
   Leonardo Style Reference, and the critic compares each candidate against it.
4. Critic rejects anything under `min_score` and feeds its notes back to the art director.

Outputs: img/cards/<slug>.jpg in the site, plus out/<slug>.prompt.txt and out/<slug>.json (score, feedback, source URL).

## Notes
- Verify the Leonardo model_id and Style Reference support against their current API docs; model IDs and presets change.
- Card images render about 20vw wide on desktop, so 1024x768 is plenty.
