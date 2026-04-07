import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Check login status on page load
  useEffect(() => {
    fetch('/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user)
        }
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false))
  }, [])

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

  const handleLogin = () => {
    window.location.href = '/auth/google'
  }

  const handleLogout = () => {
    window.location.href = '/auth/logout'
  }

  return (
    <div className="app">
      {/* Auth bar */}
      <div className="auth-bar">
        {authLoading ? null : user ? (
          <div className="user-info">
            <img src={user.picture} alt={user.name} className="user-avatar" referrerPolicy="no-referrer" />
            <span className="user-name">{user.name}</span>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <button className="btn-login" onClick={handleLogin}>
            <svg width="18" height="18" viewBox="0 0 48 48" style={{marginRight: '8px', verticalAlign: 'middle'}}>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#34A853" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#FBBC05" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Sign in with Google
          </button>
        )}
      </div>

      <h1>Background Remover</h1>
      <p className="subtitle">AI-powered background removal tool</p>

      {image ? (
        <>
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
        </>
      ) : (
        <label className="upload-card">
          <input type="file" accept="image/*" onChange={handleUpload} />
          <div className="upload-icon">📤</div>
          <h3>Upload Image</h3>
          <p>Support JPG, PNG and other formats</p>
        </label>
      )}
    </div>
  )
}

export default App
