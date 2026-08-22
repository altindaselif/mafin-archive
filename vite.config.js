import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  /*
   * Dosya izleme Vite'ın varsayılanına (işletim sisteminin kendi bildirimleri)
   * bırakıldı. Eskiden `usePolling: true` ile 300 ms'de bir tüm dosya sistemi
   * taranıyordu — bağlı bir klasörden düzenleme yapılıyorsa gerekli, ama
   * yerelde düzenlerken sadece boşuna CPU yakıyor.
   *
   * Kaydettiğin değişiklikler tarayıcıya yansımazsa (ağ sürücüsü, Docker,
   * sanal makine) `server: { watch: { usePolling: true, interval: 300 } }`
   * satırını geri ekle.
   */
});
