import * as React from 'react';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { List, Searchbar, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from '../../store';
import { getTemplates } from '../../slices/inspection';
import { InspectionTemplate } from '../../models/inspection';
import { RootStackScreenProps } from '../../types';

export default function SelectInspectionTemplateModal({
  navigation,
  route
}: RootStackScreenProps<'SelectInspectionTemplate'>) {
  const { onChange } = route.params;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { templates } = useSelector((s) => s.inspections);
  const [search, setSearch] = useState('');

  useEffect(() => { dispatch(getTemplates()); }, []);

  const filtered = templates.filter((tpl) =>
    tpl.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (tpl: InspectionTemplate) => {
    onChange(tpl);
    navigation.goBack();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Searchbar
        placeholder={t('search')}
        value={search}
        onChangeText={setSearch}
        style={{ margin: 8 }}
      />
      {filtered.map((tpl) => (
        <List.Item
          key={tpl.id}
          title={tpl.name}
          description={tpl.category ?? tpl.description}
          left={(p) => <List.Icon {...p} icon="clipboard-list-outline" />}
          onPress={() => handleSelect(tpl)}
        />
      ))}
    </ScrollView>
  );
}
