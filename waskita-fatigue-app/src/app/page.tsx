'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Button, 
  Card, 
  Tabs, 
  Statistic, 
  Row, 
  Col, 
  Progress,
  Tooltip,
  notification
} from 'antd';
import { 
  ClockCircleOutlined, 
  DashboardOutlined, 
  InfoCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SyncOutlined,
  SoundOutlined,
  BookOutlined,
  DesktopOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

// Mock chart data for weekly wellness stats
const weeklyStats = [
  { day: 'Sen', sessions: 8 },
  { day: 'Sel', sessions: 12 },
  { day: 'Rab', sessions: 15 },
  { day: 'Kam', sessions: 10 },
  { day: 'Jum', sessions: 14 },
  { day: 'Sab', sessions: 5 },
  { day: 'Min', sessions: 6 }
];

export default function Home() {
  // Live Clock State
  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setTimeStr(date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer State (20 Minutes Work = 1200 seconds)
  const [timerSeconds, setTimerSeconds] = useState(1200);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound Synth Helper
  const playChime = (type: 'work' | 'break') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(type === 'break' ? 523.25 : 880, ctx.currentTime); // C5 or A5
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio Context block', e);
    }
  };

  // Timer Engine
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            if (timerMode === 'work') {
              playChime('break');
              notification.info({
                message: 'Waktunya Istirahat Mata!',
                description: 'Lakukan aturan 20-20-20: Lihatlah sejauh 20 kaki (6 meter) selama 20 detik.',
                placement: 'topRight'
              });
              setTimerMode('break');
              return 20; // 20 seconds break
            } else {
              playChime('work');
              notification.success({
                message: 'Kembali Bekerja!',
                description: 'Fokus mata Anda telah disegarkan. Mari lanjutkan pekerjaan.',
                placement: 'topRight'
              });
              setTimerMode('work');
              return 1200; // 20 minutes work
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerMode]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerMode('work');
    setTimerSeconds(1200);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerProgress = timerMode === 'work' 
    ? ((1200 - timerSeconds) / 1200) * 100
    : ((20 - timerSeconds) / 20) * 100;

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100vh' }}>
      
      {/* HEADER SECTION */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '80px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: '20px',
              lineHeight: 1.1
            }}>
              <div><span style={{ color: '#0B1F3A' }}>WASKITA</span> <span style={{ color: '#D71920' }}>DIGITAL</span></div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#4B5563', letterSpacing: '1px' }}>BALANCE</div>
            </div>
          </div>
          
          <nav style={{ display: 'flex', gap: '30px' }}>
            <a href="#top" style={{ color: 'var(--navy)', fontWeight: 800, textDecoration: 'none', fontSize: '13px', textTransform: 'uppercase' }}>Home</a>
            <a href="#timer" style={{ color: 'var(--navy)', fontWeight: 800, textDecoration: 'none', fontSize: '13px', textTransform: 'uppercase' }}>Timer</a>
            <a href="#dashboard" style={{ color: 'var(--navy)', fontWeight: 800, textDecoration: 'none', fontSize: '13px', textTransform: 'uppercase' }}>Dashboard</a>
            <a href="#tips" style={{ color: 'var(--navy)', fontWeight: 800, textDecoration: 'none', fontSize: '13px', textTransform: 'uppercase' }}>Tips K3</a>
            <a href="#stretching" style={{ color: 'var(--navy)', fontWeight: 800, textDecoration: 'none', fontSize: '13px', textTransform: 'uppercase' }}>Stretching</a>
          </nav>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#F1F5F9',
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 800,
            color: 'var(--navy)'
          }}>
            <ClockCircleOutlined />
            <span>{timeStr}</span>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{
        background: 'linear-gradient(135deg, #0B1F3A 0%, #071426 100%)',
        color: 'white',
        padding: '140px 0 100px 0',
        position: 'relative',
        overflow: 'hidden'
      }} id="top">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '800px' }}>
            <span style={{
              background: 'rgba(215, 25, 32, 0.15)',
              border: '1px solid var(--red)',
              color: 'white',
              fontSize: '11px',
              fontWeight: 800,
              padding: '6px 16px',
              borderRadius: '50px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              display: 'inline-block',
              marginBottom: '20px'
            }}>
              Internal Corporate Health Portal
            </span>
            <h1 style={{ fontSize: '64px', fontWeight: 900, lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-2px' }}>
              Waskita Digital Balance
            </h1>
            <p style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500, marginBottom: '40px', lineHeight: 1.6 }}>
              Wujudkan produktivitas prima dan keseimbangan kesehatan dengan program 20-20-20 eye-break, peregangan terpadu, dan assessment kelelahan kerja subjektif karyawan.
            </p>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '50px' }}>
              <Button type="primary" size="large" href="#timer" style={{ height: '54px', padding: '0 30px', fontWeight: 800, borderRadius: '12px' }}>
                Mulai Timer Mata
              </Button>
              <Button size="large" ghost href="#stretching" style={{ height: '54px', padding: '0 30px', fontWeight: 800, borderRadius: '12px', borderColor: 'white', color: 'white' }}>
                Panduan Stretching
              </Button>
            </div>

            {/* Quick Access Portal */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <Button 
                onClick={() => window.location.href = '/tes-kelelahan'} 
                style={{ 
                  background: 'var(--red)', 
                  color: 'white', 
                  border: 'none', 
                  fontWeight: 800,
                  height: '46px',
                  borderRadius: '10px'
                }}
                icon={<BookOutlined />}
              >
                Tes Kelelahan (KAUPK2 Tipe I)
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* TIMER SECTION */}
      <section className="section-padding" id="timer" style={{ background: '#FFFFFF' }}>
        <div className="container">
          <div className="sec-header">
            <span class="sec-label">Ergonomic Tools</span>
            <h2 class="sec-title">20-20-20 Eye Timer</h2>
          </div>

          <div style={{
            background: '#F8FAFC',
            border: '2px solid var(--gm)',
            borderRadius: '24px',
            padding: '50px',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            <Row gutter={[40, 40]} align="middle">
              <Col xs={24} md={12} style={{ textAlign: 'center' }}>
                <div style={{ width: '220px', height: '220px', margin: '0 auto', position: 'relative' }}>
                  <Progress 
                    type="circle" 
                    percent={timerProgress} 
                    showInfo={false} 
                    strokeColor="var(--red)" 
                    trailColor="#E2E8F0"
                    strokeWidth={6}
                    width={220}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '40px', fontWeight: 900, color: 'var(--navy)', fontFamily: 'Montserrat, sans-serif' }}>
                      {formatTimer(timerSeconds)}
                    </span>
                    <span style={{ fontSize: '11px', display: 'block', textTransform: 'uppercase', fontWeight: 800, color: 'var(--tm)', marginTop: '4px' }}>
                      {timerMode === 'work' ? 'Fokus Bekerja' : 'Istirahat Mata'}
                    </span>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} md={12}>
                <h3 style={{ fontSize: '24px', color: 'var(--navy)', marginBottom: '15px' }}>Menjaga Kesehatan Mata</h3>
                <p style={{ color: 'var(--tm)', fontSize: '14px', lineHeight: 1.6, marginBottom: '25px' }}>
                  Aturan 20-20-20 didesain khusus untuk mencegah Computer Vision Syndrome (CVS). Setiap 20 menit bekerja, alihkan mata Anda untuk melihat objek berjarak minimal 20 kaki (6 meter) selama 20 detik.
                </p>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button 
                    type="primary" 
                    icon={isTimerRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />} 
                    onClick={toggleTimer}
                    size="large"
                    style={{ height: '48px', fontWeight: 800, borderRadius: '10px' }}
                  >
                    {isTimerRunning ? 'Pause' : 'Mulai'}
                  </Button>
                  <Button 
                    icon={<SyncOutlined />} 
                    onClick={resetTimer}
                    size="large"
                    style={{ height: '48px', fontWeight: 800, borderRadius: '10px' }}
                  >
                    Reset
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </section>

      {/* DASHBOARD SECTION */}
      <section className="section-padding" id="dashboard">
        <div className="container">
          <div className="sec-header">
            <span class="sec-label">Company Compliance Stats</span>
            <h2 class="sec-title">Dashboard Kesehatan</h2>
          </div>

          <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
            <Col xs={24} sm={8}>
              <Card bordered={false} style={{ borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
                <Statistic title="Rata-rata Sesi Sukses / Hari" value={11.4} precision={1} suffix="sesi" valueStyle={{ color: 'var(--navy)', fontWeight: 800 }} />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={false} style={{ borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
                <Statistic title="Total Compliance Karyawan" value={92.6} suffix="%" valueStyle={{ color: 'var(--red)', fontWeight: 800 }} />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={false} style={{ borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
                <Statistic title="Kategori Kesehatan Tim" value="OPTIMAL" valueStyle={{ color: '#10b981', fontWeight: 800 }} />
              </Card>
            </Col>
          </Row>

          <Card bordered={false} style={{ borderRadius: '20px', padding: '20px', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--navy)', marginBottom: '25px', fontWeight: 800 }}>Statistik Penyelesaian Sesi Eye-Break</h3>
            <div style={{ width: '100%', height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: 'var(--tm)', fontWeight: 'bold' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--tm)' }} />
                  <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} />
                  <Bar dataKey="sessions" radius={[6, 6, 0, 0]}>
                    {weeklyStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 2 ? 'var(--red)' : 'var(--navy)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </section>

      {/* STRETCHING SECTION */}
      <section className="section-padding" id="stretching" style={{ background: '#FFFFFF' }}>
        <div className="container">
          <div className="sec-header">
            <span class="sec-label">Daily Stretching Guide</span>
            <h2 class="sec-title">Gerakan Peregangan</h2>
          </div>

          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <Tabs defaultActiveKey="1" type="card" size="large" centered className="stretching-tabs">
              <Tabs.TabPane tab="Peregangan Leher" key="1">
                <div style={{ padding: '30px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid var(--gm)' }}>
                  <Row gutter={[30, 30]} align="middle">
                    <Col xs={24} md={12}>
                      <h3 style={{ fontSize: '20px', color: 'var(--navy)', marginBottom: '15px' }}>Peregangan Fleksi & Ekstensi Leher</h3>
                      <p style={{ color: 'var(--tm)', fontSize: '14px', lineHeight: 1.6 }}>
                        Tekuk kepala ke depan hingga dagu menyentuh dada, tahan selama 10 detik. Kemudian dongakkan kepala ke atas secara perlahan, tahan 10 detik. Lakukan gerakan ini sebanyak 3 repetisi untuk melepaskan ketegangan servikal akibat menatap layar monitor terlalu lama.
                      </p>
                    </Col>
                    <Col xs={24} md={12}>
                      <div style={{ background: '#E2E8F0', height: '220px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa-solid fa-child" style={{ fontSize: '80px', color: 'var(--navy)' }}></i>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Tabs.TabPane>

              <Tabs.TabPane tab="Peregangan Bahu" key="2">
                <div style={{ padding: '30px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid var(--gm)' }}>
                  <Row gutter={[30, 30]} align="middle">
                    <Col xs={24} md={12}>
                      <h3 style={{ fontSize: '20px', color: 'var(--navy)', marginBottom: '15px' }}>Peregangan Bahu Belakang (Shoulder Stretch)</h3>
                      <p style={{ color: 'var(--tm)', fontSize: '14px', lineHeight: 1.6 }}>
                        Silangkan salah satu tangan ke dada dan tekan sikut tangan tersebut menggunakan telapak tangan lainnya, rasakan peregangan pada bahu bagian belakang. Tahan selama 12 detik lalu gantilah sisi. Lakukan 2 repetisi per tangan untuk memobilisasi artikulasi bahu.
                      </p>
                    </Col>
                    <Col xs={24} md={12}>
                      <div style={{ background: '#E2E8F0', height: '220px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa-solid fa-child-reaching" style={{ fontSize: '80px', color: 'var(--navy)' }}></i>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Tabs.TabPane>

              <Tabs.TabPane tab="Peregangan Mata" key="3">
                <div style={{ padding: '30px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid var(--gm)' }}>
                  <Row gutter={[30, 30]} align="middle">
                    <Col xs={24} md={12}>
                      <h3 style={{ fontSize: '20px', color: 'var(--navy)', marginBottom: '15px' }}>Peregangan Fokus & Berkedip Cepat</h3>
                      <p style={{ color: 'var(--tm)', fontSize: '14px', lineHeight: 1.6 }}>
                        Fokuskan pandangan Anda pada ibu jari yang diacungkan sejauh 30 cm di depan hidung, lalu perlahan pindahkan fokus Anda ke objek sejauh 6 meter. Ulangi 5 kali. Akhiri dengan berkedip cepat sebanyak 10 kali secara berturut-turut untuk merangsang lubrikasi kelenjar air mata alami.
                      </p>
                    </Col>
                    <Col xs={24} md={12}>
                      <div style={{ background: '#E2E8F0', height: '220px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa-solid fa-eye" style={{ fontSize: '80px', color: 'var(--navy)' }}></i>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Tabs.TabPane>
            </Tabs>
          </div>
        </div>
      </section>

      {/* TIPS SECTION */}
      <section className="section-padding" id="tips">
        <div className="container">
          <div className="sec-header">
            <span class="sec-label">Health & Safety Guidance</span>
            <h2 class="sec-title">Tips Kesehatan Kerja K3</h2>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card title="Posisi Layar Monitor" bordered={false} style={{ borderRadius: '16px', height: '100%' }}>
                <p style={{ fontSize: '13px', color: 'var(--tm)' }}>Posisikan bagian atas layar sejajar dengan mata Anda untuk mencegah ketegangan leher kronis. Atur jarak pandang sekitar 50-70 cm.</p>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="Asupan Cairan Tubuh" bordered={false} style={{ borderRadius: '16px', height: '100%' }}>
                <p style={{ fontSize: '13px', color: 'var(--tm)' }}>Konsumsilah air mineral minimal 2 liter per hari. Dehidrasi ringan menurunkan fokus mental dan memicu kelelahan kognitif selama jam kantor.</p>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="Pencahayaan Ruangan" bordered={false} style={{ borderRadius: '16px', height: '100%' }}>
                <p style={{ fontSize: '13px', color: 'var(--tm)' }}>Pastikan pencahayaan meja kerja cukup terang (300-500 Lux) dan kurangi pantulan langsung monitor (glare) menggunakan tirai atau filter layar anti-glare.</p>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* FOOTER SECTION */}
      <footer style={{
        padding: '60px 0',
        background: 'var(--navy)',
        color: '#E2E8F0',
        borderTop: '5px solid var(--red)'
      }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: '24px' }}>
            <span style={{ color: 'white' }}>WASKITA</span> <span style={{ color: '#D71920' }}>DIGITAL BALANCE</span>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', maxWidth: '500px' }}>
            Unit Quality, Safety, Health and Environment (QSHE) – PT Waskita Karya (Persero) Tbk.
          </p>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '20px' }}>
            &copy; 2026 PT Waskita Karya (Persero) Tbk. All Rights Reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
