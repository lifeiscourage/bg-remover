import { useState } from 'react'
import './App.css'

function App() {
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setImage(e.target.result)
      reader.readAsDataURL(file)
      setResult(null)
    }
  }

  const removeBackground = async () => {
    if (!image) return
    setLoading(true)
    
    try {
      const formData = new FormData()
      const blob = await fetch(image).then(r => r.blob())
      formData.append('image_file', blob)
      formData.append('size', 'auto')
      
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': 'fx91zPjDFXsar9pwJTyDsq9w'
        },
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('处理失败，请稍后重试')
      }
      
      const resultBlob = await response.blob()
      setResult(URL.createObjectURL(resultBlob))
    } catch (error) {
      alert('处理失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <h1>✨ 图片背景移除</h1>
      <p className="subtitle">一键去除图片背景，简单快捷</p>
      
      {!image && (
        <div className="upload-section">
          <label className="upload-box">
            <input type="file" accept="image/*" onChange={handleUpload} />
            <div className="upload-icon">📸</div>
            <div className="upload-text">点击或拖拽上传图片</div>
          </label>
        </div>
      )}

      {image && (
        <div className="preview-section">
          <div className="image-container">
            <h3>原图</h3>
            <img src={image} alt="原图" />
          </div>
          
          {result && (
            <div className="image-container">
              <h3>处理后</h3>
              <img src={result} alt="处理后" style={{background: 'repeating-conic-gradient(#ddd 0% 25%, white 0% 50%) 50% / 20px 20px'}} />
            </div>
          )}
        </div>
      )}

      {loading && <div className="loading">⏳ 正在处理中...</div>}

      {image && !result && !loading && (
        <button onClick={removeBackground}>
          🎨 移除背景
        </button>
      )}

      {result && (
        <>
          <a href={result} download="no-bg.png" className="download-btn">
            ⬇️ 下载图片
          </a>
          <button onClick={() => { setImage(null); setResult(null); }}>
            🔄 重新上传
          </button>
        </>
      )}
    </div>
  )
}

export default App
