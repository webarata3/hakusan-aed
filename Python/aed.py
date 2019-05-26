import csv

print('(function (global) {')
print("  'use strict';")
print('  global.locations = [')

with open('aed.csv', 'r', encoding='shift_jis') as f:
    reader = csv.reader(f)
    header = next(reader)

    row_format = '''
    {{
      latitude: {},
      longitude: {},
      name: '{}',
      place: '{}',
      address: '{}',
      tel: '{}'
    }}'''

    row_array = []
    for row in reader:
        row_array.append(
            row_format.format(row[1], row[2], row[9], row[10], row[12],
                              row[13]))

    print(','.join(row_array))

print('  ];')
print('})(this);')
