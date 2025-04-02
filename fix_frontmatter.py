import os
import re
import yaml
from datetime import datetime

def extract_first_image_url(content):
    # Look for markdown image syntax
    img_match = re.search(r'!\[.*?\]\((.*?)\)', content)
    if img_match:
        return img_match.group(1)
    return None

def update_mdx_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract frontmatter using regex
    frontmatter_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not frontmatter_match:
        return
    
    # Parse frontmatter
    try:
        frontmatter = yaml.load(frontmatter_match.group(1))
    except yaml.YAMLError:
        frontmatter = {}
    
    # Extract first image URL from content
    first_image_url = extract_first_image_url(content)
    
    # Create new frontmatter with standardized fields
    new_frontmatter = {
        'author': frontmatter.get('authors', [''])[0] if isinstance(frontmatter.get('authors'), list) else frontmatter.get('authors', ''),
        'title': frontmatter.get('title', ''),
        'date': frontmatter.get('date', datetime.now().strftime('%Y-%m-%d')),
        'topic': frontmatter.get('tags', [''])[0] if isinstance(frontmatter.get('tags'), list) else frontmatter.get('tags', ''),
        'description': frontmatter.get('summary', ''),
        'featured_image_url': first_image_url or ''
    }
    
    # Convert frontmatter to YAML
    yaml_str = yaml.dump(new_frontmatter, default_flow_style=False, allow_unicode=True, sort_keys=False)
    
    # Replace old frontmatter with new frontmatter
    new_content = re.sub(
        r'^---\n.*?\n---',
        f'---\n{yaml_str}---',
        content,
        flags=re.DOTALL
    )
    
    # Write updated content back to file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

def main():
    content_dir = 'content/cubed'
    
    # Process all MDX files in the directory
    for filename in os.listdir(content_dir):
        if filename.endswith('.mdx'):
            file_path = os.path.join(content_dir, filename)
            try:
                update_mdx_file(file_path)
                print(f"Successfully updated {filename}")
            except Exception as e:
                print(f"Error processing {filename}: {str(e)}")

if __name__ == "__main__":
    main() 