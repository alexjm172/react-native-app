import React, { useMemo, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Calendar } from 'react-native-calendars';
import { Estado } from '../../../domain/entities/enums/Estado';
import { COLORS } from '../../../app/theme/colors';

export type HomeFilters = {
  marca: string;
  estado?: Estado;
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
};

type Props = {
  visible: boolean;
  onClose: () => void;
  value: HomeFilters;
  onChange: (f: HomeFilters) => void;
};

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const P = COLORS.pantone;

export default function HomeFilterSheet({ visible, onClose, value, onChange }: Props) {
  const [showCal, setShowCal] = useState<'desde'|'hasta'|null>(null);

  const estados: { label: string; val: Estado }[] = useMemo(() => ([
    { label: 'Nuevo',     val: Estado.NUEVO },
    { label: 'Usado',     val: Estado.USADO },
    { label: 'Muy usado', val: Estado.MUY_USADO },
  ]), []);

  const activeChips: { key: keyof HomeFilters; label: string }[] = useMemo(() => {
    const chips: { key: keyof HomeFilters; label: string }[] = [];
    if (value.marca?.trim())  chips.push({ key: 'marca', label: `Marca: ${value.marca.trim()}` });
    if (value.estado)         chips.push({ key: 'estado', label: `Estado: ${value.estado}` });
    if (value.desde && value.hasta) chips.push({ key: 'desde', label: `Rango: ${value.desde} → ${value.hasta}` });
    return chips;
  }, [value]);

  const removeFilter = (key: keyof HomeFilters) => {
    if (key === 'desde') onChange({ ...value, desde: undefined, hasta: undefined });
    else onChange({ ...value, [key]: key === 'estado' ? undefined : '' } as any);
  };

  // Rango marcado usando SIEMPRE el pantone
  const marked = useMemo(() => {
    const m: Record<string, any> = {};
    if (value.desde && value.hasta) {
      const days: string[] = [];
      let a = new Date(value.desde), b = new Date(value.hasta);
      if (a > b) [a, b] = [b, a];
      for (let i = new Date(a); i <= b; i.setDate(i.getDate()+1)) {
        days.push(toStr(i));
      }
      days.forEach((d, i) => {
        m[d] = {
          startingDay: i === 0,
          endingDay: i === days.length - 1,
          color: P,
          textColor: '#fff',
        };
      });
    } else if (value.desde) {
      m[value.desde] = { startingDay: true, endingDay: true, color: P, textColor: '#fff' };
    }
    return m;
  }, [value.desde, value.hasta]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.35)', justifyContent:'flex-end' }}>
        <View style={{
          backgroundColor:'#fff',
          borderTopLeftRadius:16,
          borderTopRightRadius:16,
          paddingTop:12, paddingBottom:20, paddingHorizontal:16,
          maxHeight: '90%',
        }}>
          {/* Header */}
          <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <Text style={{ fontSize:16, fontWeight:'700', color:'#111827' }}>Filtros</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top:10, bottom:10, left:10, right:10 }}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Chips activos */}
          {activeChips.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:12 }}>
              {activeChips.map(ch => (
                <View key={ch.key} style={{
                  flexDirection:'row', alignItems:'center',
                  backgroundColor:'#eef2ff', borderRadius:9999, paddingHorizontal:10, paddingVertical:6,
                  marginRight:8, borderWidth:1, borderColor:P,
                }}>
                  <Text style={{ color:'#1f2937', fontWeight:'600' }}>{ch.label}</Text>
                  <TouchableOpacity onPress={() => removeFilter(ch.key)} style={{
                    marginLeft:8, width:20, height:20, borderRadius:10, backgroundColor:P,
                    alignItems:'center', justifyContent:'center'
                  }}>
                    <Ionicons name="close" size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Marca */}
          <Text style={{ fontSize:12, color:'#6b7280', marginBottom:6 }}>Marca</Text>
          <TextInput
            style={{
              borderWidth:1, borderColor:'#e5e7eb', borderRadius:10, paddingHorizontal:12, height:42, marginBottom:16,
            }}
            placeholder="Ej: Bosch"
            value={value.marca}
            onChangeText={(t) => onChange({ ...value, marca: t })}
          />

          {/* Estado */}
          <Text style={{ fontSize:12, color:'#6b7280', marginBottom:6 }}>Estado</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', marginBottom:16 }}>
            {estados.map(opt => {
              const selected = value.estado === opt.val;
              return (
                <TouchableOpacity
                  key={opt.val}
                  onPress={() => onChange({ ...value, estado: selected ? undefined : opt.val })}
                  style={{
                    backgroundColor: selected ? P : '#ffffff',
                    borderWidth: 1,
                    borderColor: P,
                    paddingHorizontal:12, paddingVertical:8, borderRadius:9999, marginRight:8, marginBottom:8,
                  }}
                >
                  <Text style={{ color: selected ? '#fff' : P, fontWeight:'700' }}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Rango de fechas */}
          <Text style={{ fontSize:12, color:'#6b7280', marginBottom:6 }}>Periodo disponible</Text>
          <View style={{ flexDirection:'row', alignItems:'center', marginBottom:6 }}>
            <TouchableOpacity
              onPress={() => setShowCal('desde')}
              style={{
                flex:1, height:42, borderWidth:1, borderColor:'#e5e7eb', borderRadius:10, paddingHorizontal:12,
                alignItems:'center', flexDirection:'row', justifyContent:'space-between', marginRight:8
              }}
            >
              <Text style={{ color:'#111827' }}>{value.desde ?? 'Desde (YYYY-MM-DD)'}</Text>
              <Ionicons name="calendar-outline" size={18} color={P} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowCal('hasta')}
              style={{
                flex:1, height:42, borderWidth:1, borderColor:'#e5e7eb', borderRadius:10, paddingHorizontal:12,
                alignItems:'center', flexDirection:'row', justifyContent:'space-between',
              }}
            >
              <Text style={{ color:'#111827' }}>{value.hasta ?? 'Hasta (YYYY-MM-DD)'}</Text>
              <Ionicons name="calendar-outline" size={18} color={P} />
            </TouchableOpacity>
          </View>

          {(value.desde || value.hasta) && (
            <View style={{ flexDirection:'row', alignItems:'center', marginBottom:10 }}>
              <TouchableOpacity
                onPress={() => onChange({ ...value, desde: undefined, hasta: undefined })}
                style={{ paddingHorizontal:12, paddingVertical:10, backgroundColor:'#fff', borderRadius:8, borderWidth:1, borderColor:P }}
              >
                <Text style={{ color:P, fontWeight:'700' }}>Limpiar periodo</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Calendario modal */}
          <Modal visible={!!showCal} transparent animationType="fade" onRequestClose={() => setShowCal(null)}>
            <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.35)', alignItems:'center', justifyContent:'center' }}>
              <View style={{ width:'92%', backgroundColor:'#fff', borderRadius:12, overflow:'hidden' }}>
                <View style={{ padding:12, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                  <Text style={{ fontWeight:'700', color:'#111827' }}>
                    {showCal === 'desde' ? 'Selecciona fecha de inicio' : 'Selecciona fecha de fin'}
                  </Text>
                  <TouchableOpacity onPress={() => setShowCal(null)}>
                    <Ionicons name="close" size={22} color="#111827" />
                  </TouchableOpacity>
                </View>
                <Calendar
                  initialDate={(showCal === 'desde' ? value.desde : value.hasta) ?? toStr(new Date())}
                  markingType="period"
                  markedDates={marked}
                  theme={{
                    arrowColor: P,
                    todayTextColor: P,
                    monthTextColor: '#111827',
                    textDayFontWeight: '600',
                    textMonthFontWeight: '700',
                  }}
                  minDate={toStr(new Date())}
                  onDayPress={(d) => {
                    if (showCal === 'desde') {
                      onChange({ ...value, desde: d.dateString, hasta: undefined });
                    } else {
                      if (!value.desde) {
                        onChange({ ...value, desde: d.dateString, hasta: undefined });
                      } else {
                        let a = value.desde;
                        let b = d.dateString;
                        if (new Date(b) < new Date(a)) [a, b] = [b, a];
                        onChange({ ...value, desde: a, hasta: b });
                      }
                    }
                    setShowCal(null);
                  }}
                />
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
}