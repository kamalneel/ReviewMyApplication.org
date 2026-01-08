#!/usr/bin/env python3
import json

# Load the main database
with open('college_admissions_database.json', 'r') as f:
    main_db = json.load(f)

# Load all three research files
with open('universities_research_complete.json', 'r') as f:
    research_part1 = json.load(f)

with open('universities_research_complete_part2.json', 'r') as f:
    research_part2 = json.load(f)

with open('universities_research_complete_part3.json', 'r') as f:
    research_part3 = json.load(f)

# Combine all research
all_research = {**research_part1, **research_part2, **research_part3}

# Map the research keys to university names
university_mapping = {
    'stanford_university': 'Stanford University',
    'yale_university': 'Yale University',
    'princeton_university': 'Princeton University',
    'columbia_university': 'Columbia University',
    'university_of_pennsylvania': 'University of Pennsylvania (Penn/Wharton)',
    'duke_university': 'Duke University',
    'university_of_chicago': 'University of Chicago',
    'northwestern_university': 'Northwestern University'
}

# Replace the partial entries in top_10_universities_deep_research
updated_universities = []
for uni in main_db['top_10_universities_deep_research']:
    uni_name = uni['university']

    # Check if we have updated research for this university
    updated = False
    for research_key, full_name in university_mapping.items():
        if uni_name == full_name and research_key in all_research:
            # Replace with comprehensive research
            updated_universities.append(all_research[research_key])
            updated = True
            print(f"Updated: {uni_name}")
            break

    if not updated:
        # Keep existing entry (Harvard and MIT)
        updated_universities.append(uni)
        print(f"Kept existing: {uni_name}")

# Update the main database
main_db['top_10_universities_deep_research'] = updated_universities

# Update metadata
main_db['metadata']['last_updated'] = '2026-01-07'
main_db['metadata']['colleges_with_deep_research'] = 10

# Save the updated database
with open('college_admissions_database_updated.json', 'w') as f:
    json.dump(main_db, f, indent=2)

print("\nDatabase updated successfully!")
print(f"Total universities with deep research: {len(updated_universities)}")
