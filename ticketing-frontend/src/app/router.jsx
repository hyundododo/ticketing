import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppRoot from './AppRoot.jsx'

function AppRouter() {
    return <BrowserRouter>
        <Routes>
            <Route path="*" element={<AppRoot />} />
        </Routes>
    </BrowserRouter>
}

export default AppRouter
