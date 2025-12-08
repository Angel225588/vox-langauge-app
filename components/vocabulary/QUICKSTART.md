# Quick Start Guide - AddWordModal

## 1-Minute Integration

### Step 1: Import
```tsx
import { useState } from 'react';
import { AddWordModal } from '@/components/vocabulary';
```

### Step 2: Add State
```tsx
const [modalVisible, setModalVisible] = useState(false);
```

### Step 3: Add Button
```tsx
<Button onPress={() => setModalVisible(true)}>
  Add Word
</Button>
```

### Step 4: Add Modal
```tsx
<AddWordModal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  onWordAdded={(word) => console.log('Added:', word)}
/>
```

## Complete Example (Copy & Paste)

```tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AddWordModal } from '@/components/vocabulary';
import { colors, spacing, borderRadius } from '@/constants/designSystem';

export function MyVocabularyScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Vocabulary</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add New Word</Text>
      </TouchableOpacity>

      <AddWordModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onWordAdded={(word) => {
          console.log('New word added:', word);
          // Refresh your word list here
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: colors.background.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  addButton: {
    backgroundColor: colors.primary.DEFAULT,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

## That's It!

Your modal is now fully functional with:
- ✅ Validation
- ✅ Animations
- ✅ Haptic feedback
- ✅ Auto-save to word bank
- ✅ Error handling

## Next Steps

1. **Refresh word list** after adding:
   ```tsx
   const { refresh } = useWordBank();

   onWordAdded={(word) => {
     refresh(); // Refresh your list
   }}
   ```

2. **Customize categories**:
   - Add autocomplete for categories
   - Pre-fill category from current context

3. **Add FAB (Floating Action Button)**:
   ```tsx
   <TouchableOpacity style={styles.fab} onPress={...}>
     <Text>+</Text>
   </TouchableOpacity>
   ```

## Troubleshooting

### Modal doesn't appear
- Check `visible` prop is `true`
- Ensure modal is rendered in component tree

### Form doesn't submit
- Check console for errors
- Verify word-bank is initialized
- Check database permissions

### No haptic feedback
- Ensure `expo-haptics` is installed
- Test on physical device (simulators may not vibrate)

## More Examples

See `EXAMPLE_USAGE.tsx` for:
- Floating Action Button implementation
- Integration with word list
- Standalone form usage

## Documentation

- `README.md` - Full documentation
- `VISUAL_REFERENCE.md` - Visual design guide
- `IMPLEMENTATION_SUMMARY.md` - Technical details
