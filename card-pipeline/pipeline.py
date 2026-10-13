#!/usr/bin/env python3
"""
Agentic card-image pipeline for 1031f.com using Leonardo AI.

Stages per card:
  1. ART DIRECTOR (Claude)  - writes a scene prompt that obeys the style bible
  2. GENERATOR (Leonardo)   - fixed model/seed/size (+ optional style reference), N variants
  3. CRITIC (Claude vision) - scores each variant for style consistency + subject fit
  4. LOOP                   - if best score < min_score, critic's feedback goes back to
                              the art director and we retry (max_attempts)
  5. PUBLISH                - winner saved to <site>/img/cards/<slug>.jpg; optional HTML patch

Usage:
  export LEONARDO_API_KEY=... ANTHROPIC_API_KEY=...
  python pipeline.py --site /path/to/site                 # all cards
  python pipeline.py --site /path/to/site --only vortex-cannon,chess
  python pipeline.py --site /path/to/site --patch-html    # swap <img src> in the pages
  python pipeline.py --dry-run                            # prompts only, no image spend
"""
import argparse, base64, json, os, re, sys, time
from pathlib import Path
import requests
import anthropic

HERE = Path(__file__).parent
LEO = "https://cloud.leonardo.ai/api/rest/v1"


def load(name):
    return json.loads((HERE / name).read_text())


def text_of(r):
    # Thinking-capable models can return thinking blocks before the text block
    return "".join(b.text for b in r.content if b.type == "text").strip()


# ---------- Stage 1: art director ----------
def write_prompt(client, cfg, card, feedback=None):
    msg = (
        f"Style bible (must be honored exactly):\n{cfg['style_bible']}\n\n"
        f"Card: {card['title']} - {card['subtitle']}\nAbout: {card['blurb']}\n\n"
    )
    if card.get("details"):
        msg += f"Required details (follow these exactly):\n{card['details']}\n\n"
    msg += (
        "Write ONE image-generation prompt (max 70 words) depicting a single iconic object or scene "
        "that represents this project. Describe subject, composition and mood only; do not repeat "
        "the style bible, it is appended automatically. No text or lettering in the image."
    )
    if feedback:
        msg += f"\n\nPrevious attempt was rejected. Critic feedback:\n{feedback}\nFix these issues."
    r = client.messages.create(model=cfg["claude_model"], max_tokens=1024,
                               messages=[{"role": "user", "content": msg}])
    return text_of(r)


# ---------- Stage 2: Leonardo ----------
def leo_headers():
    return {"authorization": f"Bearer {os.environ['LEONARDO_API_KEY']}",
            "accept": "application/json", "content-type": "application/json"}


def upload_style_ref(path):
    ext = Path(path).suffix.lstrip(".").lower().replace("jpeg", "jpg")
    r = requests.post(f"{LEO}/init-image", headers=leo_headers(), json={"extension": ext})
    r.raise_for_status()
    d = r.json()["uploadInitImage"]
    fields = json.loads(d["fields"])
    with open(path, "rb") as f:
        requests.post(d["url"], data=fields, files={"file": f}).raise_for_status()
    return d["id"]


def generate(cfg, prompt, seed, style_ref_id=None):
    L = cfg["leonardo"]
    body = {
        "prompt": f"{prompt}. {cfg['style_bible']}"[:1500],
        "negative_prompt": cfg["negative_prompt"],
        "modelId": L["model_id"], "width": L["width"], "height": L["height"],
        "num_images": L["num_images"], "seed": seed, "alchemy": L["alchemy"],
    }
    if style_ref_id:  # Style Reference (preprocessor 67, SDXL-based models)
        body["controlnets"] = [{"initImageId": style_ref_id, "initImageType": "UPLOADED",
                                "preprocessorId": 67, "strengthType": "Mid"}]
    r = requests.post(f"{LEO}/generations", headers=leo_headers(), json=body)
    r.raise_for_status()
    gid = r.json()["sdGenerationJob"]["generationId"]
    for _ in range(60):
        time.sleep(5)
        g = requests.get(f"{LEO}/generations/{gid}", headers=leo_headers()).json()["generations_by_pk"]
        if g["status"] == "COMPLETE":
            return [i["url"] for i in g["generated_images"]]
        if g["status"] == "FAILED":
            raise RuntimeError("Leonardo generation failed")
    raise TimeoutError("Leonardo generation timed out")


