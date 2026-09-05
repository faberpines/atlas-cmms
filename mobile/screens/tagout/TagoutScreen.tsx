/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app */
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Card, FAB, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import LotoRecord from '../../models/loto';
import useAuth from '../../hooks/useAuth';
import { PermissionEntity } from '../../models/role';
import { useAppTheme } from '../../custom-theme';

export default function TagoutScreen({ navigation }: any) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { hasCreatePermission } = useAuth();
  const [records, setRecords] = useState<LotoRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRecords(await api.get<LotoRecord[]>('loto'));
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => void load(), [load]));

  const release = async (id: number) => {
    await api.post(`loto/${id}/release`, {});
    await load();
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.notice, { backgroundColor: theme.colors.chassis }]}>
        <Text variant="titleMedium" style={{ color: theme.colors.paper, fontWeight: '700' }}>{t('tagout_safety_title')}</Text>
        <Text style={{ color: theme.colors.outlineVariant }}>{t('tagout_safety_note')}</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        {records.map((record) => (
          <Card key={record.id} style={[styles.card, { backgroundColor: theme.colors.paper, borderColor: record.status === 'ACTIVE' ? theme.colors.seasonal : theme.colors.rule }]}>
            <Card.Content style={{ gap: 6 }}>
              <View style={styles.cardTop}>
                <Text variant="titleMedium" style={styles.title}>{record.title}</Text>
                <Text variant="labelMedium" style={{ color: record.status === 'ACTIVE' ? theme.colors.error : theme.colors.onSurfaceVariant }}>{t(record.status)}</Text>
              </View>
              <Text>{t('isolation_point')}: {record.isolationPoint}</Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>{t(record.energyType)}</Text>
              {!!record.asset && <Text>{t('asset')}: {record.asset.name}</Text>}
              {!!record.reason && <Text>{record.reason}</Text>}
            </Card.Content>
            {record.status === 'ACTIVE' && (
              <Card.Actions><Button icon="lock-open-outline" onPress={() => void release(record.id)}>{t('release_tagout')}</Button></Card.Actions>
            )}
          </Card>
        ))}
        {!loading && !records.length && (
          <View style={[styles.empty, { backgroundColor: theme.colors.paper }]}>
            <Text variant="titleMedium">{t('no_tagouts')}</Text>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>{t('no_tagouts_hint')}</Text>
          </View>
        )}
      </ScrollView>
      {hasCreatePermission(PermissionEntity.LOTO) && (
        <FAB icon="lock-plus" label={t('add_tagout')} style={[styles.fab, { backgroundColor: theme.colors.primary }]} color={theme.colors.paper} onPress={() => navigation.navigate('AddTagout')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 8 },
  notice: { borderRadius: 12, padding: 16, gap: 4 },
  content: { gap: 10, paddingTop: 10, paddingBottom: 112 },
  card: { borderWidth: 1, borderRadius: 12, elevation: 0 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, fontWeight: '700' },
  empty: { padding: 24, borderRadius: 12, gap: 6 },
  fab: { position: 'absolute', right: 18, bottom: 96, borderRadius: 8 }
});
