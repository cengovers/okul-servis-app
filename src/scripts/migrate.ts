import { runMigrations } from '../lib/db/migrations';

// IIFE (Immediately Invoked Function Expression) kullanarak asenkron çalıştır
(async () => {
  try {
    console.log('Veritabanı migration başlatılıyor...');
    const result = await runMigrations();
    
    if (result.success) {
      console.log('Migration başarıyla tamamlandı.');
    } else {
      console.error('Migration hatası:', result.error);
    }
  } catch (error) {
    console.error('Migration işlemi sırasında beklenmeyen bir hata oluştu:', error);
  } finally {
    process.exit();
  }
})();