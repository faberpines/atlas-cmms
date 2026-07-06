import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  Dialog,
  FAB,
  IconButton,
  Menu,
  Portal,
  Searchbar,
  Text,
  useTheme
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from '../../store';
import { deleteInspectionById, getInspections, getTemplates } from '../../slices/inspection';
import { Inspection, InspectionStatus } from '../../models/inspection';
import { RootStackScreenProps } from '../../types';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import useAuth from '../../hooks/useAuth';
import { formatDistance } from 'date-fns';

const statusColors: Record<InspectionStatus, string> = {
  PENDING: '#FFA319',
  IN_PROGRESS: '#52b788',
  COMPLETED: '#57CA22',
  FAILED: '#FF1943'
};

export default function InspectionsScreen({
  navigation
}: RootStackScreenProps<'Inspections'>) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { inspections, templates, loadingGet } = useSelector((s) => s.inspections);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const load = () => {
    dispatch(getInspections());
    dispatch(getTemplates());
  };

  useEffect(() => { load(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([dispatch(getInspections()), dispatch(getTemplates())]).finally(() =>
      setRefreshing(false)
    );
  };

  const filtered = inspections.filter((i) =>
    i.template?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.asset?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteTarget) {
      dispatch(deleteInspectionById(deleteTarget))
        .then(() => showSnackBar(t('inspection_deleted'), 'success'))
        .catch(() => showSnackBar(t('error_delete'), 'error'));
      setDeleteTarget(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Searchbar
        placeholder={t('search')}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{ margin: 8 }}
      />
      {loadingGet && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filtered.length === 0 && (
            <Text style={{ textAlign: 'center', marginTop: 40, opacity: 0.5 }}>
              {t('no_inspections')}
            </Text>
          )}
          {filtered.map((item) => (
            <Card
              key={item.id}
              style={{ margin: 8 }}
              onPress={() => navigation.navigate('InspectionDetails', { id: item.id, inspectionProp: item })}
            >
              <Card.Title
                title={item.template?.name ?? t('inspection')}
                subtitle={item.asset?.name ?? ''}
                left={(props) => (
                  <Avatar.Icon
                    {...props}
                    icon="clipboard-check-outline"
                    style={{ backgroundColor: theme.colors.primaryContainer }}
                  />
                )}
                right={(props) => (
                  <Menu
                    visible={menuVisible === item.id}
                    onDismiss={() => setMenuVisible(null)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        onPress={() => setMenuVisible(item.id)}
                      />
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        setMenuVisible(null);
                        navigation.navigate('InspectionDetails', { id: item.id, inspectionProp: item });
                      }}
                      title={t('view')}
                      leadingIcon="eye"
                    />
                    <Menu.Item
                      onPress={() => { setMenuVisible(null); setDeleteTarget(item.id); }}
                      title={t('to_delete')}
                      leadingIcon="trash-can"
                    />
                  </Menu>
                )}
              />
              <Card.Content>
                <Chip
                  style={{ alignSelf: 'flex-start', backgroundColor: statusColors[item.status] + '33' }}
                  textStyle={{ color: statusColors[item.status] }}
                >
                  {t(item.status)}
                </Chip>
                {item.dueDate && (
                  <Text variant="bodySmall" style={{ marginTop: 4, opacity: 0.6 }}>
                    {t('due')}: {new Date(item.dueDate).toLocaleDateString()}
                  </Text>
                )}
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => navigation.navigate('CreateInspection')}
      />

      <Portal>
        <Dialog visible={!!deleteTarget} onDismiss={() => setDeleteTarget(null)}>
          <Dialog.Title>{t('confirmation')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('confirm_delete_inspection')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteTarget(null)}>{t('cancel')}</Button>
            <Button onPress={handleDelete}>{t('to_delete')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: { position: 'absolute', right: 16, bottom: 16 }
});
