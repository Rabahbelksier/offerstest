import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Toast } from "@/components/Toast";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import {
  type OfferType,
  OFFER_TYPE_OPTIONS,
  HIDE_SELLER_COUPON,
  SHOW_PRICE3PCS,
  normalizeOfferType,
  getOfferTypeLabel,
} from "@/lib/offer-types";

import { SHIPPING_COUNTRY_CODES_LOWER } from "@/constants/countries";
const COUNTRIES = SHIPPING_COUNTRY_CODES_LOWER;

type RouteParams = {
  AdminEditOffre: {
    id: number;
    title: string;
    price: string;
    sellerCoupon: string;
    productUrl: string;
    info: string;
    country: string;
    currentPrice?: string;
    imageUrl?: string;
    offerType?: string;
    offer_type?: string;
    price3pcs?: string;
  };
};

export default function AdminEditOffreScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, "AdminEditOffre">>();
  const params = route.params;
  const isRTL = language === "ar";

  const [title, setTitle] = useState(params.title || "");
  const [price, setPrice] = useState(params.price || "");
  const [currentPrice, setCurrentPrice] = useState(params.currentPrice || "");
  const [sellerCoupon, setSellerCoupon] = useState(params.sellerCoupon || "");
  const [productUrl, setProductUrl] = useState(params.productUrl || "");
  const [info, setInfo] = useState(params.info || "");
  const [imageUrl, setImageUrl] = useState(params.imageUrl || "");
  const [country, setCountry] = useState((params.country || "dz").toLowerCase());
  const [offerType, setOfferType] = useState<OfferType>(
    normalizeOfferType(params.offerType ?? params.offer_type),
  );
  const [price3pcs, setPrice3pcs] = useState(params.price3pcs || "");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const showToast = (message: string, type: "success" | "error" = "success") =>
    setToast({ visible: true, message, type });

  const hideSellerCoupon = HIDE_SELLER_COUPON.includes(offerType);
  const showPrice3pcsField = SHOW_PRICE3PCS.includes(offerType);

  const selectedTypeLabel = getOfferTypeLabel(offerType);

  const handleApply = async () => {
    setIsSubmitting(true);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(new URL(`/api/admin/offres/${params.id}`, apiUrl).href, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          price,
          sellerCoupon: hideSellerCoupon ? "" : sellerCoupon,
          productUrl,
          info,
          country,
          currentPrice,
          imageUrl,
          offerType,
          offer_type: offerType,
          price3pcs: showPrice3pcsField ? price3pcs : "",
        }),
      });
      if (!res.ok) throw new Error();
      showToast(t("changes_saved"));
      setTimeout(() => navigation.goBack(), 1200);
    } catch {
      showToast(t("error"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(p => ({ ...p, visible: false }))}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.md,
            paddingBottom: insets.bottom + (Platform.OS === "android" ? 340 : 100),
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Country selector */}
          <View style={styles.fieldContainer}>
            <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
              {t("country_code")}
            </ThemedText>
            <Pressable
              style={[styles.pickerBtn, { backgroundColor: AppColors.primary }]}
              onPress={() => setShowCountryPicker(true)}
            >
              <ThemedText type="body" style={{ color: "#fff", fontWeight: "700" }}>
                {country.toUpperCase()}
              </ThemedText>
              <Feather name="chevron-down" size={16} color="#fff" />
            </Pressable>
          </View>

          {/* Offer type selector */}
          <View style={styles.fieldContainer}>
            <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
              نوع العرض
            </ThemedText>
            <Pressable
              style={[styles.pickerBtn, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, borderWidth: 1 }]}
              onPress={() => setShowTypePicker(true)}
            >
              <ThemedText type="body" style={{ color: theme.text, fontWeight: "600" }}>
                {selectedTypeLabel}
              </ThemedText>
              <Feather name="chevron-down" size={16} color={theme.textSecondary} />
            </Pressable>
          </View>

          {/* Static text fields */}
          {[
            { label: "Title", value: title, onChange: setTitle, placeholder: "Product title..." },
            { label: "Price (final/trending)", value: price, onChange: setPrice, placeholder: "12.99$" },
            { label: "Current Price (for coupon matching)", value: currentPrice, onChange: setCurrentPrice, placeholder: "15.00$" },
          ].map(({ label, value, onChange, placeholder }) => (
            <View key={label} style={styles.fieldContainer}>
              <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
                {label}
              </ThemedText>
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor={theme.textSecondary}
                textAlign={isRTL ? "right" : "left"}
                textAlignVertical="center"
              />
            </View>
          ))}

          {/* Seller coupon — hidden for super/bigsave/bundle */}
          {!hideSellerCoupon && (
            <View style={styles.fieldContainer}>
              <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
                Seller Coupon
              </ThemedText>
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
                value={sellerCoupon}
                onChangeText={setSellerCoupon}
                placeholder="2.00$"
                placeholderTextColor={theme.textSecondary}
                textAlign={isRTL ? "right" : "left"}
                textAlignVertical="center"
              />
            </View>
          )}

          {/* Price 3 pcs — only for bundle */}
          {showPrice3pcsField && (
            <View style={styles.fieldContainer}>
              <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
                سعر 3 قطع (Bundle)
              </ThemedText>
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
                value={price3pcs}
                onChangeText={setPrice3pcs}
                placeholder="e.g. 29.99$"
                placeholderTextColor={theme.textSecondary}
                textAlign={isRTL ? "right" : "left"}
                textAlignVertical="center"
              />
            </View>
          )}

          {/* Remaining fields */}
          {[
            { label: "Product URL", value: productUrl, onChange: setProductUrl, placeholder: "https://...", multiline: false },
            { label: "Image URL (optional)", value: imageUrl, onChange: setImageUrl, placeholder: "https://...", multiline: false },
            { label: "Info", value: info, onChange: setInfo, placeholder: "Additional info...", multiline: true },
          ].map(({ label, value, onChange, placeholder, multiline }) => (
            <View key={label} style={styles.fieldContainer}>
              <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
                {label}
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
                  multiline && { minHeight: 80 },
                ]}
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor={theme.textSecondary}
                multiline={multiline}
                numberOfLines={multiline ? 3 : 1}
                textAlign={isRTL ? "right" : "left"}
                textAlignVertical={multiline ? "top" : "center"}
              />
            </View>
          ))}
        </ScrollView>

        <View style={[styles.bottomBtns, { paddingBottom: insets.bottom + Spacing.md, backgroundColor: theme.backgroundRoot }]}>
          <Pressable
            style={[styles.btn, { backgroundColor: AppColors.primary, opacity: isSubmitting ? 0.7 : 1 }]}
            onPress={handleApply}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? <ActivityIndicator size="small" color="#fff" />
              : <Feather name="check" size={18} color="#fff" />
            }
            <ThemedText type="body" style={{ color: "#fff", fontWeight: "700" }}>
              {t("apply_changes")}
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Country picker */}
      <Modal visible={showCountryPicker} transparent animationType="fade" onRequestClose={() => setShowCountryPicker(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowCountryPicker(false)}>
          <View style={[styles.pickerCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <ThemedText type="h4" style={{ padding: Spacing.md, textAlign: "center" }}>
              {t("select_country")}
            </ThemedText>
            <ScrollView style={{ maxHeight: 400 }}>
              {COUNTRIES.map((cc) => (
                <Pressable
                  key={cc}
                  style={[
                    styles.pickerItem,
                    { borderColor: theme.border },
                    country === cc && { backgroundColor: `${AppColors.primary}15` },
                  ]}
                  onPress={() => { setCountry(cc); setShowCountryPicker(false); }}
                >
                  <ThemedText
                    type="body"
                    style={{ color: country === cc ? AppColors.primary : theme.text, fontWeight: country === cc ? "700" : "400" }}
                  >
                    {cc.toUpperCase()}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Offer type picker */}
      <Modal visible={showTypePicker} transparent animationType="fade" onRequestClose={() => setShowTypePicker(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowTypePicker(false)}>
          <View style={[styles.pickerCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <ThemedText type="h4" style={{ padding: Spacing.md, textAlign: "center" }}>
              اختر نوع العرض
            </ThemedText>
            {OFFER_TYPE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[
                  styles.pickerItem,
                  { borderColor: theme.border },
                  offerType === opt.value && { backgroundColor: `${AppColors.primary}15` },
                ]}
                onPress={() => { setOfferType(opt.value); setShowTypePicker(false); }}
              >
                <ThemedText
                  type="body"
                  style={{
                    color: offerType === opt.value ? AppColors.primary : theme.text,
                    fontWeight: offerType === opt.value ? "700" : "400",
                  }}
                >
                  {opt.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fieldContainer: { marginBottom: Spacing.md },
  label: { marginBottom: Spacing.xs, fontSize: 12 },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 15,
  },
  pickerBtn: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    justifyContent: "space-between",
  },
  bottomBtns: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  pickerCard: {
    width: "100%",
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  pickerItem: {
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
  },
});
