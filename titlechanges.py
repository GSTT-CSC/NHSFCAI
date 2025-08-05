import os
import re

MARKDOWN_DIR = './_fellow'
POSTER_BASE_PATH = '/assets/docs/posters/'

for md_file in os.listdir(MARKDOWN_DIR):
    if not md_file.endswith('.md'):
        continue

    md_path = os.path.join(MARKDOWN_DIR, md_file)
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    i = 0
    changed = False

    while i < len(lines):
        line = lines[i]

        if line.strip() == '### Fellowship Project':
            new_lines.append(line)
            # Check next two lines
            if i + 2 < len(lines):
                link_line = lines[i + 1].strip()
                title_line = lines[i + 2].strip()

                # Match: ##### _[View Poster](...)_
                match = re.match(r'^##### _\[View Poster\]\((.*?)\)_$', link_line)
                # Match: ##### _Title_
                title_match = re.match(r'^##### _(.+)_$', title_line)

                if match and title_match:
                    link = match.group(1)
                    title = title_match.group(1)
                    # Replace with one line:
                    new_lines.append(f'##### _[{title}]({link})_\n')
                    changed = True
                    i += 3
                    continue

        new_lines.append(line)
        i += 1

    if changed:
        with open(md_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"✅ Updated: {md_file}")