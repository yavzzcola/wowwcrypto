-- Sayaç sistemi için tablo güncellemeleri
-- Bu dosyayı mevcut veritabanınıza çalıştırın

USE crypto_platform2;

-- Counter settings table for presale countdown
CREATE TABLE IF NOT EXISTS counter_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stage_name VARCHAR(100) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_is_active (is_active),
    INDEX idx_end_date (end_date)
);

-- Insert default counter settings (eğer tablo boşsa)
INSERT IGNORE INTO counter_settings (stage_name, start_date, end_date, is_active) VALUES
('ICO Presale Phase 1', '2024-12-01 00:00:00', '2025-01-15 23:59:59', TRUE);

-- Mevcut aktif sayaçları kontrol et
SELECT 'Current Active Counters:' as info;
SELECT id, stage_name, start_date, end_date, is_active, created_at 
FROM counter_settings 
WHERE is_active = 1 
ORDER BY created_at DESC;

-- Sayaç durumu özeti
SELECT 
    COUNT(*) as total_counters,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_counters,
    SUM(CASE WHEN end_date > NOW() AND is_active = 1 THEN 1 ELSE 0 END) as future_counters,
    SUM(CASE WHEN end_date <= NOW() AND is_active = 1 THEN 1 ELSE 0 END) as expired_counters
FROM counter_settings;

-- Sayaç sistemi başarıyla kuruldu mesajı
SELECT 'Counter system successfully installed!' as status;