# ---------- Stage 3: critic ----------
def critique(client, cfg, card, url, ref_bytes=None):
    img = requests.get(url).content
    content = []
    if ref_bytes:
        content += [{"type": "text", "text": "Reference image (approved style):"},
                    {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg",
                                                 "data": base64.b64encode(ref_bytes).decode()}}]
    content += [{"type": "text", "text": "Candidate:"},
                {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg",
                                             "data": base64.b64encode(img).decode()}},
                {"type": "text", "text":
                    f"Style bible:\n{cfg['style_bible']}\n\nCard subject: {card['title']} - {card['blurb']}\n\n"
                    "Score 1-10 for (a) adherence to the style bible/palette, (b) clearly depicting the "
                    "subject, (c) no text/artifacts. Reply with JSON only: "
                    '{"score": <overall int>, "feedback": "<one or two sentences on what to fix>"}'}]
    r = client.messages.create(model=cfg["claude_model"], max_tokens=1024,
                               messages=[{"role": "user", "content": content}])
    reply = text_of(r)
    m = re.search(r"\{.*\}", reply, re.S)
    if not m:
        raise ValueError(f"critic reply had no JSON: {reply!r}")
    return json.loads(m.group(0))


# ---------- Orchestrator ----------
def run_card(client, cfg, card, out, site, ref_bytes, style_ref_id, dry):
    feedback, best = None, (-1, None, None)
    for attempt in range(1, cfg["max_attempts"] + 1):
        prompt = write_prompt(client, cfg, card, feedback)
        print(f"[{card['slug']}] attempt {attempt}: {prompt}")
        (out / f"{card['slug']}.prompt.txt").write_text(prompt)
        if dry:
            return None
        seed = cfg["leonardo"]["seed"] + attempt - 1
        urls = generate(cfg, prompt, seed, style_ref_id)
        scored = [(critique(client, cfg, card, u, ref_bytes), u) for u in urls]
        top, url = max(scored, key=lambda s: s[0]["score"])
        print(f"[{card['slug']}]   best score {top['score']}: {top['feedback']}")
        if top["score"] > best[0]:
            best = (top["score"], url, top)
        if top["score"] >= cfg["min_score"]:
            break
        feedback = top["feedback"]
    score, url, top = best
    data = requests.get(url).content
    dest = (site / cfg["site_image_dir"]) if site else out
    dest.mkdir(parents=True, exist_ok=True)
    path = dest / f"{card['slug']}.jpg"
    path.write_bytes(data)
    (out / f"{card['slug']}.json").write_text(json.dumps({"score": score, "url": url, **top}, indent=2))
    return path


def patch_html(site, cards, cfg):
    for page in {c["page"] for c in cards}:
        p = site / page
        html = p.read_text()
        for c in cards:
            if c["page"] == page and (site / cfg["site_image_dir"] / f"{c['slug']}.jpg").exists():
                html = html.replace(f'src="{c["current"]}"', f'src="{cfg["site_image_dir"]}/{c["slug"]}.jpg"')
        p.write_text(html)
        print("patched", page)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--site", type=Path)
    ap.add_argument("--only")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--patch-html", action="store_true")
    a = ap.parse_args()

    cfg, cards = load("style.json"), load("cards.json")
    if a.only:
        wanted = set(a.only.split(","))
        cards = [c for c in cards if c["slug"] in wanted]
    out = HERE / cfg["output_dir"]
    out.mkdir(exist_ok=True)
    client = anthropic.Anthropic()

    ref = cfg["leonardo"]["style_reference_image"]
    ref_bytes = Path(ref).read_bytes() if ref else None
    style_ref_id = upload_style_ref(ref) if ref and not a.dry_run else None

    for c in cards:
        try:
            run_card(client, cfg, c, out, a.site, ref_bytes, style_ref_id, a.dry_run)
        except Exception as e:
            print(f"[{c['slug']}] FAILED: {e}", file=sys.stderr)

    if a.patch_html and a.site:
        patch_html(a.site, cards, cfg)


if __name__ == "__main__":
    main()
