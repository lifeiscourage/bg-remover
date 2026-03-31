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
    }
  }

  const removeBackground = async () => {
    if (!image) return
    setLoading(true)
    
    try {
      const formData = new FormData()
      const blob = await fetch(image).then(r => r.blob())
      formData.append('image_file', blob)
      
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': 'fx91zPjDFXsar9pwJTyDsq9w'
        },
        body: formData
      })
      
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
      <h1>图片背景移除</h1>
      
      <div className="upload-section">
        <input type="file" accept="image/*" onChange={handleUpload} />
      </div>

      {image && (
        <div className="preview-section">
          <div className="image-container">
            <h3>原图</h3>
            <img src={image} alt="原图" />
          </div>
          
          {result && (
            <div className="image-container">
              <h3>处理后</h3>
              <img src={result} alt="处理后" />
            </div>
          )}
        </div>
      )}

      {image && !result && (
        <button onClick={removeBackground} disabled={loading}>
          {loading ? '处理中...' : '移除背景'}
        </button>
      )}

      {result && (
        <a href={result} download="no-bg.png" className="download-btn">
          下载图片
        </a>
      )}
    </div>
  )
}

export default App
