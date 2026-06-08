'use client';

import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Button, 
  Collapse, 
  Table, 
  Card, 
  Alert,
  Space
} from 'antd';
import { 
  FileTextOutlined, 
  InfoCircleOutlined, 
  HistoryOutlined, 
  UndoOutlined, 
  CheckCircleOutlined, 
  HomeOutlined,
  AlertOutlined,
  HeartOutlined,
  SafetyCertificateOutlined,
  SmileOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Respondent {
  name: string;
  age: number | null;
  gender: string;
  tenure: number | null;
}

interface AssessmentResult {
  name: string;
  age: number;
  gender: string;
  tenure: number;
  score: number;
  category: string;
  date: string;
}

// 17 KAUPK2 Questions
const QUESTIONS = [
  "Apakah Anda merasa sukar berpikir?",
  "Apakah Anda merasa lelah berbicara?",
  "Apakah Anda merasa gugup menghadapi sesuatu?",
  "Apakah Anda merasa tidak pernah berkonsentrasi dalam menghadapi suatu pekerjaan?",
  "Apakah Anda merasa tidak mempunyai perhatian terhadap sesuatu?",
  "Apakah Anda cenderung lupa terhadap sesuatu?",
  "Apakah Anda merasa kurang percaya terhadap diri sendiri?",
  "Apakah Anda merasa tidak tekun dalam melaksanakan pekerjaan Anda?",
  "Apakah Anda merasa enggan menatap mata orang lain?",
  "Apakah Anda merasa enggan bekerja cekatan?",
  "Apakah Anda merasa tidak tenang dalam bekerja?",
  "Apakah Anda merasa lelah seluruh tubuh?",
  "Apakah Anda merasa bertindak lamban?",
  "Apakah Anda merasa tidak kuat lagi berjalan?",
  "Apakah Anda merasa sebelum bekerja sudah lelah?",
  "Apakah Anda merasa daya pikir menurun?",
  "Apakah Anda merasa cemas terhadap sesuatu hal?"
];

export default function TesKelelahan() {
  const [form] = Form.useForm();
  const [answers, setAnswers] = useState<(number | null)[]>(Array(17).fill(null));
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [lastHistory, setLastHistory] = useState<AssessmentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Multi-step Stepper state
  // 0: Identity Form, 1: Questions Wizard, 2: Results & History
  const [step, setStep] = useState<number>(0);
  const [qPage, setQPage] = useState<number>(0);

  // Load last history on mount
  useEffect(() => {
    const saved = localStorage.getItem('waskita_fatigue_last_assessment');
    if (saved) {
      try {
        setLastHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Calculate answered questions
  const answeredCount = answers.filter((val) => val !== null).length;
  const progressPercent = Math.round((answeredCount / 17) * 100);

  // Handle Radio Selection
  const handleSelectOption = (index: number, score: number) => {
    const newAnswers = [...answers];
    newAnswers[index] = score;
    setAnswers(newAnswers);
    setErrorMessage(null);
  };

  // Move from Identity step to Questions step
  const handleStartQuestions = () => {
    form.validateFields()
      .then(() => {
        setStep(1);
        setQPage(0);
        setErrorMessage(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(() => {
        setErrorMessage('Silakan lengkapi seluruh form identitas responden terlebih dahulu.');
      });
  };

  // Step pagination helpers
  const handleNextPage = () => {
    const startIndex = qPage * 5;
    const endIndex = Math.min(startIndex + 5, 17);
    
    // Validate that all questions on current page are answered
    for (let i = startIndex; i < endIndex; i++) {
      if (answers[i] === null) {
        setErrorMessage(`Silakan jawab semua pertanyaan pada halaman ini terlebih dahulu.`);
        const el = document.getElementById(`q-card-${i}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }
    
    setErrorMessage(null);
    if (qPage < 3) {
      setQPage(qPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleCalculate();
    }
  };

  const handlePrevPage = () => {
    setErrorMessage(null);
    if (qPage > 0) {
      setQPage(qPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setStep(0); // Back to identity
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Perform scoring logic
  const handleCalculate = () => {
    form.validateFields()
      .then((values) => {
        // Validate if all questions are answered
        const unansweredIndices = answers
          .map((ans, idx) => (ans === null ? idx : null))
          .filter((idx) => idx !== null) as number[];

        if (unansweredIndices.length > 0) {
          // If somehow an answer is missing, go to that page
          const targetPage = Math.floor(unansweredIndices[0] / 5);
          setStep(1);
          setQPage(targetPage);
          setErrorMessage(`Kuesioner belum lengkap. Silakan jawab pertanyaan nomor ${unansweredIndices[0] + 1}.`);
          setTimeout(() => {
            const el = document.getElementById(`q-card-${unansweredIndices[0]}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
          return;
        }

        // Summing scores
        const totalScore = answers.reduce((sum, val) => sum! + val!, 0) as number;
        
        // Categorizing
        let category = 'Kurang Lelah';
        let interpretation = 'Kondisi fisik dan mental Anda prima. Tetap pertahankan kesehatan fisik dan mental Anda dengan melakukan microbreak secara rutin di sela-sela waktu kerja.';

        if (totalScore >= 24 && totalScore <= 30) {
          category = 'Lelah';
          interpretation = 'Anda mulai mengalami perasaan lelah yang signifikan secara subjektif. Direkomendasikan untuk melakukan peregangan ringan, mengkonsumsi air putih yang cukup, melakukan microbreak, dan beristirahat 5-10 menit.';
        } else if (totalScore > 30) {
          category = 'Sangat Lelah';
          interpretation = 'Tingkat kelelahan Anda berada dalam kategori sangat tinggi. Direkomendasikan untuk segera melakukan istirahat yang cukup, mengevaluasi beban kerja Anda, menghindari lembur, dan jika keluhan terus berlanjut silakan hubungi tim QSHE atau pengawas K3L.';
        }

        const dateStr = new Date().toLocaleString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) + ' WIB';

        const newResult: AssessmentResult = {
          name: values.name,
          age: values.age,
          gender: values.gender,
          tenure: values.tenure,
          score: totalScore,
          category,
          date: dateStr
        };

        // Save to state and LocalStorage
        setResult(newResult);
        localStorage.setItem('waskita_fatigue_last_assessment', JSON.stringify(newResult));
        setLastHistory(newResult);
        setErrorMessage(null);
        setStep(2); // Go to results

        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(() => {
        setStep(0);
        setErrorMessage('Silakan lengkapi formulir identitas responden terlebih dahulu.');
      });
  };

  // Reset Form
  const handleReset = () => {
    form.resetFields();
    setAnswers(Array(17).fill(null));
    setResult(null);
    setStep(0);
    setQPage(0);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Radial Bar Data Setup
  const chartColor = result 
    ? result.score > 30 ? '#D71920' : result.score >= 24 ? '#f59e0b' : '#10b981'
    : '#10b981';

  const chartData = [
    {
      name: 'Score',
      value: result ? result.score : 0,
      fill: chartColor
    }
  ];

  // Dynamic question slices
  const startIndex = qPage * 5;
  const endIndex = Math.min(startIndex + 5, 17);
  const pageQuestions = QUESTIONS.slice(startIndex, endIndex);

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Mini Top Navigation Bar */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: '18px',
              lineHeight: 1.1
            }}>
              <div><span style={{ color: '#0B1F3A' }}>WASKITA</span> <span style={{ color: '#D71920' }}>DIGITAL</span></div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#4B5563', letterSpacing: '1px' }}>BALANCE</div>
            </div>
          </div>
          <Button type="text" icon={<HomeOutlined />} onClick={() => window.location.href = '/'} style={{ fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Kembali Ke Dashboard
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <div className="container" style={{ marginTop: '40px' }}>
        
        {/* Header Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="sec-label">QSHE Assessment Portal</span>
          <h2 className="sec-title" style={{ fontSize: '42px', marginBottom: '15px' }}>Tes Kelelahan Kerja</h2>
          <p style={{ maxWidth: '700px', margin: '0 auto', color: 'var(--tm)', fontSize: '15px', lineHeight: 1.6 }}>
            Self-assessment tingkat kelelahan kerja subjektif menggunakan metode KAUPK2 Tipe I. Kuesioner ini digunakan untuk membantu mengidentifikasi tingkat kelelahan kerja subjektif pekerja berdasarkan kondisi yang dirasakan saat ini.
          </p>
        </div>

        {/* Main Fatigue Card */}
        <div className="fatigue-card-wrapper">
          {/* Section Hero Header */}
          <div className="fatigue-hero-header">
            <div className="fatigue-hero-icon">
              <FileTextOutlined />
            </div>
            <div className="fatigue-hero-text">
              <h3>Self-Assessment Kelelahan Kerja</h3>
              <p>Kuesioner ini dirancang untuk mendeteksi tingkat kelelahan fisik, mental, dan psikologis pekerja administrasi dan kantor secara cepat dan akurat.</p>
            </div>
          </div>

          {errorMessage && (
            <Alert 
              message={errorMessage} 
              type="error" 
              showIcon 
              closable 
              onClose={() => setErrorMessage(null)} 
              style={{ marginBottom: '24px', borderRadius: '10px' }} 
            />
          )}

          <AnimatePresence mode="wait">
            {/* STEP 0: IDENTITY FORM */}
            {step === 0 && (
              <motion.div
                key="identity-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <Form
                  form={form}
                  id="fatigue-identity-form"
                  layout="vertical"
                  requiredMark={false}
                  style={{ marginBottom: '0' }}
                >
                  <div className="identity-form-grid" style={{ marginBottom: '25px' }}>
                    <Form.Item
                      name="name"
                      label={<span style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '11px', textTransform: 'uppercase' }}>Nama Responden *</span>}
                      rules={[{ required: true, message: 'Masukkan nama Anda' }]}
                    >
                      <Input placeholder="Masukkan nama lengkap" className="form-control" />
                    </Form.Item>

                    <Form.Item
                      name="age"
                      label={<span style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '11px', textTransform: 'uppercase' }}>Usia (Tahun) *</span>}
                      rules={[{ required: true, message: 'Masukkan usia' }]}
                    >
                      <InputNumber min={15} max={80} placeholder="Contoh: 28" style={{ width: '100%' }} className="form-control" />
                    </Form.Item>

                    <Form.Item
                      name="gender"
                      label={<span style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '11px', textTransform: 'uppercase' }}>Jenis Kelamin *</span>}
                      rules={[{ required: true, message: 'Pilih jenis kelamin' }]}
                    >
                      <Select placeholder="Pilih jenis kelamin" className="form-control" style={{ height: '46px' }}>
                        <Select.Option value="Laki-laki">Laki-laki</Select.Option>
                        <Select.Option value="Perempuan">Perempuan</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="tenure"
                      label={<span style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '11px', textTransform: 'uppercase' }}>Masa Kerja (Tahun) *</span>}
                      rules={[{ required: true, message: 'Masukkan masa kerja' }]}
                    >
                      <InputNumber min={0} max={60} placeholder="Contoh: 3" style={{ width: '100%' }} className="form-control" />
                    </Form.Item>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <Button 
                      type="primary" 
                      onClick={handleStartQuestions}
                      className="btn btn-red"
                      style={{ 
                        padding: '0 35px', 
                        height: '48px', 
                        fontSize: '14px', 
                        borderRadius: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      Mulai Isi Kuesioner <ArrowRightOutlined />
                    </Button>
                  </div>
                </Form>
              </motion.div>
            )}

            {/* STEP 1: QUESTIONNAIRE WIZARD */}
            {step === 1 && (
              <motion.div
                key="questions-step"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ marginTop: '0px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #F1F5F9', paddingBottom: '15px' }}>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--navy)', marginBottom: '4px' }}>Kuesioner KAUPK2 Tipe I</h4>
                      <p style={{ color: 'var(--tm)', fontSize: '13px', margin: 0 }}>Halaman {qPage + 1} dari 4</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--navy)' }}>{answeredCount} dari 17 dijawab</span>
                    </div>
                  </div>

                  {/* Inline Progress Bar */}
                  <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', marginBottom: '25px' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        background: 'var(--red)', 
                        width: `${progressPercent}%`, 
                        transition: 'width 0.3s ease'
                      }} 
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                    {pageQuestions.map((q, localIdx) => {
                      const absoluteIdx = startIndex + localIdx;
                      const isSelected = answers[absoluteIdx] !== null;
                      const answeredClass = isSelected ? 'answered' : '';

                      return (
                        <div 
                          key={absoluteIdx}
                          id={`q-card-${absoluteIdx}`}
                          className={`question-item ${answeredClass}`}
                        >
                          <div className="question-text">
                            <span className="question-number">{absoluteIdx + 1}.</span>
                            <span>{q}</span>
                          </div>

                          <div className="options-group">
                            <button
                              type="button"
                              className={`option-btn ${answers[absoluteIdx] === 3 ? 'selected-often' : ''}`}
                              onClick={() => handleSelectOption(absoluteIdx, 3)}
                            >
                              Ya, Sering
                            </button>
                            <button
                              type="button"
                              className={`option-btn ${answers[absoluteIdx] === 2 ? 'selected-rarely' : ''}`}
                              onClick={() => handleSelectOption(absoluteIdx, 2)}
                            >
                              Ya, Jarang
                            </button>
                            <button
                              type="button"
                              className={`option-btn ${answers[absoluteIdx] === 1 ? 'selected-never' : ''}`}
                              onClick={() => handleSelectOption(absoluteIdx, 1)}
                            >
                              Tidak Pernah
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Wizard Footer Controls */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: '#F8FAFC', 
                    padding: '15px 25px', 
                    borderRadius: '12px', 
                    border: '1.5px solid var(--gm)' 
                  }}>
                    <Button 
                      type="text" 
                      onClick={handlePrevPage}
                      icon={<ArrowLeftOutlined />}
                      style={{ fontWeight: 800, color: 'var(--navy)' }}
                    >
                      Kembali
                    </Button>
                    
                    <span style={{ fontSize: '12px', color: 'var(--tm)', fontWeight: 700 }}>
                      Pertanyaan {startIndex + 1} - {endIndex}
                    </span>

                    <Space>
                      <Button 
                        type="text" 
                        onClick={handleReset}
                        style={{ fontWeight: 800, color: 'var(--navy)' }}
                      >
                        Reset
                      </Button>
                      <Button 
                        type="primary" 
                        onClick={handleNextPage}
                        className="btn btn-red"
                        style={{ 
                          height: '40px', 
                          fontWeight: 800,
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        {qPage === 3 ? 'Hitung Hasil' : 'Berikutnya'} <ArrowRightOutlined />
                      </Button>
                    </Space>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: RESULTS CARD & HISTORY */}
            {step === 2 && result && (
              <motion.div
                key="result-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <div className="result-grid">
                  {/* Premium Result Card */}
                  <div className="result-card-premium">
                    <div className="result-score-indicator" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      
                      {/* Recharts Circular Meter */}
                      <div style={{ width: '100px', height: '100px', position: 'relative', flexShrink: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RadialBarChart 
                            cx="50%" 
                            cy="50%" 
                            innerRadius="75%" 
                            outerRadius="100%" 
                            barSize={6} 
                            data={chartData} 
                            startAngle={90} 
                            endAngle={-270}
                          >
                            <PolarAngleAxis 
                              type="number" 
                              domain={[17, 51]} 
                              angleAxisId={0} 
                              tick={false} 
                            />
                            <RadialBar 
                              background={{ fill: 'rgba(255,255,255,0.08)' }} 
                              dataKey="value" 
                              cornerRadius={3}
                            />
                          </RadialBarChart>
                        </ResponsiveContainer>
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center'
                        }}>
                          <span style={{ fontSize: '24px', fontWeight: 900, color: 'white' }}>{result.score}</span>
                          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', display: 'block', marginTop: '-4px' }}>/51</span>
                        </div>
                      </div>

                      <div>
                        <div className="result-level-title">Tingkat Kelelahan Kerja</div>
                        <span className={`result-level-badge ${
                          result.score > 30 ? 'badge-high' : result.score >= 24 ? 'badge-medium' : 'badge-low'
                        }`}>
                          {result.category}
                        </span>
                      </div>
                    </div>

                    <div className="result-interpretation">
                      {result.score > 30 
                        ? 'Tingkat kelelahan Anda berada dalam kategori sangat tinggi. Direkomendasikan untuk segera melakukan istirahat yang cukup, mengevaluasi beban kerja Anda, menghindari lembur, dan jika keluhan terus berlanjut silakan hubungi tim QSHE atau pengawas K3L.' 
                        : result.score >= 24 
                          ? 'Anda mulai mengalami perasaan lelah yang signifikan secara subjektif. Direkomendasikan untuk melakukan peregangan ringan, mengkonsumsi air putih yang cukup, melakukan microbreak, dan beristirahat 5-10 menit.' 
                          : 'Kondisi fisik dan mental Anda prima. Tetap pertahankan kesehatan fisik dan mental Anda dengan melakukan microbreak secara rutin di sela-sela waktu kerja.'
                      }
                    </div>

                    <div className="result-recommendations">
                      <h4>Rekomendasi Fatigue Management</h4>
                      <div className="recom-list">
                        <div className="recom-item"><i className="fa-solid fa-bed"></i> Istirahat cukup</div>
                        <div className="recom-item"><i className="fa-solid fa-child"></i> Lakukan peregangan ringan</div>
                        <div className="recom-item"><i className="fa-solid fa-mug-hot"></i> Lakukan microbreak</div>
                        <div className="recom-item"><i className="fa-solid fa-briefcase"></i> Evaluasi beban kerja</div>
                      </div>
                    </div>

                    <div style={{ marginTop: '25px' }}>
                      <Button 
                        type="default" 
                        onClick={handleReset}
                        icon={<ReloadOutlined />}
                        style={{ 
                          width: '100%', 
                          background: 'transparent',
                          borderColor: 'rgba(255,255,255,0.3)',
                          color: 'white',
                          fontWeight: 800,
                          height: '42px',
                          borderRadius: '8px'
                        }}
                      >
                        Uji Kembali
                      </Button>
                    </div>
                  </div>

                  {/* History Hasil Card */}
                  <div className="history-card">
                    <div>
                      <div className="history-header">
                        <span className="history-title"><HistoryOutlined style={{ marginRight: '8px' }} /> Assessment Terakhir</span>
                        <span className="history-date">{lastHistory ? lastHistory.date : 'Belum ada data'}</span>
                      </div>

                      <div className="history-body">
                        {lastHistory ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="history-meta-row">
                              <div className="history-meta-box">
                                <div className="history-meta-lbl">Nama Karyawan</div>
                                <div className="history-meta-val">{lastHistory.name}</div>
                              </div>
                              <div className="history-meta-box">
                                <div className="history-meta-lbl">Masa Kerja</div>
                                <div className="history-meta-val">{lastHistory.tenure} Tahun</div>
                              </div>
                            </div>
                            <div className="history-meta-row">
                              <div className="history-meta-box">
                                <div className="history-meta-lbl">Karakteristik</div>
                                <div className="history-meta-val">{lastHistory.gender}, {lastHistory.age} Thn</div>
                              </div>
                              <div className="history-meta-box">
                                <div className="history-meta-lbl">Skor Assessment</div>
                                <div className="history-meta-val">
                                  <span className={`result-level-badge ${
                                    lastHistory.score > 30 ? 'badge-high' : lastHistory.score >= 24 ? 'badge-medium' : 'badge-low'
                                  }`} style={{ fontSize: '11px', padding: '3px 10px', marginTop: '2px', display: 'inline-block' }}>
                                    Skor {lastHistory.score} ({lastHistory.category})
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p style={{ textAlign: 'center', color: 'var(--tm)', padding: '30px 0', fontSize: '13px', fontWeight: 600 }}>
                            Belum ada riwayat pengujian subjektif sebelumnya.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collapsible Referensi & Metode */}
                <div className="collapsible-method-container">
                  <Collapse ghost expandIconPosition="end">
                    <Collapse.Panel 
                      header={
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <InfoCircleOutlined /> Lihat Dasar Metode dan Referensi Kuesioner
                        </span>
                      } 
                      key="1"
                    >
                      <div style={{ padding: '5px 10px' }}>
                        <div style={{ marginBottom: '20px' }}>
                          <h4 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '8px', fontSize: '14px' }}>Apa itu KAUPK2?</h4>
                          <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--tm)', marginBottom: '8px' }}>
                            Kuesioner Alat Ukur Perasaan Kelelahan Kerja (KAUPK2) merupakan metode pengukuran kelelahan kerja subjektif yang digunakan untuk mengidentifikasi tingkat perasaan lelah yang dirasakan pekerja berdasarkan kondisi fisik, mental, dan psikologis saat bekerja.
                          </p>
                          <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--tm)' }}>
                            Metode ini digunakan karena mampu menggambarkan kondisi kelelahan kerja subjektif pekerja secara sederhana, cepat, dan mudah dipahami, khususnya pada pekerjaan administratif dan pekerjaan kantor.
                          </p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                          <h4 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '8px', fontSize: '14px' }}>Alasan Pemilihan Metode</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--tm)', fontWeight: 600 }}>
                              <CheckCircleOutlined style={{ color: 'var(--red)' }} /> Cocok digunakan untuk pekerja kantor
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--tm)', fontWeight: 600 }}>
                              <CheckCircleOutlined style={{ color: 'var(--red)' }} /> Digunakan pada pekerjaan administratif
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--tm)', fontWeight: 600 }}>
                              <CheckCircleOutlined style={{ color: 'var(--red)' }} /> Digunakan pada pekerjaan pengembangan SDM
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--tm)', fontWeight: 600 }}>
                              <CheckCircleOutlined style={{ color: 'var(--red)' }} /> Relevan untuk fatigue management
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--tm)', fontWeight: 600 }}>
                              <CheckCircleOutlined style={{ color: 'var(--red)' }} /> Mudah diterapkan secara digital
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--tm)', fontWeight: 600 }}>
                              <CheckCircleOutlined style={{ color: 'var(--red)' }} /> Umum digunakan dalam penelitian kelelahan kerja
                            </div>
                          </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                          <h4 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '8px', fontSize: '14px' }}>Referensi Studi Literatur</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                            <div style={{ background: '#F8FAFC', border: '1px solid var(--gm)', borderRadius: '10px', padding: '12px', fontSize: '11.5px' }}>
                              <strong style={{ color: 'var(--navy)', display: 'block', marginBottom: '4px' }}>Hartono et al., 2022</strong>
                              Penggunaan metode KAUPK2 pada pekerja kantor bidang pengembangan SDM.
                            </div>
                            <div style={{ background: '#F8FAFC', border: '1px solid var(--gm)', borderRadius: '10px', padding: '12px', fontSize: '11.5px' }}>
                              <strong style={{ color: 'var(--navy)', display: 'block', marginBottom: '4px' }}>Roshadi, 2014</strong>
                              Penggunaan metode KAUPK2 pada karyawan Fakultas Dakwah dan Komunikasi UIN Yogyakarta.
                            </div>
                            <div style={{ background: '#F8FAFC', border: '1px solid var(--gm)', borderRadius: '10px', padding: '12px', fontSize: '11.5px' }}>
                              <strong style={{ color: 'var(--navy)', display: 'block', marginBottom: '4px' }}>Ifansyah et al., 2025</strong>
                              Penggunaan metode KAUPK2 pada pekerja administrator.
                            </div>
                            <div style={{ background: '#F8FAFC', border: '1px solid var(--gm)', borderRadius: '10px', padding: '12px', fontSize: '11.5px' }}>
                              <strong style={{ color: 'var(--navy)', display: 'block', marginBottom: '4px' }}>Ramli et al., 2022</strong>
                              Dasar interpretasi kategori skor tingkat kelelahan kerja KAUPK2.
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '10px', fontSize: '14px' }}>Interpretasi Skor KAUPK2 Tipe I</h4>
                          <Table 
                            pagination={false} 
                            bordered 
                            size="small"
                            columns={[
                              { title: 'Skor Total', dataIndex: 'score', key: 'score' },
                              { title: 'Kategori Kelelahan', dataIndex: 'category', key: 'category' },
                              { title: 'Tindakan K3L', dataIndex: 'action', key: 'action' }
                            ]}
                            dataSource={[
                              { key: '1', score: 'Skor < 23', category: 'Kurang Lelah', action: 'Kondisi aman, teruskan pola istirahat aktif dan microbreak.' },
                              { key: '2', score: 'Skor 24 - 30', category: 'Lelah', action: 'Perlu istirahat sejenak, lakukan peregangan/stretching K3, hindari overtime.' },
                              { key: '3', score: 'Skor > 31', category: 'Sangat Lelah', action: 'Istirahat wajib segera, kurangi intensitas kerja, konsultasikan dengan pengawas QSHE.' }
                            ]}
                          />
                          <p style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--red)', fontWeight: 700, marginTop: '10px' }}>
                            Catatan: Hasil assessment digunakan sebagai self-awareness dan bukan sebagai diagnosis medis.
                          </p>
                        </div>
                      </div>
                    </Collapse.Panel>
                  </Collapse>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* QSHE K3 Education Cards */}
        <div style={{ marginTop: '60px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="sec-label">QSHE K3 Education</span>
            <h2 className="sec-title" style={{ fontSize: '36px' }}>Edukasi Kelelahan Kerja (Fatigue)</h2>
          </div>

          <div className="edu-cards-grid">
            <Card className="edu-card" bordered={false}>
              <div className="edu-card-icon"><AlertOutlined /></div>
              <h4 className="edu-card-title">Dampak Fatigue</h4>
              <p className="edu-card-desc">Kelelahan kerja menurunkan konsentrasi, memperlambat waktu reaksi, meningkatkan risiko kecelakaan kerja, serta mengganggu kesehatan jangka panjang.</p>
            </Card>

            <Card className="edu-card" bordered={false}>
              <div className="edu-card-icon"><HeartOutlined /></div>
              <h4 className="edu-card-title">Pentingnya Istirahat</h4>
              <p className="edu-card-desc">Istirahat teratur membantu memulihkan energi seluler, mengurangi beban kognitif otak, dan memulihkan fungsi sistem saraf motorik tubuh.</p>
            </Card>

            <Card className="edu-card" bordered={false}>
              <div className="edu-card-icon"><SafetyCertificateOutlined /></div>
              <h4 className="edu-card-title">Ergonomi Kerja</h4>
              <p className="edu-card-desc">Gunakan posisi duduk tegak, atur tinggi kursi agar kaki menapak datar, dan pastikan jarak mata ke layar monitor sekitar 50-70 cm untuk mengurangi beban fisik.</p>
            </Card>

            <Card className="edu-card" bordered={false}>
              <div className="edu-card-icon"><SmileOutlined /></div>
              <h4 className="edu-card-title">Pentingnya Microbreak</h4>
              <p className="edu-card-desc">Lakukan microbreak selama 30-60 detik setiap 30-45 menit sekali. Gunakan untuk berdiri, melihat objek jauh, atau sekadar mengambil napas dalam.</p>
            </Card>

            <Card className="edu-card" bordered={false}>
              <div className="edu-card-icon"><UndoOutlined /></div>
              <h4 className="edu-card-title">Stretching Berkala</h4>
              <p className="edu-card-desc">Lakukan peregangan otot leher, bahu, pergelangan tangan, dan punggung minimal 2 kali sehari untuk mencegah kekakuan otot (MSDs).</p>
            </Card>

            <Card className="edu-card" bordered={false}>
              <div className="edu-card-icon"><CheckCircleOutlined /></div>
              <h4 className="edu-card-title">Budaya QSHE</h4>
              <p className="edu-card-desc">Melaporkan kondisi kelelahan ekstrem secara transparan adalah bagian dari budaya keselamatan kerja. Prioritaskan keselamatan diri Anda dan rekan kerja.</p>
            </Card>
          </div>
        </div>

      </div>

      {/* Footer Area */}
      <footer style={{
        marginTop: '80px',
        padding: '40px 0',
        background: '#0B1F3A',
        color: '#E2E8F0',
        borderTop: '5px solid #D71920'
      }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: '18px' }}>
            <span style={{ color: 'white' }}>WASKITA</span> <span style={{ color: '#D71920' }}>DIGITAL BALANCE</span>
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', maxWidth: '500px' }}>
            Unit Quality, Safety, Health and Environment (QSHE) – PT Waskita Karya (Persero) Tbk.
          </p>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '15px' }}>
            &copy; 2026 PT Waskita Karya (Persero) Tbk. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
