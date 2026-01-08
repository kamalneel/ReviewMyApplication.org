#!/usr/bin/env python3
import json
import re

# Read the main database
with open('college_admissions_database.json', 'r') as f:
    content = f.read()

# Read Columbia research
with open('universities_research_complete_part2.json', 'r') as f:
    part2 = json.load(f)

# Read UChicago and Northwestern research
with open('universities_research_complete_part3.json', 'r') as f:
    part3 = json.load(f)

# Function to replace a university entry
def replace_university(content, university_name, new_data):
    # Find the university entry
    pattern = r'(\s+{\s+"university":\s+"' + re.escape(university_name) + r'".*?)\s+},\s+(\s+{)'
    replacement = '\n' + json.dumps(new_data, indent=2).replace('\n', '\n    ') + ',\n\n    {'
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    return content

# Replace Columbia
content = replace_university(content, "Columbia University", part2['columbia_university'])
print("Updated Columbia University")

# Replace Penn
content = replace_university(content, "University of Pennsylvania (Penn/Wharton)", part2['university_of_pennsylvania'])
print("Updated University of Pennsylvania")

# Replace Duke
content = replace_university(content, "Duke University", part2['duke_university'])
print("Updated Duke University")

# Replace UChicago
content = replace_university(content, "University of Chicago", part3['university_of_chicago'])
print("Updated University of Chicago")

# Replace Northwestern
content = replace_university(content, "Northwestern University", part3['northwestern_university'])
print("Updated Northwestern University")

# Save the updated database
with open('college_admissions_database.json', 'w') as f:
    f.write(content)

print("\n✅ All universities integrated successfully!")
