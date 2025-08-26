import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../../../app/providers/AuthProvider';
import { useObtenidosVM } from '../../../viewmodels/ObtenidosViewModel';
import { articuloListStyles as card } from '../../../components/ArticuloList/styles/ArticuloList.styles';
import ArticuloThumb from '../../../components/ArticuloList/components/ArticuloThumb';
import { obtenidosStyles as styles } from './styles/Obtenidos.styles';

export default function ObtenidosScreen() {
  const { user } = useAuth();
  const uid = user?.id;

  const { items, loading, error, reload, periodText, statusOf } = useObtenidosVM(uid);
  const nav = useNavigation<any>();

  if (loading && items.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[card.center, { flex:1 }]}><ActivityIndicator /></View>
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[card.center, { flex:1 }]}><Text style={card.error}>{error}</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <FlatList
          data={items}
          keyExtractor={(it) => `${it.alquiler.idAlquiler}::${it.articulo.id}`}
          contentContainerStyle={card.content}
          onRefresh={reload}
          refreshing={loading}
          renderItem={({ item }) => {
            const a = item.articulo;
            const alq = item.alquiler;

            const st = statusOf(alq.fechaDesde, alq.fechaHasta);
            const chipCfg =
              st === 'active'
                ? { label: 'En alquiler', bg: '#f97316' }     
                : st === 'future'
                ? { label: 'Reservado',   bg: '#3b82f6' }     
                : { label: 'Finalizado',  bg: '#94a3b8' };    

            return (
              <TouchableOpacity
                style={card.row}
                activeOpacity={0.9}
                onPress={() => nav.navigate('ArticuloDetail', { articulo: a })}
              >
                <View style={card.rowTop}>
                  <ArticuloThumb articulo={a} size={64} />
                  <View style={card.rowBody}>
                    <Text style={card.rowTitle}>{a.nombre}</Text>
                    <Text style={card.rowSub}>{a.marca ?? 'Sin marca'}</Text>
                    <Text style={card.rowSub}>
                      {(a.precioPorHora ?? '-') + '€/h · ' + (a.precioPorDia ?? '-') + '€/día · ' + (a.precioPorSemana ?? '-') + '€/sem'}
                    </Text>
                  </View>
                </View>

                <View style={{ marginTop: 10 }}>
                  <View style={[styles.chip, { backgroundColor: chipCfg.bg }]}>
                    <Text style={styles.chipTxt}>{chipCfg.label}</Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaTxt}>{periodText(alq.fechaDesde, alq.fechaHasta)}</Text>
                    <Text style={styles.metaTxt}>Importe: {alq.importe?.toFixed(2) ?? '—'}€</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={card.empty}>
              <Text style={card.emptyText}>Aún no has alquilado artículos</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}