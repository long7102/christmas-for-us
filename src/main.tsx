import { createRoot } from 'react-dom/client'
import '@fontsource/cormorant-garamond/400.css'
import '@fontsource/cormorant-garamond/400-italic.css'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/600.css'
import '@fontsource/cormorant-garamond/700.css'
import '@fontsource/cormorant-garamond/500-italic.css'
import '@fontsource/cormorant-garamond/600-italic.css'
import '@fontsource/cormorant-garamond/700-italic.css'
import '@fontsource/dancing-script/500.css'
import '@fontsource/dancing-script/600.css'
import '@fontsource/patrick-hand/400.css'
import '@fontsource/charm/400.css'
import '@fontsource/charm/700.css'
import '@fontsource/playfair-display/700.css'
import '@fontsource/playfair-display/700-italic.css'
import './styles.css'
import App from './App'

import { initPreview } from './lib/unlock'

// xem trước (?xem=<mã>) phải xử lý xong trước khi dựng trang để các quà đọc đúng trạng thái
initPreview().finally(() => createRoot(document.getElementById('root')!).render(<App />))
