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
        throw new Error('Processing failed')
      }
      
      const resultBlob = await response.blob()
      setResult(URL.createObjectURL(resultBlob))
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (image) {
    return (
      <div className="app">
        <h1>Background Remover</h1>
        <p className="subtitle">AI-powered background removal tool</p>
        
        <div className="result-container">
          <div className="result-card">
            <h3>Original</h3>
            <img src={image} alt="Original" />
          </div>
          
          {result && (
            <div className="result-card">
              <h3>Result</h3>
              <img src={result} alt="Result" style={{background: 'repeating-conic-gradient(#ddd 0% 25%, white 0% 50%) 50% / 20px 20px'}} />
            </div>
          )}
        </div>

        {loading && <div className="loading">⏳ Processing...</div>}

        <div className="actions">
          {!result && !loading && (
            <button className="btn-primary" onClick={removeBackground}>
              Remove Background
            </button>
          )}
          
          {result && (
            <>
              <a href={result} download="no-bg.png" className="btn-primary">
                Download
              </a>
              <button className="btn-secondary" onClick={() => { setImage(null); setResult(null); }}>
                Upload New
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <h1>Background Remover</h1>
      <p className="subtitle">AI-powered background removal tool</p>
      
      <label className="upload-card">
        <input type="file" accept="image/*" onChange={handleUpload} />
        <div className="upload-icon">📤</div>
        <h3>Upload Image</h3>
        <p>Support JPG, PNG and other formats</p>
      </label>
    </div>
  )
}

export default App
