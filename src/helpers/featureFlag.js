import { useState, useEffect } from 'react'

const useFeatureFlags = () => {
  const [features, setFeatures] = useState({})

  useEffect(() => {
    window.chrome.storage.sync.get(['features'], ({ features = {} }) => {
      setFeatures(features)
    })
  }, [])

  return {
    features,
    setFeatures: (features) => {
      setFeatures(features)
       window.chrome.storage.sync.set({ features })
    },
  }
}
export { useFeatureFlags }
