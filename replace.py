import re

def main():
    with open('PROJECT DIGITALISASI WASKITA.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Branding changes
    content = content.replace('Waskita Digital Balance', 'Waskita Digital Simfoni')
    content = content.replace('Refresh. Refocus. Deliver.', 'Menyegarkan. Memfokuskan. Menyalurkan.')
    content = content.replace('Quality Safety Health Environment', 'Manajemen Mutu dan K3L')
    content = content.replace('QSHE', 'Manajemen Mutu dan K3L')
    content = content.replace('digital-balance', 'digital-simfoni')

    # General replacements
    reps = {
        'Smart Timer System': 'Sistem Timer Pintar',
        '20-20-20 Corporate Rule': 'Aturan Korporat 20-20-20',
        'Smart Timer': 'Timer Pintar',
        'Dashboard': 'Dasbor',
        'Quick Access': 'Akses Cepat',
        'Daily Activity': 'Aktivitas Harian',
        'Weekly Summary': 'Ringkasan Mingguan',
        'Progress Tracking': 'Pemantauan Kepatuhan',
        'Behavior Insight': 'Insight Perilaku Kerja',
        'Safety &amp; Health Guide': 'Panduan K3L',
        'Safety & Health Guide': 'Panduan K3L',
        'Corporate Information': 'Informasi Perusahaan',
        'Voice Assistant': 'Asisten Suara',
        'Soft Glass Tone (Recommended)': 'Nada Kaca Lembut (Disarankan)',
        'Corporate Bell': 'Bel Korporat',
        'Office Chime': 'Lonceng Kantor',
        'Calm Piano': 'Piano Tenang',
        'Premium Ding': 'Denting Premium',
        'Digital Ping': 'Ping Digital',
        'Durasi Bunyi': 'Durasi Alarm',
        'Break Berhasil': 'Istirahat Berhasil',
        'Self-Assessment Kelelahan Kerja': 'Penilaian Mandiri Kelelahan Kerja',
        'Fatigue Management': 'Manajemen Kelelahan',
        'Assessment Terakhir': 'Penilaian Terakhir',
        'Hasil Assessment': 'Hasil Penilaian',
        'Fatigue Level': 'Tingkat Kelelahan',
        'Fatigue': 'Kelelahan',
        'Stretching': 'Peregangan',
        '1-Minute Office Stretch': 'Peregangan Kantor 1 Menit',
        'Reset': 'Atur Ulang',
        '>Mulai<': '>Mulai Timer<',
        'btn-red" onclick="toggleTimer()">Mulai<': 'btn-red" onclick="toggleTimer()">Mulai Timer<',
        'Sedang Bekerja': 'Sedang Bekerja',
        'Istirahat': 'Istirahat'
    }

    for k, v in reps.items():
        content = content.replace(k, v)

    with open('PROJECT DIGITALISASI WASKITA.html', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    main()
