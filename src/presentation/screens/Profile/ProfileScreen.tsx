import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { profileStyles as styles } from './styles/Profile.styles';
import { useProfileVM } from '../../viewmodels/ProfileViewModel';

export default function ProfileScreen() {
  const {
    userName,
    goMisProductos,
    goObtenidos,
    goFavoritos,
    confirmSignOut,
  } = useProfileVM();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <Ionicons name="person-outline" size={48} color="#0F172A" />
            <View style={styles.avatarBadge}>
              <Ionicons name="add-outline" size={16} color="#fff" />
            </View>
          </View>
          <Text style={styles.userName}>{userName}</Text>
        </View>

        {/* Tarjetas */}
        <View style={styles.cards}>
          <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={goMisProductos}>
            <Text style={styles.cardTitle}>Tus Productos</Text>
            <View style={styles.cardIcon}>
              <Ionicons name="basket-outline" size={22} color="#0F172A" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={goObtenidos}>
            <Text style={styles.cardTitle}>Productos Obtenidos</Text>
            <View style={styles.cardIcon}>
              <Ionicons name="cart-outline" size={22} color="#0F172A" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={goFavoritos}>
            <Text style={styles.cardTitle}>Tus favoritos</Text>
            <View style={[styles.cardIcon, styles.heartBg]}>
              <Ionicons name="heart" size={20} color="#fff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.logoutCard]}
            activeOpacity={0.9}
            onPress={confirmSignOut}
          >
            <Text style={[styles.cardTitle, styles.logoutText]}>Cerrar sesión</Text>
            <View style={[styles.cardIcon, styles.logoutIconBg]}>
              <Ionicons name="exit-outline" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}