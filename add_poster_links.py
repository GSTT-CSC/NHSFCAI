import os

POSTER_DIR = './assets/docs/posters'
MARKDOWN_DIR = './_fellow'
POSTER_PREFIX = 'FCAI C3 Grad Poster '
INSERT_HEADING = '### Fellowship Project'

poster_map = {}
for fname in os.listdir(POSTER_DIR):
    if fname.startswith(POSTER_PREFIX) and fname.endswith('.pdf'):
        raw_name = fname.replace(POSTER_PREFIX, '').replace('.pdf', '').strip()
        norm_name = raw_name.lower().replace(' ', '').replace('-', '')
        poster_map[norm_name] = fname

print(f"Found {len(poster_map)} posters.")

for md_file in os.listdir(MARKDOWN_DIR):
    if not md_file.endswith('.md'):
        continue

    base_name = md_file.replace('.md', '').replace('-', '').lower()
    md_path = os.path.join(MARKDOWN_DIR, md_file)
    poster_file = poster_map.get(base_name)

    print(f"\nChecking {md_file}...")
    if not poster_file:
        print(f"⛔ No matching poster for: {base_name}")
        continue

    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    in_project_section = False
    poster_link_found = False
    for line in lines:
        stripped = line.strip()
        if stripped == INSERT_HEADING:
            in_project_section = True
            continue
        if stripped.startswith('### ') and in_project_section:
            break  # left the section
        if in_project_section and '/assets/docs/posters/' in stripped:
            poster_link_found = True
            break

    if poster_link_found:
        print("✅ Poster link already present — skipping.")
        continue

    if not in_project_section:
        print("⚠️ No valid '### Fellowship Project' section found — skipping.")
        continue

    # Actually modify file
    new_lines = []
    inserted = False
    for line in lines:
        new_lines.append(line)
        if line.strip() == INSERT_HEADING and not inserted:
            link = f"##### _[View Poster](/assets/docs/posters/{poster_file})_\n"
            new_lines.append(link)
            inserted = True

    if inserted:
        print(f"✍️ Inserting link to {poster_file}")
        with open(md_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)