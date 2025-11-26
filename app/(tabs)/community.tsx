import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function CommunityScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
        Community
      </Text>
      <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 32, textAlign: 'center' }}>
        Phase 7: To be implemented
      </Text>

      <Link href="/design-showcase" asChild>
        <TouchableOpacity
          style={{
            backgroundColor: '#6366F1',
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
            View Design Showcase
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
