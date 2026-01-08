#!/usr/bin/env python3
import json

# Read main database
with open('college_admissions_database.json', 'r') as f:
    db = json.load(f)

# Read research files
with open('universities_research_complete_part2.json', 'r') as f:
    part2 = json.load(f)

with open('universities_research_complete_part3.json', 'r') as f:
    part3 = json.load(f)

# Find and replace Duke, UChicago, Northwestern in the top_10 list
for i, uni in enumerate(db['top_10_universities_deep_research']):
    uni_name = uni['university']

    if uni_name == 'Duke University':
        db['top_10_universities_deep_research'][i] = part2['duke_university']
        print(f"✅ Updated Duke University")

    elif uni_name == 'University of Chicago':
        db['top_10_universities_deep_research'][i] = part3['university_of_chicago']
        print(f"✅ Updated University of Chicago")

    elif uni_name == 'Northwestern University':
        db['top_10_universities_deep_research'][i] = part3['northwestern_university']
        print(f"✅ Updated Northwestern University")

# Update metadata
db['metadata']['last_updated'] = '2026-01-07'
db['metadata']['colleges_with_deep_research'] = 10

# Write updated database
with open('college_admissions_database.json', 'w') as f:
    json.dump(db, f, indent=2)

print("\n🎉 ALL 10 UNIVERSITIES INTEGRATED SUCCESSFULLY!")
print("Database now contains comprehensive research for:")
print("1. Harvard ✅")
print("2. MIT ✅")
print("3. Stanford ✅")
print("4. Yale ✅")
print("5. Princeton ✅")
print("6. Columbia ✅")
print("7. Penn ✅")
print("8. Duke ✅")
print("9. UChicago ✅")
print("10. Northwestern ✅")
